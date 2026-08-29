# My Garden Diary — Build Plan

> **Status: APPROVED by Kathryn on 29/08/2026**, including the two amendments made at her request before approval: the document library named and verified in the plan itself (docx, MIT licence, v9.7.1, actively maintained), and the backup reminder made explicit and escalating — always visible, never a hard stop.
>
> Next step when work resumes: **Stage 1 — Design** (seasonal palette previews, icon options, and sample documents for the LibreOffice check). Nothing beyond Stage 1 proceeds without her approval of the Stage 1 deliverables.

## Context

A personal gardening diary for Kathryn, used day to day on a Samsung Android phone (Chrome) and tested on a Zorin Linux PC (Firefox). It records what was done in the garden and when, in two kinds of entry: a factual eight-field record and a free-written journal with photographs. At each month end the diary is written out to two editable .docx documents (checked in LibreOffice Writer, not Word) and the app empties. The guiding principle, which outranks feature completeness: **focused and straightforward, or it will not get used.**

Everything below was agreed in the interview. Nothing on the brief's rejected list (AI processing, linked crops, databases, accounts, external services, weather data) appears in this plan.

## What is being built

A **Progressive Web App (PWA)**: a small website whose files live in the MyGardenDiary GitHub repository, opened once in Chrome and installed to the phone from there. After installation it works entirely offline, appears as "My Garden Diary" in the launcher with its own icon, and never sends data anywhere. There is no framework, no build step, and no external service — just plain HTML, CSS and JavaScript files, with the two code libraries it needs (document generation, nothing else) stored as files in the repository so the app never fetches anything from the internet once installed.

### The document library — settled now, not at Stage 3

The document-generation library is **docx** (github.com/dolanmiu/docx), stored locally in `vendor/`.

- **Licence:** MIT — free to use for any purpose, personal use included, with no obligations beyond keeping the licence text with the library file. Fully permits this use.
- **Maintenance:** actively maintained — current version 9.7.1, published 27/05/2026 (verified on the npm registry today). It is the most widely used .docx generator for JavaScript and is built to run in the browser, which this app requires.
- **Capability:** it produces everything this plan describes — landscape and portrait page setup, tables, page borders, page background colour, styled headings and fonts, and embedded photographs including small images with text wrapped around them.
- **Proof before dependence:** the Stage 1 sample documents will exercise every one of those features with dummy content, and Kathryn's LibreOffice check of those samples is the acceptance test. If any single feature renders badly in LibreOffice (page background colour is the one I judge least certain), that feature gets a simpler substitute at Stage 1 — for example a tinted content panel instead of a whole-page background — before any app code is written against it.

### The screens

1. **Main screen** — the working day view.
   - Factual entry form: Date (prefilled, editable) · Action (Sowed, Potted On, Planted Out, Harvested) · Plant · Variety · Type (Saved Seed, Old Seed, New Seed, Seedling, Plug Plant, Plant) · Location (Propagator, Greenhouse, Pot / Trough, Garden, Allotment) · Bed Number · Yield. All eight fields always visible, any may be blank, no linking between entries.
   - Journal entry: large free-text area plus "add photos", multiple photos selectable in one action.
   - No limit on entries per day; factual, journal and photos can all be saved for the same day.
2. **This month** — a simple list of the current month's entries only (not an archive), where any entry can be reopened, changed, or deleted; photos can be added to or removed from a set, or the set deleted whole.
3. **Month-end gate** — appears automatically on the first opening in a new month *if* the previous month has content. It generates both documents, downloads them on a single tap (Chrome asks once for permission to download two files together), then requires an explicit "I have both files" confirmation before the month clears. It cannot be bypassed; months with no entries produce no documents and no gate, so after a quiet winter gap the app simply carries on.
4. **Backup & restore** — save a JSON backup file (all current entries and photos) at any time; restore from a chosen backup file. Backup file names carry date and time so the latest is obvious: `My-Garden-Diary-Backup-2026-08-29-1732.json`.

### The backup reminder — explicit, never a hard stop

The backup is the only defence against Chrome's stored data being cleared, so the reminder is designed to be impossible to miss but never to block:

- **Always visible:** the main screen carries a permanent backup status line — "Last backup: 3 days ago · 12 changes since" — which shifts from quiet to amber to red as the backup ages or unsaved changes build up.
- **On exit:** leaving through the app's own exit control brings up a full-screen notice, not a small message: it states plainly when the last backup was taken and exactly what stands to be lost — "18 entries and 9 photographs from August are not in any backup file." It offers **Back up now** as the prominent action and **Leave without backing up** as a plain, always-available choice. Exit is never blocked.
- **Escalation:** the longer since the last backup, and the more unsaved changes, the stronger the notice's wording and colouring — drawing on the same red used for destructive actions in the button hierarchy.
- **One honest limit:** if the app is killed from Android's recent-apps view (swiped away), Android does not tell it, so no exit notice can appear that way. The entries themselves are safe — autosave means nothing is lost by a swipe — and the permanent status line exists precisely so the state of the backup is in view every time the app is opened, not only on the way out.

### How data is kept safe

- Everything autosaves continuously to the app's own private storage on the phone (IndexedDB, with persistent-storage protection requested from Android). Opening the app shows the month exactly as it was left; a half-finished entry survives an unexpected exit.
- Photos are shrunk on the way in to diary size (about 1,000 pixels on the long edge, a few hundred KB each) — sized for two to four per page with wrapped text. Originals on the camera roll are untouched.
- The JSON backup is the belt and braces, moved by hand to the PC and its cloud storage.
- The month clears **only** after both documents have been generated, both downloads triggered, and Kathryn has confirmed she has them.

### The two documents

Both .docx, both built from simple document features that LibreOffice Writer handles reliably; nothing Word-only. Each month's pair loads into a seasonal template: a page background colour drawn from that season's palette (a lighter accent for Winter, never the dark app background), the app's border style as a page border, a title in the palette font — e.g. "August 2026" — with the season's motif beside it, and the content flowing beneath as normal document text (no floating text boxes, so editing and page overflow behave properly).

- **Table document** — landscape; eight columns matching the eight fields, one row per factual entry, dates as dd.mm.yyyy.
- **Journal document** — portrait; each day headed with its full date ("Tuesday 12 August 2026"), the written entries, and small photographs with text wrap.
- File names: `My-Garden-Diary-Table-2026-08.docx`, `My-Garden-Diary-Journal-2026-08.docx`.

### Look and feel

Art Nouveau: soft, curving, plant-drawn lines. One unified layout and font pairing all year; the colour palette and a seasonal motif do the seasonal work, switching automatically on 1 March / 1 June / 1 September / 1 December. Winter dark, Summer light, Spring bright mid-tone, Autumn rich mid-tone. Buttons and input boxes clearly distinct from the background; the border style repeated as the visual cue dividing functional sections; a colour hierarchy by function (save ≠ exit, update ≠ delete); every button's tap-feedback colour individually chosen against its background. Uncluttered, clearly structured, but not dull. Exact colours and fonts are worked through together at the design stage — with Claude Design as the fallback if that proves difficult.

App icon: a stylised Art Nouveau garden mark — spring flowers or a fruit-laden tree — simpler than the reference images, colours drawn from the seasonal palettes (mixing seasons is fine), legible at recent-apps-bar size. A small set of options to choose from.

## Build order — five stages, each ending with Kathryn's approval

**Stage 1 — Design.** Before any app code: (a) the four seasonal palettes and font pairing shown as four phone-shaped preview pages Kathryn can open and compare; (b) two or three icon options; (c) two sample documents filled with dummy entries, for her to download and open in LibreOffice Writer on the PC — because neither of us here can open a .docx, her PC check is the acceptance test for the document design. Nothing proceeds until she approves all three.

**Stage 2 — The working core.** Main screen, both entry types, photos, this-month list with edit/delete, continuous autosave. Delivered as a test page she can try in the phone's browser before installation.

**Stage 3 — Month end.** Document generation on the phone, the gate, the single-tap double download, the confirm-then-clear step, and the skipped-months catch-up.

**Stage 4 — Backup and restore.** Timestamped JSON save, leave-reminder, restore from file.

**Stage 5 — Installation.** PWA manifest, offline caching, the chosen icon; the repository published through GitHub Pages (a free GitHub feature — a one-time settings step I will either do or walk through click by click); plain-English install instructions for the phone; a short test checklist for phone and PC.

Each stage is committed and pushed to the designated branch (`claude/gardening-diary-brief-rwnv3m`) as it is approved.

## Files to be created (all new — the repository is empty)

- `index.html`, `styles.css`, `app.js` — the app itself
- `seasons.css` — the four palettes as swappable colour sets
- `docs-export.js` — builds the two .docx files
- `storage.js` — autosave, backup, restore
- `manifest.json`, `service-worker.js`, `icons/` — PWA installation and offline
- `vendor/` — the document-generation library, stored locally
- `design/` — Stage 1 preview pages and sample documents

## Verification

- On my side, every stage: the app driven in a real (headless) Chromium at phone-screen size with screenshots checked; generated .docx files unzipped and structurally verified, and where LibreOffice can be installed in this workspace, rendered with it to images and inspected — so what reaches Kathryn has already been seen working.
- On Kathryn's side, per stage: open the preview/test page on the phone; at Stages 1 and 3, open the documents in LibreOffice Writer on the PC and confirm layout, editability and photographs; at Stage 5, install the app, make real entries, and run the checklist (including a forced month-end with test data before trusting it with a real month).

## Explicitly out of scope

Story/summary generation, AI processing of entries, linked crops or database behaviour, accounts or external services, automatic weather data, bed layouts, crop rotation planning, browsing past months inside the app. The reference record is the documents, not the app.
