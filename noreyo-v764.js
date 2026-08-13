/* NOREYO V7.64 — corrected BFCache hot-function stack stabilizer.
   Advertises the actual markers of the active ranking and traveller-state
   wrappers so Safari pageshow does not rebuild those chains repeatedly. */
(function(){
'use strict';
const BUILD='7.64';
const SPECS=[
  {name:'filterAndRankOffers',markers:['__noreyoV677','__noreyoV707']},
  {name:'persistState',markers:['__noreyoV688','__noreyoV751']},
  {name:'toggleFav',markers:['__noreyoV606','__noreyoV703Id']},
  {name:'toggleSnapshotFavorite',markers:['__noreyoV606','__noreyoV703Snapshot']}
];
function getFn(name){try{return eval(name);}catch(_){return null;}}
function setFn(name,fn){try{eval(name+'=fn');return true;}catch(_){return false;}}
function mark(fn,markers,finalMarker){
  if(typeof fn!=='function')return fn;
  for(const key of markers){try{fn[key]=true;}catch(_){}}
  try{fn[finalMarker]=true;}catch(_){}
  return fn;
}
function installOne(spec){
  const current=getFn(spec.name),finalMarker='__noreyoV764_'+spec.name;
  if(typeof current!=='function')return false;
  if(current[finalMarker]){mark(current,spec.markers,finalMarker);return false;}
  const wrapped=function(){return current.apply(this,arguments);};
  mark(wrapped,spec.markers,finalMarker);
  return setFn(spec.name,wrapped);
}
function install(){
  let changed=false;
  for(const spec of SPECS)changed=installOne(spec)||changed;
  return changed;
}
function markers(name){
  const spec=SPECS.find(x=>x.name===name);
  return spec?spec.markers.slice():[];
}
install();
window.addEventListener('pageshow',install,{passive:true});
window.NOREYO_V764=Object.freeze({
  BUILD,
  SPECS:SPECS.map(x=>({name:x.name,markers:x.markers.slice()})),
  getFn,installOne,install,markers
});
})();