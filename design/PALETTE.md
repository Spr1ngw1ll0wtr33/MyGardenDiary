# My Garden Diary — design system (Stage 1, FINAL — approved 04/09/2026)

Source of truth: Kathryn's Claude Design mockups and colour chart (border, fonts, colours,
motifs), plus five rounds of her corrections on 03–04/09/2026. The functional layout follows the
approved build plan. Supersedes all earlier rounds.

The exact rendering of everything below is `design/stage1-preview.html` — the approved artefact.
Where this file and that file ever disagree, the preview is right and this file is the error.

## Typefaces (files in design/fonts/, both SIL Open Font Licence)

| Role | Face (installed family name) |
|---|---|
| App title | Boecklins Universe |
| Dates, subtitles, buttons, journal text, documents | Glass Antiqua |
| Tiny field labels only | EB Garamond |

## Layout

- **No panels.** Subtitles and cream input boxes sit directly on the seasonal background;
  sections are separated by the gold squiggle-and-dot divider (94% wide, centred).
- **Frame:** the ornate gold frame, thinned one erosion pass, applied nine-slice so corners keep
  their true shape at any size and only the plain rails stretch. It reads as background, never
  foreground. Source: `design/frame-thin.png` (920×1800; corner artwork 220 wide × 300 tall).
- **Motifs:** strokes thickened ×1.8, dots ×1.25 (`design/motifs/motif-*-bold.svg`) to match the
  thinned frame's weight.
- **Header order** (rounds 4–5), top to bottom:
  1. Title, centred, Boecklins Universe 1.6rem — sitting **just below where the border's top
     ornament finishes** (content inset 46px from the top edge, not more).
  2. **Backup & Exit** — dual-action, critical colour, right-aligned, **inset 16px from the right
     edge so it never touches the border**, and **the same size as the other buttons**
     (0.9rem text, 6px/13px padding). Round 5 corrected both its size and its position.
  3. Gold divider.
  4. Date row: motif at the **left** of the page, date **left-justified** beside it, on two lines
     ("Friday 4th" / "September 2026"), Glass Antiqua 1.62rem.
- **Button alignment:** Add Photos and Update sit at the left edge, aligned with the boxes; Save
  and Delete sit at the right; clear space between (`justify-content: space-between`).
- **Journal box:** sized for long-form writing (min-height 170px). Photo thumbnails 52px, each
  with a small ✕ badge in the critical colour to remove it; Add Photos appends.
- **This month:** full-width scrolling list inset 8px from the border, several entries visible,
  selected entry highlighted (#F1E2B8 with a 3px inset gold bar). Update and Delete beneath act
  on the highlighted entry, whose contents load into the form above for editing.

## Constants in every season

- Entry boxes and journal box: Pale Cream **#FBF6E8**, black text (#111), 1px gold border at 80%
  opacity, radius 9px, padding 7px 9px.
- Border, dividers, motifs, focus bars: Gold **#C9A24D**.
- Buttons: rectangular with rounded corners (radius 9px — the entry-box idiom), white text,
  no border. Standard 0.9rem/6px·12px; the larger action buttons 0.95rem/7px·14px, min-width 84px.
- Field labels: EB Garamond, 0.68rem, uppercase, letter-spacing 0.1em, bold, in the season's
  subtitle colour.
- App content padding: 46px top, 30px sides, 84px bottom.

## Per-season assignments (Kathryn's spec, verbatim; pressed states tuned per ground)

| Season | Background | Title & date | Subtitles & labels | Save | Add Photos / Update | Backup & Exit / Delete |
|---|---|---|---|---|---|---|
| Spring | Spring Green #9AB791 | Tulip Orange, adjusted #E0813C | Daffodil Yellow #E9D58F | Sky Blue #A9CFE2 | Soft Lavender #BCB2CE | Rose Pink #D9A1A0 |
| Summer | Cornflower Blue #6495ED | Mustard Yellow #D2B161 | Pale Sand #E6D3B6 | Seafoam Green #A1B5A0 | Warm Tan #C5A07F | Coral Pink #D79383 |
| Autumn | Olive Green #878961 | Rust Orange, lightened #B57E63 | Rust Orange, lightened #B57E63 | Goldenrod #BFA253 | Terracotta #C3765A | Maroon Red #8D5356 |
| Winter | Forest Green #5D7865 | Ice Blue #D3DEE8 | Ice Blue #D3DEE8 | Steel Blue #848F9A | Deep Plum, lightened #8E7990 | Berry Red #9A5E66 |

Pressed (tap-feedback) colours, in the same column order — Save / Aux / Critical:

| Season | Save pressed | Aux pressed | Critical pressed |
|---|---|---|---|
| Spring | #87B2CB | #9E92B6 | #C08183 |
| Summer | #839981 | #A98261 | #BC7263 |
| Autumn | #A0873C | #A65E44 | #713F44 |
| Winter | #69747F | #746080 | #7C464F |

Adjusted colours APPROVED 04/09/2026: Tulip Orange #E0813C, Rust Orange #B57E63, Deep Plum
#8E7990. White button text approved as rendered.

Motifs: Spring butterfly · Summer cornflower · Autumn grapes · Winter snowdrop.
Seasonal switch: 1 March / 1 June / 1 September / 1 December, from the device date.

**App icon (chosen 04/09/2026):** the gold grape vine (Autumn's motif) on Forest Green #5D7865,
with the thin gold ring, rounded-square. Fixed all year.

## Documents — one palette in every season (Kathryn's decision, round 3)

Pale Cream #FBF6E8 page; gold frame and squiggle dividers; title "My Garden Diary" in Boecklins
Universe, Mustard #D2B161, sized above the month date in Glass Antiqua, Seafoam #A1B5A0; day
headings Seafoam; mustard table header; dividers separate one day from the next (never under a
heading), each divider preceded by a Word clearing break so it always sits below both the text
and the photographs. The frame is composited ornament-aware at print resolution
(design/frame-a4-*.png): corners and centre ornaments at true shape, side rails taken as the
full span between corner cuts so the junctions are seamless. Table columns total
13,400 dxa. Fonts are named in the files; they fall back to an ordinary serif on machines
without them. Generator: design/samples/gen-docs.js (docx 9.7.1, MIT).

Both sample documents APPROVED by Kathryn on 04/09/2026 after her LibreOffice check.
