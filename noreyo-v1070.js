/* NOREYO V10.70 — no-op filter apply must not trigger live search.
   Packed applyPrefs always schedules searchTrips from search/results, even when
   the user opened the sheet and changed nothing (or reverted every edit).
   Compare the complete filter state, including the explicit flight-duration marker,
   and close cleanly without a provider call when there is no committed change. */
(function(){
'use strict';
const BUILD='10.70',MARKER='noreyoFlightMaxExplicitV1040';
let installed=false,priorOpen=null,priorApply=null,openingSig=null;
function stable(value){if(!value||typeof value!=='object')return value;if(Array.isArray(value))return value.map(stable);const out={};for(const key of Object.keys(value).sort())out[key]=stable(value[key]);return out;}
function marker(){try{return localStorage.getItem(MARKER);}catch(_){return null;}}
function snapshot(){try{const st=typeof states!=='undefined'?states:{},lim=typeof limits!=='undefined'?limits:{},ex=typeof excluded!=='undefined'?excluded:null;return{states:stable(st||{}),limits:stable(lim||{}),excluded:ex?.values?[...ex.values()].map(String).sort():[],confirmedOnly:typeof confirmedOnly!=='undefined'?!!confirmedOnly:false,maxFlightExplicit:marker()};}catch(_){return{fallback:'error'};}}
function signature(){return JSON.stringify(snapshot());}
function origin(){try{return String(typeof filterOrigin!=='undefined'?filterOrigin:'');}catch(_){return'';}}
function closeNoop(){try{updateCounts?.();}catch(_){}try{refreshQuickStates?.();}catch(_){}try{refreshPremiumFilterChips?.();}catch(_){}const from=origin();try{closeFilter?.();}catch(_){}if(from==='profile'){try{go?.('profile');}catch(_){}try{showToast?.('Keine Filteränderungen');}catch(_){}}else{try{showToast?.('Filter unverändert');}catch(_){}}return false;}
function install(){if(installed||typeof window.openFilter!=='function'||typeof window.applyPrefs!=='function'||window.applyPrefs.__noreyoV1070)return false;priorOpen=window.openFilter;priorApply=window.applyPrefs;window.openFilter=function(...args){const result=priorOpen.apply(this,args);openingSig=signature();return result;};window.applyPrefs=function(...args){const before=openingSig;openingSig=null;if(before!==null&&before===signature())return closeNoop();return priorApply.apply(this,args);};window.applyPrefs.__noreyoV1070=true;window.applyPrefs.__noreyoV1070Prior=priorApply;installed=true;return true;}
function restore(){if(installed&&priorOpen)window.openFilter=priorOpen;if(installed&&window.applyPrefs?.__noreyoV1070&&priorApply)window.applyPrefs=priorApply;installed=false;priorOpen=null;priorApply=null;openingSig=null;}
install();window.addEventListener('pagehide',restore,{passive:true});window.addEventListener('pageshow',install,{passive:true});window.NOREYO_V1070=Object.freeze({BUILD,MARKER,stable,marker,snapshot,signature,origin,closeNoop,install,restore});
})();