/* My Garden Diary — how the app behaves.
   Save makes a new entry. Tap an entry in This month to select it: its contents load into
   the form above, and Update saves your changes to it while Delete removes it.
   Everything you type is kept as you go, so nothing is lost if the app closes. */

(() => {
  'use strict';

  const $ = (id) => document.getElementById(id);

  const FACTUAL_FIELDS = ['date', 'action', 'plant', 'variety', 'type', 'location', 'bed', 'yield'];
  const PHOTO_MAX_EDGE = 1000;     // long edge, in pixels — sized for the journal document
  const PHOTO_QUALITY  = 0.82;

  let entries = [];          // everything the app is currently holding
  let selectedId = null;     // the highlighted entry in This month, if any
  let editingId = null;      // the entry currently loaded into the form, if any
  let journalPhotoIds = [];  // photographs attached to the journal box right now
  let stashedDraft = null;   // the unsaved work set aside while editing an existing entry
  let thumbUrls = [];        // object URLs to release when the strip is redrawn

  /* ---------------- the season ---------------- */

  function seasonFor(date) {
    const m = date.getMonth() + 1;                 // meteorological seasons
    if (m >= 3 && m <= 5)  return 'spring';
    if (m >= 6 && m <= 8)  return 'summer';
    if (m >= 9 && m <= 11) return 'autumn';
    return 'winter';
  }

  // The single-file test build supplies these as embedded images instead of file paths.
  const MOTIF_SRC = window.MOTIF_SRC || {
    spring: 'assets/motifs/spring.svg',
    summer: 'assets/motifs/summer.svg',
    autumn: 'assets/motifs/autumn.svg',
    winter: 'assets/motifs/winter.svg'
  };

  function applySeason(date) {
    const season = seasonFor(date);
    document.body.className = 'season-' + season;
    $('seasonMotif').src = MOTIF_SRC[season];
  }

  /* ---------------- dates ---------------- */

  const pad = (n) => String(n).padStart(2, '0');
  const isoLocal = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

  function ordinal(n) {
    if (n > 3 && n < 21) return n + 'th';
    return n + ({ 1: 'st', 2: 'nd', 3: 'rd' }[n % 10] || 'th');
  }

  function showToday(date) {
    const weekday = date.toLocaleDateString('en-GB', { weekday: 'long' });
    const month   = date.toLocaleDateString('en-GB', { month: 'long' });
    $('todayLine1').textContent = `${weekday} ${ordinal(date.getDate())}`;
    $('todayLine2').textContent = `${month} ${date.getFullYear()}`;
  }

  const shortDate = (iso) => {
    if (!iso) return '--/--';
    const [y, m, d] = iso.split('-');
    return `${d}/${m}`;
  };

  /* ---------------- small helpers ---------------- */

  let toastTimer = null;
  function toast(message) {
    const el = $('toast');
    el.textContent = message;
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('show'), 2400);
  }

  function confirmAsk(question, yesLabel = 'Yes, delete') {
    return new Promise((resolve) => {
      const box = $('ask');
      $('askText').textContent = question;
      $('askYes').textContent = yesLabel;
      box.hidden = false;
      const done = (answer) => {
        box.hidden = true;
        $('askYes').removeEventListener('click', yes);
        $('askNo').removeEventListener('click', no);
        resolve(answer);
      };
      const yes = () => done(true);
      const no  = () => done(false);
      $('askYes').addEventListener('click', yes);
      $('askNo').addEventListener('click', no);
      $('askNo').focus();
    });
  }

  /* ---------------- the form ---------------- */

  function readFactual() {
    const out = {};
    for (const f of FACTUAL_FIELDS) out[f] = $('f-' + f).value.trim();
    return out;
  }

  function writeFactual(values) {
    for (const f of FACTUAL_FIELDS) $('f-' + f).value = (values && values[f]) || '';
  }

  function factualIsEmpty(v) {
    // the date is prefilled, so it does not count towards "has she typed anything?"
    return FACTUAL_FIELDS.filter(f => f !== 'date').every(f => !v[f]);
  }

  function clearFactual() {
    writeFactual({});
    $('f-date').value = isoLocal(new Date());
  }

  function clearJournal() {
    $('j-text').value = '';
    journalPhotoIds = [];
    drawPhotoStrip();
  }

  /* ---------------- photographs ---------------- */

  async function shrink(file) {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, PHOTO_MAX_EDGE / Math.max(bitmap.width, bitmap.height));
    const w = Math.round(bitmap.width * scale);
    const h = Math.round(bitmap.height * scale);
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    canvas.getContext('2d').drawImage(bitmap, 0, 0, w, h);
    if (bitmap.close) bitmap.close();
    return new Promise(res => canvas.toBlob(res, 'image/jpeg', PHOTO_QUALITY));
  }

  async function addPhotos(fileList) {
    const files = Array.from(fileList).filter(f => f.type.startsWith('image/'));
    if (!files.length) return;
    let added = 0;
    for (const file of files) {
      try {
        const small = await shrink(file);
        const id = await Store.putPhoto(small);
        journalPhotoIds.push(id);
        added++;
      } catch (err) {
        console.error('Could not read a photograph', err);
      }
    }
    await drawPhotoStrip();
    saveDraft();
    const missed = files.length - added;
    toast(added === 1 ? '1 photograph added'
        : `${added} photographs added${missed ? ` — ${missed} could not be read` : ''}`);
  }

  async function drawPhotoStrip() {
    const strip = $('photoStrip');
    thumbUrls.forEach(URL.revokeObjectURL);
    thumbUrls = [];
    strip.replaceChildren();

    for (const id of journalPhotoIds) {
      const record = await Store.getPhoto(id);
      if (!record) continue;
      const url = URL.createObjectURL(record.blob);
      thumbUrls.push(url);

      const wrap = document.createElement('span');
      wrap.className = 'thumb';

      const img = document.createElement('img');
      img.src = url;
      img.alt = 'Attached photograph';

      const x = document.createElement('button');
      x.type = 'button';
      x.className = 'x';
      x.textContent = '✕';
      x.title = 'Remove this photograph';
      x.setAttribute('aria-label', 'Remove this photograph');
      x.addEventListener('click', async () => {
        journalPhotoIds = journalPhotoIds.filter(pid => pid !== id);
        await drawPhotoStrip();
        saveDraft();
      });

      wrap.append(img, x);
      strip.append(wrap);
    }
  }

  /* ---------------- the unfinished draft ---------------- */

  let draftTimer = null;
  function saveDraft() {
    if (selectedId !== null) return;            // editing an entry, not writing a new one
    clearTimeout(draftTimer);
    draftTimer = setTimeout(async () => {
      await Store.setMeta('draft-factual', readFactual());
      await Store.setMeta('draft-journal', { text: $('j-text').value, photoIds: journalPhotoIds });
    }, 400);
  }

  async function loadDraft() {
    const factual = await Store.getMeta('draft-factual');
    const journal = await Store.getMeta('draft-journal');
    if (factual) writeFactual(factual);
    if (!$('f-date').value) $('f-date').value = isoLocal(new Date());
    if (journal) {
      $('j-text').value = journal.text || '';
      journalPhotoIds = (journal.photoIds || []).slice();
    }
    await drawPhotoStrip();
  }

  async function clearDraft() {
    await Store.delMeta('draft-factual');
    await Store.delMeta('draft-journal');
  }

  /* ---------------- This month ---------------- */

  function entryLines(e) {
    if (e.kind === 'journal') {
      const count = (e.photoIds || []).length;
      const photos = count ? ` · ${count} photograph${count > 1 ? 's' : ''}` : '';
      const words = (e.text || '').trim().replace(/\s+/g, ' ');
      const snippet = words ? `“${words.slice(0, 60)}${words.length > 60 ? '…' : ''}”`
                            : 'No writing';
      return [`${shortDate(e.date)} · Journal entry${photos}`, snippet];
    }
    const what = [e.plant, e.variety].filter(Boolean).join(', ');
    const head = `${shortDate(e.date)} · ${e.action || 'Entry'}${what ? ' — ' + what : ''}`;
    const detail = [
      e.location,
      e.bed ? 'bed ' + e.bed : '',
      e.type,
      e.yield ? 'yield ' + e.yield : ''
    ].filter(Boolean).join(' · ');
    return [head, detail || 'No further details'];
  }

  function sortEntries(list) {
    return list.slice().sort((a, b) => {
      if (a.date !== b.date) return (b.date || '').localeCompare(a.date || '');
      return b.id - a.id;
    });
  }

  function renderMonth() {
    const list = $('monthList');
    list.replaceChildren();

    if (!entries.length) {
      const empty = document.createElement('div');
      empty.className = 'mempty';
      empty.textContent = 'Nothing recorded yet this month.';
      list.append(empty);
      setSelection(null);
      return;
    }

    for (const e of sortEntries(entries)) {
      const [line1, line2] = entryLines(e);
      const row = document.createElement('div');
      row.className = 'mrow' + (e.id === selectedId ? ' sel' : '');
      row.dataset.id = String(e.id);
      row.setAttribute('role', 'button');
      row.tabIndex = 0;

      const l1 = document.createElement('span');
      l1.className = 'l1';
      l1.textContent = line1;
      const l2 = document.createElement('span');
      l2.className = 'l2';
      l2.textContent = line2;

      row.append(l1, document.createElement('br'), l2);
      row.addEventListener('click', () => selectRow(e.id));
      row.addEventListener('keydown', (ev) => {
        if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); selectRow(e.id); }
      });
      list.append(row);
    }
  }

  function setSelection(id) {
    selectedId = id;
    updateListButtons();
  }

  /* The two buttons under This month act on the highlighted entry.
     Edit brings it up into the form; while editing, that button becomes Cancel. */
  function updateListButtons() {
    const edit = $('btnEdit');
    edit.disabled = selectedId === null;
    edit.textContent = editingId === null ? 'Edit' : 'Cancel';
    $('btnDelete').disabled = selectedId === null;
  }

  /* While an entry is being edited, the Save button beside it says Update and saves the
     changes; the other section's Save is held back so a second entry cannot be made by
     accident. There is only ever one Update button, next to what it will change. */
  function setEditingUI(kind) {
    const fBtn = $('btnSaveFactual'), jBtn = $('btnSaveJournal');
    const editing = { textContent: 'Update', className: 'btn aux big' };
    const saving  = { textContent: 'Save',   className: 'btn save big' };
    Object.assign(fBtn, kind === 'factual' ? editing : saving);
    Object.assign(jBtn, kind === 'journal' ? editing : saving);
    fBtn.disabled = kind === 'journal';
    jBtn.disabled = kind === 'factual';
    $('h-factual').textContent = kind === 'factual' ? 'What I did — editing' : 'What I did';
    $('h-journal').textContent = kind === 'journal' ? 'Journal — editing'    : 'Journal';
  }

  /* Keep the page where she left it when the list is redrawn. */
  async function holdingScroll(fn) {
    const y = window.scrollY;
    await fn();
    requestAnimationFrame(() => window.scrollTo(0, Math.min(y, document.body.scrollHeight)));
  }

  /* Tapping a row only highlights it. Nothing is loaded or changed until Edit is pressed. */
  async function selectRow(id) {
    if (editingId !== null) {
      toast('Finish this entry first — Update or Cancel');
      return;
    }
    setSelection(selectedId === id ? null : id);
    renderMonth();
  }

  async function beginEdit() {
    const entry = entries.find(e => e.id === selectedId);
    if (!entry) return;

    // set the half-written entry aside so it comes back when editing finishes
    stashedDraft = {
      factual: readFactual(),
      journal: { text: $('j-text').value, photoIds: journalPhotoIds.slice() }
    };

    editingId = entry.id;
    if (entry.kind === 'journal') {
      clearFactual();
      $('j-text').value = entry.text || '';
      journalPhotoIds = (entry.photoIds || []).slice();
      await drawPhotoStrip();
    } else {
      clearJournal();
      writeFactual(entry);
    }
    setEditingUI(entry.kind);
    updateListButtons();
    renderMonth();
    toast('Editing above — press Update to save');
  }

  /* Put everything back as it was, keeping the entry untouched. */
  async function stopEditing({ keepSelected = false } = {}) {
    editingId = null;
    setEditingUI(null);
    if (stashedDraft) {
      writeFactual(stashedDraft.factual);
      $('j-text').value = stashedDraft.journal.text || '';
      journalPhotoIds = stashedDraft.journal.photoIds.slice();
      stashedDraft = null;
    } else {
      clearFactual();
      clearJournal();
    }
    if (!$('f-date').value) $('f-date').value = isoLocal(new Date());
    if (!keepSelected) setSelection(null);
    updateListButtons();
    await drawPhotoStrip();
    renderMonth();
  }

  async function refresh() {
    entries = await Store.allEntries();
    renderMonth();
  }

  /* ---------------- saving ---------------- */

  const editingKind = () => {
    const entry = entries.find(e => e.id === editingId);
    return entry ? entry.kind : null;
  };

  async function saveFactual() {
    if (editingKind() === 'factual') return updateSelected();   // never a duplicate
    const values = readFactual();
    if (factualIsEmpty(values)) {
      toast('Nothing to save yet');
      return;
    }
    const entry = Object.assign({ kind: 'factual', created: Date.now() }, values);
    if (!entry.date) entry.date = isoLocal(new Date());
    await Store.putEntry(entry);
    clearFactual();
    await clearDraft();
    await refresh();
    toast('Entry saved');
  }

  async function saveJournal() {
    if (editingKind() === 'journal') return updateSelected();   // never a duplicate
    const text = $('j-text').value.trim();
    if (!text && !journalPhotoIds.length) {
      toast('Nothing to save yet');
      return;
    }
    await Store.putEntry({
      kind: 'journal',
      date: $('f-date').value || isoLocal(new Date()),
      created: Date.now(),
      text,
      photoIds: journalPhotoIds.slice()
    });
    clearJournal();
    await clearDraft();
    await refresh();
    toast('Journal entry saved');
  }

  async function updateSelected() {
    const entry = entries.find(e => e.id === editingId);
    if (!entry) return;

    if (entry.kind === 'journal') {
      entry.text = $('j-text').value.trim();
      entry.photoIds = journalPhotoIds.slice();
      entry.date = $('f-date').value || entry.date;
    } else {
      Object.assign(entry, readFactual());
    }
    entry.updated = Date.now();

    await holdingScroll(async () => {
      await Store.putEntry(entry);
      await Store.tidyPhotos();
      await stopEditing();
      await refresh();
    });
    toast('Entry updated');
  }

  async function deleteSelected() {
    const entry = entries.find(e => e.id === selectedId);
    if (!entry) return;
    const [line1] = entryLines(entry);
    const yes = await confirmAsk(`Delete this entry?\n\n${line1}`);
    if (!yes) return;

    await holdingScroll(async () => {
      await Store.deleteEntry(entry.id);
      await Store.tidyPhotos();
      stashedDraft = null;
      await stopEditing();
      await refresh();
    });
    toast('Entry deleted');
  }

  /* ---------------- start ---------------- */

  async function start() {
    const today = new Date();
    applySeason(today);
    showToday(today);
    $('f-date').value = isoLocal(today);

    if (!(await Store.available())) {
      toast('This browser will not let the diary save anything');
      return;
    }
    await Store.requestDurability();

    await loadDraft();
    await refresh();

    // typing anywhere keeps the unfinished entry safe
    for (const f of FACTUAL_FIELDS) $('f-' + f).addEventListener('input', saveDraft);
    $('j-text').addEventListener('input', saveDraft);

    $('btnSaveFactual').addEventListener('click', saveFactual);
    $('btnSaveJournal').addEventListener('click', saveJournal);
    $('btnEdit').addEventListener('click', () => editingId === null ? beginEdit() : stopEditing({ keepSelected: true }));
    $('btnDelete').addEventListener('click', deleteSelected);

    $('btnAddPhotos').addEventListener('click', () => $('photoInput').click());
    $('photoInput').addEventListener('change', async (ev) => {
      await addPhotos(ev.target.files);
      ev.target.value = '';            // so the same photograph can be chosen again
    });

    $('btnExit').addEventListener('click', () => {
      toast('Backup & Exit comes at Stage 4');
    });

    // if the app is left open across midnight into a new season, catch up quietly
    setInterval(() => {
      const now = new Date();
      if (!document.body.classList.contains('season-' + seasonFor(now))) applySeason(now);
      showToday(now);
    }, 60_000);
  }

  document.addEventListener('DOMContentLoaded', start);
})();
