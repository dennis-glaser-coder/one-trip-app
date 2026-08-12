/* NOREYO V9.49 — actionable expired-flight recovery.
   V9.45 correctly classified stale offers but disabled the retry control. Keep
   stale offers non-selectable while intercepting their button at window-capture
   level to launch a fresh search before V9.43 can process selection. */
(()=>{
'use strict';
const BUILD='9.49';
let observer=null,raf=0;
function expiredButtons(){return [...document.querySelectorAll('.noreyo-v943-select[data-noreyo-expired="1"]')]}
function repairButton(button){if(!button)return false;let changed=false;if(button.disabled){button.disabled=false;changed=true}if(button.hasAttribute('aria-disabled')){button.removeAttribute('aria-disabled');changed=true}if(button.textContent!=='Abgelaufen · Flüge neu suchen'){button.textContent='Abgelaufen · Flüge neu suchen';changed=true}button.setAttribute('aria-label','Flugangebot abgelaufen – Flüge neu suchen');return changed}
function repair(){raf=0;let changed=false;for(const b of expiredButtons())changed=repairButton(b)||changed;return changed}
function schedule(){if(raf)return;raf=requestAnimationFrame(repair)}
function onWindowClick(e){const button=e.target?.closest?.('.noreyo-v943-select[data-noreyo-expired="1"]');if(!button)return;e.preventDefault();e.stopImmediatePropagation();try{window.NOREYO_V943?.search?.()}catch(_){}}
function observe(){if(observer){observer.disconnect();observer=null}if(typeof MutationObserver==='undefined'||!document.body)return false;observer=new MutationObserver(schedule);observer.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['disabled','data-noreyo-expired']});schedule();return true}
function cleanup(){if(observer){observer.disconnect();observer=null}if(raf){cancelAnimationFrame(raf);raf=0}}
window.addEventListener('click',onWindowClick,true);observe();window.addEventListener('pagehide',cleanup,{passive:true});window.addEventListener('pageshow',observe,{passive:true});
window.NOREYO_V949=Object.freeze({BUILD,expiredButtons,repairButton,repair,schedule,onWindowClick,observe,cleanup});
})();