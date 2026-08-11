/* NOREYO V7.61 — BFCache hot-function stack stabilizer.
   Prevents alternating pageshow installers from repeatedly wrapping ranking,
   persistence and favorite toggle functions on Safari BFCache restores. */
(function(){
'use strict';
const BUILD='7.61';
const SPECS=[{name:'filterAndRankOffers',markers:['__noreyoV677','__noreyoV706']},{name:'persistState',markers:['__noreyoV687','__noreyoV751']},{name:'toggleFav',markers:['__noreyoV606','__noreyoV703Id']},{name:'toggleSnapshotFavorite',markers:['__noreyoV606','__noreyoV703Snapshot']}];
function getFn(name){try{return eval(name);}catch(_){return null;}}
function setFn(name,fn){try{eval(name+'=fn');return true;}catch(_){return false;}}
function mark(fn,markers,finalMarker){if(typeof fn!=='function')return fn;for(const key of markers){try{fn[key]=true;}catch(_){}}try{fn[finalMarker]=true;}catch(_){}return fn;}
function installOne(spec){const current=getFn(spec.name),finalMarker='__noreyoV761_'+spec.name;if(typeof current!=='function')return false;if(current[finalMarker]){mark(current,spec.markers,finalMarker);return false;}const wrapped=function(){return current.apply(this,arguments);};mark(wrapped,spec.markers,finalMarker);return setFn(spec.name,wrapped);}
function install(){let changed=false;for(const spec of SPECS)changed=installOne(spec)||changed;return changed;}
function markers(name){const spec=SPECS.find(x=>x.name===name);return spec?spec.markers.slice():[];}
install();window.addEventListener('pageshow',install,{passive:true});
window.NOREYO_V761=Object.freeze({BUILD,SPECS:SPECS.map(x=>({name:x.name,markers:x.markers.slice()})),getFn,installOne,install,markers});
})();