/* NOREYO V7.55 — startup traveller-state repair.
   Repairs already-persisted invalid traveller combinations to the closest safe
   state on load/pageshow, including infant/adult parity, instead of waiting
   until the next search request rejects them. */
(function(){
'use strict';
const BUILD='7.55',MAX_ADULTS=6,MAX_CHILDREN=4,MAX_TRAVELLERS=9;
function snapshot(){try{if(typeof searchState==='undefined'||!searchState)return null;return{adults:Math.round(Number(searchState.adults)),childAges:Array.isArray(searchState.childAges)?searchState.childAges.map(Number):[]};}catch(_){return null;}}
function valid(s){return !!s&&Number.isInteger(s.adults)&&s.adults>=1&&s.adults<=MAX_ADULTS&&Array.isArray(s.childAges)&&s.childAges.length<=MAX_CHILDREN&&s.childAges.every(v=>Number.isInteger(v)&&v>=0&&v<=17)&&s.adults+s.childAges.length<=MAX_TRAVELLERS&&s.childAges.filter(v=>v<=1).length<=s.adults;}
function normalize(s){if(!s)return{adults:2,childAges:[]};let adults=Math.round(Number(s.adults));if(!Number.isInteger(adults)||adults<1)adults=2;adults=Math.max(1,Math.min(MAX_ADULTS,adults));let ages=Array.isArray(s.childAges)?s.childAges.map(Number).filter(v=>Number.isInteger(v)&&v>=0&&v<=17).slice(0,MAX_CHILDREN):[];const totalRoom=Math.max(0,MAX_TRAVELLERS-adults);if(ages.length>totalRoom)ages=ages.slice(0,totalRoom);let infantSlots=adults;const kept=[];for(const age of ages){if(age<=1){if(infantSlots<=0)continue;infantSlots--;}kept.push(age);}return{adults,childAges:kept};}
function same(a,b){return !!a&&!!b&&a.adults===b.adults&&a.childAges.length===b.childAges.length&&a.childAges.every((v,i)=>v===b.childAges[i]);}
function repair(){const before=snapshot();if(valid(before))return false;const next=normalize(before);try{if(typeof searchState==='undefined'||!searchState)return false;searchState.adults=next.adults;searchState.childAges=next.childAges.slice();try{updateSearchUI?.();}catch(_){}try{updateCounts?.();}catch(_){}try{persistState?.();}catch(_){}return !same(before,next);}catch(_){return false;}}
function install(){return repair();}
install();window.addEventListener('pageshow',install,{passive:true});
window.NOREYO_V755=Object.freeze({BUILD,snapshot,valid,normalize,same,repair,install});
})();