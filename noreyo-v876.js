/* NOREYO V8.76 — latest-intent natural date reconciliation.
   Applies only the newest recognized natural date intent after older parser
   callbacks settle, preventing a stale AI "Übernehmen" from restoring older dates. */
(function(){
'use strict';
const BUILD='8.76',DEBOUNCE_MS=110;
let timer=0,generation=0;
function stateDates(){try{return{checkin:String(searchState?.checkin||''),checkout:String(searchState?.checkout||'')};}catch(_){return{checkin:'',checkout:''};}}
function inputText(){return document.getElementById('noreyoAi556Text')?.value||'';}
function validPlan(p){return !!p&&/^\d{4}-\d{2}-\d{2}$/.test(String(p.checkin||''))&&/^\d{4}-\d{2}-\d{2}$/.test(String(p.checkout||''))&&p.checkout>p.checkin;}
function decision(text,before=stateDates()){try{const r=window.NOREYO_V846?.parseNamedRange?.(text);if(validPlan(r))return{checkin:r.checkin,checkout:r.checkout,reason:'full-range'};}catch(_){}try{const r=window.NOREYO_V859?.parseElidedRange?.(text);if(validPlan(r))return{checkin:r.checkin,checkout:r.checkout,reason:'elided-range'};}catch(_){}try{const p=window.NOREYO_V861?.repairPlan?.(text,before);if(validPlan(p))return{checkin:p.checkin,checkout:p.checkout,reason:'am-single'};}catch(_){}try{const p=window.NOREYO_V853?.repairPlan?.(text,before);if(validPlan(p))return{checkin:p.checkin,checkout:p.checkout,reason:'named-single'};}catch(_){}return null;}
function setDates(plan){if(!validPlan(plan))return false;try{if(typeof searchState==='undefined'||!searchState)return false;if(searchState.checkin===plan.checkin&&searchState.checkout===plan.checkout)return false;searchState.checkin=plan.checkin;searchState.checkout=plan.checkout;try{updateSearchUI?.();}catch(_){}try{updateCounts?.();}catch(_){}try{persistState?.();}catch(_){}return true;}catch(_){return false;}}
function applyLatest(text,before,token){if(token!==generation)return false;const plan=decision(text,before);return plan?setDates(plan):false;}
function schedule(text=inputText(),before=stateDates()){generation+=1;const token=generation;if(timer){clearTimeout(timer);timer=0;}timer=setTimeout(()=>{timer=0;applyLatest(text,before,token);},DEBOUNCE_MS);return token;}
function onApply(e){if(!e.target?.closest?.('.noreyo-v556-apply'))return;schedule(inputText(),stateDates());}
function cleanup(){generation+=1;if(timer){clearTimeout(timer);timer=0;}}
document.addEventListener('click',onApply,true);window.addEventListener('pagehide',cleanup,{passive:true});window.NOREYO_V876=Object.freeze({BUILD,DEBOUNCE_MS,stateDates,inputText,validPlan,decision,setDates,applyLatest,schedule,cleanup,get generation(){return generation;},get pending(){return !!timer;}});
})();