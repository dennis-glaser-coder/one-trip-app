/* NOREYO V9.92 — truthful async busy semantics.
   Mirror the packed visual loading states into ARIA so screen readers know when
   hotel results or planner content are actively being refreshed. */
(function(){
'use strict';
const BUILD='9.92';
let observer=null,raf=0;
function setBusy(el,busy){if(!el)return false;const value=busy?'true':'false';if(el.getAttribute('aria-busy')===value)return false;el.setAttribute('aria-busy',value);return true;}
function sync(){raf=0;let changed=false;const results=document.getElementById('results');const offers=document.getElementById('offers');const resultBusy=!!results?.classList?.contains('results-busy');changed=setBusy(results,resultBusy)||changed;changed=setBusy(offers,resultBusy)||changed;const sheet=document.getElementById('plannerSheet');const body=document.getElementById('plannerBody');const plannerOpen=!!sheet?.classList?.contains('show');const plannerBusy=plannerOpen&&!!body?.querySelector?.('.loading-panel,.search-spinner');changed=setBusy(body,plannerBusy)||changed;return changed;}
function schedule(){if(!raf)raf=requestAnimationFrame(sync);}
function observe(){if(observer){observer.disconnect();observer=null;}if(typeof MutationObserver==='undefined'||!document.body)return false;observer=new MutationObserver(records=>{for(const r of records){const el=r.target?.nodeType===1?r.target:r.target?.parentElement;if(el?.closest?.('#results,#offers,#plannerSheet,#plannerBody')){schedule();return;}for(const n of r.addedNodes||[]){if(n?.nodeType===1&&(n.matches?.('#results,#offers,#plannerSheet,#plannerBody,.loading-panel,.search-spinner')||n.querySelector?.('#results,#offers,#plannerSheet,#plannerBody,.loading-panel,.search-spinner'))){schedule();return;}}}});observer.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['class']});schedule();return true;}
function cleanup(){if(observer){observer.disconnect();observer=null;}if(raf){cancelAnimationFrame(raf);raf=0;}}
observe();window.addEventListener('pagehide',cleanup,{passive:true});window.addEventListener('pageshow',observe,{passive:true});window.NOREYO_V992=Object.freeze({BUILD,setBusy,sync,schedule,observe,cleanup});
})();