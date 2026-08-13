/* NOREYO V10.72 — no-op meal selection must not refresh hotel rates.
   Choosing the already-active meal plan currently persists, closes and launches
   another search/detail refresh. Detect the effective planner selection first;
   unchanged choices simply close and preserve the current verified result state. */
(function(){
'use strict';
const BUILD='10.72';let installed=false,prior=null;
function effective(){try{if(typeof plannerMealSelection==='function')return String(plannerMealSelection()||'ANY');}catch(_){}try{return String(typeof mealPlanFilter!=='undefined'?mealPlanFilter:'ANY');}catch(_){return'ANY';}}
function closeNoop(){try{closePlanner?.();}catch(_){}try{showToast?.('Verpflegung unverändert');}catch(_){}return false;}
function install(){if(installed||typeof window.chooseMealPlan!=='function'||window.chooseMealPlan.__noreyoV1072)return false;prior=window.chooseMealPlan;const wrapped=function(code,...args){const next=String(code||'');if(next&&next===effective())return closeNoop();return prior.call(this,code,...args);};wrapped.__noreyoV1072=true;wrapped.__noreyoV1072Prior=prior;window.chooseMealPlan=wrapped;installed=true;return true;}
function restore(){if(installed&&window.chooseMealPlan?.__noreyoV1072&&prior)window.chooseMealPlan=prior;installed=false;prior=null;}
install();window.addEventListener('pagehide',restore,{passive:true});window.addEventListener('pageshow',install,{passive:true});window.NOREYO_V1072=Object.freeze({BUILD,effective,closeNoop,install,restore});
})();