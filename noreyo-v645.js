/* NOREYO V6.45 — async-safe hotel-detail audit.
   Re-runs factual meal verification only after renderDetail has actually
   completed, while preserving the original Promise/value/rejection semantics. */
(function(){
'use strict';
const BUILD='6.45';
function audit(o){
  try{return !!window.NOREYO_V624?.auditDetailMeal?.(o);}catch(_){return false;}
}
function afterResult(result,after){
  if(result&&typeof result.then==='function')return result.then(value=>{after();return value;});
  after();return result;
}
function install(){
  try{
    if(typeof renderDetail!=='function'||renderDetail.__noreyoV645)return false;
    const prior=renderDetail;
    const wrapped=function(o){
      const result=prior.apply(this,arguments);
      return afterResult(result,()=>audit(o));
    };
    wrapped.__noreyoV645=true;
    renderDetail=wrapped;
    return true;
  }catch(_){return false;}
}
install();
window.addEventListener('pageshow',install,{passive:true});
window.NOREYO_V645=Object.freeze({BUILD,audit,afterResult,install});
})();