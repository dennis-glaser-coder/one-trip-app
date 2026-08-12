/* NOREYO V10.34 — strict flight constraints must never be silently ignored.
   Packed filters expose hard flight exclusions and maxFlightMinutes, but the current
   normalized offers do not reliably expose enough structured fields to prove them.
   When such a hard constraint is active, keep offers visible but block selection
   until the criterion can be verified server/provider-side. */
(function(){
'use strict';
const BUILD='10.34',DEFAULT_MAX_MINUTES=480;
const FLIGHT_EXCLUSIONS=Object.freeze(['Nachtflug','Getrennte Tickets','Transfer über 60 Min.']);
let observer=null,raf=0;

function excludedSet(){try{return typeof excluded!=='undefined'?excluded:(window.excluded||new Set());}catch(_){return window.excluded||new Set();}}
function limitsObj(){try{return typeof limits!=='undefined'?limits:(window.limits||{});}catch(_){return window.limits||{};}}
function activeConstraints(){
  const ex=excludedSet(),items=[];
  for(const label of FLIGHT_EXCLUSIONS)if(ex?.has?.(label))items.push(label);
  const max=Number(limitsObj()?.maxFlightMinutes);
  if(Number.isFinite(max)&&max>0&&max<DEFAULT_MAX_MINUTES)items.push(`Maximale Flugzeit ${Math.floor(max/60)}:${String(max%60).padStart(2,'0')} Std.`);
  return items;
}
function flightOpen(){
  return document.getElementById('plannerSheet')?.classList?.contains('show') &&
    String(document.getElementById('plannerTitle')?.textContent||'').trim()==='Flüge';
}
function body(){return document.getElementById('plannerBody');}
function expired(offer){try{return !!window.NOREYO_V994?.expired?.(offer?.expiration);}catch(_){return false;}}
function otherBlock(btn){return btn?.dataset?.noreyoV1004Bag==='1'||btn?.dataset?.noreyoV1008Must==='1';}
function blockButton(btn){
  if(!btn||btn.dataset.noreyoV1034Strict==='1')return false;
  btn.dataset.noreyoV1034Strict='1';
  btn.dataset.noreyoV1034Label=btn.textContent||'Angebot auswählen';
  btn.disabled=true;btn.setAttribute('aria-disabled','true');
  btn.textContent='Harte Fluggrenze nicht verifiziert';
  return true;
}
function restoreButton(btn,offer){
  if(!btn||btn.dataset.noreyoV1034Strict!=='1')return false;
  delete btn.dataset.noreyoV1034Strict;
  const label=btn.dataset.noreyoV1034Label||'Angebot auswählen';
  delete btn.dataset.noreyoV1034Label;
  if(!otherBlock(btn)&&!expired(offer)){
    btn.disabled=false;btn.setAttribute('aria-disabled','false');btn.textContent=label;
  }
  return true;
}
function noteText(items=activeConstraints()){
  if(!items.length)return'';
  return `Auswahl gesperrt: ${items.join(', ')} ${items.length===1?'ist':'sind'} als harte Grenze aktiv, kann mit den aktuell normalisierten Flugdaten aber noch nicht sicher bestätigt werden.`;
}
function sync(){
  raf=0;if(!flightOpen())return false;
  const b=body();if(!b)return false;
  const items=activeConstraints(),block=items.length>0,list=Array.isArray(b.__noreyoV943Offers)?b.__noreyoV943Offers:[];
  let changed=false;
  b.querySelectorAll?.('.noreyo-v943-offer').forEach(card=>{
    const idx=Number(card.dataset.flightOfferIndex),offer=list[idx],btn=card.querySelector('.noreyo-v943-select');
    if(block){if(blockButton(btn))changed=true;}
    else if(restoreButton(btn,offer))changed=true;
  });
  let note=b.querySelector('.noreyo-v1034-note');
  const text=noteText(items);
  if(text){
    if(!note){note=document.createElement('div');note.className='backend-note noreyo-v1034-note';const first=b.firstElementChild;if(first)b.insertBefore(note,first);else b.appendChild(note);changed=true;}
    if(note.textContent!==text){note.textContent=text;changed=true;}
  }else if(note){note.remove();changed=true;}
  return changed;
}
function schedule(){if(!raf)raf=requestAnimationFrame(sync);}
function observe(){
  if(observer){observer.disconnect();observer=null;}
  const b=body();if(typeof MutationObserver==='undefined'||!b)return false;
  observer=new MutationObserver(schedule);observer.observe(b,{childList:true,subtree:true});schedule();return true;
}
function cleanup(){if(observer){observer.disconnect();observer=null;}if(raf){cancelAnimationFrame(raf);raf=0;}}
observe();window.addEventListener('pagehide',cleanup,{passive:true});window.addEventListener('pageshow',observe,{passive:true});
window.NOREYO_V1034=Object.freeze({BUILD,DEFAULT_MAX_MINUTES,FLIGHT_EXCLUSIONS,excludedSet,limitsObj,activeConstraints,flightOpen,body,otherBlock,blockButton,restoreButton,noteText,sync,schedule,observe,cleanup});
})();