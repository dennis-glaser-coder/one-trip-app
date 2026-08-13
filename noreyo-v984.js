/* NOREYO V9.84 — bind result live-region semantics to the real packed #offers container.
   V9.80 correctly fixed the clickable result summary but targeted a non-existent
   #list node for announcements. The packed core renders results into #offers. */
(function(){
'use strict';
const BUILD='9.84';
let observer=null,raf=0;
function enhance(){const offers=document.getElementById('offers');if(!offers)return false;let changed=false;if(offers.getAttribute('aria-live')!=='polite'){offers.setAttribute('aria-live','polite');changed=true;}if(offers.getAttribute('aria-atomic')!=='false'){offers.setAttribute('aria-atomic','false');changed=true;}if(offers.getAttribute('aria-relevant')!=='additions text'){offers.setAttribute('aria-relevant','additions text');changed=true;}return changed;}
function run(){raf=0;enhance();}
function schedule(){if(!raf)raf=requestAnimationFrame(run);}
function observe(){if(observer){observer.disconnect();observer=null;}if(typeof MutationObserver==='undefined'||!document.body)return false;observer=new MutationObserver(records=>{for(const r of records){for(const n of r.addedNodes||[]){if(n?.nodeType===1&&(n.id==='offers'||n.querySelector?.('#offers'))){schedule();return;}}}});observer.observe(document.body,{childList:true,subtree:true});schedule();return true;}
function cleanup(){if(observer){observer.disconnect();observer=null;}if(raf){cancelAnimationFrame(raf);raf=0;}}
observe();window.addEventListener('pagehide',cleanup,{passive:true});window.addEventListener('pageshow',observe,{passive:true});window.NOREYO_V984=Object.freeze({BUILD,enhance,run,schedule,observe,cleanup});
})();