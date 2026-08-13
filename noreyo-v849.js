/* NOREYO V8.49 — BFCache fetch stabilizer for type-safe occupancy.
   Advertises V8.48 together with all earlier active fetch-wrapper markers so
   Safari pageshow cannot rebuild the stricter occupancy wrapper. */
(function(){
'use strict';
const BUILD='8.49';
const MARKERS=['__noreyoV656','__noreyoV690','__noreyoV692','__noreyoV698','__noreyoV719','__noreyoV717','__noreyoV736','__noreyoV716','__noreyoV743','__noreyoV744','__noreyoV826','__noreyoV828','__noreyoV830','__noreyoV839','__noreyoV848'];
function mark(fn){if(typeof fn!=='function')return fn;for(const key of MARKERS){try{fn[key]=true;}catch(_){} }try{fn.__noreyoV849=true;}catch(_){}return fn;}
function install(){try{if(typeof window.fetch!=='function')return false;if(window.fetch.__noreyoV849){mark(window.fetch);return false;}const prior=window.fetch.bind(window);const wrapped=function(){return prior(...arguments);};mark(wrapped);window.fetch=wrapped;return true;}catch(_){return false;}}
install();window.addEventListener('pageshow',install,{passive:true});window.NOREYO_V849=Object.freeze({BUILD,MARKERS:MARKERS.slice(),mark,install});
})();