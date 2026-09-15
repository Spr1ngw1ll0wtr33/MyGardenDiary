#!/usr/bin/env python3
"""Photograph the real app in all four seasons and lay them side by side.

The app itself shows only today's season — that is deliberate, and there is no setting to
change it. This produces a preview page so the other three can be looked at whenever the
design changes, without putting a switch into the app.

    python3 tools/build-season-preview.py   ->  build/season-preview.html
"""
import base64
import json
import pathlib
import subprocess

ROOT = pathlib.Path(__file__).resolve().parent.parent
BUILD = ROOT / 'build'
SHOTS = BUILD / 'season-shots'

SEASONS = [
    ('spring', '2027-04-15', 'Spring', '1 March – 31 May',        'deepened sage #6B8862 · apricot #EFB183'),
    ('summer', '2027-07-10', 'Summer', '1 June – 31 August',      'cornflower #6495ED · mustard #D2B161'),
    ('autumn', '2026-10-20', 'Autumn', '1 September – 30 November','deepened olive #6E7050 · pale cream #FBF6E8'),
    ('winter', '2027-01-20', 'Winter', '1 December – 28 February', 'forest #5D7865 · ice blue #D3DEE8'),
]

SCRIPT = r'''
const { chromium } = require('playwright-core');
const [seasonsJson, page_url, outDir] = process.argv.slice(2);
const seasons = JSON.parse(seasonsJson);
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  for (const [name, date] of seasons) {
    const ctx = await b.newContext({ viewport: { width: 412, height: 915 }, locale: 'en-GB', deviceScaleFactor: 2 });
    await ctx.addInitScript(`{ const R = Date, f = new R('${date}T10:00:00');
      class D extends R { constructor(...a){ return a.length ? new R(...a) : new R(f); } static now(){ return f.getTime(); } }
      window.Date = D; }`);
    const p = await ctx.newPage();
    await p.goto(page_url);
    await p.waitForTimeout(1500);
    // a couple of entries so This month is not empty
    await p.fill('#f-plant', 'Winter Lettuce'); await p.fill('#f-variety', 'Arctic King');
    await p.selectOption('#f-action', 'Sowed'); await p.selectOption('#f-location', 'Greenhouse');
    await p.click('#btnSaveFactual'); await p.waitForTimeout(500);
    await p.fill('#j-text', 'Lifted the last of the second early potatoes and cleared bed three.');
    await p.click('#btnSaveJournal'); await p.waitForTimeout(600);
    await p.evaluate(() => window.scrollTo(0, 0)); await p.waitForTimeout(300);
    await p.screenshot({ path: outDir + '/' + name + '.png', fullPage: true });
    await ctx.close();
  }
  await b.close();
  console.log('shots taken');
})().catch(e => { console.error(e.message); process.exit(1); });
'''

SHOTS.mkdir(parents=True, exist_ok=True)
# Run the browser from wherever playwright-core is installed, so node can find it.
import os, shutil
WORK = pathlib.Path(os.environ.get('PLAYWRIGHT_WORKDIR', ''))
if not (WORK / 'node_modules' / 'playwright-core').exists():
    raise SystemExit('Set PLAYWRIGHT_WORKDIR to a directory that has playwright-core installed.')
runner = WORK / 'shoot-seasons.js'
runner.write_text(SCRIPT)
subprocess.run(
    ['node', str(runner), json.dumps([[s[0], s[1]] for s in SEASONS]),
     (BUILD / 'my-garden-diary-test.html').as_uri(), str(SHOTS)],
    cwd=str(WORK), check=True)

b64 = lambda p: base64.b64encode(p.read_bytes()).decode()
cards = ''.join(f'''
  <figure class="card">
    <figcaption>
      <h2>{title}</h2>
      <p class="when">{when}</p>
      <p class="hex">{hexes}</p>
    </figcaption>
    <img src="data:image/png;base64,{b64(SHOTS / (name + '.png'))}" alt="The app in {title}">
  </figure>''' for name, _, title, when, hexes in SEASONS)

html = f'''<title>The Diary Through the Year</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=EB+Garamond:ital@0;1&display=swap">
<style>
  :root {{ --paper:#EDE7DB; --pen:#3A3226; --soft:#6B6353; --gold:#C9A24D; --rule:#D9D0BC; }}
  body {{ background:var(--paper); color:var(--pen); font-family:'EB Garamond',Georgia,serif;
          margin:0; padding:0 16px 56px; font-size:17px; line-height:1.55; }}
  .wrap {{ max-width:1100px; margin:0 auto; }}
  h1 {{ font-size:clamp(1.9rem,5vw,2.6rem); margin:34px 0 6px; font-weight:400; }}
  .lede {{ color:var(--soft); max-width:62ch; }}
  .grid {{ display:grid; grid-template-columns:repeat(auto-fit,minmax(260px,1fr)); gap:26px; margin-top:26px; }}
  .card {{ margin:0; }}
  figcaption h2 {{ font-size:1.35rem; margin:0; font-weight:400; }}
  .when {{ color:var(--soft); font-size:.9rem; margin:1px 0 0; }}
  .hex {{ color:var(--soft); font-size:.8rem; margin:2px 0 10px; font-family:ui-monospace,monospace; }}
  .card img {{ width:100%; display:block; border:1px solid var(--rule); border-radius:12px;
               box-shadow:0 8px 20px rgba(50,44,30,.18); }}
  .foot {{ margin-top:42px; border-top:1px solid var(--rule); padding-top:14px;
           color:var(--soft); font-size:.95rem; max-width:62ch; }}
</style>
<div class="wrap">
  <h1>The diary through the year</h1>
  <p class="lede">Photographs of the real app, taken in each of the four seasons. The app itself
  always shows today's season and has no switch — that was your decision — so this page exists to
  let you see the other three. Scroll each one; they are full-length.</p>
  <div class="grid">{cards}</div>
  <p class="foot">Taken from the current build, so this page is always what the app actually looks
  like. I regenerate it whenever the design changes.</p>
</div>
'''

out = BUILD / 'season-preview.html'
out.write_text(html)
print(f'{out.relative_to(ROOT)} — {len(html)/1024/1024:.2f} MB')
