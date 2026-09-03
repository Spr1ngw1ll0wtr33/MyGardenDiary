/* My Garden Diary — storage.
   Everything lives in the app's own private area on this device (IndexedDB).
   Nothing is ever sent anywhere. */

const Store = (() => {
  const DB_NAME = 'my-garden-diary';
  const DB_VERSION = 1;
  let dbPromise = null;

  function open() {
    if (dbPromise) return dbPromise;
    dbPromise = new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains('entries')) {
          db.createObjectStore('entries', { keyPath: 'id', autoIncrement: true });
        }
        if (!db.objectStoreNames.contains('photos')) {
          db.createObjectStore('photos', { keyPath: 'id', autoIncrement: true });
        }
        if (!db.objectStoreNames.contains('meta')) {
          db.createObjectStore('meta', { keyPath: 'key' });
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
    return dbPromise;
  }

  async function run(storeName, mode, fn) {
    const db = await open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, mode);
      const req = fn(tx.objectStore(storeName));
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error);
      if (req) {
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      } else {
        tx.oncomplete = () => resolve();
      }
    });
  }

  return {
    /* Ask Android to protect this app's data from being cleared when space runs low.
       Best effort: the browser may say no, and the JSON backup remains the real safety net. */
    async requestDurability() {
      try {
        if (navigator.storage && navigator.storage.persist) {
          if (await navigator.storage.persisted()) return true;
          return await navigator.storage.persist();
        }
      } catch (_) { /* not supported — carry on */ }
      return false;
    },

    async available() {
      try { await open(); return true; } catch (_) { return false; }
    },

    /* ---- entries ---- */
    putEntry(entry)   { return run('entries', 'readwrite', s => s.put(entry)); },
    getEntry(id)      { return run('entries', 'readonly',  s => s.get(id)); },
    allEntries()      { return run('entries', 'readonly',  s => s.getAll()); },
    deleteEntry(id)   { return run('entries', 'readwrite', s => s.delete(id)); },

    /* ---- photographs (stored as image data, shrunk before they arrive here) ---- */
    async putPhoto(blob) {
      return run('photos', 'readwrite', s => s.add({ blob }));
    },
    getPhoto(id)      { return run('photos', 'readonly',  s => s.get(id)); },
    deletePhoto(id)   { return run('photos', 'readwrite', s => s.delete(id)); },
    allPhotoIds()     { return run('photos', 'readonly',  s => s.getAllKeys()); },

    /* ---- small odds and ends: the unfinished draft, the app's own notes ---- */
    async setMeta(key, value) { return run('meta', 'readwrite', s => s.put({ key, value })); },
    async getMeta(key) {
      const row = await run('meta', 'readonly', s => s.get(key));
      return row ? row.value : undefined;
    },
    delMeta(key)      { return run('meta', 'readwrite', s => s.delete(key)); },

    /* Remove any photograph no longer referenced by an entry or by the unsaved draft.
       Keeps the phone tidy after deletions. */
    async tidyPhotos() {
      const [entries, draft, ids] = await Promise.all([
        this.allEntries(), this.getMeta('draft-journal'), this.allPhotoIds()
      ]);
      const keep = new Set();
      for (const e of entries) for (const pid of (e.photoIds || [])) keep.add(pid);
      for (const pid of ((draft && draft.photoIds) || [])) keep.add(pid);
      for (const id of ids) if (!keep.has(id)) await this.deletePhoto(id);
    }
  };
})();
