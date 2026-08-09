(function(){
  'use strict';
  let raf=0;
  function isFlightMode(){try{if(typeof productMode==='string'&&productMode==='flight')return true;}catch(_){ }const active=document.querySelector('#discover .product-mode.on');return /flug/i.test(active?.textContent||'');}
  function trustMarkup(){return '<div class="noreyo-v541-trust" aria-label="NOREYO Vorteile"><span><i>✓</i>Live-Preisprüfung</span><span><i>✓</i>Pflichtfilter</span><span><i>✓</i>Match erklärt</span></div>';}
  function normalizeFlightLayout(){if(!isFlightMode())return;const hero=document.querySelector('#discover .hero');if(!hero)return;hero.classList.remove('noreyo-interactive-hero','noreyo-v539-hero','noreyo-v540-hero');hero.classList.add('noreyo-v541-hero');if(!hero.querySelector('.noreyo-v541-trust'))hero.insertAdjacentHTML('beforeend',trustMarkup());}
  function loadScript(version){const attr=`data-noreyo-v${version}`;if(window[`NOREYO_V${version}`]||document.querySelector(`script[${attr}]`))return;const s=document.createElement('script');s.src=`./noreyo-v${version}.js?build=${version}`;s.setAttribute(attr,'1');document.head.appendChild(s);}
  function loadStyle(version){const attr=`data-noreyo-v${version}`;if(document.querySelector(`link[${attr}]`))return;const l=document.createElement('link');l.rel='stylesheet';l.href=`./noreyo-v${version}.css?build=${version}`;l.setAttribute(attr,'1');document.head.appendChild(l);}
  function loadEnhancements(){loadStyle('557');loadScript('557');loadScript('559');loadScript('576');loadScript('577');loadScript('578');loadScript('579');loadStyle('580');}
  function schedule(){if(raf)return;raf=requestAnimationFrame(()=>{raf=0;normalizeFlightLayout();});}
  normalizeFlightLayout();loadEnhancements();setTimeout(normalizeFlightLayout,80);setTimeout(normalizeFlightLayout,220);setTimeout(normalizeFlightLayout,500);
  const discover=document.getElementById('discover');if(discover&&typeof MutationObserver!=='undefined')new MutationObserver(schedule).observe(discover,{childList:true,subtree:true});
  window.addEventListener('pageshow',()=>{schedule();loadEnhancements();},{passive:true});
})();
