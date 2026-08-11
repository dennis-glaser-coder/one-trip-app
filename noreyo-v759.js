/* NOREYO V7.59 — BFCache navigation-stack stabilizer.
   Advertises all active go() wrapper markers on one final pass-through so Safari
   pageshow cannot multiply navigation hooks for Discover/search/favorites/trips/profile. */
(function(){
'use strict';
const BUILD='7.59';
const MARKERS=['__noreyoV584','__noreyoV663','__noreyoV656','__noreyoV690','__noreyoV723'];
function mark(fn){if(typeof fn!=='function')return fn;for(const key of MARKERS){try{fn[key]=true;}catch(_){}}try{fn.__noreyoV759=true;}catch(_){}return fn;}
function install(){try{if(typeof go!=='function')return false;if(go.__noreyoV759){mark(go);return false;}const prior=go;const wrapped=function(){return prior.apply(this,arguments);};mark(wrapped);go=wrapped;return true;}catch(_){return false;}}
install();window.addEventListener('pageshow',install,{passive:true});
window.NOREYO_V759=Object.freeze({BUILD,MARKERS:MARKERS.slice(),mark,install});
})();