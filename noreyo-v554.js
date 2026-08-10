(function(){
  'use strict';
  const BUILD='6.15';
  let raf=0,fallbackTimer=0;

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

  function ensureV557(){
    if(window.NOREYO_V557)return;
    if(document.querySelector('script[data-noreyo-v557-fallback]'))return;
    const s=document.createElement('script');
    s.src='./noreyo-v557.js?build=596';
    s.dataset.noreyoV557Fallback='1';
    s.onerror=()=>s.remove();
    document.head.appendChild(s);
  }

  function scheduleV557Fallback(){
    clearTimeout(fallbackTimer);
    fallbackTimer=setTimeout(ensureV557,120);
  }

  function loadV559(){
    if(window.NOREYO_V559||document.querySelector('script[data-noreyo-v559]'))return;
    const s=document.createElement('script');
    s.src='./noreyo-v559.js?build=559';s.dataset.noreyoV559='1';
    document.head.appendChild(s);
  }

  function schedule(){
    if(raf)return;
    raf=requestAnimationFrame(()=>{raf=0;normalizeFlightLayout();});
  }

  function mutationRelevant(records){
    for(const r of records){
      for(const n of r.addedNodes||[]){
        if(n.nodeType!==1)continue;
        if(n.matches?.('.hero,.product-mode,.product-switch-host')||
           n.querySelector?.('.hero,.product-mode,.product-switch-host'))return true;
      }
    }
    return false;
  }

  try{
    if(typeof setProductMode==='function'&&!setProductMode.__noreyoV554Schedule){
      const prior=setProductMode;
      const wrapped=function(){const r=prior.apply(this,arguments);schedule();return r;};
      wrapped.__noreyoV554Schedule=true;setProductMode=wrapped;
    }
  }catch(_){ }

  normalizeFlightLayout();
  loadV559();
  scheduleV557Fallback();
  setTimeout(normalizeFlightLayout,80);
  setTimeout(normalizeFlightLayout,220);
  setTimeout(normalizeFlightLayout,500);

  const discover=document.getElementById('discover');
  if(discover&&typeof MutationObserver!=='undefined'){
    new MutationObserver(records=>{if(mutationRelevant(records))schedule();})
      .observe(discover,{childList:true,subtree:true});
  }
  window.addEventListener('pagehide',()=>{clearTimeout(fallbackTimer);fallbackTimer=0;},{passive:true});
  window.addEventListener('pageshow',()=>{schedule();loadV559();scheduleV557Fallback();},{passive:true});
})();