# My Garden Diary — design system (Stage 1, round 3)

Source of truth: Kathryn's corrections of 03/09/2026 (two rounds), applied over her Claude Design
mockups (border, fonts, colours, motifs) and colour chart. The functional layout follows the
approved build plan. Supersedes rounds 1 and 2.

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
- **Backup & Exit** (renamed round 3): dual-action, critical colour, small one-line button at top
  right, above the centred title. No backup banner.
- **Journal box:** sized for long-form writing. Photo thumbnails each carry a small ✕ to
  remove; Add Photos appends.
- **This month:** full-width scrolling list, several entries visible, selected entry
  highlighted (gold inner bar + tint); big Update and Delete buttons beneath act on the
  highlighted entry, whose contents load into the form above for editing.

## Constants in every season

- Entry boxes: Pale Cream #FBF6E8, black text, thin gold border.
- Border, dividers, motifs: Gold #C9A24D.
- Buttons: rectangular with rounded corners (the entry-box idiom, radius ~9px), modest size,
  white text. Pressed states: the same hue darkened, tuned per ground.
- Title centred at top; date on two lines ("Monday 31st" / "August 2026"), slightly enlarged.

## Per-season assignments (Kathryn's spec, verbatim)

| Season | Background | Title & date | Subtitles & labels | Save | Add Photos / Update | Save Backup & Exit / Delete |
|---|---|---|---|---|---|---|
| Spring | Spring Green #9AB791 | Tulip Orange, adjusted #E0813C* | Daffodil Yellow #E9D58F | Sky Blue #A9CFE2 | Soft Lavender #BCB2CE | Rose Pink #D9A1A0 |
| Summer | Cornflower Blue #6495ED | Mustard Yellow #D2B161 | Pale Sand #E6D3B6 | Seafoam Green #A1B5A0 | Warm Tan #C5A07F | Coral Pink #D79383 |
| Autumn | Olive Green #878961 | Rust Orange, lightened #B57E63 | Rust Orange, lightened #B57E63 | Goldenrod #BFA253 | Terracotta #C3765A | Maroon Red #8D5356 |
| Winter | Forest Green #5D7865 | Ice Blue #D3DEE8 | Ice Blue #D3DEE8 | Steel Blue #848F9A | Deep Plum, lightened #8E7990 | Berry Red #9A5E66 |

\* Adjusted colours awaiting Kathryn's verdict: Tulip Orange #E0813C (from #D49D6A), Rust Orange
#B57E63 (from #A2684F) and Deep Plum #8E7990 (from #7A6679), plus white-text legibility on the
palest buttons.

Motifs: Spring butterfly · Summer cornflower · Autumn grapes · Winter snowdrop.
Seasonal switch: 1 March / 1 June / 1 September / 1 December, from the device date.

## Documents — one palette in every season (Kathryn's decision, round 3)

Pale Cream #FBF6E8 page; gold frame and squiggle dividers; title "My Garden Diary" in Boecklins
Universe, Mustard #D2B161, sized above the month date in Glass Antiqua, Seafoam #A1B5A0; day
headings Seafoam; mustard table header; dividers separate one day from the next (never under a
heading). The frame is composited ornament-aware at print resolution (design/frame-a4-*.png):
corners and centre ornaments at true shape, only the plain rails stretched. Table columns total
13,400 dxa. Fonts are named in the files; they fall back to an ordinary serif on machines
without them. Generator: design/samples/gen-docs.js (docx 9.7.1, MIT).
