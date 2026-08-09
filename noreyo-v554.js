(function(){
  'use strict';
  let raf=0;

  function isFlightMode(){
    try{if(typeof productMode==='string'&&productMode==='flight')return true;}catch(_){ }
    const active=document.querySelector('#discover .product-mode.on');
    return /flug/i.test(active?.textContent||'');
  }

  function trustMarkup(){
    return '<div class="noreyo-v541-trust" aria-label="NOREYO Vorteile"><span><i>✓</i>Live-Preisprüfung</span><span><i>✓</i>Pflichtfilter</span><span><i>✓</i>Match erklärt</span></div>';
  }

  function normalizeFlightLayout(){
    if(!isFlightMode())return;
    const hero=document.querySelector('#discover .hero');
    if(!hero)return;
    hero.classList.remove('noreyo-interactive-hero','noreyo-v539-hero','noreyo-v540-hero');
    hero.classList.add('noreyo-v541-hero');
    if(!hero.querySelector('.noreyo-v541-trust'))hero.insertAdjacentHTML('beforeend',trustMarkup());
  }

  function loadV557(){
    if(!document.querySelector('link[data-noreyo-v557]')){
      const l=document.createElement('link');
      l.rel='stylesheet';l.href='./noreyo-v557.css?build=557';l.dataset.noreyoV557='1';
      document.head.appendChild(l);
    }
    if(!window.NOREYO_V557&&!document.querySelector('script[data-noreyo-v557]')){
      const s=document.createElement('script');
      s.src='./noreyo-v557.js?build=557';s.dataset.noreyoV557='1';
      document.head.appendChild(s);
    }
  }

  function loadV576(){
    if(window.NOREYO_V576||document.querySelector('script[data-noreyo-v576]'))return;
    const s=document.createElement('script');
    s.src='./noreyo-v576.js?build=576';
    s.dataset.noreyoV576='1';
    s.defer=true;
    document.head.appendChild(s);
  }

  function schedule(){
    if(raf)return;
    raf=requestAnimationFrame(()=>{raf=0;normalizeFlightLayout();});
  }

  normalizeFlightLayout();
  loadV557();
  loadV576();
  setTimeout(normalizeFlightLayout,80);
  setTimeout(normalizeFlightLayout,220);
  setTimeout(normalizeFlightLayout,500);

  const discover=document.getElementById('discover');
  if(discover&&typeof MutationObserver!=='undefined'){
    new MutationObserver(schedule).observe(discover,{childList:true,subtree:true});
  }
  window.addEventListener('pageshow',()=>{schedule();loadV557();loadV576();},{passive:true});
})();
