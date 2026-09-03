# My Garden Diary — design system (Stage 1, round 2)

Source of truth: Kathryn's corrections of 03/09/2026, applied over her Claude Design mockups
(border, fonts, colours, motifs) and colour chart. The functional layout follows the approved
build plan. This supersedes round 1 entirely.

## Typefaces (files in design/fonts/, both SIL Open Font Licence)

| Role | Face (installed family name) |
|---|---|
| App title | Boecklins Universe |
| Dates, subtitles, buttons, journal text, documents | Glass Antiqua |
| Tiny field labels only | EB Garamond |

## Layout principles (round 2)

- **No panels.** Subtitles and cream input boxes sit directly on the seasonal background;
  sections are separated by the gold squiggle-and-dot divider.
- **Frame:** the ornate gold frame, thinned one erosion pass and composited nine-slice
  (design/frame-thin.png source; frame-phone.png, frame-a4-portrait.png, frame-a4-landscape.png)
  so corners never distort. It reads as background, not foreground.
- **Motifs:** strokes thickened ×1.8, dots ×1.25 (design/motifs/*-bold.svg) to match the
  thinned frame's weight.
- **Save Backup & Exit:** dual-action, critical colour, fixed top right. No backup banner.
- **Journal box:** sized for long-form writing. Photo thumbnails each carry a small ✕ to
  remove; Add Photos appends.
- **This month:** full-width scrolling list, several entries visible, selected entry
  highlighted (gold inner bar + tint); big Update and Delete buttons beneath act on the
  highlighted entry, whose contents load into the form above for editing.

## Constants in every season

- Entry boxes: Pale Cream #FBF6E8, black text, thin gold border.
- Border, dividers, motifs: Gold #C9A24D.
- Button text: white. Pressed states: the same hue darkened, tuned per ground.

## Per-season assignments (Kathryn's spec, verbatim)

| Season | Background | Title & date | Subtitles & labels | Save | Add Photos / Update | Save Backup & Exit / Delete |
|---|---|---|---|---|---|---|
| Spring | Spring Green #9AB791 | Tulip Orange, adjusted #E0813C* | Daffodil Yellow #E9D58F | Sky Blue #A9CFE2 | Soft Lavender #BCB2CE | Rose Pink #D9A1A0 |
| Summer | Cornflower Blue #6495ED | Mustard Yellow #D2B161 | Pale Sand #E6D3B6 | Seafoam Green #A1B5A0 | Warm Tan #C5A07F | Coral Pink #D79383 |
| Autumn | Olive Green #878961 | Rust Orange #A2684F | Rust Orange #A2684F | Goldenrod #BFA253 | Terracotta #C3765A | Maroon Red #8D5356 |
| Winter | Forest Green #5D7865 | Ice Blue #D3DEE8 | Ice Blue #D3DEE8 | Steel Blue #848F9A | Deep Plum #7A6679 | Berry Red #9A5E66 |

\* Chart Tulip Orange #D49D6A read rust-brown on the green; #E0813C proposed in round 2,
awaiting Kathryn's confirmation. Open items also awaiting her round-2 verdict: white text
legibility on the palest buttons, and rust-on-olive contrast in Autumn.

Motifs: Spring butterfly · Summer cornflower · Autumn grapes · Winter snowdrop.
Seasonal switch: 1 March / 1 June / 1 September / 1 December, from the device date.

## Documents (August samples = Summer)

Pale Cream page; the ornate frame on every page (header image behind text, per orientation);
squiggle dividers instead of straight rules; title in Boecklins Universe (Mustard), month in
Glass Antiqua (Cornflower); day headings Glass Antiqua Cornflower; mustard table header;
table columns total 13,400 dxa so the table clears the frame. Fonts are named in the files —
they display properly on Kathryn's PC where both are installed, and fall back to an ordinary
serif elsewhere. Generator: design/samples/gen-docs.js (docx 9.7.1, MIT).
