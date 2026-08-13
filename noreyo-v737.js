/* NOREYO V7.37 — BFCache fetch-stack stabilizer for parallel-safe transport. */
(function(){
'use strict';
const BUILD='7.37';
const MARKERS=[
  '__noreyoV656','__noreyoV690','__noreyoV692','__noreyoV698',
  '__noreyoV719','__noreyoV717','__noreyoV736','__noreyoV716'
];
function mark(fn){
  if(typeof fn!=='function')return fn;
  for(const key of MARKERS){try{fn[key]=true;}catch(_){}}
  try{fn.__noreyoV737=true;}catch(_){}
  return fn;
}
function install(){
  try{
    if(typeof window.fetch!=='function')return false;
    if(window.fetch.__noreyoV737){mark(window.fetch);return false;}
    const prior=window.fetch.bind(window);
    const wrapped=function(){return prior(...arguments);};
    mark(wrapped);
    window.fetch=wrapped;
    return true;
  }catch(_){return false;}
}
install();
window.addEventListener('pageshow',install,{passive:true});
window.NOREYO_V737=Object.freeze({BUILD,MARKERS:MARKERS.slice(),mark,install});
})();