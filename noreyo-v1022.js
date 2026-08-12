/* NOREYO V10.22 — retire conflicting legacy saved-detail observer.
   V9.53 rewrites saved-detail availability/tariff copy, while V10.14 now owns the
   stricter read-only truth. Stop V9.53's observer to prevent mutation ping-pong,
   but retain its harmless saved-list freshness labels through this observer. */
(function(){
'use strict';
const BUILD='10.22';
let observer=null,raf=0;
function legacy(){return window.NOREYO_V953||null;}
function stopLegacy(){try{legacy()?.cleanup?.();return true;}catch(_){return false;}}
function sync(){raf=0;stopLegacy();let changed=false;try{changed=legacy()?.fixSavedLists?.()||changed;}catch(_){}try{changed=window.NOREYO_V1014?.sync?.()||changed;}catch(_){}return changed;}
function schedule(){if(!raf)raf=requestAnimationFrame(sync);}
function observe(){if(observer){observer.disconnect();observer=null;}stopLegacy();if(typeof MutationObserver==='undefined'||!document.body)return false;observer=new MutationObserver(schedule);observer.observe(document.body,{subtree:true,childList:true,characterData:true});schedule();return true;}
function cleanup(){if(observer){observer.disconnect();observer=null;}if(raf){cancelAnimationFrame(raf);raf=0;}stopLegacy();}
observe();window.addEventListener('pagehide',cleanup,{passive:true});window.addEventListener('pageshow',()=>{stopLegacy();observe();},{passive:true});window.NOREYO_V1022=Object.freeze({BUILD,legacy,stopLegacy,sync,schedule,observe,cleanup});
})();