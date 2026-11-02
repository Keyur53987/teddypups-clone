import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root=fileURLToPath(new URL('../',import.meta.url));
const config=JSON.parse(await readFile(path.join(root,'src/site.json'),'utf8'));
test('every page template has content and every local link resolves',async()=>{
  for(const route of config.routes){
    const key=route==='/'?'home':route.slice(1).replaceAll('/','__');
    const html=await readFile(path.join(root,`src/pages/${key}.html`),'utf8');
    assert.ok(html.length>1000,route+' has meaningful content');
    assert.ok(/<h1\b/.test(html),route+' has a main heading');
    assert.equal(/<script\b/.test(html),false,route+' has no copied runtime scripts');
    for(const [,attr,raw] of html.matchAll(/\b(href|src|poster)="(\/[^"\s]*)"/g)){
      const target=raw.split(/[?#]/)[0].replace(/\/$/,'')||'/';
      if(attr==='href'&&!target.startsWith('/assets/')){
        assert.ok(config.routes.includes(target),`${route}: missing route ${target}`);
      }else{
        assert.ok((await stat(path.join(root,'public',target))).isFile(),`${route}: missing asset ${target}`);
      }
    }
  }
});
test('all gallery media and posters are local and present',async()=>{
  const galleries=JSON.parse(await readFile(path.join(root,'public/data/galleries.json'),'utf8'));
  for(const [route,media] of Object.entries(galleries)){
    assert.ok(media.length>0,route+' has media');
    for(const item of media){
      for(const file of [item.src,item.poster].filter(Boolean)) assert.ok((await stat(path.join(root,'public',file))).isFile(),file);
    }
  }
});
