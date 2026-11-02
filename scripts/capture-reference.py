"""Capture public reference material for this authorized website-cloning exercise.

One-time development utility; the deployed site does not contact the reference.
Requires beautifulsoup4. Run from the repository root.
"""
from pathlib import Path
from urllib.request import urlopen, Request
from urllib.parse import urlsplit, parse_qs, unquote
from concurrent.futures import ThreadPoolExecutor
from bs4 import BeautifulSoup, Comment
import json, re, hashlib

BASE = 'https://puppy.instabizweb.com'
ROOT = Path(__file__).resolve().parent.parent
REF = ROOT / 'reference'
ASSETS = ROOT / 'public' / 'assets'
PAGES = ROOT / 'src' / 'pages'
for folder in [REF, ASSETS, PAGES, ROOT / 'src' / 'partials']:
    folder.mkdir(parents=True, exist_ok=True)

def fetch(url):
    with urlopen(Request(url, headers={'User-Agent': 'Mozilla/5.0'}), timeout=60) as r:
        return r.read()

def page_file(route):
    return REF / ('home.html' if route == '/' else route.strip('/').replace('/', '__') + '.html')

def load(route):
    path = page_file(route)
    if not path.exists(): path.write_bytes(fetch(BASE + route))
    return BeautifulSoup(path.read_text(encoding='utf-8-sig'), 'html.parser')

routes = {'/', '/puppies', '/happy-families', '/how-it-works', '/faq', '/contact', '/gone-home'}
for route in list(routes):
    s = load(route)
    routes.update(urlsplit(a['href']).path for a in s.select('a[href]') if a['href'].startswith('/puppies/'))
with ThreadPoolExecutor(max_workers=6) as pool:
    docs = dict(zip(sorted(routes), pool.map(load, sorted(routes))))
print('Captured', len(docs), 'pages', flush=True)

asset_map = {}
def asset(url):
    if not url or url.startswith(('data:', '#', 'mailto:', 'tel:')): return url
    if url.startswith(BASE): url = url[len(BASE):]
    if not url.startswith('/'): return url
    if url.startswith('/_next/image?'):
        url = parse_qs(urlsplit(url).query)['url'][0]
    url = unquote(url)
    if url not in asset_map:
        ext = Path(urlsplit(url).path).suffix or '.bin'
        asset_map[url] = '/assets/' + hashlib.sha256(url.encode()).hexdigest()[:12] + ext
    return asset_map[url]

for route, soup in docs.items():
    # Resolve Next's streamed server HTML into its main element without copying runtime JS.
    for segment in soup.select('div[id^="S:"]'):
        if soup.main and not soup.main.get_text(strip=True):
            soup.main.clear()
            for node in list(segment.contents): soup.main.append(node.extract())
        segment.decompose()
    for tag in soup.select('script, canvas, nextjs-portal'): tag.decompose()
    for comment in soup.find_all(string=lambda text:isinstance(text,Comment)): comment.extract()
    for tag in soup.select('main link'): tag.decompose()
    for tag in soup.find_all(True):
        for attr in list(tag.attrs):
            if attr.lower().startswith('on') or attr.lower() in ['srcset', 'imagesrcset', 'data-nimg']:
                del tag[attr]
        for attr in ['src', 'poster']:
            if tag.has_attr(attr): tag[attr] = asset(tag[attr])
        if tag.name == 'link' and tag.get('rel') == ['stylesheet']:
            tag['href'] = asset(tag['href'])
        if tag.has_attr('style'):
            tag['style'] = re.sub(r'url\(["\']?(/[^)"\']+)["\']?\)', lambda m: 'url("'+asset(m[1])+'")', tag['style'])
        if tag.name == 'a' and '/cdn-cgi/l/email-protection' in tag.get('href',''):
            tag['href'] = 'mailto:info@instabizweb.com'; tag.clear(); tag.string = 'info@instabizweb.com'
        if tag.name == 'a' and tag.get('href','').startswith(BASE): tag['href'] = tag['href'][len(BASE):] or '/'
    # Animations were server-rendered at their pre-hydration frame. Reveal content.
    for tag in soup.select('[style]'):
        tag['style'] = re.sub(r'opacity:\s*0(?:\.0)?(?=;|$)', 'opacity:1', tag['style'])
    if route == '/':
        (ROOT/'src/partials/header.html').write_text(str(soup.header), encoding='utf-8')
        (ROOT/'src/partials/footer.html').write_text(str(soup.footer), encoding='utf-8')
        css = [x['href'] for x in soup.select('link[rel="stylesheet"]')]
        html_class = soup.html.get('class',[])
    content = ''.join(str(x) for x in soup.main.contents)
    (PAGES / ('home.html' if route == '/' else route.strip('/').replace('/', '__') + '.html')).write_text(content, encoding='utf-8')

def download(item):
    remote, local = item
    dest = ROOT/'public'/local.lstrip('/')
    if not dest.exists(): dest.write_bytes(fetch(BASE+remote))
    if dest.suffix == '.css':
        text = dest.read_text(encoding='utf-8')
        def css_asset(m):
            raw = m[1].strip('"\' ')
            if raw.startswith('data:'): return m[0]
            from urllib.parse import urljoin
            resolved = urljoin(remote, raw)
            return 'url("'+asset(resolved)+'")'
        text = re.sub(r'url\(([^)]+)\)', css_asset, text)
        dest.write_text(text, encoding='utf-8')
    return local

done = set()
while len(done) < len(asset_map):
    pending = [(k,v) for k,v in asset_map.items() if k not in done]
    with ThreadPoolExecutor(max_workers=8) as pool:
        for result in pool.map(download,pending): pass
    done.update(k for k,v in pending)
    print('Downloaded',len(done),'assets',flush=True)
(ROOT/'src/site.json').write_text(json.dumps({'routes':sorted(routes),'styles':css,'htmlClass':html_class},indent=2),encoding='utf-8')
(ROOT/'src/asset-sources.json').write_text(json.dumps(asset_map,indent=2),encoding='utf-8')
print('Reference captured. Templates and assets are self-contained.',flush=True)
