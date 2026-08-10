/* NOREYO V6.30 — CTA DOM stability without per-button observers.
   A single scoped Discover observer detects CTA rewrites and inserts the
   missing label/arrow text-space idempotently. */
(function(){
'use strict';
const BUILD='6.30';
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
function scan(){
  raf=0;
  document.querySelectorAll('.noreyo-v541-booking-cta,.liveSearchButton').forEach(stabilizeButton);
}
function schedule(){if(raf)return;raf=requestAnimationFrame(scan);}
function relevant(records){
  for(const r of records){
    const target=r.target?.nodeType===1?r.target:r.target?.parentElement;
    if(isSearchCta(target))return true;
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
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
window.addEventListener('pagehide',cleanup,{passive:true});
window.addEventListener('pageshow',install,{passive:true});
window.NOREYO_V612=Object.freeze({BUILD,stabilizeButton,scan,relevant});
})();