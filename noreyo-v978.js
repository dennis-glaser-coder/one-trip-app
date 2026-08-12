/* NOREYO V9.78 — race-free airport planner commit.
   V9.74 bound the airport Save button after planner mutations. A very fast tap
   could theoretically reach inline closePlanner() before that listener existed,
   causing the transactional snapshot to roll back. Commit synchronously in the
   document capture phase for every airport planner Save activation. */
(function(){
'use strict';
const BUILD='9.78';
let bound=false;

function isAirportSave(target){
  try{
    const save=target?.closest?.('#plannerBody .planner-save');
    return !!save && window.NOREYO_V974?.active?.()==='airports';
  }catch(_){return false;}
}
function commitFromEvent(e){
  if(!isAirportSave(e.target))return false;
  try{return !!window.NOREYO_V974?.commit?.('airports');}catch(_){return false;}
}
function bind(){
  if(bound)return false;
  document.addEventListener('click',commitFromEvent,true);
  bound=true;
  return true;
}
function cleanup(){
  if(!bound)return false;
  document.removeEventListener('click',commitFromEvent,true);
  bound=false;
  return true;
}
bind();
window.addEventListener('pagehide',cleanup,{passive:true});
window.addEventListener('pageshow',bind,{passive:true});
window.NOREYO_V978=Object.freeze({BUILD,isAirportSave,commitFromEvent,bind,cleanup});
})();