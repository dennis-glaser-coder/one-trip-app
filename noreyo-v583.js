/* NOREYO V5.83 — native CTA bridge for family validation + double-submit */
(function(){
'use strict';
const BUILD='5.83';
let busy=false,busyButton=null,busyTimer=0,observer=null,observedRoot=null,baseline='';

function norm(v){return String(v||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/ß/g,'ss');}
function notify(msg){try{if(typeof showToast==='function')showToast(msg);else if(typeof window.toast==='function')window.toast(msg);}catch(_){ }}
function openTravellers(){try{if(typeof openPlanner==='function'){openPlanner('travellers');return;}}catch(_){ }for(const q of ['.travellerInput','.travelerInput','[data-planner="travellers"]','[data-field="travellers"]']){const el=document.querySelector(q);if(el){el.click();return;}}}
function resultRoot(){return document.getElementById('results');}
function offerSignature(){const offers=[...document.querySelectorAll('#offers .offer')];return offers.length+':'+offers.slice(0,3).map(x=>String(x.textContent||'').replace(/\s+/g,' ').slice(0,180)).join('|');}
function terminalResult(){const t=norm(resultRoot()?.textContent||'');return /keine (?:angebote|hotels|fluege|reisen|ergebnisse)|nichts gefunden|suche fehlgeschlagen|fehler bei der suche|erneut versuchen/.test(t);}
function releaseBusy(){if(!busy)return;busy=false;clearTimeout(busyTimer);busyTimer=0;if(busyButton){busyButton.disabled=false;busyButton.removeAttribute('aria-disabled');}busyButton=null;resultRoot()?.setAttribute('aria-busy','false');}
function beginBusy(btn){busy=true;baseline=offerSignature();busyButton=btn||null;if(btn){btn.disabled=true;btn.setAttribute('aria-disabled','true');}resultRoot()?.setAttribute('aria-busy','true');clearTimeout(busyTimer);busyTimer=setTimeout(releaseBusy,15000);}
function settled(){if(!busy)return;if(offerSignature()!==baseline||terminalResult())releaseBusy();}
function bindResults(){const r=resultRoot();if(!r||r===observedRoot)return;if(observer)observer.disconnect();observedRoot=r;r.setAttribute('aria-live','polite');r.setAttribute('aria-busy',busy?'true':'false');observer=new MutationObserver(settled);observer.observe(r,{childList:true,subtree:true,characterData:true});}
function nativeCTA(target){return target instanceof Element?target.closest('.noreyo-v541-booking-cta'):null;}
function validateFamily(){
 const api=window.NOREYO_V577;if(!api)return'';
 try{api.applyFamily();const error=api.validateBeforeSearch();return error||'';}catch(_){return'';}
}
function onClick(e){
 const btn=nativeCTA(e.target);if(!btn)return;
 const error=validateFamily();
 if(error){e.preventDefault();e.stopImmediatePropagation();notify(error);setTimeout(openTravellers,0);return;}
 if(window.NOREYO_V577?.busy||busy){e.preventDefault();e.stopImmediatePropagation();return;}
 beginBusy(btn);
}
function rootRelevant(records){for(const r of records){for(const n of r.addedNodes||[]){if(n.nodeType!==1)continue;if(n.id==='results'||n.querySelector?.('#results'))return true;}for(const n of r.removedNodes||[]){if(n===observedRoot||n.nodeType===1&&(n.id==='results'||n.querySelector?.('#results')))return true;}}return false;}
function cleanup(){releaseBusy();if(observer){observer.disconnect();observer=null;}observedRoot=null;}
function install(){
 bindResults();
 document.addEventListener('click',onClick,true);
 if(typeof MutationObserver!=='undefined'){const mo=new MutationObserver(records=>{if(rootRelevant(records)){observedRoot=null;bindResults();}});mo.observe(document.body,{childList:true,subtree:true});}
 window.addEventListener('pagehide',cleanup,{passive:true});
 window.addEventListener('pageshow',()=>{releaseBusy();bindResults();},{passive:true});
}
window.NOREYO_V583=Object.freeze({BUILD,validateFamily,releaseBusy,get busy(){return busy;}});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();