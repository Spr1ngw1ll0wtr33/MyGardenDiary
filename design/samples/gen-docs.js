// Stage 1 sample documents for My Garden Diary — round 2, to Kathryn's corrections of 03/09/2026:
// pale cream page, ornate gold frame on every page (header image behind text), squiggle dividers
// instead of straight rules, thicker motif, narrower Bed No./Yield columns, and the diary's own
// typefaces specified by name (installed on Kathryn's PC; substitute serif elsewhere).
const fs = require('fs');
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType,
  ImageRun, PageOrientation, BorderStyle, AlignmentType, ShadingType,
  TextWrappingType, TextWrappingSide, HorizontalPositionRelativeFrom,
  VerticalPositionRelativeFrom, VerticalAlign, TableLayoutType, Header,
} = require('docx');

const GOLD = 'C9A24D';
const CREAM = 'FBF6E8';     // page ground — the app's entry-box cream
const MUSTARD = 'D2B161';   // Summer title colour and table header
const SEAFOAM = 'A1B5A0';   // date and day headings — one palette in every season
const INK = '221E14';
const TITLE_FONT = 'Boecklins Universe';
const BODY_FONT = 'Glass Antiqua';

const motif = fs.readFileSync('assets/motif-summer-bold.png');
const divider = fs.readFileSync('assets/divider-bold.png');
const framePortrait = fs.readFileSync('assets/frame-a4-portrait.png');
const frameLandscape = fs.readFileSync('assets/frame-a4-landscape.png');
const photos = {
  bed: fs.readFileSync('photos/bed.png'),
  greenhouse: fs.readFileSync('photos/greenhouse.png'),
  sunflowers: fs.readFileSync('photos/sunflowers.png'),
  harvest: fs.readFileSync('photos/harvest.png'),
};

const t = (text, opts = {}) => new TextRun({ text, font: BODY_FONT, color: INK, size: 24, ...opts });

// Full-page frame, behind the text, repeated on every page via the header.
const frameHeader = (landscape) => new Header({
  children: [new Paragraph({
    children: [new ImageRun({
      type: 'png', data: landscape ? frameLandscape : framePortrait,
      transformation: landscape ? { width: 1123, height: 794 } : { width: 794, height: 1123 },
      floating: {
        horizontalPosition: { relative: HorizontalPositionRelativeFrom.PAGE, offset: 0 },
        verticalPosition: { relative: VerticalPositionRelativeFrom.PAGE, offset: 0 },
        behindDocument: true, allowOverlap: true,
        wrap: { type: TextWrappingType.NONE },
      },
    })],
  })],
});

const dividerImg = (w, h) => new ImageRun({ type: 'png', data: divider, transformation: { width: w, height: h } });

function titleBlock() {
  return [
    new Paragraph({
      alignment: AlignmentType.CENTER, spacing: { before: 60, after: 0 },
      children: [new ImageRun({ type: 'png', data: motif, transformation: { width: 66, height: 66 } })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER, spacing: { before: 40, after: 40 },
      children: [new TextRun({ text: 'My Garden Diary', font: TITLE_FONT, color: MUSTARD, size: 62 })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER, spacing: { before: 0, after: 60 },
      children: [new TextRun({ text: 'August 2026', font: BODY_FONT, color: SEAFOAM, size: 46 })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER, spacing: { after: 220 },
      children: [dividerImg(380, 22)],
    }),
  ];
}

/* ---------------- Document 1 — the table ---------------- */
const rows = [
  ['01.08.2026', 'Harvested', 'Courgette', 'Defender', '', 'Allotment', '4', '1.8 kg'],
  ['03.08.2026', 'Sowed', 'Spring Cabbage', 'Durham Early', 'New Seed', 'Greenhouse', '', ''],
  ['06.08.2026', 'Harvested', 'Potato', 'Charlotte', '', 'Allotment', '2', '4.5 kg'],
  ['08.08.2026', 'Potted On', 'Wallflower', 'Sunset Apricot', 'Seedling', 'Greenhouse', '', ''],
  ['12.08.2026', 'Harvested', 'Runner Bean', 'Scarlet Emperor', '', 'Allotment', '6', '2.3 kg'],
  ['14.08.2026', 'Sowed', 'Winter Lettuce', 'Arctic King', 'Old Seed', 'Propagator', '', ''],
  ['17.08.2026', 'Planted Out', 'Leek', 'Musselburgh', 'Seedling', 'Allotment', '3', ''],
  ['21.08.2026', 'Harvested', 'Tomato', 'Gardener’s Delight', '', 'Greenhouse', '', '3.1 kg'],
  ['24.08.2026', 'Potted On', 'Sweet William', '', 'Plug Plant', 'Pot / Trough', '', ''],
  ['29.08.2026', 'Harvested', 'Blackberry', 'Wild', '', 'Garden', '', '900 g'],
];
const headers = ['Date', 'Action', 'Plant', 'Variety', 'Type', 'Location', 'Bed No.', 'Yield'];
const widths = [1450, 1500, 2100, 2300, 1550, 1800, 800, 1900]; // 13,400 dxa — well inside the frame

const cell = (text, { header = false, w } = {}) => new TableCell({
  width: { size: w, type: WidthType.DXA },
  verticalAlign: VerticalAlign.CENTER,
  shading: { type: ShadingType.CLEAR, fill: header ? MUSTARD : 'FFFDF5' },
  margins: { top: 80, bottom: 80, left: 110, right: 110 },
  children: [new Paragraph({ children: [t(text, header ? { bold: true } : {})] })],
});

const table = new Table({
  layout: TableLayoutType.FIXED, alignment: AlignmentType.CENTER,
  width: { size: widths.reduce((a, b) => a + b, 0), type: WidthType.DXA },
  borders: {
    top: { style: BorderStyle.SINGLE, size: 6, color: GOLD },
    bottom: { style: BorderStyle.SINGLE, size: 6, color: GOLD },
    left: { style: BorderStyle.SINGLE, size: 6, color: GOLD },
    right: { style: BorderStyle.SINGLE, size: 6, color: GOLD },
    insideHorizontal: { style: BorderStyle.SINGLE, size: 4, color: GOLD },
    insideVertical: { style: BorderStyle.SINGLE, size: 4, color: GOLD },
  },
  rows: [
    new TableRow({ tableHeader: true, children: headers.map((h, i) => cell(h, { header: true, w: widths[i] })) }),
    ...rows.map(r => new TableRow({ children: r.map((c, i) => cell(c, { w: widths[i] })) })),
  ],
});

const tableDoc = new Document({
  background: { color: CREAM },
  styles: { default: { document: { run: { font: BODY_FONT, color: INK, size: 24 } } } },
  sections: [{
    headers: { default: frameHeader(true) },
    properties: {
      page: {
        size: { orientation: PageOrientation.LANDSCAPE },
        margin: { top: 1050, bottom: 900, left: 1250, right: 1250 },
      },
    },
    children: [...titleBlock(), table],
  }],
});

/* ---------------- Document 2 — the journal ---------------- */
const photo = (data, align = 'right') => new ImageRun({
  type: 'png', data,
  transformation: { width: 176, height: 132 },
  floating: {
    horizontalPosition: { relative: HorizontalPositionRelativeFrom.MARGIN, align },
    verticalPosition: { relative: VerticalPositionRelativeFrom.PARAGRAPH, offset: 0 },
    wrap: { type: TextWrappingType.SQUARE, side: align === 'right' ? TextWrappingSide.LEFT : TextWrappingSide.RIGHT },
    margins: { left: 60480, right: 60480, top: 60480, bottom: 60480 },
  },
});

const dayHeading = (s) => [
  new Paragraph({
    spacing: { before: 120, after: 100 },
    children: [new TextRun({ text: s, font: BODY_FONT, size: 32, color: SEAFOAM })],
  }),
];
const dayBreak = () => new Paragraph({
  alignment: AlignmentType.CENTER, spacing: { before: 200, after: 120 },
  children: [dividerImg(380, 22)],
});
const body = (s, imgs = []) => new Paragraph({
  spacing: { after: 140 }, alignment: AlignmentType.JUSTIFIED,
  children: [...imgs, t(s)],
});

const journalDoc = new Document({
  background: { color: CREAM },
  styles: { default: { document: { run: { font: BODY_FONT, color: INK, size: 24 } } } },
  sections: [{
    headers: { default: frameHeader(false) },
    properties: {
      page: { margin: { top: 1250, bottom: 1250, left: 1400, right: 1400 } },
    },
    children: [
      ...titleBlock(),
      ...dayHeading('Saturday 1 August 2026'),
      body('A proper harvest morning at last. The courgettes have gone from nothing to glut in a fortnight, as they always do, and the first of the Defenders came in just under two kilos — the best of them from the plant nearest the compost heap, which tells its own story. The beds are drying out fast though, and the water butts are down to the last quarter.', [photo(photos.bed, 'right')]),
      body('Spent the afternoon tidying the greenhouse staging ready for the late sowings. Found a toad living under the far bench, who was not pleased to be discovered and has been left in peace with my apologies.', [photo(photos.greenhouse, 'left')]),
      dayBreak(),
      ...dayHeading('Friday 14 August 2026'),
      body('Sowed the Arctic King lettuce in the propagator — old seed from two years back, so fingers crossed for germination. The sunflowers by the allotment gate are over eight feet now and the goldfinches have already started on the earliest heads. I had meant to save that seed, but I find I don’t begrudge them it.', [photo(photos.sunflowers, 'right')]),
      dayBreak(),
      ...dayHeading('Saturday 29 August 2026'),
      body('Blackberrying along the back hedge with the last of the morning cool — nearly a kilo of them, and the tomatoes and squash coming in besides. The kitchen table looked like a harvest festival by ten o’clock. Made the first crumble of the year and froze the rest. August always ends with purple fingers.', [photo(photos.harvest, 'left')]),
    ],
  }],
});

(async () => {
  fs.writeFileSync('Sample-Table-August-2026.docx', await Packer.toBuffer(tableDoc));
  fs.writeFileSync('Sample-Journal-August-2026.docx', await Packer.toBuffer(journalDoc));
  console.log('written both docx');
})();
