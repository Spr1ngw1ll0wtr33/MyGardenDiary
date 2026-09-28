#!/usr/bin/env python3
"""Write the offline file list and version into service-worker.js.

The version is a fingerprint of every file the app uses, so it changes whenever any of them
changes — and only then. Run this before committing any change to the app.

    python3 tools/stamp-offline.py
"""
import hashlib
import pathlib
import re

ROOT = pathlib.Path(__file__).resolve().parent.parent
SW = ROOT / 'service-worker.js'

files = ['index.html', 'manifest.json', 'seasons.css', 'app.css',
         'vendor/docx.iife.js', 'storage.js', 'backup.js', 'monthend.js', 'app.js']
for folder, pattern in [('assets', '*.svg'), ('assets', '*.png'), ('assets/fonts', '*.ttf'),
                        ('assets/motifs', '*.svg'), ('assets/doc', '*.png'), ('icons', '*.png')]:
    files += sorted(str(p.relative_to(ROOT)) for p in (ROOT / folder).glob(pattern))

missing = [f for f in files if not (ROOT / f).exists()]
assert not missing, missing

digest = hashlib.sha256()
for f in files:
    digest.update(f.encode() + b'\0' + (ROOT / f).read_bytes())
version = digest.hexdigest()[:12]

listing = ',\n  '.join(f"'{f}'" for f in ['./'] + files)
sw = SW.read_text()
sw = re.sub(r"const VERSION = '[^']*';", f"const VERSION = '{version}';", sw)
sw = re.sub(r"const FILES = \[[^\]]*\];", f"const FILES = [\n  {listing}\n];", sw)
SW.write_text(sw)
total = sum((ROOT / f).stat().st_size for f in files)
print(f'service-worker.js — version {version}, {len(files) + 1} files, {total / 1024 / 1024:.1f} MB')
