/* NOREYO V10.64 — actionable direct-hotel ambiguity UI.
   V10.56/V10.58 correctly reject low-confidence hotel resolution, but packed
   searchTrips catches every thrown error as a backend failure and offers a useless
   retry. Reclassify only NOREYO resolver-ambiguity messages into an input-repair UI. */
(function(){
'use strict';
const BUILD='10.64';
let observer=null,raf=0;
function ambiguousText(text){const t=String(text||'');return /nicht eindeutig genug zugeordnet|als alleiniger Hotelname nicht eindeutig genug/i.test(t);}
function focusHotelQuery(){try{if(typeof go==='function')go('searchView');setTimeout(()=>{try{document.querySelector('.view.active .hotelQueryInput')?.focus({preventScroll:false});}catch(_){}},0);}catch(_){}}
function repair(){raf=0;const root=document.getElementById('offers');if(!root||!ambiguousText(root.textContent))return false;let changed=false;const heading=root.querySelector('b');if(heading&&heading.textContent!=='Hotelname nicht eindeutig'){heading.textContent='Hotelname nicht eindeutig';changed=true;}const button=root.querySelector('button.planner-save');if(button&&button.dataset.noreyoV1064!=='1'){button.dataset.noreyoV1064='1';button.textContent='Hotelname oder Ort ergänzen';button.removeAttribute('onclick');button.addEventListener('click',focusHotelQuery);changed=true;}const match=document.querySelector('#results .match');if(match){const b=match.querySelector('b'),small=match.querySelector('small');if(b&&b.textContent!=='Hotelname präzisieren'){b.textContent='Hotelname präzisieren';changed=true;}if(small&&small.textContent!=='Ergänze den vollständigen Hotelnamen oder zusätzlich den Ort.'){small.textContent='Ergänze den vollständigen Hotelnamen oder zusätzlich den Ort.';changed=true;}}return changed;}
function schedule(){if(!raf)raf=requestAnimationFrame(repair);}
function observe(){if(observer){observer.disconnect();observer=null;}const root=document.getElementById('offers');if(typeof MutationObserver==='undefined'||!root)return false;observer=new MutationObserver(schedule);observer.observe(root,{subtree:true,childList:true,characterData:true});schedule();return true;}
function cleanup(){if(observer){observer.disconnect();observer=null;}if(raf){cancelAnimationFrame(raf);raf=0;}}
observe();window.addEventListener('pagehide',cleanup,{passive:true});window.addEventListener('pageshow',observe,{passive:true});
window.NOREYO_V1064=Object.freeze({BUILD,ambiguousText,focusHotelQuery,repair,schedule,observe,cleanup});
})();