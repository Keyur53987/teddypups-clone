import { test } from 'node:test';
import assert from 'node:assert/strict';
import { matchesPuppy, wrapIndex, enquiryText } from '../src/client/logic.js';

const imported = {name:'Max',Breed:'Maltipoo',Where:'Imported for you'};
test('catalog combines name, breed and origin filters',()=>{
  assert.equal(matchesPuppy(imported,{search:'max',breed:'Maltipoo',origin:'imported'}),true);
  assert.equal(matchesPuppy(imported,{origin:'local'}),false);
  assert.equal(matchesPuppy(imported,{breed:'poodle'}),false);
  assert.equal(matchesPuppy({Breed:'Shih Tzu',Where:'Dubai showroom'},{breed:'shih-tzu',origin:'local'}),true);
});
test('gallery wraps in both directions and handles empty collections',()=>{
  assert.equal(wrapIndex(-1,3),2);assert.equal(wrapIndex(3,3),0);assert.equal(wrapIndex(0,0),0);
});
test('enquiry includes supplied details without inventing optional information',()=>{
  assert.equal(enquiryText({name:'Test',phone:'+123'},'Max'),'Hello TeddyPups! My name is Test.\nPhone: +123\nInterested in: Max');
  assert.ok(enquiryText({name:'Test',phone:'+123',message:'<script>alert(1)</script>'}).includes('<script>'));
});
