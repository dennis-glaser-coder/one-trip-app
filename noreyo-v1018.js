/* NOREYO V10.18 — selected-flight preference context.
   A selected offer must not survive later changes to the six flight preferences.
   Preserve the existing V10.02 search context and attach a preference fingerprint. */
(function(){
'use strict';
const BUILD='10.18',KEYS=Object.freeze(['Flug0','Flug1','Flug2','Flug3','Flug4','Flug5']);
let observer=null,raf=0;
function statesObj(){try{return typeof states!=='undefined'?states:(window.states||{});}catch(_){return window.states||{};}}
function prefs(){const s=statesObj(),out={};for(const k of KEYS)out[k]=String(s?.[k]||'any');return out;}
function same(a,b){return !!a&&!!b&&KEYS.every(k=>String(a[k]||'any')===String(b[k]||'any'));}
function selected(){return window.NOREYO_SELECTED_FLIGHT||null;}
function attach(){const offer=selected();if(!offer)return false;const current=prefs();if(offer.__noreyoFlightPrefs&&same(offer.__noreyoFlightPrefs,current))return false;window.NOREYO_SELECTED_FLIGHT=Object.freeze({...offer,__noreyoFlightPrefs:Object.freeze(current)});return true;}
function valid(){const offer=selected();if(!offer)return true;return !!offer.__noreyoFlightPrefs&&same(offer.__noreyoFlightPrefs,prefs());}
function clear(){if(!selected())return false;try{delete window.NOREYO_SELECTED_FLIGHT;}catch(_){window.NOREYO_SELECTED_FLIGHT=undefined;}return true;}
function sync(){raf=0;const offer=selected();if(!offer)return false;if(!offer.__noreyoFlightPrefs)return attach();if(!valid())return clear();return false;}
function schedule(){if(!raf)raf=requestAnimationFrame(sync);}
function onClick(e){if(e.target?.closest?.('.noreyo-v943-select'))setTimeout(attach,0);else if(e.target?.closest?.('[data-pref-key],.premium-chip,.filter-chip,.pref-chip,.noreyo-v559-pref'))setTimeout(schedule,0);}
function observe(){if(observer){observer.disconnect();observer=null;}if(typeof MutationObserver==='undefined'||!document.body)return false;observer=new MutationObserver(schedule);observer.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['class','data-state']});document.addEventListener('click',onClick,true);schedule();return true;}
function cleanup(){if(observer){observer.disconnect();observer=null;}document.removeEventListener('click',onClick,true);if(raf){cancelAnimationFrame(raf);raf=0;}}
observe();window.addEventListener('pagehide',cleanup,{passive:true});window.addEventListener('pageshow',observe,{passive:true});window.NOREYO_V1018=Object.freeze({BUILD,KEYS,statesObj,prefs,same,selected,attach,valid,clear,sync,schedule,observe,cleanup});
})();