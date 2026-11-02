import { matchesPuppy, normalize, wrapIndex, enquiryText } from './logic.js?v=2bec2b03aec1';

const $ = (selector, parent = document) => parent.querySelector(selector);
const $$ = (selector, parent = document) => [...parent.querySelectorAll(selector)];
const base = document.body.dataset.base || '';
const route = document.body.dataset.route;
const assetPath = src => src?.startsWith('/assets/') ? base + src : src;
const loadData = name => fetch(`${base}/data/${name}.json`).then(response => {
  if (!response.ok) throw new Error(`Unable to load ${name}`);
  return response.json();
});

// Navigation: native modal dialog supplies focus trapping and Escape handling.
const header = $('#site-header');
const menu = $('dialog', header);
const menuTrigger = $('button[aria-haspopup="dialog"]', header);
if (menu && menuTrigger) {
  menu.id = 'mobile-navigation';
  menuTrigger.setAttribute('aria-controls', menu.id);
  menuTrigger.setAttribute('aria-expanded', 'false');
  menuTrigger.addEventListener('click', () => {
    menu.showModal(); menuTrigger.setAttribute('aria-expanded','true');
  });
  $('button', menu)?.addEventListener('click', () => menu.close());
  menu.addEventListener('close', () => menuTrigger.setAttribute('aria-expanded','false'));
  menu.addEventListener('click', event => { if (event.target === menu) menu.close(); });
}
for (const link of $$('.tp-nav-link,.tp-menu-link')) {
  const path = new URL(link.href).pathname.replace(new RegExp(`^${base}`), '').replace(/\/$/, '') || '/';
  const active = path === '/' ? route === '/' : route.startsWith(path);
  link.dataset.active = String(active);
  if (active) link.setAttribute('aria-current','page'); else link.removeAttribute('aria-current');
}
header.dataset.home = String(route === '/');
const updateHeader = () => header.dataset.scrolled = String(window.scrollY > 30);
addEventListener('scroll', updateHeader, {passive:true}); updateHeader();

// Reveal progressive content as it enters the viewport.
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) { entry.target.dataset.reveal = 'true'; observer.unobserve(entry.target); }
  }), {threshold:.04});
  $$('[data-reveal]').forEach(element => observer.observe(element));
}

// FAQ cards: inert collapses keyboard focus together with the visual answer.
const notes = $$('.tp-note');
for (const note of notes) {
  const button = $('button[aria-controls]', note);
  const answer = $('.tp-note__answer', note);
  if (!button || !answer) continue;
  button.addEventListener('click', () => {
    const open = button.getAttribute('aria-expanded') !== 'true';
    button.setAttribute('aria-expanded', String(open));
    note.dataset.open = String(open);
    note.toggleAttribute('data-unfolded',open);
    answer.inert = !open;
  });
}
const faqSearch = $('input[type="search"]');
if (faqSearch && notes.length) {
  const empty = document.createElement('p'); empty.className = 'faq-empty';
  empty.textContent = 'No matching questions. Try another word or ask us on WhatsApp.'; empty.hidden = true;
  notes[0].parentElement.after(empty);
  faqSearch.addEventListener('input', () => {
    const query = normalize(faqSearch.value); let visible = 0;
    notes.forEach(note => { note.hidden = !normalize(note.textContent).includes(query); if (!note.hidden) visible++; });
    empty.hidden = visible > 0;
    const count = $('.tp-notes__count');
    if (count) count.textContent = `${visible} ${visible === 1 ? 'note' : 'notes'} on the board`;
  });
}

// The reference's locally available showroom clip uses native playback controls.
$$('.tp-clip').forEach(clip => {
  const video=$('video',clip),button=$('button',clip);
  if(!video||!button)return;
  button.addEventListener('click',async()=>{
    video.controls=true;
    try{await video.play();button.hidden=true;}
    catch{button.hidden=false;button.setAttribute('aria-label','Try playing video');}
  });
});

// Journey tabs with Arrow/Home/End keyboard interaction.
const tabs = $$('[role="tab"]');
function selectTab(tab, focus = false) {
  tabs.forEach(item => {
    const selected = item === tab;
    item.setAttribute('aria-selected',String(selected)); item.tabIndex = selected ? 0 : -1;
    const panel = document.getElementById(item.getAttribute('aria-controls'));
    if (panel) panel.hidden = !selected;
  });
  if (focus) tab.focus();
}
tabs.forEach((tab, index) => {
  tab.addEventListener('click', () => selectTab(tab));
  tab.addEventListener('keydown', event => {
    const indexByKey = {ArrowRight:wrapIndex(index+1,tabs.length),ArrowLeft:wrapIndex(index-1,tabs.length),Home:0,End:tabs.length-1};
    if (event.key in indexByKey) {event.preventDefault();selectTab(tabs[indexByKey[event.key]],true);}
  });
});
if (tabs.length) selectTab(tabs[0]);

// Shared full-screen viewer for family photos and puppy image/video collections.
let viewer, currentMedia = [], currentIndex = 0, returnFocus;
function renderMedia(container, media, modal = false) {
  container.replaceChildren();
  const element = document.createElement(media.kind === 'video' && !media.unavailable ? 'video' : 'img');
  element.src = assetPath(media.src);
  if (media.kind === 'video' && !media.unavailable) { element.controls = true; element.playsInline = true; element.preload = 'metadata'; if(media.poster) element.poster=assetPath(media.poster); }
  else element.alt = media.caption || 'TeddyPups puppy photo';
  if (!modal) element.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;object-fit:cover';
  container.append(element);
  if(media.unavailable){const note=document.createElement('p');note.textContent='Video unavailable from the reference. Preview photo shown.';note.style.cssText='position:absolute;bottom:12px;left:12px;right:12px;padding:12px;border-radius:12px;background:#fff8e5;color:#321b11;z-index:2;font:14px system-ui';container.append(note);}
}
function showLightbox(media, index = 0) {
  currentMedia = media; currentIndex = index; returnFocus = document.activeElement;
  if (!viewer) {
    viewer = document.createElement('dialog'); viewer.className = 'clone-lightbox'; viewer.setAttribute('aria-label','Photo and video viewer');
    viewer.innerHTML = '<button type="button" data-close aria-label="Close viewer">×</button><button type="button" data-prev aria-label="Previous photo">‹</button><div class="clone-lightbox__stage"></div><button type="button" data-next aria-label="Next photo">›</button><p aria-live="polite"></p>';
    document.body.append(viewer);
    $('[data-close]',viewer).onclick = () => viewer.close();
    $('[data-prev]',viewer).onclick = () => advance(-1);
    $('[data-next]',viewer).onclick = () => advance(1);
    viewer.addEventListener('keydown', event => { if(event.key === 'ArrowLeft') advance(-1);if(event.key === 'ArrowRight') advance(1); });
    viewer.addEventListener('close', () => { $('video',viewer)?.pause();document.body.style.overflow='';returnFocus?.focus(); });
  }
  function paint() {
    renderMedia($('.clone-lightbox__stage',viewer),currentMedia[currentIndex],true);
    $(':scope > p',viewer).textContent = `${currentIndex+1} / ${currentMedia.length}${currentMedia[currentIndex].caption ? ' — '+currentMedia[currentIndex].caption : ''}`;
    $('[data-prev]',viewer).hidden = $('[data-next]',viewer).hidden = currentMedia.length < 2;
  }
  viewer.paint = paint;
  paint(); if (!viewer.open) viewer.showModal(); document.body.style.overflow='hidden';
}
function advance(delta) {currentIndex=wrapIndex(currentIndex+delta,currentMedia.length);viewer.paint();}
const familyButtons = $$('button[aria-label^="Open photo"]');
const familyMedia = familyButtons.map(button => ({src:$('img',button)?.src,kind:'image',caption:$('.tp-polaroid__caption',button)?.textContent?.trim() || ''}));
familyButtons.forEach((button,index) => button.addEventListener('click', () => showLightbox(familyMedia,index)));

async function enhancePuppyGallery() {
  const frame = $('.tp-storypage');
  if (!frame) return;
  const galleries = await loadData('galleries');
  const media = galleries[route];
  if (!media?.length) return;
  let index = 0;
  const imageButton = $('button', frame);
  const thumbs = $$('button[aria-current]');
  const counter = $('button[aria-label="Previous photo"]')?.nextElementSibling;
  const paint = () => {
    renderMedia(imageButton,media[index]);
    imageButton.setAttribute('aria-label',`Open ${index+1} of ${media.length} full screen`);
    thumbs.forEach((button,i) => {button.setAttribute('aria-current',String(i===index));button.style.borderColor=i===index?'#a35121':'';});
    if (counter) counter.textContent = `${index+1} / ${media.length}`;
  };
  imageButton.addEventListener('click', () => showLightbox(media,index));
  thumbs.forEach((button,i) => button.addEventListener('click', () => {index=i;paint();}));
  $('button[aria-label="Previous photo"]')?.addEventListener('click', () => {index=wrapIndex(index-1,media.length);paint();});
  $('button[aria-label="Next photo"]')?.addEventListener('click', () => {index=wrapIndex(index+1,media.length);paint();});
  paint();
}

// Catalog filters preserve the URL so breed/origin links and Back work correctly.
async function enhanceCatalog() {
  if (route !== '/puppies') return;
  const records = await loadData('puppies');
  const grid = $('.tp-sketch')?.closest('ul');
  const cards = grid ? $$('.tp-sketch',grid) : [];
  if (!cards.length) return;
  const tools = document.createElement('form'); tools.className='catalog-tools'; tools.setAttribute('role','search');
  tools.innerHTML = '<label>Find a puppy<input name="search" type="search" placeholder="Name or breed"></label><label>Breed<select name="breed"><option value="">All breeds</option><option value="maltipoo">Maltipoo</option><option value="pomeranian">Pomeranian</option><option value="poodle">Poodle</option><option value="cavapoo">Cavapoo</option><option value="shih-tzu">Shih Tzu</option></select></label><label>Location<select name="origin"><option value="">All puppies</option><option value="local">In Dubai</option><option value="imported">Imported for you</option></select></label><output aria-live="polite"></output>';
  grid.before(tools);
  const empty=document.createElement('p');empty.className='catalog-empty';empty.textContent='No puppies match these filters. Try another breed or clear your search.';grid.after(empty);
  const params=new URLSearchParams(location.search);
  for (const name of ['search','breed','origin']) tools.elements[name].value=params.get(name)||'';
  const filter = (updateUrl = true) => {
    const filters=Object.fromEntries(new FormData(tools));let count=0;
    cards.forEach(card => {
      const href=card.getAttribute('href').slice(base.length).replace(/\/$/,'');
      const record=records[href] || {name:card.textContent};
      const match=matchesPuppy(record,filters);
      (card.closest('li') || card).hidden=!match;
      if(match)count++;
    });
    $('output',tools).textContent=`${count} ${count===1?'puppy':'puppies'}`;empty.hidden=count>0;
    if(updateUrl){const query=new URLSearchParams(Object.entries(filters).filter(([,value])=>value));history.replaceState(null,'',location.pathname+(query.size?'?'+query:'')+location.hash);}
  };
  tools.addEventListener('submit',event=>event.preventDefault());tools.addEventListener('input',()=>filter());filter(false);
}

// No backend credentials are present in the reference. Prepare an explicit handoff
// rather than claiming a message was submitted to a nonexistent service.
$$('form').forEach(form => {
  if (!$('[name="phone"]',form)) return;
  form.addEventListener('submit', event => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const data=Object.fromEntries(new FormData(form));
    if(data.website)return; // honeypot
    const selected=$('select[name="puppyId"]',form);
    const puppy=selected?.selectedOptions[0]?.textContent || $('h1')?.textContent || '';
    const text=enquiryText(data,puppy);
    let feedback=$('.form-feedback',form);
    if(!feedback){feedback=document.createElement('div');feedback.className='form-feedback';feedback.setAttribute('role','status');form.append(feedback);}
    feedback.replaceChildren();
    const message=document.createElement('p');message.textContent='Your enquiry is ready. Choose WhatsApp or email below to send it. Nothing has been sent yet.';feedback.append(message);
    for (const [label,url] of [['Send on WhatsApp',`https://wa.me/919898124987?text=${encodeURIComponent(text)}`],['Send by email',`mailto:info@instabizweb.com?subject=${encodeURIComponent('Puppy enquiry')}&body=${encodeURIComponent(text)}`]]) {
      const link=document.createElement('a');link.textContent=label;link.href=url;link.target='_blank';link.rel='noopener noreferrer';feedback.append(link);
    }
    feedback.scrollIntoView({block:'nearest'});
  });
});

Promise.allSettled([enhanceCatalog(),enhancePuppyGallery()]).then(results => {
  results.forEach(result=>{if(result.status==='rejected')console.error('Page enhancement unavailable:',result.reason);});
});
