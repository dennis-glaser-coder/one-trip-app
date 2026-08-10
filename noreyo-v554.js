(function(){
'use strict';
const BUILD='6.62';
let raf=0,fallbackTimer=0,observer=null;
const warmupTimers=new Set();
function isFlightMode(){try{if(typeof productMode==='string'&&productMode==='flight')return true;}catch(_){ }const active=document.querySelector('#discover .product-mode.on');return /flug/i.test(active?.textContent||'');}
function trustMarkup(){return '<div class="noreyo-v541-trust" aria-label="NOREYO Vorteile"><span><i>✓</i>Live-Preisprüfung</span><span><i>✓</i>Pflichtfilter</span><span><i>✓</i>Match erklärt</span></div>';}
function normalizeFlightLayout(){if(!isFlightMode())return;const hero=document.querySelector('#discover .hero');if(!hero)return;hero.classList.remove('noreyo-interactive-hero','noreyo-v539-hero','noreyo-v540-hero');hero.classList.add('noreyo-v541-hero');if(!hero.querySelector('.noreyo-v541-trust'))hero.insertAdjacentHTML('beforeend',trustMarkup());}
function ensureV557(){if(window.NOREYO_V557||document.querySelector('script[data-noreyo-v557-fallback]'))return;const s=document.createElement('script');s.src='./noreyo-v557.js?build=596';s.dataset.noreyoV557Fallback='1';s.onerror=()=>s.remove();document.head.appendChild(s);}
function scheduleV557Fallback(){clearTimeout(fallbackTimer);fallbackTimer=setTimeout(()=>{fallbackTimer=0;ensureV557();},120);}
function loadV559(){if(window.NOREYO_V559||document.querySelector('script[data-noreyo-v559]'))return;const s=document.createElement('script');s.src='./noreyo-v559.js?build=559';s.dataset.noreyoV559='1';document.head.appendChild(s);}
function schedule(){if(raf)return;raf=requestAnimationFrame(()=>{raf=0;normalizeFlightLayout();});}
function scheduleWarmup(delay){const id=setTimeout(()=>{warmupTimers.delete(id);normalizeFlightLayout();},delay);warmupTimers.add(id);return id;}
function clearWarmups(){warmupTimers.forEach(clearTimeout);warmupTimers.clear();}
function mutationRelevant(records){for(const r of records)for(const n of r.addedNodes||[]){if(n.nodeType!==1)continue;if(n.matches?.('.hero,.product-mode,.product-switch-host')||n.querySelector?.('.hero,.product-mode,.product-switch-host'))return true;}return false;}
function installModeHook(){try{if(typeof setProductMode==='function'&&!setProductMode.__noreyoV554Schedule){const prior=setProductMode,wrapped=function(){const r=prior.apply(this,arguments);schedule();return r;};wrapped.__noreyoV554Schedule=true;setProductMode=wrapped;}}catch(_){ }}
function installObserver(){const discover=document.getElementById('discover');if(!discover||observer||typeof MutationObserver==='undefined')return;observer=new MutationObserver(records=>{if(mutationRelevant(records))schedule();});observer.observe(discover,{childList:true,subtree:true});}
function warmup(){clearWarmups();scheduleWarmup(80);scheduleWarmup(220);scheduleWarmup(500);}
function cleanup(){clearTimeout(fallbackTimer);fallbackTimer=0;clearWarmups();if(observer){observer.disconnect();observer=null;}if(raf){cancelAnimationFrame(raf);raf=0;}}
installModeHook();normalizeFlightLayout();loadV559();scheduleV557Fallback();warmup();installObserver();
window.addEventListener('pagehide',cleanup,{passive:true});
window.addEventListener('pageshow',()=>{installModeHook();schedule();loadV559();scheduleV557Fallback();warmup();installObserver();},{passive:true});
window.NOREYO_V554=Object.freeze({BUILD,normalizeFlightLayout,mutationRelevant,cleanup,get warmupCount(){return warmupTimers.size;},get observing(){return !!observer;}});
})();