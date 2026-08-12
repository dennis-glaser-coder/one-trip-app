/* NOREYO V9.76 — transactional filter edits.
   Packed filters persist on every tap although the sheet exposes an explicit
   “Filter übernehmen” action. Closing with X/backdrop must restore the opening
   snapshot; applyPrefs commits the staged filter state. */
(function(){
'use strict';
const BUILD='9.76';
let tx=null,committing=false;
function snapshot(){try{const st=typeof states!=='undefined'?states:null;const ex=typeof excluded!=='undefined'?excluded:null;const lim=typeof limits!=='undefined'?limits:null;if(!st||!ex||!lim)return null;return{states:{...st},excluded:[...ex],confirmedOnly:!!confirmedOnly,limits:{...lim}};}catch(_){return null;}}
function restore(snap){if(!snap)return false;try{Object.keys(states).forEach(k=>delete states[k]);Object.assign(states,snap.states);excluded.clear();snap.excluded.forEach(x=>excluded.add(x));confirmedOnly=snap.confirmedOnly;Object.keys(limits).forEach(k=>delete limits[k]);Object.assign(limits,snap.limits);try{updateCounts?.();}catch(_){}try{refreshQuickStates?.();}catch(_){}try{refreshPremiumFilterChips?.();}catch(_){}try{persistState?.();}catch(_){}return true;}catch(_){return false;}}
function begin(){if(tx)return false;const snap=snapshot();if(!snap)return false;tx=snap;return true;}
function cancel(){if(!tx)return false;const snap=tx;tx=null;return restore(snap);}
function commit(){if(!tx)return false;tx=null;return true;}
function active(){return !!tx;}
const priorOpen=window.openFilter;const priorClose=window.closeFilter;const priorApply=window.applyPrefs;
if(typeof priorOpen==='function'){window.openFilter=function(...args){begin();try{return priorOpen.apply(this,args);}catch(e){cancel();throw e;}};}
if(typeof priorClose==='function'){window.closeFilter=function(...args){if(tx&&!committing)cancel();return priorClose.apply(this,args);};}
if(typeof priorApply==='function'){window.applyPrefs=function(...args){committing=true;commit();try{return priorApply.apply(this,args);}finally{committing=false;}};}
window.NOREYO_V976=Object.freeze({BUILD,snapshot,restore,begin,cancel,commit,active});
})();