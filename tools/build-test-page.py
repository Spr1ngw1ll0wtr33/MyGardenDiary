#!/usr/bin/env python3
"""Bundle the app into one self-contained HTML file.

The real app is a set of ordinary files (index.html, app.css, app.js and so on) served from
GitHub Pages. This script folds all of them — fonts, frame, motifs, styles and code — into a
single page that can be published anywhere for testing on a phone before Pages is set up.

    python3 tools/build-test-page.py  ->  build/my-garden-diary-test.html
"""

import base64
import pathlib
import re

ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT = ROOT / 'build' / 'my-garden-diary-test.html'

read = lambda p: (ROOT / p).read_text()
b64 = lambda p: base64.b64encode((ROOT / p).read_bytes()).decode()
data_uri = lambda p, mime: f'data:{mime};base64,{b64(p)}'

SVG = 'image/svg+xml'
MOTIFS = {s: data_uri(f'assets/motifs/{s}.svg', SVG) for s in ('spring', 'summer', 'autumn', 'winter')}

# --- styles: fold the two stylesheets together and embed what they reference ---
css = read('seasons.css') + '\n' + read('app.css')
css = css.replace("url('assets/fonts/BoecklinsUniverse.ttf') format('truetype')",
                  f"url({data_uri('assets/fonts/BoecklinsUniverse.ttf', 'font/ttf')}) format('truetype')")
css = css.replace("url('assets/fonts/GlassAntiqua-Regular.ttf') format('truetype')",
                  f"url({data_uri('assets/fonts/GlassAntiqua-Regular.ttf', 'font/ttf')}) format('truetype')")
css = css.replace("url('assets/fonts/EBGaramond-Bold.ttf') format('truetype')",
                  f"url({data_uri('assets/fonts/EBGaramond-Bold.ttf', 'font/ttf')}) format('truetype')")
css = css.replace("url('assets/frame.png')", f"url({data_uri('assets/frame.png', 'image/png')})")

# --- page: swap the stylesheet links for the folded styles, embed the images ---
html = read('index.html')
html = re.sub(r'\n?<link rel="icon"[^>]*>', '', html)
html = re.sub(r'<link rel="stylesheet" href="seasons\.css">\s*<link rel="stylesheet" href="app\.css">',
              f'<style>\n{css}\n</style>', html)
html = html.replace('src="assets/motifs/divider.svg"', f'src="{data_uri("assets/motifs/divider.svg", SVG)}"')
html = html.replace('src="assets/motifs/autumn.svg"', f'src="{MOTIFS["autumn"]}"')

# Nothing may still be *fetched* from outside the file. (The code keeps plain asset paths as
# fallbacks for the served version; those are inert here, so only markup and styles are checked,
# before the scripts go in.)
loads = re.findall(r'(?:src|href)="(?!data:)([^"]+)"|url\(\s*(?!data:)[\'"]?([^)\'"]+)', html)
outside = sorted({(a or b) for a, b in loads if (a or b) not in
                  ('vendor/docx.iife.js', 'storage.js', 'backup.js', 'monthend.js', 'app.js')})
assert not outside, f'the bundle still loads from outside itself: {outside}'

motif_map = ',\n  '.join(f'{name}: "{uri}"' for name, uri in MOTIFS.items())
PNG = 'image/png'
doc_assets = {
    'framePortrait':  data_uri('assets/doc/frame-portrait.png', PNG),
    'frameLandscape': data_uri('assets/doc/frame-landscape.png', PNG),
    'divider':        data_uri('assets/doc/divider.png', PNG),
    **{s: data_uri(f'assets/doc/motif-{s}.png', PNG) for s in ('spring', 'summer', 'autumn', 'winter')},
}
doc_map = ',\n  '.join(f'{k}: "{v}"' for k, v in doc_assets.items())

# The library writes the Unicode replacement character literally inside its strings; as an
# escape it means the same to the browser and survives publishing.
inline = lambda code: ('<script>\n' + code.replace('</script', '<\\/script').replace('\ufffd', '\\uFFFD')
                       + '\n</script>')
scripts = '\n'.join([
    '<script>\nwindow.MOTIF_SRC = {\n  ' + motif_map + '\n};\nwindow.DOC_ASSETS = {\n  ' + doc_map + '\n};\n</script>',
    inline(read('vendor/docx.iife.js')),
    inline(read('storage.js')),
    inline(read('backup.js')),
    inline(read('monthend.js')),
    inline(read('app.js')),
])
tags = ('<script src="vendor/docx.iife.js"></script>\n<script src="storage.js"></script>\n'
        '<script src="backup.js"></script>\n<script src="monthend.js"></script>\n<script src="app.js"></script>')
assert tags in html, 'index.html script tags have changed — update the bundler'
html = html.replace(tags, scripts)

OUT.parent.mkdir(exist_ok=True)
OUT.write_text(html)
print(f'{OUT.relative_to(ROOT)} — {len(html) / 1024 / 1024:.2f} MB')

# --- second output: the same page with the document skeleton removed, for publishing
# as an Artifact (which supplies its own <!doctype>, <html>, <head> and <body>).
# The <title> must come first so it stays within the first 8KB, ahead of the big <style>. ---
body = html
title = re.search(r'<title>.*?</title>', body, re.S).group(0)
body = body.replace(title, '')
for tag in (r'<!DOCTYPE html>', r'<html[^>]*>', r'</html>', r'<head>', r'</head>',
            r'<body>', r'</body>', r'<meta[^>]*>'):
    body = re.sub(tag, '', body, flags=re.I)
art = ROOT / 'build' / 'artifact-page.html'
art.write_text(title + '\n' + body.strip() + '\n')
print(f'{art.relative_to(ROOT)} — {art.stat().st_size / 1024 / 1024:.2f} MB')
