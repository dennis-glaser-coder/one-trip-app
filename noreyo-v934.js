/* NOREYO V9.34 — exhaustive post-render UX sweep; no short-circuit between independent repairs. */
(function(){
'use strict';
const BUILD='9.34';let observer=null,raf=0;
function sweep(){
  let changed=false;
  try{changed=window.NOREYO_V928?.repairNoResultButton?.()||changed;}catch(_){}
  try{changed=window.NOREYO_V928?.repairFlightFilterCopy?.()||changed;}catch(_){}
  try{changed=window.NOREYO_V930?.syncNav?.()||changed;}catch(_){}
  try{changed=window.NOREYO_V930?.syncHeader?.()||changed;}catch(_){}
  try{changed=window.NOREYO_V930?.syncInspiration?.()||changed;}catch(_){}
  try{changed=window.NOREYO_V932?.fixProfile?.()||changed;}catch(_){}
  return changed;
}
function run(){raf=0;return sweep();}
function schedule(){if(!raf)raf=requestAnimationFrame(run);}
function observe(){
  if(observer){observer.disconnect();observer=null;}
  if(typeof MutationObserver==='undefined'||!document.body)return false;
  observer=new MutationObserver(schedule);
  observer.observe(document.body,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['class']});
  schedule();return true;
}
function cleanup(){if(observer){observer.disconnect();observer=null;}if(raf){cancelAnimationFrame(raf);raf=0;}}
observe();window.addEventListener('pagehide',cleanup,{passive:true});window.addEventListener('pageshow',observe,{passive:true});
window.NOREYO_V934=Object.freeze({BUILD,sweep,run,schedule,observe,cleanup});
})();