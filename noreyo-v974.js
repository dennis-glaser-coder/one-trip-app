/* NOREYO V9.74 — transactional main traveller/airport planners.
   Packed core persists traveller and airport changes on every tap. If the user
   closes with X/backdrop instead of “Übernehmen”, those intermediate changes still
   leak into the global search. Snapshot only these two planners and restore on cancel. */
(function(){
'use strict';
const BUILD='9.74';
let tx=null;
function state(){try{return typeof searchState!=='undefined'&&searchState?searchState:null;}catch(_){return null;}}
function snapshot(mode){const s=state();if(!s)return null;if(mode==='travellers')return{mode,adults:Number(s.adults)||1,childAges:Array.isArray(s.childAges)?s.childAges.map(Number):[]};if(mode==='airports')return{mode,airports:Array.isArray(s.airports)?s.airports.map(String):[]};return null;}
function restore(snap){const s=state();if(!s||!snap)return false;if(snap.mode==='travellers'){s.adults=snap.adults;s.childAges=[...snap.childAges];}else if(snap.mode==='airports'){s.airports=[...snap.airports];}else return false;try{updateSearchUI?.();}catch(_){}try{persistState?.();}catch(_){}return true;}
function begin(mode){if(tx||window.NOREYO_V962?.active?.())return false;const snap=snapshot(mode);if(!snap)return false;tx=snap;return true;}
function commit(mode){if(!tx||tx.mode!==mode)return false;tx=null;return true;}
function cancel(){if(!tx)return false;const snap=tx;tx=null;return restore(snap);}
function active(){return tx?.mode||null;}
const priorOpen=window.openPlanner;const priorClose=window.closePlanner;const priorApplyTravellers=window.applyTravellers;
if(typeof priorOpen==='function'){window.openPlanner=function(mode,...args){begin(mode);try{return priorOpen.call(this,mode,...args);}catch(e){cancel();throw e;}};}
if(typeof priorClose==='function'){window.closePlanner=function(...args){if(tx)cancel();return priorClose.apply(this,args);};}
if(typeof priorApplyTravellers==='function'){window.applyTravellers=function(...args){commit('travellers');return priorApplyTravellers.apply(this,args);};}
function bindAirportSave(root=document.getElementById('plannerBody')){if(!root||active()!=='airports')return false;const save=root.querySelector('.planner-save');if(!save||save.dataset.noreyoV974==='1')return false;save.dataset.noreyoV974='1';save.addEventListener('click',()=>commit('airports'),true);return true;}
let observer=null,raf=0;function run(){raf=0;bindAirportSave();}function schedule(){if(!raf)raf=requestAnimationFrame(run);}function observe(){if(observer){observer.disconnect();observer=null;}const root=document.getElementById('plannerBody');if(typeof MutationObserver==='undefined'||!root)return false;observer=new MutationObserver(schedule);observer.observe(root,{childList:true,subtree:true});schedule();return true;}function cleanup(){if(observer){observer.disconnect();observer=null;}if(raf){cancelAnimationFrame(raf);raf=0;}}
observe();window.addEventListener('pagehide',cleanup,{passive:true});window.addEventListener('pageshow',observe,{passive:true});window.NOREYO_V974=Object.freeze({BUILD,snapshot,restore,begin,commit,cancel,active,bindAirportSave,observe,cleanup});
})();