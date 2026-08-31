# My Garden Diary — design system (Stage 1)

Source of truth: Kathryn's seasonal colour chart and Claude Design mockups (31/08/2026).
The mockups govern border, fonts, colours and motifs; the functional layout follows the approved build plan.

## Typefaces (files in design/fonts/)

| Role | Face |
|---|---|
| App title | Boecklin's Universe |
| Dates, headings, buttons, journal text | Glass Antiqua |
| Tiny field labels, small print | EB Garamond |

Both faces are under the SIL Open Font Licence: Glass Antiqua (also on Google Fonts) and
Boecklin's Universe (Peter Wiegel) — licence texts alongside the font files in this folder.

## The year-round thread

- Gold #C9A24D: the nine-slice frame (design/frame.png), dividers, motif line-work, input borders.
- The gold squiggle-and-dot divider (design/motifs/gold-divider.svg) separates functional sections.
- Pill-shaped buttons; rounded panels; one layout in every season.

## Seasonal palettes (hex codes from Kathryn's chart — correct as given)

| Season | Background | Primary (titles) | Secondary (panels) | Accent 1 | Accent 2 | Accent 3 | Motif |
|---|---|---|---|---|---|---|---|
| Spring | #9AB791 Spring Green | #D49D6A Tulip Orange | #E9D58F Daffodil Yellow | #A9CFE2 Sky Blue | #BCB2CE Soft Lavender | #D9A1A0 Rose Pink | Butterfly |
| Summer | #6495ED Cornflower Blue | #E6D3B6 Pale Sand | #D2B161 Mustard Yellow | #A1B5A0 Seafoam Green | #D79383 Coral Pink | #C5A07F Warm Tan | Cornflower |
| Autumn | #F3E1C5 Deep Cream | #A2684F Rust Orange | #878961 Olive Green | #C3765A Terracotta | #BFA253 Goldenrod | #8D5356 Maroon Red | Grapes |
| Winter | #D3DEE8 Icy Blue-Grey | #9A5E66 Berry Red | #5D7865 Forest Green | #848F9A Steel Grey | #7A6679 Deep Plum | #F4F4ED Cold White | Snowdrop |

Winter is light (ice blue) by Kathryn's explicit decision of 31/08/2026, superseding the earlier
"dark for winter" interview note.

## Button hierarchy (function-consistent; pressed states individually darkened per ground)

| Season | Save | Update | Delete | Exit |
|---|---|---|---|---|
| Spring | Sky Blue | Soft Lavender | Rose Pink | outline |
| Summer | Seafoam Green | Warm Tan | Coral Pink | outline |
| Autumn | Goldenrod | Terracotta | Maroon Red | outline |
| Winter | Steel Grey | Deep Plum | Berry Red (Cold White too pale for Delete) | outline |

Rule: the reddest accent always takes Delete, so "red means removal" holds in every season.
On-screen deviation noted in the preview: Spring titles deepen Tulip Orange to #8E5A2B for
readability on the green ground; the chart shade stays for larger decorative uses.

## Backup status line

Quiet (recently backed up) → amber (Goldenrod family) → red (season's red), escalating with age
and unsaved changes. Never blocks exit.

## Seasonal switch dates

Spring 1 March · Summer 1 June · Autumn 1 September · Winter 1 December (device date, automatic).

## Documents

Monthly documents dress in the season of their month: page ground from the palette (a mid accent,
never Cornflower Blue or a dark), double gold page border, month title with the season's motif.
August samples: Pale Sand ground, cornflower title ink, Mustard table header.
Generator: design/samples/gen-docs.js (docx 9.7.1, MIT).
