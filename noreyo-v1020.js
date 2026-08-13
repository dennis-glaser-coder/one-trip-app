/* NOREYO V10.20 — invalid saved-price ownership lifecycle.
   V10.16 fixes malformed saved prices but its internal invalid owner can outlive
   the saved detail. Stop that legacy observer and re-run its repairs only while
   this layer owns an invalid saved detail; current live results clear ownership. */
(function(){
'use strict';
const BUILD='10.20';
let invalidKey='',observer=null,raf=0,installed=false,priorSaved=null,priorCurrent=null;
function legacy(){return window.NOREYO_V1016||null;}
function finite(v){return legacy()?.finitePrice?.(v)??(Number.isFinite(Number(v))&&Number(v)>0?Number(v):null);}
function snap(encoded){try{return typeof snapshotByKey==='function'?snapshotByKey(encoded):null;}catch(_){return null;}}
function stopLegacyObserver(){try{legacy()?.cleanup?.();return true;}catch(_){return false;}}
function install(){if(installed)return false;stopLegacyObserver();priorSaved=window.showSavedDetail;priorCurrent=window.showDetail;if(typeof priorSaved==='function'){window.showSavedDetail=function(encoded,...args){const o=snap(encoded);invalidKey=o&&finite(o.price)===null?String(o.key||''):'';const r=priorSaved.call(this,encoded,...args);setTimeout(schedule,0);return r;};window.showSavedDetail.__noreyoV1020=true;}if(typeof priorCurrent==='function'){window.showDetail=function(...args){invalidKey='';const r=priorCurrent.apply(this,args);setTimeout(schedule,0);return r;};window.showDetail.__noreyoV1020=true;}installed=true;return true;}
function sync(){raf=0;let changed=false;try{changed=legacy()?.fixLists?.()||changed;}catch(_){}if(invalidKey){try{changed=legacy()?.fixDetail?.()||changed;}catch(_){}}return changed;}
function schedule(){if(!raf)raf=requestAnimationFrame(sync);}
function observe(){if(observer){observer.disconnect();observer=null;}stopLegacyObserver();if(typeof MutationObserver==='undefined'||!document.body)return false;observer=new MutationObserver(schedule);observer.observe(document.body,{subtree:true,childList:true,characterData:true});schedule();return true;}
function cleanup(){if(observer){observer.disconnect();observer=null;}if(raf){cancelAnimationFrame(raf);raf=0;}stopLegacyObserver();}
function state(){return{invalidKey};}
install();observe();window.addEventListener('pagehide',cleanup,{passive:true});window.addEventListener('pageshow',()=>{stopLegacyObserver();observe();},{passive:true});window.NOREYO_V1020=Object.freeze({BUILD,legacy,finite,snap,stopLegacyObserver,install,sync,schedule,observe,cleanup,state});
})();