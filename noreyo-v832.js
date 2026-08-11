/* NOREYO V8.32 — final BFCache fetch-stack stabilizer.
   Advertises every active fetch-wrapper marker on one final pass-through so
   Safari pageshow cannot rebuild V7.x plus V8.26/V8.28/V8.30 chains repeatedly. */
(function(){
'use strict';
const BUILD='8.32';
const MARKERS=[
  '__noreyoV656','__noreyoV690','__noreyoV692','__noreyoV698',
  '__noreyoV719','__noreyoV717','__noreyoV736','__noreyoV716','__noreyoV743',
  '__noreyoV744','__noreyoV826','__noreyoV828','__noreyoV830'
];
function mark(fn){
  if(typeof fn!=='function')return fn;
  for(const key of MARKERS){try{fn[key]=true;}catch(_){} }
  try{fn.__noreyoV832=true;}catch(_){}
  return fn;
}
function install(){
  try{
    if(typeof window.fetch!=='function')return false;
    if(window.fetch.__noreyoV832){mark(window.fetch);return false;}
    const prior=window.fetch.bind(window);
    const wrapped=function(){return prior(...arguments);};
    mark(wrapped);
    window.fetch=wrapped;
    return true;
  }catch(_){return false;}
}
install();
window.addEventListener('pageshow',install,{passive:true});
window.NOREYO_V832=Object.freeze({BUILD,MARKERS:MARKERS.slice(),mark,install});
})();