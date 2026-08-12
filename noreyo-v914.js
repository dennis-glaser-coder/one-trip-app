/* NOREYO V9.14 — saved favorite/trip price fallback.
   Prevents invalid persisted prices from rendering as "NaN €" in Favorites/Trips. */
(function(){
'use strict';
const BUILD='9.14';
let observer=null,raf=0;
function invalidPriceText(text){return /^\s*(?:NaN|∞|Infinity)\s*€/i.test(String(text||''));}
function repair(root=document){let changed=false;
  root.querySelectorAll?.('#favList .fav-card .fav-body > span,#tripList .saved-trip-foot > div > b').forEach(el=>{
    if(!invalidPriceText(el.textContent))return;
    el.textContent='Preis aktuell nicht verfügbar';changed=true;
  });
  return changed;
}
function run(){raf=0;repair();}
function schedule(){if(!raf)raf=requestAnimationFrame(run);}
function relevant(n){return n?.nodeType===1&&(n.matches?.('#favList,#tripList,.fav-card,.saved-trip')||n.closest?.('#favList,#tripList')||n.querySelector?.('#favList,#tripList,.fav-card,.saved-trip'));}
function observe(){if(observer){observer.disconnect();observer=null;}if(typeof MutationObserver==='undefined'||!document.body)return false;observer=new MutationObserver(records=>{for(const r of records){if(relevant(r.target)){schedule();return;}for(const n of r.addedNodes||[])if(relevant(n)){schedule();return;}}});observer.observe(document.body,{subtree:true,childList:true,characterData:true});schedule();return true;}
function cleanup(){if(observer){observer.disconnect();observer=null;}if(raf){cancelAnimationFrame(raf);raf=0;}}
observe();window.addEventListener('pagehide',cleanup,{passive:true});window.addEventListener('pageshow',observe,{passive:true});
window.NOREYO_V914=Object.freeze({BUILD,invalidPriceText,repair,relevant,observe,cleanup});
})();
