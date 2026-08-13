/* NOREYO V11.22 — PREBOOK price-ack lifecycle hygiene.
   Price-change acknowledgement belongs only to the currently active prebookId.
   Clear stale acknowledgement immediately when the prebook session disappears or
   changes, including states where the acknowledgement UI itself is no longer rendered. */
(function(){
'use strict';
const BUILD='11.22';
let observer=null,raf=0;
function snap(){return window.NOREYO_HOTEL_PREBOOK||null;}
function accepted(){return window.NOREYO_HOTEL_PREBOOK_ACCEPTED||null;}
function clear(){
  if(!accepted())return false;
  try{delete window.NOREYO_HOTEL_PREBOOK_ACCEPTED;}catch(_){window.NOREYO_HOTEL_PREBOOK_ACCEPTED=undefined;}
  return true;
}
function owned(a=accepted(),s=snap()){
  return !!a&&!!s&&String(a.prebookId||'').trim()!==''&&String(a.prebookId||'').trim()===String(s.prebookId||'').trim();
}
function sync(){
  raf=0;
  const a=accepted(),s=snap();
  if(a&&(!s||!owned(a,s)))return clear();
  return false;
}
function schedule(){if(!raf)raf=requestAnimationFrame(sync);}
function install(){
  if(observer||typeof MutationObserver==='undefined'||!document.body)return false;
  observer=new MutationObserver(schedule);
  observer.observe(document.body,{subtree:true,childList:true,characterData:true});
  schedule();return true;
}
function cleanup(){if(observer){observer.disconnect();observer=null;}if(raf){cancelAnimationFrame(raf);raf=0;}}
install();window.addEventListener('pagehide',cleanup,{passive:true});window.addEventListener('pageshow',install,{passive:true});
window.NOREYO_V1122=Object.freeze({BUILD,snap,accepted,clear,owned,sync,schedule,install,cleanup});
})();