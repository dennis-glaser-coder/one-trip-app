/* NOREYO V5.85 — post-parse occupancy safety + fail-closed native CTA */
(function(){
'use strict';
const BUILD='5.85';
let busy=false,busyButton=null,busyTimer=0,observer=null,rootObserver=null,observedRoot=null,baseline='';
let safetyAttempts=0,safetyTimer=0;

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
function scheduleSafetyRetry(){
 if(window.NOREYO_V577||safetyAttempts>=3)return;
 clearTimeout(safetyTimer);
 safetyTimer=setTimeout(ensureFamilySafety,300*Math.pow(2,Math.max(0,safetyAttempts-1)));
}
function ensureFamilySafety(){
 if(window.NOREYO_V577){safetyAttempts=0;clearTimeout(safetyTimer);safetyTimer=0;return;}
 try{window.NOREYO_V576?.loadSafetyJs?.();}catch(_){ }
 if(window.NOREYO_V577||document.querySelector('script[data-noreyo-v577]'))return;
 if(safetyAttempts>=3)return;
 safetyAttempts++;
 const s=document.createElement('script');s.src='./noreyo-v577.js?build=585';s.dataset.noreyoV577='1';
 s.onload=()=>{safetyAttempts=0;clearTimeout(safetyTimer);safetyTimer=0;};
 s.onerror=()=>{s.remove();scheduleSafetyRetry();};
 document.head.appendChild(s);
}
function occupancyError(){
 try{return String(window.NOREYO_V581?.occupancyError?.()||'');}catch(_){return'Reisendenbelegung konnte nicht geprüft werden.';}
}
function validateSearchSafety(){
 const api=window.NOREYO_V577;
 if(!api){ensureFamilySafety();return{error:'Reisendenprüfung wird geladen. Bitte gleich noch einmal suchen.',unavailable:true,planner:false};}
 try{
   api.applyFamily();
   const familyError=String(api.validateBeforeSearch?.()||'');
   if(familyError)return{error:familyError,unavailable:false,planner:true};
   const occupancy=occupancyError();
   if(occupancy)return{error:occupancy,unavailable:false,planner:true};
   return{error:'',unavailable:false,planner:false};
 }catch(_){
   ensureFamilySafety();
   return{error:'Reisendenprüfung konnte noch nicht abgeschlossen werden. Bitte erneut versuchen.',unavailable:true,planner:false};
 }
}
function onClick(e){
 const btn=nativeCTA(e.target);if(!btn)return;
 const check=validateSearchSafety();
 if(check.error){e.preventDefault();e.stopImmediatePropagation();notify(check.error);if(check.planner)setTimeout(openTravellers,0);return;}
 if(window.NOREYO_V577?.busy||busy){e.preventDefault();e.stopImmediatePropagation();return;}
 beginBusy(btn);
}
function rootRelevant(records){for(const r of records){for(const n of r.addedNodes||[]){if(n.nodeType!==1)continue;if(n.id==='results'||n.querySelector?.('#results'))return true;}for(const n of r.removedNodes||[]){if(n===observedRoot||n.nodeType===1&&(n.id==='results'||n.querySelector?.('#results')))return true;}}return false;}
function attachRootObserver(){if(rootObserver||typeof MutationObserver==='undefined'||!document.body)return;rootObserver=new MutationObserver(records=>{if(rootRelevant(records)){observedRoot=null;bindResults();}});rootObserver.observe(document.body,{childList:true,subtree:true});}
function cleanup(){releaseBusy();clearTimeout(safetyTimer);safetyTimer=0;if(observer){observer.disconnect();observer=null;}if(rootObserver){rootObserver.disconnect();rootObserver=null;}observedRoot=null;}
function restore(){releaseBusy();ensureFamilySafety();bindResults();attachRootObserver();}
function install(){ensureFamilySafety();bindResults();attachRootObserver();document.addEventListener('click',onClick,true);window.addEventListener('pagehide',cleanup,{passive:true});window.addEventListener('pageshow',restore,{passive:true});}
window.NOREYO_V585=Object.freeze({BUILD,validateSearchSafety,ensureFamilySafety,occupancyError,releaseBusy,rootRelevant,get busy(){return busy;}});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();