"""Normalize reference puppy metadata and acquire the publicly linked video assets."""
from pathlib import Path
from bs4 import BeautifulSoup
from urllib.request import urlopen
from concurrent.futures import ThreadPoolExecutor
import json,re,hashlib

root=Path(__file__).resolve().parent.parent
mapping=json.loads((root/'src/asset-sources.json').read_text(encoding='utf-8'))
catalog={}
galleries={}
downloads={}
for file in (root/'src/pages').glob('puppies__*.html'):
    route='/'+file.stem.replace('__','/')
    soup=BeautifulSoup(file.read_text(encoding='utf-8'),'html.parser')
    facts={}
    for dt in soup.select('dt'):
        dd=dt.find_next_sibling('dd')
        if dd:facts[dt.get_text(strip=True)]=dd.get_text(' ',strip=True)
    catalog[route]={'name':soup.h1.get_text(' ',strip=True) if soup.h1 else '',**facts}
    thumbs=soup.select('button[aria-current]')
    raw=(root/'reference'/file.name).read_text(encoding='utf-8-sig')
    videos=list(dict.fromkeys(re.findall(r'/media/[^"\\\s<>]+\.mp4',raw)))
    media=[]
    for button in thumbs:
        img=button.select_one('img')
        if not img:continue
        if 'video' in button.get('aria-label','').lower() and videos:
            url=videos.pop(0)
            target='/assets/'+hashlib.sha256(url.encode()).hexdigest()[:12]+'.mp4'
            downloads[url]=target
            media.append({'src':target,'poster':img['src'],'kind':'video'})
        else:media.append({'src':img['src'],'kind':'image'})
    if not media:
        for img in soup.select('.tp-storypage img'):media.append({'src':img['src'],'kind':'image'})
    galleries[route]=media

def download(item):
    remote,target=item
    dest=root/'public'/target.lstrip('/')
    if not dest.exists():
        with urlopen('https://puppy.instabizweb.com'+remote,timeout=120) as response:dest.write_bytes(response.read())
    return remote
# The reference denied video downloads with HTTP 403. Do not retry or hotlink
# those files: preserve a visible poster with an explicit unavailable state.
for media in galleries.values():
    for item in media:
        if item['kind']=='video' and not (root/'public'/item['src'].lstrip('/')).exists():
            item['unavailable']=True
            item['src']=item['poster']
(root/'public/data').mkdir(exist_ok=True)
(root/'public/data/puppies.json').write_text(json.dumps(catalog,ensure_ascii=False,indent=2),encoding='utf-8')
(root/'public/data/galleries.json').write_text(json.dumps(galleries,ensure_ascii=False,indent=2),encoding='utf-8')
mapping.update(downloads)
(root/'src/asset-sources.json').write_text(json.dumps(mapping,indent=2),encoding='utf-8')
print('Normalized',len(catalog),'puppy records. Restricted videos use an explicit poster fallback.')
