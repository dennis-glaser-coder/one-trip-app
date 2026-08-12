/* NOREYO V9.62 — transactional hotel-detail edits.
   Opening a detail planner must not permanently overwrite the global search when
   the user cancels. Snapshot global search state before detail editing, restore
   it on close, and commit only when applyDetailEdit is actually executed. */
(function(){
'use strict';
const BUILD='9.62';
let tx=null, committing=false;

function getSearchState(){
  try{return typeof searchState!=='undefined'&&searchState?searchState:null;}catch(_){return null;}
}
function snapshot(){
  const s=getSearchState();
  if(!s)return null;
  let meal='ANY';
  try{meal=typeof mealPlanFilter!=='undefined'?mealPlanFilter:'ANY';}catch(_){}
  return{
    checkin:String(s.checkin||''),
    checkout:String(s.checkout||''),
    adults:Number(s.adults)||1,
    childAges:Array.isArray(s.childAges)?s.childAges.map(Number):[],
    mealPlanFilter:String(meal||'ANY')
  };
}
function restore(state){
  const s=getSearchState();
  if(!s||!state)return false;
  s.checkin=state.checkin;
  s.checkout=state.checkout;
  s.adults=state.adults;
  s.childAges=[...state.childAges];
  try{if(typeof mealPlanFilter!=='undefined')mealPlanFilter=state.mealPlanFilter;}catch(_){}
  try{updateSearchUI?.();}catch(_){}
  try{persistState?.();}catch(_){}
  return true;
}
function begin(){
  if(tx)return false;
  const state=snapshot();
  if(!state)return false;
  tx={state};
  return true;
}
function cancel(){
  if(!tx)return false;
  const state=tx.state;
  tx=null;
  return restore(state);
}
function commit(){
  if(!tx)return false;
  tx=null;
  return true;
}
function active(){return !!tx;}

const priorOpen=window.openDetailPlanner;
const priorClose=window.closePlanner;
const priorApply=window.applyDetailEdit;

if(typeof priorOpen==='function'){
  window.openDetailPlanner=function(...args){
    begin();
    try{return priorOpen.apply(this,args);}
    catch(error){cancel();throw error;}
  };
}
if(typeof priorClose==='function'){
  window.closePlanner=function(...args){
    if(tx&&!committing)cancel();
    return priorClose.apply(this,args);
  };
}
if(typeof priorApply==='function'){
  window.applyDetailEdit=async function(...args){
    committing=true;
    try{
      const result=await priorApply.apply(this,args);
      commit();
      return result;
    }catch(error){
      cancel();
      throw error;
    }finally{
      committing=false;
    }
  };
}

window.NOREYO_V962=Object.freeze({BUILD,snapshot,restore,begin,cancel,commit,active});
})();