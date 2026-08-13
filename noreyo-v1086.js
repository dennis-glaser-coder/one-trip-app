/* NOREYO V10.86 — verified-flight lifecycle completion.
   Verification is session memory tied to the currently selected offer. Clear it
   whenever the selection disappears/changes or a new flight search begins, so a
   later checkout step can never consume a stale verification snapshot. */
(function(){
'use strict';
const BUILD='10.86';
let observer=null,raf=0,lastOfferId='';
function selectedId(){return String(window.NOREYO_SELECTED_FLIGHT?.offerId||'').trim();}
function verified(){return window.NOREYO_VERIFIED_FLIGHT||null;}
function clear(){if(!verified())return false;try{delete window.NOREYO_VERIFIED_FLIGHT;}catch(_){window.NOREYO_VERIFIED_FLIGHT=undefined;}return true;}
function sync(){raf=0;const id=selectedId(),v=verified();let changed=false;if(v&&(!id||String(v.offerId||'')!==id))changed=clear()||changed;if(lastOfferId&&id!==lastOfferId&&v)changed=clear()||changed;lastOfferId=id;return changed;}
function schedule(){if(!raf)raf=requestAnimationFrame(sync);}
function onClick(e){if(e.target?.closest?.('.noreyo-v943-back,.noreyo-v943-retry,.liveSearchButton'))clear();const mode=e.target?.closest?.('.product-mode');if(mode){const onclick=String(mode.getAttribute?.('onclick')||'');const m=onclick.match(/setProductMode\(['"]([^'"]+)['"]\)/);if(m&&m[1]!=='flight')clear();}}
function install(){if(observer)return false;if(typeof MutationObserver!=='undefined'&&document.body){observer=new MutationObserver(schedule);observer.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['class']});}document.addEventListener('click',onClick,true);schedule();return true;}
function cleanup(){if(observer){observer.disconnect();observer=null;}document.removeEventListener('click',onClick,true);if(raf){cancelAnimationFrame(raf);raf=0;}}
install();window.addEventListener('pagehide',cleanup,{passive:true});window.addEventListener('pageshow',install,{passive:true});window.NOREYO_V1086=Object.freeze({BUILD,selectedId,verified,clear,sync,schedule,onClick,install,cleanup});
})();