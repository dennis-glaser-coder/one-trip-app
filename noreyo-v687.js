/* NOREYO V6.87 — persisted traveller-state total-cap safety.
   Prevents transient invalid AI/manual states (>9 travellers) from being
   persisted and restores the last valid traveller snapshot before storage. */
(function(){
'use strict';
const BUILD='6.87',MAX_ADULTS=6,MAX_CHILDREN=4,MAX_TRAVELLERS=9;
let lastValid=null;

function snapshot(){
  try{
    if(typeof searchState==='undefined'||!searchState)return null;
    return {
      adults:Math.round(Number(searchState.adults)),
      childAges:Array.isArray(searchState.childAges)?searchState.childAges.map(Number):[]
    };
  }catch(_){return null;}
}
function valid(s){
  return !!s&&Number.isInteger(s.adults)&&s.adults>=1&&s.adults<=MAX_ADULTS&&
    Array.isArray(s.childAges)&&s.childAges.length<=MAX_CHILDREN&&
    s.childAges.every(v=>Number.isInteger(v)&&v>=0&&v<=17)&&
    s.adults+s.childAges.length<=MAX_TRAVELLERS;
}
function remember(){
  const s=snapshot();if(!valid(s))return false;
  lastValid={adults:s.adults,childAges:s.childAges.slice()};return true;
}
function restore(){
  if(!lastValid)return false;
  try{
    if(typeof searchState==='undefined'||!searchState)return false;
    searchState.adults=lastValid.adults;
    searchState.childAges=lastValid.childAges.slice();
    return true;
  }catch(_){return false;}
}
function guard(){
  const s=snapshot();
  if(valid(s)){lastValid={adults:s.adults,childAges:s.childAges.slice()};return false;}
  if(!s||!lastValid)return false;
  return restore();
}
function refreshLater(){
  setTimeout(()=>{
    try{if(typeof updateSearchUI==='function')updateSearchUI();}catch(_){ }
    try{if(typeof updateCounts==='function')updateCounts();}catch(_){ }
  },0);
}
function installPersistHook(){
  try{
    if(typeof persistState!=='function'||persistState.__noreyoV687)return false;
    const prior=persistState;
    const wrapped=function(){
      const restored=guard();
      const result=prior.apply(this,arguments);
      if(restored)refreshLater();
      else remember();
      return result;
    };
    wrapped.__noreyoV687=true;
    persistState=wrapped;
    return true;
  }catch(_){return false;}
}
remember();
installPersistHook();
window.addEventListener('pageshow',()=>{remember();installPersistHook();},{passive:true});
window.NOREYO_V687=Object.freeze({BUILD,snapshot,valid,remember,restore,guard,installPersistHook,get lastValid(){return lastValid?{adults:lastValid.adults,childAges:lastValid.childAges.slice()}:null;}});
})();