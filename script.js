function initInteractions() {
  document.querySelectorAll('.faq button').forEach(button => button.addEventListener('click', () => {
    const item = button.closest('.faq'); item.classList.toggle('open');
    const symbol = button.querySelector('span:last-child'); if (symbol) symbol.textContent = item.classList.contains('open') ? '−' : '+';
  }));
  const form=document.querySelector('#leadForm');
  if(form) form.addEventListener('submit',e=>{e.preventDefault();const s=document.querySelector('#successMsg');if(s)s.style.display='block';});

  let dictionaries = { uz: {}, ru: {} };
  fetch('./translations.json')
    .then(response => { if (!response.ok) throw new Error('Не удалось загрузить translations.json'); return response.json(); })
    .then(data => { dictionaries = data; let saved = 'uz'; try { saved = localStorage.getItem('fastEasyLanguage') || 'uz'; } catch (e) {} setLanguage(saved); })
    .catch(error => console.error('Ошибка загрузки переводов:', error));
  const languageButton=document.querySelector('#languageFlag'), languageMenu=document.querySelector('#languageMenu');
  function setLanguage(lang){lang=lang==='ru'?'ru':'uz';document.documentElement.lang=lang;const dict=dictionaries[lang];
    const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);const nodes=[];while(walker.nextNode())nodes.push(walker.currentNode);
    nodes.forEach(n=>{if(!n.parentElement||n.parentElement.closest('script,style,.languagePicker'))return;if(!Object.prototype.hasOwnProperty.call(n,'originalText'))n.originalText=n.nodeValue;const orig=n.originalText,trim=orig.trim();if(!trim)return;const value=dict[trim];n.nodeValue=orig.replace(trim,value||trim);});
    document.querySelectorAll('[placeholder]').forEach(el=>{if(!el.dataset.originalPlaceholder)el.dataset.originalPlaceholder=el.placeholder;el.placeholder=dict[el.dataset.originalPlaceholder]||el.dataset.originalPlaceholder;});
    if(languageButton)languageButton.innerHTML=(lang==='uz'?'🇺🇿':'🇷🇺')+' <span>⌄</span>';
    if(languageMenu)languageMenu.querySelectorAll('[data-lang]').forEach(b=>b.hidden=b.dataset.lang===lang);
    try{localStorage.setItem('fastEasyLanguage',lang)}catch(e){}
  }
  if(languageButton&&languageMenu){languageButton.addEventListener('click',e=>{e.stopPropagation();languageMenu.hidden=!languageMenu.hidden;languageButton.setAttribute('aria-expanded',String(!languageMenu.hidden));});languageMenu.querySelectorAll('[data-lang]').forEach(b=>b.addEventListener('click',e=>{e.stopPropagation();setLanguage(b.dataset.lang);languageMenu.hidden=true;languageButton.setAttribute('aria-expanded','false')}));document.addEventListener('click',e=>{if(!e.target.closest('.languagePicker')){languageMenu.hidden=true;languageButton.setAttribute('aria-expanded','false')}})}
  // Переводы загружаются из translations.json выше; язык по умолчанию — узбекский.

  // Automatically move each horizontal rail; touch/trackpad scrolling remains available.
  ['centerCarousel','teachersCarousel','certCarousel','eventsCarousel','partnersCarousel'].forEach(id=>{const track=document.getElementById(id);if(!track)return;track.style.overflowX='auto';track.style.scrollBehavior='smooth';track.style.scrollSnapType='x mandatory';track.querySelectorAll(':scope > *').forEach(el=>el.style.scrollSnapAlign='start');let timer=null;const move=()=>{const max=track.scrollWidth-track.clientWidth;if(max<12)return;const item=track.querySelector(':scope > *');const step=item?item.getBoundingClientRect().width+18:track.clientWidth*.75;if(track.scrollLeft>=max-8)track.scrollTo({left:0,behavior:'smooth'});else track.scrollBy({left:Math.min(step,max-track.scrollLeft),behavior:'smooth'});};const start=()=>{if(timer)return;timer=setInterval(()=>{if(!track.matches(':hover'))move()},2600)};track.addEventListener('mouseenter',()=>{});start();window.addEventListener('load',move,{once:true});});
  document.querySelectorAll('[data-carousel-prev],[data-carousel-next]').forEach(b=>b.addEventListener('click',()=>{const track=document.getElementById(b.dataset.carouselPrev||b.dataset.carouselNext);if(!track)return;const item=track.querySelector(':scope > *');const step=item?item.getBoundingClientRect().width+18:track.clientWidth*.8;track.scrollBy({left:(b.dataset.carouselPrev?-1:1)*step,behavior:'smooth'})}));
  const lightbox=document.createElement('div');lightbox.className='imageLightbox';lightbox.innerHTML='<button type="button" aria-label="Close">×</button><img alt="Preview image">';document.body.appendChild(lightbox);const img=lightbox.querySelector('img');document.querySelectorAll('.lightboxLink').forEach(a=>a.addEventListener('click',e=>{e.preventDefault();img.src=a.href;img.alt=a.querySelector('img')?.alt||'Image';lightbox.classList.add('open')}));lightbox.addEventListener('click',e=>{if(e.target===lightbox||e.target.tagName==='BUTTON')lightbox.classList.remove('open')});document.addEventListener('keydown',e=>{if(e.key==='Escape')lightbox.classList.remove('open')});
}
document.addEventListener('DOMContentLoaded',initInteractions);
