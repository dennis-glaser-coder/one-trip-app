/* NOREYO V10.02 — selected-flight context validity.
   A selected offer must not survive changes to destination, dates or travellers.
   Attach the current search context immediately after selection and clear stale
   selections before any future verify/prebook flow can consume them. */
(function(){
'use strict';
const BUILD='10.02';
let observer=null,raf=0;
function currentState(){try{return typeof searchState!=='undefined'&&searchState?searchState:{};}catch(_){return{};}}
function currentDest(){try{return String(typeof dest!=='undefined'?dest:'').trim();}catch(_){return'';}}
function context(){const s=currentState();return{dest:currentDest(),checkin:String(s.checkin||''),checkout:String(s.checkout||''),adults:Number(s.adults)||1,childAges:Array.isArray(s.childAges)?s.childAges.map(Number):[]};}
function sameContext(a,b){return !!a&&!!b&&a.dest===b.dest&&a.checkin===b.checkin&&a.checkout===b.checkout&&a.adults===b.adults&&JSON.stringify(a.childAges||[])===JSON.stringify(b.childAges||[]);}
function selected(){return window.NOREYO_SELECTED_FLIGHT||null;}
function attach(){const offer=selected();if(!offer)return false;if(offer.__noreyoContext&&sameContext(offer.__noreyoContext,context()))return false;window.NOREYO_SELECTED_FLIGHT=Object.freeze({...offer,__noreyoContext:Object.freeze(context())});return true;}
function valid(){const offer=selected();if(!offer)return true;if(!offer.__noreyoContext)return false;if(!sameContext(offer.__noreyoContext,context()))return false;const airports=currentState()?.airports;if(offer.origin&&Array.isArray(airports)&&airports.length&&!airports.map(x=>String(x).toUpperCase()).includes(String(offer.origin).toUpperCase()))return false;return true;}
function clear(){if(!selected())return false;try{delete window.NOREYO_SELECTED_FLIGHT;}catch(_){window.NOREYO_SELECTED_FLIGHT=undefined;}return true;}
function sync(){raf=0;const offer=selected();if(!offer)return false;if(!offer.__noreyoContext)return attach();if(!valid())return clear();return false;}
function schedule(){if(!raf)raf=requestAnimationFrame(sync);}
function onClick(e){if(e.target?.closest?.('.noreyo-v943-select'))setTimeout(attach,0);else setTimeout(schedule,0);}
function observe(){if(observer){observer.disconnect();observer=null;}if(typeof MutationObserver==='undefined'||!document.body)return false;observer=new MutationObserver(schedule);observer.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['class']});document.addEventListener('click',onClick,true);schedule();return true;}
function cleanup(){if(observer){observer.disconnect();observer=null;}document.removeEventListener('click',onClick,true);if(raf){cancelAnimationFrame(raf);raf=0;}}
observe();window.addEventListener('pagehide',cleanup,{passive:true});window.addEventListener('pageshow',observe,{passive:true});window.NOREYO_V1002=Object.freeze({BUILD,currentState,currentDest,context,sameContext,selected,attach,valid,clear,sync,schedule,observe,cleanup});
})();