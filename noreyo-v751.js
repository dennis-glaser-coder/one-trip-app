/* NOREYO V7.51 — persisted infant/adult parity safety.
   Keeps persisted traveller state aligned with the final request boundary:
   at most one child under 2 years per adult, in addition to existing caps. */
(function(){
'use strict';
const BUILD='7.51',MAX_ADULTS=6,MAX_CHILDREN=4,MAX_TRAVELLERS=9;
let lastValid=null;
function snapshot(){try{if(typeof searchState==='undefined'||!searchState)return null;return{adults:Math.round(Number(searchState.adults)),childAges:Array.isArray(searchState.childAges)?searchState.childAges.map(Number):[]};}catch(_){return null;}}
function valid(s){if(!s||!Number.isInteger(s.adults)||s.adults<1||s.adults>MAX_ADULTS)return false;if(!Array.isArray(s.childAges)||s.childAges.length>MAX_CHILDREN)return false;if(s.childAges.some(v=>!Number.isInteger(v)||v<0||v>17))return false;if(s.adults+s.childAges.length>MAX_TRAVELLERS)return false;if(s.childAges.filter(v=>v<=1).length>s.adults)return false;return true;}
function remember(){const s=snapshot();if(!valid(s))return false;lastValid={adults:s.adults,childAges:s.childAges.slice()};return true;}
function restore(){if(!lastValid)return false;try{if(typeof searchState==='undefined'||!searchState)return false;searchState.adults=lastValid.adults;searchState.childAges=lastValid.childAges.slice();return true;}catch(_){return false;}}
function refreshLater(){setTimeout(()=>{try{updateSearchUI?.();}catch(_){}try{updateCounts?.();}catch(_){}},0);}
function install(){try{if(typeof persistState!=='function'||persistState.__noreyoV751)return false;const prior=persistState;const wrapped=function(){const s=snapshot();if(valid(s)){lastValid={adults:s.adults,childAges:s.childAges.slice()};return prior.apply(this,arguments);}if(lastValid&&restore()){const result=prior.apply(this,arguments);refreshLater();return result;}return undefined;};wrapped.__noreyoV751=true;persistState=wrapped;return true;}catch(_){return false;}}
remember();install();window.addEventListener('pageshow',()=>{remember();install();},{passive:true});
window.NOREYO_V751=Object.freeze({BUILD,snapshot,valid,remember,restore,install,get lastValid(){return lastValid?{adults:lastValid.adults,childAges:lastValid.childAges.slice()}:null;}});
})();