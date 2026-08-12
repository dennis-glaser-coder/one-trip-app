/* NOREYO V10.98 — accessible live-verify announcements.
   Verify, price-change and acceptance feedback changes asynchronously. Mark those
   surfaces as polite atomic status regions and expose button busy state while a
   provider verification is running. */
(function(){
'use strict';
const BUILD='10.98';
let observer=null,raf=0;
function setAttr(el,key,value){if(!el||el.getAttribute(key)===value)return false;el.setAttribute(key,value);return true;}
function sync(){raf=0;let changed=false;document.querySelectorAll('.noreyo-v1084-verify-state,.noreyo-v1094-gate,.noreyo-v1096-price-delta').forEach(el=>{changed=setAttr(el,'role','status')||changed;changed=setAttr(el,'aria-live','polite')||changed;changed=setAttr(el,'aria-atomic','true')||changed;});const btn=document.querySelector('.noreyo-v1084-verify');if(btn){const busy=btn.disabled&&/verifiziert|verifizieren|prüfung|prüft/i.test(btn.textContent||'');changed=setAttr(btn,'aria-busy',busy?'true':'false')||changed;}const accept=document.querySelector('.noreyo-v1094-accept');if(accept&&!accept.getAttribute('aria-label'))changed=setAttr(accept,'aria-label','Aktualisierten Flugpreis und Tarifdetails bestätigen')||changed;return changed;}
function schedule(){if(!raf)raf=requestAnimationFrame(sync);}
function observe(){if(observer){observer.disconnect();observer=null;}if(typeof MutationObserver==='undefined'||!document.body)return false;observer=new MutationObserver(schedule);observer.observe(document.body,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['disabled']});schedule();return true;}
function cleanup(){if(observer){observer.disconnect();observer=null;}if(raf){cancelAnimationFrame(raf);raf=0;}}
observe();window.addEventListener('pagehide',cleanup,{passive:true});window.addEventListener('pageshow',observe,{passive:true});window.NOREYO_V1098=Object.freeze({BUILD,setAttr,sync,schedule,observe,cleanup});
})();