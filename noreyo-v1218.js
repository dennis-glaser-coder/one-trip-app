/* NOREYO V12.18 — consume scrubbed legacy auth errors exactly once.
   V11.64 keeps its last authError string for the page lifetime. V12.16 can therefore
   re-read the same retired error after retry/success. Wrap authError with a per-page
   consumed fingerprint and mark it consumed whenever the current V12.10 clear
   boundary runs. A new redirect reload creates a fresh page/fingerprint. */
(function(){
'use strict';
const BUILD='12.18';
let patchedAuth=false,patchedClear=false,priorAuthError=null,priorClear=null,consumed='';

function auth(){return window.NOREYO_V1158||null;}
function raw(){
  try{return String(typeof priorAuthError==='function'?priorAuthError():'').trim();}catch(_){return'';}
}
function visibleRaw(){
  const r=raw();
  return r&&r!==consumed?r:'';
}
function patchAuth(){
  const a=auth();
  if(!a||a.__noreyoV1218)return false;
  priorAuthError=a.authError;
  if(typeof priorAuthError!=='function')return false;
  const authError=function(){return visibleRaw();};
  window.NOREYO_V1158=Object.freeze({...a,__noreyoV1218:true,authError});
  patchedAuth=true;return true;
}
function patchClear(){
  const api=window.NOREYO_V1210;
  if(!api||api.__noreyoV1218)return false;
  priorClear=api.clear;
  const clear=function(...args){
    const r=raw();
    let result=false;
    try{result=typeof priorClear==='function'?!!priorClear.apply(this,args):false;}
    finally{if(r)consumed=r;}
    return result;
  };
  window.NOREYO_V1210=Object.freeze({...api,__noreyoV1218:true,clear});
  patchedClear=true;return true;
}
function install(){patchAuth();patchClear();return patchedAuth||patchedClear;}
install();
window.addEventListener('pageshow',install,{passive:true});
window.NOREYO_V1218=Object.freeze({BUILD,auth,raw,visibleRaw,patchAuth,patchClear,install,get consumed(){return consumed;},get patchedAuth(){return patchedAuth;},get patchedClear(){return patchedClear;}});
})();