"""Fetch the original Commons photographs and retain attribution provenance."""
import hashlib
import html
import io
import json
import re
import time
import urllib.parse
import urllib.request
from pathlib import Path
from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parents[1]
source = (ROOT / 'uzbekistana_piedzivojums_bildes_labotas.html').read_text()
files = sorted(set(urllib.parse.unquote(x) for x in re.findall(r'commons/thumb/[0-9a-f]/[0-9a-f]{2}/([^/]+)/', source)))
manifest = ROOT / 'assets/images/manifest.json'
records = json.loads(manifest.read_text()) if manifest.exists() else []
def fetch(url):
    for attempt in range(6):
        try:
            return urllib.request.urlopen(urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 Uzbekistan27 personal travel project'}), timeout=90).read()
        except urllib.error.HTTPError as error:
            if error.code not in (429, 503) or attempt == 5: raise
            time.sleep(12 * (attempt + 1))

for name in files:
    if any(r['file'] == name for r in records): continue
    print('Fetching', name, flush=True)
    page = 'https://commons.wikimedia.org/wiki/File:' + urllib.parse.quote(name)
    request = urllib.request.Request(page, headers={'User-Agent': 'Uzbekistana27/1.0 (personal expedition website; image attribution) '})
    markup = fetch(page).decode()
    match = re.search(r'class="fullImageLink".*?href="([^"]+)"', markup, re.S)
    if not match:
        raise RuntimeError('No original found: ' + name)
    original = html.unescape(match[1])
    data = fetch(original)
    image = ImageOps.exif_transpose(Image.open(io.BytesIO(data))).convert('RGB')
    image.thumbnail((1920, 1440))
    slug = name.rsplit('.', 1)[0].lower().replace('_', '-')
    if not slug.isascii(): slug = 'charvak-from-small-chimgan'
    relative = 'assets/images/' + slug + '.webp'
    image.save(ROOT / relative, 'WEBP', quality=84, method=6)
    (ROOT / 'assets/images' / (slug + '.source.html')).write_text(markup)
    records.append({'file': name, 'path': relative, 'source': page, 'original': original, 'width': image.width, 'height': image.height, 'original_sha256': hashlib.sha256(data).hexdigest()})
    manifest.write_text(json.dumps(records, ensure_ascii=False, indent=2) + '\n')
    print(name, '→', relative, (ROOT / relative).stat().st_size, flush=True)
    time.sleep(3)
(ROOT / 'assets/images/manifest.json').write_text(json.dumps(records, ensure_ascii=False, indent=2) + '\n')
