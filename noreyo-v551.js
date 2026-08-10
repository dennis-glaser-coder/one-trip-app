(function(){
'use strict';
const BUILD='6.64';
let raf=0,observer=null;
const warmupTimers=new Set();

function currentMode(){const active=document.querySelector('#discover .product-mode.on'),t=(active?.textContent||'').toLowerCase();if(t.includes('kreuzfahrt'))return'cruise';if(t.includes('hotel'))return'hotel';if(t.includes('flug'))return'flight';if(t.includes('pauschal'))return'package';try{if(typeof productMode==='string')return productMode;}catch(_){ }return'package';}
function makeFlightFilter(){const b=document.createElement('button');b.type='button';b.className='command-cell noreyo-v551-flight-filter';b.dataset.noreyoV551='flight-filter';b.innerHTML='<span class="noreyo-v551-filter-icon">≡</span><span class="command-copy"><small>FILTER</small><b>Flugwünsche</b></span><span aria-hidden="true">›</span>';b.addEventListener('click',()=>{try{openFilter?.('Flug');}catch(_){ }});return b;}
function ctaLabel(mode){return mode==='hotel'?'Passende Hotels finden':mode==='flight'?'Passende Flüge finden':'Passende Reisen finden';}
function unify(){
  const card=document.querySelector('#discover .search-card');if(!card)return;const mode=currentMode();
  card.querySelectorAll('.actions .ai').forEach(el=>{el.hidden=mode==='flight';});if(mode==='cruise')return;
  card.classList.add('noreyo-v551-search');card.dataset.noreyoMode=mode;const grid=card.querySelector('.booking-command-grid');if(!grid)return;
  grid.querySelectorAll('.noreyo-v551-destination,.noreyo-v551-filter-wide').forEach(el=>el.classList.remove('noreyo-v551-destination','noreyo-v551-filter-wide'));card.querySelectorAll('.noreyo-v551-hotel-destination').forEach(el=>el.classList.remove('noreyo-v551-hotel-destination'));
  if(mode==='hotel'){const hotelMain=card.querySelector('.hotel-universal');if(hotelMain)hotelMain.classList.add('noreyo-v551-hotel-destination');card.querySelector('[data-noreyo-v551="flight-filter"]')?.remove();}
  else{const destCell=grid.querySelector('.destination-command')||grid.querySelector('.command-cell');if(destCell)destCell.classList.add('noreyo-v551-destination');if(mode==='package'){card.querySelector('[data-noreyo-v551="flight-filter"]')?.remove();const filter=[...grid.querySelectorAll('.command-cell')].find(el=>/wünsche\s*&\s*pflicht|filter/i.test(el.textContent||''));if(filter&&filter!==destCell)filter.classList.add('noreyo-v551-filter-wide');}else if(mode==='flight'){let ff=card.querySelector('[data-noreyo-v551="flight-filter"]');if(!ff){ff=makeFlightFilter();grid.appendChild(ff);}}}
  const cta=card.querySelector('.liveSearchButton')||card.querySelector('.noreyo-v541-booking-cta[data-noreyo-native="1"]')||card.querySelector('.noreyo-v541-booking-cta');
  if(cta){cta.classList.add('noreyo-v551-cta');const label=ctaLabel(mode);if((cta.textContent||'').replace(/\s+/g,' ').trim()!==label+' →')cta.innerHTML='<span>'+label+'</span><span aria-hidden="true">→</span>';if(cta.parentElement!==grid)grid.appendChild(cta);}
  card.querySelectorAll('.actions').forEach(actions=>{const visible=[...actions.children].some(el=>!el.hidden&&el!==cta);actions.classList.toggle('noreyo-v551-empty-actions',!visible);});
}
function schedule(){if(raf)return;raf=requestAnimationFrame(()=>{raf=0;unify();});}
function mutationRelevant(records){for(const r of records)for(const n of r.addedNodes||[]){if(n.nodeType!==1)continue;if(n.matches?.('.search-card,.booking-command-grid,.product-mode,.liveSearchButton,.noreyo-v541-booking-cta')||n.querySelector?.('.search-card,.booking-command-grid,.product-mode,.liveSearchButton,.noreyo-v541-booking-cta'))return true;}return false;}
function scheduleWarmup(delay){const id=setTimeout(()=>{warmupTimers.delete(id);unify();},delay);warmupTimers.add(id);return id;}
function clearWarmups(){warmupTimers.forEach(clearTimeout);warmupTimers.clear();}
function installModeHook(){try{if(typeof setProductMode==='function'&&!setProductMode.__noreyoV551Schedule){const prior=setProductMode,wrapped=function(){const r=prior.apply(this,arguments);schedule();return r;};wrapped.__noreyoV551Schedule=true;setProductMode=wrapped;}}catch(_){ }}
function installObserver(){const discover=document.getElementById('discover');if(!discover||observer||typeof MutationObserver==='undefined')return;observer=new MutationObserver(records=>{if(mutationRelevant(records))schedule();});observer.observe(discover,{childList:true,subtree:true});}
function warmup(){clearWarmups();scheduleWarmup(80);scheduleWarmup(240);scheduleWarmup(500);}
function cleanup(){if(observer){observer.disconnect();observer=null;}if(raf){cancelAnimationFrame(raf);raf=0;}clearWarmups();}
installModeHook();unify();warmup();installObserver();
window.addEventListener('pagehide',cleanup,{passive:true});
window.addEventListener('pageshow',()=>{installModeHook();schedule();warmup();installObserver();},{passive:true});
window.NOREYO_V551=Object.freeze({unify,currentMode,mutationRelevant,version:BUILD,get warmupCount(){return warmupTimers.size;},get observing(){return !!observer;}});
})();