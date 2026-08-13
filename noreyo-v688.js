/* NOREYO V6.88 — persisted traveller-state migration + total-cap safety.
   Restores the last valid traveller state during transient invalid edits and
   repairs legacy persisted states so adults + children never exceed 9. */
(function(){
'use strict';
const BUILD='6.88',MAX_ADULTS=6,MAX_CHILDREN=4,MAX_TRAVELLERS=9;
let lastValid=null,repairNoticeShown=false;

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
function canonical(s){
  const rawAdults=Math.round(Number(s?.adults));
  const adults=Number.isFinite(rawAdults)?Math.max(1,Math.min(MAX_ADULTS,rawAdults)):2;
  const capacity=Math.max(0,Math.min(MAX_CHILDREN,MAX_TRAVELLERS-adults));
  const childAges=(Array.isArray(s?.childAges)?s.childAges:[])
    .map(Number).filter(Number.isFinite)
    .map(v=>Math.max(0,Math.min(17,Math.round(v))))
    .slice(0,capacity);
  return {adults,childAges};
}
function assign(s){
  try{
    if(typeof searchState==='undefined'||!searchState||!s)return false;
    searchState.adults=s.adults;
    searchState.childAges=s.childAges.slice();
    return true;
  }catch(_){return false;}
}
function remember(s=snapshot()){
  if(!valid(s))return false;
  lastValid={adults:s.adults,childAges:s.childAges.slice()};
  return true;
}
function restoreLast(){
  if(!lastValid)return false;
  return assign(lastValid);
}
function repairCurrent(){
  const s=snapshot();
  if(valid(s)){remember(s);return {changed:false,migrated:false};}
  if(lastValid&&restoreLast())return {changed:true,migrated:false};
  if(!s)return {changed:false,migrated:false};
  const fixed=canonical(s);
  if(!assign(fixed))return {changed:false,migrated:false};
  remember(fixed);
  return {changed:true,migrated:true};
}
function refreshLater(){
  setTimeout(()=>{
    try{if(typeof updateSearchUI==='function')updateSearchUI();}catch(_){ }
    try{if(typeof updateCounts==='function')updateCounts();}catch(_){ }
  },0);
}
function notifyMigration(){
  if(repairNoticeShown)return;
  repairNoticeShown=true;
  setTimeout(()=>{try{if(typeof showToast==='function')showToast('Reisenden-Auswahl auf maximal 9 Personen angepasst.');}catch(_){ }},0);
}
function installPersistHook(){
  try{
    if(typeof persistState!=='function'||persistState.__noreyoV688)return false;
    const prior=persistState;
    const wrapped=function(){
      const repair=repairCurrent();
      const result=prior.apply(this,arguments);
      if(repair.changed)refreshLater();
      if(repair.migrated)notifyMigration();
      remember();
      return result;
    };
    wrapped.__noreyoV688=true;
    persistState=wrapped;
    return true;
  }catch(_){return false;}
}
function install(){
  const repair=repairCurrent();
  const hooked=installPersistHook();
  if(repair.changed){
    try{if(typeof persistState==='function')persistState();}catch(_){ }
    refreshLater();
    if(repair.migrated)notifyMigration();
  }
  return hooked||repair.changed;
}

install();
window.addEventListener('pageshow',install,{passive:true});
window.NOREYO_V688=Object.freeze({
  BUILD,snapshot,valid,canonical,assign,remember,restoreLast,repairCurrent,installPersistHook,install,
  get lastValid(){return lastValid?{adults:lastValid.adults,childAges:lastValid.childAges.slice()}:null;}
});
})();