/* My Garden Diary — backup and restore.
   A backup is one ordinary file (JSON — plain text a computer can read back) holding every
   entry, every photograph and any half-written work. It is saved to the phone's Downloads
   folder with the date and time in its name, and nothing is ever sent anywhere.
   Restoring replaces everything in the diary with what the chosen backup holds. */

const Backup = (() => {
  const APP = 'My Garden Diary';
  const VERSION = 1;

  const pad = (n) => String(n).padStart(2, '0');

  function fileName(d = new Date()) {
    return `My-Garden-Diary-Backup-${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` +
           `-${pad(d.getHours())}${pad(d.getMinutes())}.json`;
  }

  function saveFile(blob, name) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    document.body.append(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
  }

  const toDataUrl = (blob) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });

  /* Everything the diary holds, as one file. */
  async function make() {
    const now = new Date();
    const [entries, photoIds, meta] = await Promise.all([
      Store.allEntries(), Store.allPhotoIds(), Store.allMeta()
    ]);
    const photos = [];
    for (const id of photoIds) {
      const record = await Store.getPhoto(id);
      if (record) photos.push({ id, data: await toDataUrl(record.blob) });
    }
    const body = JSON.stringify({ app: APP, version: VERSION, saved: now.toISOString(),
                                  entries, photos, meta });
    return { blob: new Blob([body], { type: 'application/json' }), name: fileName(now),
             entries: entries.length, photos: photos.length };
  }

  /* Make a backup and send it to Downloads. Returns the file's name. */
  async function save() {
    const backup = await make();
    saveFile(backup.blob, backup.name);
    return backup.name;
  }

  /* Read a chosen file and check it really is a backup from this diary.
     Throws if it is not, so nothing is touched. */
  async function read(file) {
    let data;
    try { data = JSON.parse(await file.text()); } catch (_) { data = null; }
    if (!data || data.app !== APP || !Array.isArray(data.entries) || !Array.isArray(data.photos)) {
      throw new Error('not a backup');
    }
    return data;
  }

  /* Replace everything in the diary with the backup's contents. */
  async function restore(data) {
    const photos = [];
    for (const p of data.photos) {
      photos.push({ id: p.id, blob: await (await fetch(p.data)).blob() });
    }
    await Store.replaceAll({ entries: data.entries, photos, meta: data.meta || [] });
  }

  return { save, read, restore, saveFile, fileName };
})();
