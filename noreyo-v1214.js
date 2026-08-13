/* NOREYO V12.14 — clear stale Magic-Link callback copy on recovery.
   V12.10 clear() restores status semantics but intentionally leaves textContent.
   After a retry/success that can leave "link expired" visible in the profile.
   Wrap only the public clear boundary and erase text iff it still equals the exact
   callback message being retired; unrelated status messages are preserved. */
(function(){
'use strict';
const BUILD='12.14';
let patched=false,priorClear=null;
function targets(){return[document.querySelector('.noreyo-v1162-status'),document.querySelector('.noreyo-v1158-status')].filter(Boolean);}
function patch(){const api=window.NOREYO_V1210;if(!api||api.__noreyoV1214)return false;priorClear=api.clear;const clear=function(...args){const stale=String(api.message||'');let result=false;try{result=typeof priorClear==='function'?!!priorClear.apply(this,args):false;}finally{if(stale){for(const el of targets()){if(el.textContent===stale)el.textContent='';}}}return result;};window.NOREYO_V1210=Object.freeze({...api,__noreyoV1214:true,clear});patched=true;return true;}
function install(){return patch();}
install();window.addEventListener('pageshow',install,{passive:true});
window.NOREYO_V1214=Object.freeze({BUILD,targets,patch,install,get patched(){return patched;}});
})();