/* NOREYO V10.52 — cancel flex-price comparisons before mutable planner edits.
   Packed flex-price workers read global searchState for each parallel request.
   Travellers/dates/board planners mutate that global state while open. Even if the
   edit is later cancelled, an in-flight flex run can mix prices from old/new state.
   Invalidate and hide the flex run before such planner edits begin. */
(function(){
'use strict';
const BUILD='10.52';
const INVALIDATING_MODES=Object.freeze(new Set(['travellers','dates','board']));
let priorOpen=null,installed=false;
function invalidate(){let changed=false;try{if(typeof flexPriceRun!=='undefined'){flexPriceRun=Number(flexPriceRun||0)+1;changed=true;}}catch(_){}try{if(typeof resetFlexPricePanel==='function'){resetFlexPricePanel();changed=true;}else{const el=document.getElementById('flexPricePanel');if(el){el.hidden=true;el.innerHTML='';changed=true;}}}catch(_){}return changed;}
function shouldInvalidate(mode){return INVALIDATING_MODES.has(String(mode||''));}
function install(){if(installed||typeof window.openPlanner!=='function'||window.openPlanner.__noreyoV1052)return false;priorOpen=window.openPlanner;const wrapped=function(mode,...args){if(shouldInvalidate(mode))invalidate();return priorOpen.call(this,mode,...args);};wrapped.__noreyoV1052=true;wrapped.__noreyoV1052Prior=priorOpen;window.openPlanner=wrapped;installed=true;return true;}
function restore(){if(!installed)return false;if(window.openPlanner?.__noreyoV1052&&priorOpen)window.openPlanner=priorOpen;installed=false;priorOpen=null;return true;}
install();window.addEventListener('pagehide',restore,{passive:true});window.addEventListener('pageshow',install,{passive:true});
window.NOREYO_V1052=Object.freeze({BUILD,INVALIDATING_MODES,shouldInvalidate,invalidate,install,restore});
})();