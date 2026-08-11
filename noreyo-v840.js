/* NOREYO V8.40 — BFCache fetch-stack stabilizer with strict occupancy marker.
   Extends V8.32 so Safari pageshow also recognizes the V8.39 occupancy wrapper
   and cannot rebuild that layer repeatedly. */
(function(){
'use strict';
const BUILD='8.40';
const MARKERS=['__noreyoV656','__noreyoV690','__noreyoV692','__noreyoV698','__noreyoV719','__noreyoV717','__noreyoV736','__noreyoV716','__noreyoV743','__noreyoV744','__noreyoV826','__noreyoV828','__noreyoV830','__noreyoV839'];
function mark(fn){if(typeof fn!=='function')return fn;for(const key of MARKERS){try{fn[key]=true;}catch(_){} }try{fn.__noreyoV840=true;}catch(_){}return fn;}
function install(){try{if(typeof window.fetch!=='function')return false;if(window.fetch.__noreyoV840){mark(window.fetch);return false;}const prior=window.fetch.bind(window);const wrapped=function(){return prior(...arguments);};mark(wrapped);window.fetch=wrapped;return true;}catch(_){return false;}}
install();window.addEventListener('pageshow',install,{passive:true});window.NOREYO_V840=Object.freeze({BUILD,MARKERS:MARKERS.slice(),mark,install});
})();