/* NOREYO V6.12 — CTA DOM stability bridge.
   Inserts the missing text-space between label/arrow spans so legacy idempotence
   checks stop rebuilding search CTA innerHTML on every enforce/unify pass. */
(function(){
'use strict';
const BUILD='6.12';
let discoverObserver=null,raf=0;

function isSearchCta(el){
  return !!el?.matches?.('.noreyo-v541-booking-cta,.liveSearchButton');
}
function stabilizeButton(btn){
  if(!isSearchCta(btn))return false;
  const spans=[...btn.children].filter(el=>el.tagName==='SPAN');
  if(spans.length<2)return false;
  const arrow=spans[1];
  if((arrow.textContent||'').trim()!=='→')return false;

  let node=spans[0].nextSibling;
  while(node&&node!==arrow){
    if(node.nodeType===3&&/\s/.test(node.textContent||''))return false;
    node=node.nextSibling;
  }
  btn.insertBefore(document.createTextNode(' '),arrow);
  return true;
}
function bindButton(btn){
  if(!isSearchCta(btn)||btn.__noreyoV612Observer)return;
  stabilizeButton(btn);
  if(typeof MutationObserver==='undefined')return;
  const mo=new MutationObserver(()=>{stabilizeButton(btn);});
  mo.observe(btn,{childList:true});
  btn.__noreyoV612Observer=mo;
}
function scan(){
  raf=0;
  document.querySelectorAll('.noreyo-v541-booking-cta,.liveSearchButton').forEach(bindButton);
}
function schedule(){if(raf)return;raf=requestAnimationFrame(scan);}
function relevant(records){
  for(const r of records){
    for(const n of r.addedNodes||[]){
      if(n.nodeType!==1)continue;
      if(isSearchCta(n)||n.querySelector?.('.noreyo-v541-booking-cta,.liveSearchButton'))return true;
    }
  }
  return false;
}
function install(){
  scan();
  const discover=document.getElementById('discover');
  if(!discover||discoverObserver||typeof MutationObserver==='undefined')return;
  discoverObserver=new MutationObserver(records=>{if(relevant(records))schedule();});
  discoverObserver.observe(discover,{childList:true,subtree:true});
}
function cleanup(){
  if(discoverObserver){discoverObserver.disconnect();discoverObserver=null;}
  if(raf){cancelAnimationFrame(raf);raf=0;}
  document.querySelectorAll('.noreyo-v541-booking-cta,.liveSearchButton').forEach(btn=>{
    try{btn.__noreyoV612Observer?.disconnect?.();}catch(_){ }
    try{delete btn.__noreyoV612Observer;}catch(_){ }
  });
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
window.addEventListener('pagehide',cleanup,{passive:true});
window.addEventListener('pageshow',install,{passive:true});
window.NOREYO_V612=Object.freeze({BUILD,stabilizeButton,scan,relevant});
})();