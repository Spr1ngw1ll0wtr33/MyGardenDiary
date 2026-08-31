// Stage 1 sample documents for My Garden Diary — same library (docx) the app will use.
const fs = require('fs');
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType,
  ImageRun, PageOrientation, BorderStyle, AlignmentType, ShadingType,
  TextWrappingType, TextWrappingSide, HorizontalPositionRelativeFrom,
  VerticalPositionRelativeFrom, VerticalAlign, TableLayoutType,
} = require('docx');

const GOLD = 'C9A24D';
const SAND = 'E6D3B6';      // Summer: Pale Sand page ground
const MUSTARD = 'D2B161';   // Summer secondary — table header, rules
const CORNFLOWER = '6495ED';// Summer background colour — used as title ink on the pale page
const INK = '3A2F1B';
const SERIF = 'Liberation Serif';

const pageBorder = { style: BorderStyle.DOUBLE, size: 18, color: GOLD, space: 18 };
const borders = {
  pageBorderTop: pageBorder, pageBorderBottom: pageBorder,
  pageBorderLeft: pageBorder, pageBorderRight: pageBorder,
};

const motif = fs.readFileSync('assets/motif-summer.png');
const photos = {
  bed: fs.readFileSync('photos/bed.png'),
  greenhouse: fs.readFileSync('photos/greenhouse.png'),
  sunflowers: fs.readFileSync('photos/sunflowers.png'),
  harvest: fs.readFileSync('photos/harvest.png'),
};

const t = (text, opts = {}) => new TextRun({ text, font: SERIF, color: INK, size: 22, ...opts });

function titleBlock() {
  return [
    new Paragraph({
      alignment: AlignmentType.CENTER, spacing: { before: 120, after: 0 },
      children: [
        new ImageRun({ type: 'png', data: motif, transformation: { width: 64, height: 64 } }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER, spacing: { before: 60, after: 0 },
      children: [t('MY GARDEN DIARY', { size: 20, color: '8A7440', characterSpacing: 60 })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER, spacing: { before: 40, after: 60 },
      children: [t('August 2026', { size: 64, color: CORNFLOWER })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER, spacing: { after: 240 },
      border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: GOLD, space: 4 } },
      children: [t(' ', { size: 8 })],
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
const widths = [1500, 1650, 2150, 2350, 1650, 1900, 1100, 3100];

const cell = (text, { header = false, w } = {}) => new TableCell({
  width: { size: w, type: WidthType.DXA },
  verticalAlign: VerticalAlign.CENTER,
  shading: header
    ? { type: ShadingType.CLEAR, fill: MUSTARD }
    : { type: ShadingType.CLEAR, fill: 'FBF7EC' },
  margins: { top: 80, bottom: 80, left: 110, right: 110 },
  children: [new Paragraph({ children: [t(text, header ? { bold: true, size: 22 } : { size: 22 })] })],
});

const table = new Table({
  layout: TableLayoutType.FIXED,
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
  background: { color: SAND },
  styles: { default: { document: { run: { font: SERIF, color: INK, size: 22 } } } },
  sections: [{
    properties: {
      page: {
        size: { orientation: PageOrientation.LANDSCAPE },
        margin: { top: 900, bottom: 900, left: 1000, right: 1000 },
        borders,
      },
    },
    children: [...titleBlock(), table],
  }],
});

/* ---------------- Document 2 — the journal ---------------- */
const photo = (data, align = 'right') => new ImageRun({
  type: 'png', data,
  transformation: { width: 176, height: 132 }, // ~4.7 x 3.5 cm — small, text wraps round
  floating: {
    horizontalPosition: {
      relative: HorizontalPositionRelativeFrom.MARGIN,
      align,
    },
    verticalPosition: { relative: VerticalPositionRelativeFrom.PARAGRAPH, offset: 0 },
    wrap: { type: TextWrappingType.SQUARE, side: align === 'right' ? TextWrappingSide.LEFT : TextWrappingSide.RIGHT },
    margins: { left: 120960 / 2, right: 120960 / 2, top: 60480, bottom: 60480 }, // EMU
  },
});

const dayHeading = (s) => new Paragraph({
  spacing: { before: 320, after: 100 },
  border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: GOLD, space: 2 } },
  children: [t(s, { size: 30, color: CORNFLOWER })],
});
const body = (s, imgs = []) => new Paragraph({
  spacing: { after: 140 }, alignment: AlignmentType.JUSTIFIED,
  children: [...imgs, t(s, { size: 23 })],
});

const journalDoc = new Document({
  background: { color: SAND },
  styles: { default: { document: { run: { font: SERIF, color: INK, size: 23 } } } },
  sections: [{
    properties: {
      page: {
        margin: { top: 1100, bottom: 1100, left: 1250, right: 1250 },
        borders,
      },
    },
    children: [
      ...titleBlock(),
      dayHeading('Saturday 1 August 2026'),
      body('A proper harvest morning at last. The courgettes have gone from nothing to glut in a fortnight, as they always do, and the first of the Defenders came in just under two kilos — the best of them from the plant nearest the compost heap, which tells its own story. The beds are drying out fast though, and the water butts are down to the last quarter.', [photo(photos.bed, 'right')]),
      body('Spent the afternoon tidying the greenhouse staging ready for the late sowings. Found a toad living under the far bench, who was not pleased to be discovered and has been left in peace with my apologies.', [photo(photos.greenhouse, 'left')]),
      dayHeading('Friday 14 August 2026'),
      body('Sowed the Arctic King lettuce in the propagator — old seed from two years back, so fingers crossed for germination. The sunflowers by the allotment gate are over eight feet now and the goldfinches have already started on the earliest heads. I had meant to save that seed, but I find I don’t begrudge them it.', [photo(photos.sunflowers, 'right')]),
      dayHeading('Saturday 29 August 2026'),
      body('Blackberrying along the back hedge with the last of the morning cool — nearly a kilo of them, and the tomatoes and squash coming in besides. The kitchen table looked like a harvest festival by ten o’clock. Made the first crumble of the year and froze the rest. August always ends with purple fingers.', [photo(photos.harvest, 'left')]),
    ],
  }],
});

(async () => {
  fs.writeFileSync('Sample-Table-August-2026.docx', await Packer.toBuffer(tableDoc));
  fs.writeFileSync('Sample-Journal-August-2026.docx', await Packer.toBuffer(journalDoc));
  console.log('written both docx');
})();
