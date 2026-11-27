#!/usr/bin/env python3
"""Read-only local draft checks; no browser, tenant, network or publication."""
from pathlib import Path
import hashlib
import json
import re
import struct
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[2]
DOC = ROOT / 'docs/marketplace'
ART = ROOT / 'assets/marketplace'
checks = []

def check(ok, label):
    assert ok, label
    checks.append(label)

def bounded(value, n, label):
    check(isinstance(value, str) and 0 < len(value) <= n, label)

def run():
    data = json.loads((DOC / 'listing-copy.json').read_text())
    for key, cap in [('name',60), ('tagline',130), ('legacy_summary',250), ('more_details',1000), ('release_summary',80), ('release_notes',1000)]:
        bounded(data[key], cap, 'text limit: ' + key)
    check(len(data['highlights']) == 3, 'three highlights')
    for h in data['highlights']:
        for key, cap in [('title',50), ('summary',220), ('caption_draft',220)]:
            bounded(h[key], cap, h['id'] + ' ' + key)
    slots = json.loads((DOC / 'screenshot-slots.json').read_text())['slots']
    check(len([s for s in slots if s['required']]) == 6, 'six required screenshot derivatives')
    check(all(s['status'] == 'MISSING_NOT_CAPTURED' and s['file'] is None for s in slots), 'all media explicitly missing')
    for name, dims in [('icon',(144,144)), ('banner',(1120,548))]:
        root = ET.parse(ART / (name+'.svg')).getroot()
        check((int(root.get('width')), int(root.get('height'))) == dims, name+' SVG dimensions/XML')
        check(root.get('viewBox') == '0 0 %d %d' % dims, name+' viewBox')
        check(not any(e.tag.split('}')[-1] in ('script','image','foreignObject') or any(k.endswith('href') for k in e.attrib) for e in root.iter()), name+' no external/embedded dependencies')
        png = (ART / (name+'.png')).read_bytes()
        check(png[:8] == b'\x89PNG\r\n\x1a\n' and struct.unpack('>II',png[16:24]) == dims, name+' PNG signature/dimensions')
    for record in json.loads((DOC/'sources.json').read_text()):
        if 'private_article_key' not in record:
            check(record['http_status'] == 200, 'public endpoint '+record['url'])
            continue
        check(bool(re.fullmatch('[a-f0-9]{64}',record['extracted_article_sha256'])), 'recorded source digest '+record['private_article_key'])
        check(record['http_status'] == 200 and record['retrieved_at'].startswith('2026-11-27'), 'source retrieval '+record['private_article_key'])
    for record in json.loads((ART/'provenance.json').read_text())['files']:
        check(hashlib.sha256((ART/record['file']).read_bytes()).hexdigest() == record['sha256'], 'asset hash '+record['file'])
    for folder in (DOC, ART):
        for p in folder.glob('*.md'):
            for target in re.findall(r'\[[^\]]*\]\(([^)]+)\)',p.read_text()):
                if '://' not in target and not target.startswith(('mailto:','#')):
                    check((p.parent/target.split('#')[0]).resolve().exists(), 'local ref '+str(p.relative_to(ROOT))+' → '+target)
        for p in folder.iterdir():
            if p.suffix in ('.md','.json','.svg','.py','.txt'):
                check(not any(line.rstrip() != line for line in p.read_text().splitlines()), 'no trailing whitespace '+str(p.relative_to(ROOT)))
    check('60f4bdda-1062-4e5b-aab6-1d9a9cf53a90' in (ROOT/'manifest.yml').read_text(), 'current identity unchanged')
    print(json.dumps({'status':'PASS','checks':len(checks),'scope':'draft XML/dimensions/text limits/hashes/local references/whitespace/identity; not native acceptance or submission readiness'},indent=2))

if __name__ == '__main__':
    run()
