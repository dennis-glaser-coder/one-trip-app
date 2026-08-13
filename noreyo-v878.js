/* NOREYO V8.78 — latest-intent traveller reconciliation.
   Runs after the existing four-tick atomic traveller layer and guarantees that
   a delayed older AI apply cannot restore an older adults/children state. */
(function(){
'use strict';
const BUILD='8.78',DEBOUNCE_MS=130;
let timer=0,generation=0;
function current(){try{if(typeof searchState==='undefined'||!searchState)return null;return{adults:Math.round(Number(searchState.adults)),childAges:Array.isArray(searchState.childAges)?searchState.childAges.map(Number):[]};}catch(_){return null;}}
function inputText(){return document.getElementById('noreyoAi556Text')?.value||'';}
function plan(text,before=current()){try{return window.NOREYO_V798?.plan?.(text,before)||null;}catch(_){return null;}}
function apply(next){try{return !!window.NOREYO_V798?.apply?.(next);}catch(_){return false;}}
function applyLatest(text,before,token){if(token!==generation)return false;const next=plan(text,before);return next?apply(next):false;}
function schedule(text=inputText(),before=current()){if(!before)return 0;generation+=1;const token=generation;if(timer){clearTimeout(timer);timer=0;}timer=setTimeout(()=>{timer=0;applyLatest(text,before,token);},DEBOUNCE_MS);return token;}
function onApply(e){if(!e.target?.closest?.('.noreyo-v556-apply'))return;schedule(inputText(),current());}
function cleanup(){generation+=1;if(timer){clearTimeout(timer);timer=0;}}
document.addEventListener('click',onApply,true);window.addEventListener('pagehide',cleanup,{passive:true});window.NOREYO_V878=Object.freeze({BUILD,DEBOUNCE_MS,current,inputText,plan,apply,applyLatest,schedule,cleanup,get generation(){return generation;},get pending(){return !!timer;}});
})();