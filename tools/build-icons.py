#!/usr/bin/env python3
"""Make the phone's app icons from the chosen design (assets/icon.svg).

Android wants picture files (PNG) at set sizes, and a "maskable" version: the phone trims
every icon to its own shape (a rounded square on Samsung), so that version has the green
running to every edge and the ring and vine drawn a little smaller, safely inside the trim.

    PLAYWRIGHT_WORKDIR=<dir with playwright-core> python3 tools/build-icons.py  ->  icons/*.png
"""
import os
import pathlib
import re
import subprocess

ROOT = pathlib.Path(__file__).resolve().parent.parent
ICONS = ROOT / 'icons'
WORK = pathlib.Path(os.environ.get('PLAYWRIGHT_WORKDIR', ''))
if not (WORK / 'node_modules' / 'playwright-core').exists():
    raise SystemExit('Set PLAYWRIGHT_WORKDIR to a directory that has playwright-core installed.')

svg = (ROOT / 'assets' / 'icon.svg').read_text()

# maskable: same green ground; ring and vine scaled about the centre to 80%
inner = svg[svg.index('<rect x="4"'):svg.rindex('</svg>')]
maskable = svg[:svg.index('<rect x="4"')] + \
    f'<g transform="translate(40,40) scale(0.80) translate(-40,-40)">{inner}</g></svg>'
ICONS.mkdir(exist_ok=True)
(ICONS / 'icon-maskable.svg').write_text(maskable)

SCRIPT = r'''
const { chromium } = require('playwright-core');
const fs = require('fs');
const [jobsJson] = process.argv.slice(1);
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  for (const [svgPath, size, out] of JSON.parse(jobsJson)) {
    const p = await b.newPage({ viewport: { width: size, height: size } });
    const svg = fs.readFileSync(svgPath, 'utf8').replace(/width="\d+" height="\d+"/, `width="${size}" height="${size}"`);
    await p.setContent(`<style>html,body{margin:0}</style>${svg}`);
    await p.screenshot({ path: out, clip: { x: 0, y: 0, width: size, height: size } });
    await p.close();
  }
  await b.close();
})();
'''
import json
jobs = [(str(ROOT / 'assets' / 'icon.svg'), 192, str(ICONS / 'icon-192.png')),
        (str(ROOT / 'assets' / 'icon.svg'), 512, str(ICONS / 'icon-512.png')),
        (str(ICONS / 'icon-maskable.svg'), 192, str(ICONS / 'icon-maskable-192.png')),
        (str(ICONS / 'icon-maskable.svg'), 512, str(ICONS / 'icon-maskable-512.png'))]
subprocess.run(['node', '-e', SCRIPT, json.dumps(jobs)], cwd=WORK, check=True)
for _, size, out in jobs:
    print(pathlib.Path(out).relative_to(ROOT), f'{size}px')
