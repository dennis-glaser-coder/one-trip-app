/* NOREYO V5.86 — complete native-search preflight + family/occupancy safety */
(function(){
'use strict';
const BUILD='5.86';
let busy=false,busyButton=null,busyTimer=0,observer=null,rootObserver=null,observedRoot=null,baseline='';
let safetyAttempts=0,safetyTimer=0;

function norm(v){return String(v||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/ß/g,'ss');}
function notify(msg){try{if(typeof showToast==='function')showToast(msg);else if(typeof window.toast==='function')window.toast(msg);}catch(_){ }}
function resultRoot(){return document.getElementById('results');}
function offerSignature(){const offers=[...document.querySelectorAll('#offers .offer')];return offers.length+':'+offers.slice(0,3).map(x=>String(x.textContent||'').replace(/\s+/g,' ').slice(0,180)).join('|');}
function terminalResult(){const t=norm(resultRoot()?.textContent||'');return /keine (?:angebote|hotels|fluege|reisen|ergebnisse)|nichts gefunden|suche fehlgeschlagen|fehler bei der suche|erneut versuchen/.test(t);}
function releaseBusy(){if(!busy)return;busy=false;clearTimeout(busyTimer);busyTimer=0;if(busyButton){busyButton.disabled=false;busyButton.removeAttribute('aria-disabled');}busyButton=null;resultRoot()?.setAttribute('aria-busy','false');}
function beginBusy(btn){busy=true;baseline=offerSignature();busyButton=btn||null;if(btn){btn.disabled=true;btn.setAttribute('aria-disabled','true');}resultRoot()?.setAttribute('aria-busy','true');clearTimeout(busyTimer);busyTimer=setTimeout(releaseBusy,15000);}
function settled(){if(!busy)return;if(offerSignature()!==baseline||terminalResult())releaseBusy();}
function bindResults(){const r=resultRoot();if(!r||r===observedRoot)return;if(observer)observer.disconnect();observedRoot=r;r.setAttribute('aria-live','polite');r.setAttribute('aria-busy',busy?'true':'false');observer=new MutationObserver(settled);observer.observe(r,{childList:true,subtree:true,characterData:true});}
function nativeCTA(target){return target instanceof Element?target.closest('.noreyo-v541-booking-cta'):null;}
function scheduleSafetyRetry(){if(window.NOREYO_V577||safetyAttempts>=3)return;clearTimeout(safetyTimer);safetyTimer=setTimeout(ensureFamilySafety,300*Math.pow(2,Math.max(0,safetyAttempts-1)));}
function ensureFamilySafety(){
 if(window.NOREYO_V577){safetyAttempts=0;clearTimeout(safetyTimer);safetyTimer=0;return;}
 try{window.NOREYO_V576?.loadSafetyJs?.();}catch(_){ }
 if(window.NOREYO_V577||document.querySelector('script[data-noreyo-v577]'))return;
 if(safetyAttempts>=3)return;
 safetyAttempts++;
 const s=document.createElement('script');s.src='./noreyo-v577.js?build=586';s.dataset.noreyoV577='1';
 s.onload=()=>{safetyAttempts=0;clearTimeout(safetyTimer);safetyTimer=0;};
 s.onerror=()=>{s.remove();scheduleSafetyRetry();};
 document.head.appendChild(s);
}
function occupancyError(){try{return String(window.NOREYO_V581?.occupancyError?.()||'');}catch(_){return'Reisendenbelegung konnte nicht geprüft werden.';}}
function state(){try{return typeof searchState!=='undefined'&&searchState?searchState:null;}catch(_){return null;}}
function mode(){
 const active=document.querySelector('#discover .product-mode.on');
 const t=norm(active?.textContent||'');
 if(t.includes('kreuzfahrt'))return'cruise';if(t.includes('hotel'))return'hotel';if(t.includes('flug'))return'flight';
 try{if(typeof productMode==='string'&&productMode)return productMode;}catch(_){ }
 return'package';
}
function validISO(value){
 const s=String(value||'');if(!/^\d{4}-\d{2}-\d{2}$/.test(s))return false;
 const d=new Date(s+'T12:00:00');return !Number.isNaN(d.getTime())&&d.getFullYear()===Number(s.slice(0,4))&&d.getMonth()+1===Number(s.slice(5,7))&&d.getDate()===Number(s.slice(8,10));
}
function todayISO(){const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');}
function destinationPresent(){try{return typeof dest!=='undefined'&&String(dest||'').trim().length>=2;}catch(_){return false;}}
function airportsValid(){const s=state(),arr=Array.isArray(s?.airports)?s.airports:[];return arr.length>=1&&arr.length<=5&&arr.every(x=>/^[A-Z]{3}$/.test(String(x||'').trim().toUpperCase()));}
function coreSearchError(){
 const m=mode(),s=state();
 if(m==='cruise')return'';
 if(!destinationPresent())return'Bitte zuerst ein Reiseziel auswählen.';
 const checkin=String(s?.checkin||''),checkout=String(s?.checkout||'');
 if(!validISO(checkin)||!validISO(checkout))return'Bitte einen gültigen Reisezeitraum auswählen.';
 if(checkin<todayISO())return'Das Abreisedatum liegt in der Vergangenheit. Bitte den Zeitraum aktualisieren.';
 if(checkout<=checkin)return'Das Rückreisedatum muss nach dem Abreisedatum liegen.';
 if((m==='package'||m==='flight')&&!airportsValid())return'Bitte mindestens einen gültigen Abflughafen auswählen.';
 return'';
}
function plannerKindFor(error){const t=norm(error);if(t.includes('reiseziel'))return'destination';if(t.includes('zeitraum')||t.includes('abreise')||t.includes('rueckreise'))return'dates';if(t.includes('abflughafen'))return'airports';return'travellers';}
function openPlannerFor(kind){
 try{if(typeof openPlanner==='function'){openPlanner(kind);return;}}catch(_){ }
 const map={destination:['.destInput','.destinationInput','[data-field="destination"]'],dates:['.dateInput','[data-field="dates"]'],airports:['.airportInput','[data-field="airports"]'],travellers:['.travellerInput','.travelerInput','[data-field="travellers"]']};
 for(const q of map[kind]||[]){const el=document.querySelector(q);if(el){el.click();return;}}
}
function validateSearchSafety(){
 const api=window.NOREYO_V577;
 if(!api){ensureFamilySafety();return{error:'Reisendenprüfung wird geladen. Bitte gleich noch einmal suchen.',unavailable:true,planner:''};}
 try{
   api.applyFamily();
   const familyError=String(api.validateBeforeSearch?.()||'');
   if(familyError)return{error:familyError,unavailable:false,planner:'travellers'};
   const occupancy=occupancyError();if(occupancy)return{error:occupancy,unavailable:false,planner:'travellers'};
   const core=coreSearchError();if(core)return{error:core,unavailable:false,planner:plannerKindFor(core)};
   return{error:'',unavailable:false,planner:''};
 }catch(_){
   ensureFamilySafety();
   return{error:'Reisendenprüfung konnte noch nicht abgeschlossen werden. Bitte erneut versuchen.',unavailable:true,planner:''};
 }
}
function onClick(e){
 const btn=nativeCTA(e.target);if(!btn)return;
 const check=validateSearchSafety();
 if(check.error){e.preventDefault();e.stopImmediatePropagation();notify(check.error);if(check.planner)setTimeout(()=>openPlannerFor(check.planner),0);return;}
 if(window.NOREYO_V577?.busy||busy){e.preventDefault();e.stopImmediatePropagation();return;}
 beginBusy(btn);
}
function rootRelevant(records){for(const r of records){for(const n of r.addedNodes||[]){if(n.nodeType!==1)continue;if(n.id==='results'||n.querySelector?.('#results'))return true;}for(const n of r.removedNodes||[]){if(n===observedRoot||n.nodeType===1&&(n.id==='results'||n.querySelector?.('#results')))return true;}}return false;}
function attachRootObserver(){if(rootObserver||typeof MutationObserver==='undefined'||!document.body)return;rootObserver=new MutationObserver(records=>{if(rootRelevant(records)){observedRoot=null;bindResults();}});rootObserver.observe(document.body,{childList:true,subtree:true});}
function cleanup(){releaseBusy();clearTimeout(safetyTimer);safetyTimer=0;if(observer){observer.disconnect();observer=null;}if(rootObserver){rootObserver.disconnect();rootObserver=null;}observedRoot=null;}
function restore(){releaseBusy();ensureFamilySafety();bindResults();attachRootObserver();}
function install(){ensureFamilySafety();bindResults();attachRootObserver();document.addEventListener('click',onClick,true);window.addEventListener('pagehide',cleanup,{passive:true});window.addEventListener('pageshow',restore,{passive:true});}
window.NOREYO_V586=Object.freeze({BUILD,validateSearchSafety,coreSearchError,validISO,airportsValid,ensureFamilySafety,releaseBusy,get busy(){return busy;}});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();