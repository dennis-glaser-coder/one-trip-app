/* NOREYO V10.74 — compare traveller apply against planner-opening occupancy.
   Traveller +/- controls mutate searchState while the sheet is open, so comparing
   before/after applyTravellers cannot detect a no-op. Capture occupancy when the
   travellers planner opens. If Apply is pressed without a real change, close/cancel
   cleanly and bypass V10.48's unconditional results refresh. */
(function(){
'use strict';
const BUILD='10.74';
let installed=false,priorOpen=null,priorApply=null,priorClose=null,opening=null;
function occupancy(){try{const s=typeof searchState!=='undefined'?searchState:null;return JSON.stringify({adults:Number(s?.adults)||1,childAges:Array.isArray(s?.childAges)?s.childAges.map(Number):[]});}catch(_){return'';}}
function clear(){opening=null;}
function install(){if(installed||typeof window.openPlanner!=='function'||typeof window.applyTravellers!=='function'||typeof window.closePlanner!=='function'||window.applyTravellers.__noreyoV1074)return false;priorOpen=window.openPlanner;priorApply=window.applyTravellers;priorClose=window.closePlanner;window.openPlanner=function(mode,...args){const result=priorOpen.call(this,mode,...args);opening=String(mode||'')==='travellers'?occupancy():null;return result;};window.closePlanner=function(...args){clear();return priorClose.apply(this,args);};window.applyTravellers=function(...args){const base=opening;if(base!==null&&base===occupancy()){clear();try{window.closePlanner();}catch(_){}try{showToast?.('Reisende unverändert');}catch(_){}return false;}clear();return priorApply.apply(this,args);};window.applyTravellers.__noreyoV1074=true;window.applyTravellers.__noreyoV1074Prior=priorApply;installed=true;return true;}
function restore(){if(installed&&priorOpen)window.openPlanner=priorOpen;if(installed&&window.applyTravellers?.__noreyoV1074&&priorApply)window.applyTravellers=priorApply;if(installed&&priorClose)window.closePlanner=priorClose;installed=false;priorOpen=null;priorApply=null;priorClose=null;opening=null;}
install();window.addEventListener('pagehide',restore,{passive:true});window.addEventListener('pageshow',install,{passive:true});window.NOREYO_V1074=Object.freeze({BUILD,occupancy,clear,install,restore,getOpening:()=>opening});
})();