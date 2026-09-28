/* My Garden Diary — the month end.

   On the first opening in a new month, any earlier month that holds entries is written out to
   its two documents — the table and the journal — and the app waits at that screen until both
   have been downloaded and Kathryn confirms she has them. Only then is that month cleared.
   A month with no entries produces nothing and never holds her up.

   The documents follow the design approved on 04/09/2026 (design/samples/gen-docs.js):
   one palette whatever the season — pale cream page, the gold frame on every page, mustard
   title, seafoam date — with the motif of the month's own season. */

const MonthEnd = (() => {
  'use strict';

  const $ = (id) => document.getElementById(id);
  const D = window.docx;

  const GOLD = 'C9A24D', CREAM = 'FBF6E8', MUSTARD = 'D2B161', SEAFOAM = 'A1B5A0', INK = '221E14';
  const TITLE_FONT = 'Boecklins Universe', BODY_FONT = 'Glass Antiqua';

  // The single-file test build supplies these as embedded images instead of file paths.
  const ASSETS = window.DOC_ASSETS || {
    framePortrait:  'assets/doc/frame-portrait.png',
    frameLandscape: 'assets/doc/frame-landscape.png',
    divider:        'assets/doc/divider.png',
    spring: 'assets/doc/motif-spring.png', summer: 'assets/doc/motif-summer.png',
    autumn: 'assets/doc/motif-autumn.png', winter: 'assets/doc/motif-winter.png'
  };

  const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July',
                  'August', 'September', 'October', 'November', 'December'];
  const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const pad = (n) => String(n).padStart(2, '0');

  /* ---------------- months ---------------- */

  const monthKey = (iso) => (iso || '').slice(0, 7);             // '2026-08'
  const thisMonthKey = () => { const d = new Date(); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`; };
  const monthName = (key) => `${MONTHS[+key.slice(5, 7) - 1]} ${key.slice(0, 4)}`;
  const monthOnly = (key) => MONTHS[+key.slice(5, 7) - 1];

  function seasonOf(key) {
    const m = +key.slice(5, 7);
    if (m >= 3 && m <= 5) return 'spring';
    if (m >= 6 && m <= 8) return 'summer';
    if (m >= 9 && m <= 11) return 'autumn';
    return 'winter';
  }

  const dotted = (iso) => { const [y, m, d] = iso.split('-'); return `${d}.${m}.${y}`; };
  function longDate(iso) {
    const [y, m, d] = iso.split('-').map(Number);
    const when = new Date(y, m - 1, d);
    return `${DAYS[when.getDay()]} ${d} ${MONTHS[m - 1]} ${y}`;
  }

  /* Every earlier month that still has entries, oldest first. */
  async function pendingMonths() {
    const now = thisMonthKey();
    const keys = new Set();
    for (const e of await Store.allEntries()) {
      const k = monthKey(e.date);
      if (k && k < now) keys.add(k);
    }
    return [...keys].sort();
  }

  /* ---------------- building the documents ---------------- */

  async function bytes(src) {
    const res = await fetch(src);
    if (!res.ok) throw new Error('Could not load ' + src);
    return new Uint8Array(await res.arrayBuffer());
  }

  async function loadArtwork(season) {
    const [framePortrait, frameLandscape, divider, motif] = await Promise.all([
      bytes(ASSETS.framePortrait), bytes(ASSETS.frameLandscape),
      bytes(ASSETS.divider), bytes(ASSETS[season])
    ]);
    return { framePortrait, frameLandscape, divider, motif };
  }

  const text = (t, opts = {}) => new D.TextRun({ text: t, font: BODY_FONT, color: INK, size: 24, ...opts });

  // A line break that also drops below any photograph floating beside the text, so a divider
  // always sits on its own line under both. The library has no switch for this, so it is
  // written as the raw Word instruction.
  const clearingBreak = () => new D.Paragraph({
    spacing: { before: 0, after: 0 },
    children: [D.ImportedXmlComponent.fromXmlString(
      '<w:r><w:br w:type="textWrapping" w:clear="all"/></w:r>').root[0]]
  });

  const dividerImage = (art, w, h) =>
    new D.ImageRun({ type: 'png', data: art.divider, transformation: { width: w, height: h } });

  const frameHeader = (art, landscape) => new D.Header({
    children: [new D.Paragraph({
      children: [new D.ImageRun({
        type: 'png', data: landscape ? art.frameLandscape : art.framePortrait,
        transformation: landscape ? { width: 1123, height: 794 } : { width: 794, height: 1123 },
        floating: {
          horizontalPosition: { relative: D.HorizontalPositionRelativeFrom.PAGE, offset: 0 },
          verticalPosition: { relative: D.VerticalPositionRelativeFrom.PAGE, offset: 0 },
          behindDocument: true, allowOverlap: true,
          wrap: { type: D.TextWrappingType.NONE }
        }
      })]
    })]
  });

  const titleBlock = (art, key) => [
    new D.Paragraph({
      alignment: D.AlignmentType.CENTER, spacing: { before: 60, after: 0 },
      children: [new D.ImageRun({ type: 'png', data: art.motif, transformation: { width: 66, height: 66 } })]
    }),
    new D.Paragraph({
      alignment: D.AlignmentType.CENTER, spacing: { before: 40, after: 40 },
      children: [new D.TextRun({ text: 'My Garden Diary', font: TITLE_FONT, color: MUSTARD, size: 62 })]
    }),
    new D.Paragraph({
      alignment: D.AlignmentType.CENTER, spacing: { before: 0, after: 60 },
      children: [new D.TextRun({ text: monthName(key), font: BODY_FONT, color: SEAFOAM, size: 46 })]
    }),
    new D.Paragraph({
      alignment: D.AlignmentType.CENTER, spacing: { after: 220 },
      children: [dividerImage(art, 380, 22)]
    })
  ];

  const quietNote = (words) => new D.Paragraph({
    alignment: D.AlignmentType.CENTER, spacing: { before: 400 },
    children: [text(words, { color: '6B6353' })]
  });

  const byDate = (a, b) => (a.date || '').localeCompare(b.date || '') || (a.created || 0) - (b.created || 0);

  /* Document 1 — the table: landscape, eight columns, one row per entry. */
  async function buildTable(entries, key, art) {
    const headers = ['Date', 'Action', 'Plant', 'Variety', 'Type', 'Location', 'Bed No.', 'Yield'];
    const widths = [1450, 1500, 2100, 2300, 1550, 1800, 800, 1900];   // 13,400 dxa, clear of the frame

    const cell = (value, w, header) => new D.TableCell({
      width: { size: w, type: D.WidthType.DXA },
      verticalAlign: D.VerticalAlign.CENTER,
      shading: { type: D.ShadingType.CLEAR, fill: header ? MUSTARD : 'FFFDF5' },
      margins: { top: 80, bottom: 80, left: 110, right: 110 },
      children: [new D.Paragraph({ children: [text(value || '', header ? { bold: true } : {})] })]
    });

    const rows = entries.filter(e => e.kind === 'factual').sort(byDate);
    const line = { style: D.BorderStyle.SINGLE, size: 6, color: GOLD };
    const thin = { style: D.BorderStyle.SINGLE, size: 4, color: GOLD };

    const body = rows.length
      ? [new D.Table({
          layout: D.TableLayoutType.FIXED, alignment: D.AlignmentType.CENTER,
          width: { size: widths.reduce((a, b) => a + b, 0), type: D.WidthType.DXA },
          borders: { top: line, bottom: line, left: line, right: line,
                     insideHorizontal: thin, insideVertical: thin },
          rows: [
            new D.TableRow({ tableHeader: true, children: headers.map((h, i) => cell(h, widths[i], true)) }),
            ...rows.map(e => new D.TableRow({ children: [
              dotted(e.date), e.action, e.plant, e.variety, e.type, e.location, e.bed, e.yield
            ].map((v, i) => cell(v, widths[i], false)) }))
          ]
        })]
      : [quietNote('Nothing was recorded in the table this month.')];

    const doc = new D.Document({
      background: { color: CREAM },
      styles: { default: { document: { run: { font: BODY_FONT, color: INK, size: 24 } } } },
      sections: [{
        headers: { default: frameHeader(art, true) },
        properties: { page: {
          size: { orientation: D.PageOrientation.LANDSCAPE },
          margin: { top: 1050, bottom: 900, left: 1250, right: 1250 }
        } },
        children: [...titleBlock(art, key), ...body]
      }]
    });
    return D.Packer.toBlob(doc);
  }

  /* Document 2 — the journal: portrait, a full-date heading for each day, small photographs
     with the writing wrapped around them, and a divider between one day and the next. */
  async function photoImage(id, box, float) {
    const record = await Store.getPhoto(id);
    if (!record) return null;
    const bitmap = await createImageBitmap(record.blob);
    const scale = box / Math.max(bitmap.width, bitmap.height);
    const size = { width: Math.round(bitmap.width * scale), height: Math.round(bitmap.height * scale) };
    if (bitmap.close) bitmap.close();
    const data = new Uint8Array(await record.blob.arrayBuffer());
    const opts = { type: 'jpg', data, transformation: size };
    if (float) {
      opts.floating = {
        horizontalPosition: { relative: D.HorizontalPositionRelativeFrom.MARGIN, align: float },
        verticalPosition: { relative: D.VerticalPositionRelativeFrom.PARAGRAPH, offset: 0 },
        wrap: { type: D.TextWrappingType.SQUARE,
                side: float === 'right' ? D.TextWrappingSide.LEFT : D.TextWrappingSide.RIGHT },
        margins: { left: 60480, right: 60480, top: 60480, bottom: 60480 }
      };
    }
    return new D.ImageRun(opts);
  }

  async function buildJournal(entries, key, art) {
    const journal = entries.filter(e => e.kind === 'journal').sort(byDate);
    const days = [];
    for (const e of journal) {
      if (!days.length || days[days.length - 1].date !== e.date) days.push({ date: e.date, entries: [] });
      days[days.length - 1].entries.push(e);
    }

    const children = [...titleBlock(art, key)];
    let side = 'right';                                   // photographs alternate right and left
    const nextSide = () => { const s = side; side = side === 'right' ? 'left' : 'right'; return s; };

    for (let d = 0; d < days.length; d++) {
      if (d > 0) {
        children.push(clearingBreak());
        children.push(new D.Paragraph({
          alignment: D.AlignmentType.CENTER, spacing: { before: 160, after: 120 }, keepNext: true,
          children: [dividerImage(art, 380, 22)]
        }));
      }
      // a day's heading never sits alone at the foot of a page, away from its writing
      children.push(new D.Paragraph({
        spacing: { before: 120, after: 100 }, keepNext: true,
        children: [new D.TextRun({ text: longDate(days[d].date), font: BODY_FONT, size: 32, color: SEAFOAM })]
      }));

      for (const entry of days[d].entries) {
        // Every line she starts is its own paragraph — on a phone, Enter means a new paragraph,
        // and a line break inside justified text would stretch the line before it.
        const paras = (entry.text || '').split('\n').map(p => p.trim()).filter(Boolean);
        const photos = (entry.photoIds || []).slice();

        // each paragraph carries one photograph beside it, alternating sides
        for (const para of paras) {
          const runs = [];
          if (photos.length) {
            const img = await photoImage(photos.shift(), 176, nextSide());
            if (img) runs.push(img);
          }
          children.push(new D.Paragraph({
            spacing: { after: 140 }, alignment: D.AlignmentType.JUSTIFIED,
            children: [...runs, text(para)]
          }));
        }

        // photographs left over once the writing runs out sit together in a row beneath it
        if (photos.length) {
          if (paras.length) children.push(clearingBreak());
          const row = [];
          for (const id of photos) {
            const img = await photoImage(id, 150, null);
            if (img) row.push(img, new D.TextRun({ text: '  ' }));
          }
          children.push(new D.Paragraph({
            alignment: D.AlignmentType.CENTER, spacing: { before: 80, after: 140 }, children: row
          }));
        }
      }
    }

    if (!days.length) children.push(quietNote('No journal entries were written this month.'));

    const doc = new D.Document({
      background: { color: CREAM },
      styles: { default: { document: { run: { font: BODY_FONT, color: INK, size: 24 } } } },
      sections: [{
        headers: { default: frameHeader(art, false) },
        properties: { page: { margin: { top: 1250, bottom: 1250, left: 1400, right: 1400 } } },
        children
      }]
    });
    return D.Packer.toBlob(doc);
  }

  const fileNames = (key) => ({
    table:   `My-Garden-Diary-Table-${key}.docx`,
    journal: `My-Garden-Diary-Journal-${key}.docx`
  });

  async function buildBoth(key) {
    const entries = (await Store.allEntries()).filter(e => monthKey(e.date) === key);
    const art = await loadArtwork(seasonOf(key));
    const [table, journal] = await Promise.all([
      buildTable(entries, key, art), buildJournal(entries, key, art)
    ]);
    return { table, journal, entries };
  }

  /* ---------------- downloading ---------------- */

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

  const pause = (ms) => new Promise(r => setTimeout(r, ms));

  /* ---------------- the month-end screen ---------------- */

  let open = false;
  let current = null;        // { key, files } for the month on screen

  function show(state) {
    for (const el of document.querySelectorAll('#gate [data-state]')) {
      el.hidden = el.dataset.state !== state;
    }
  }

  function describe(entries) {
    const n = (count, one, many) => `${count} ${count === 1 ? one : many}`;
    const factual = entries.filter(e => e.kind === 'factual').length;
    const journal = entries.filter(e => e.kind === 'journal');
    const photos = journal.reduce((sum, e) => sum + (e.photoIds || []).length, 0);
    const parts = [];
    if (factual) parts.push(n(factual, 'entry for the table', 'entries for the table'));
    if (journal.length) parts.push(n(journal.length, 'journal entry', 'journal entries'));
    if (photos) parts.push(n(photos, 'photograph', 'photographs'));
    return parts.join(', ');
  }

  async function presentMonth(key) {
    const entries = (await Store.allEntries()).filter(e => monthKey(e.date) === key);
    current = { key, files: null };
    $('gateMonth').textContent = monthName(key);
    $('gateSummary').textContent = describe(entries);
    $('gateMonthName').textContent = monthOnly(key);
    for (const el of document.querySelectorAll('.gateClearName')) el.textContent = monthOnly(key);
    const names = fileNames(key);
    $('gateTableName').textContent = names.table;
    $('gateJournalName').textContent = names.journal;
    $('gateError').hidden = true;
    show('ready');
  }

  async function download() {
    const key = current.key;
    const names = fileNames(key);
    show('working');
    try {
      const built = current.files || await buildBoth(key);
      current.files = built;
      saveFile(built.table, names.table);
      await pause(900);                    // Chrome handles two downloads better with a gap
      saveFile(built.journal, names.journal);
      show('taken');
    } catch (err) {
      console.error('Month-end documents could not be made', err);
      $('gateError').hidden = false;       // nothing is cleared if the documents were not made
      show('ready');
    }
  }

  function askToClear(key) {
    return new Promise((resolve) => {
      const box = $('ask');
      $('askText').textContent =
        `Clear ${monthName(key)} from the diary?\n\nCheck both files are in your Downloads first — ` +
        'once cleared, the documents are the record.';
      $('askYes').textContent = 'Yes, clear it';
      box.hidden = false;
      const done = (answer) => {
        box.hidden = true;
        $('askYes').removeEventListener('click', yes);
        $('askNo').removeEventListener('click', no);
        resolve(answer);
      };
      const yes = () => done(true);
      const no = () => done(false);
      $('askYes').addEventListener('click', yes);
      $('askNo').addEventListener('click', no);
      $('askNo').focus();
    });
  }

  async function clearMonth() {
    const key = current.key;
    if (!current.files) return;              // never clear a month whose documents were not made
    if (!(await askToClear(key))) return;

    for (const e of await Store.allEntries()) {
      if (monthKey(e.date) === key) await Store.deleteEntry(e.id);
    }
    await Store.tidyPhotos();
    document.dispatchEvent(new CustomEvent('diary:changed'));

    const next = (await pendingMonths())[0];
    if (next) await presentMonth(next);
    else close();
  }

  function close() {
    open = false;
    current = null;
    $('gate').hidden = true;
    document.body.classList.remove('gate-open');
  }

  /* Called when the app opens, and whenever it comes back into view. */
  async function check() {
    if (open) return;
    const months = await pendingMonths();
    if (!months.length) return;
    open = true;
    document.body.classList.add('gate-open');
    $('gate').hidden = false;
    await presentMonth(months[0]);
  }

  function wire() {
    $('gateDownload').addEventListener('click', download);
    $('gateAgain').addEventListener('click', download);
    $('gateClear').addEventListener('click', clearMonth);
  }

  return { check, wire, pendingMonths, buildBoth, fileNames };
})();
