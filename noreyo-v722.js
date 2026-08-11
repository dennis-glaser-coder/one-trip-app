/* NOREYO V7.22 — BFCache fetch-stack stabilizer.
   All active search fetch layers reinstall on pageshow but historically only
   recognized their own outer marker. This final pass-through advertises every
   active layer marker so Safari BFCache navigation cannot stack duplicate
   validators/trackers/retries on top of each other. */
(function(){
'use strict';
const BUILD='7.22';
const MARKERS=['__noreyoV656','__noreyoV690','__noreyoV692','__noreyoV698','__noreyoV719','__noreyoV717','__noreyoV721','__noreyoV716'];
function mark(fn){if(typeof fn!=='function')return fn;for(const key of MARKERS){try{fn[key]=true;}catch(_){}}try{fn.__noreyoV722=true;}catch(_){}return fn;}
function install(){try{if(typeof window.fetch!=='function')return false;if(window.fetch.__noreyoV722){mark(window.fetch);return false;}const prior=window.fetch.bind(window);const wrapped=function(){return prior(...arguments);};mark(wrapped);window.fetch=wrapped;return true;}catch(_){return false;}}
install();window.addEventListener('pageshow',install,{passive:true});
window.NOREYO_V722=Object.freeze({BUILD,MARKERS:MARKERS.slice(),mark,install});
})();