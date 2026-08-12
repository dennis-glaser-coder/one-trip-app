/* NOREYO V11.86 — refreshed-auth preflight for sensitive checkout calls.
   V11.84 captures/rotates the implicit-flow refresh token. Run that refresh before
   PREBOOK/status calls reach V11.78's identity gate, and clear refresh credentials
   on logout. This keeps long checkout sessions usable without weakening auth. */
(function(){
'use strict';
const BUILD='11.86';
const PATHS=Object.freeze([
  '/functions/v1/hotel-prebook',
  '/functions/v1/hotel-prebook-status',
  '/functions/v1/hotel-checkout-status'
]);
let installed=false,priorFetch=null,priorSignOut=null,signOutPatched=false;
function inputUrl(input){if(typeof input==='string')return input;try{if(typeof Request!=='undefined'&&input instanceof Request)return input.url||'';}catch(_){}return String(input?.url||'');}
function sensitive(input){const url=inputUrl(input);return PATHS.some(path=>url.includes(path));}
function refreshApi(){return window.NOREYO_V1184||null;}
async function preflight(){const r=refreshApi();if(!r)return null;try{return await r.refresh?.();}catch(_){return null;}}
async function wrappedFetch(input,init){if(!sensitive(input))return priorFetch(input,init);await preflight();return priorFetch(input,init);}
function patchSignOut(){const a=window.NOREYO_V1158;if(!a||a.__noreyoV1186)return false;priorSignOut=a.signOut;const signOut=async function(...args){try{return typeof priorSignOut==='function'?await priorSignOut.apply(this,args):a.clear?.();}finally{try{refreshApi()?.clear?.();}catch(_){}}};window.NOREYO_V1158=Object.freeze({...a,__noreyoV1186:true,signOut});signOutPatched=true;return true;}
function install(){patchSignOut();if(installed||typeof window.fetch!=='function'||window.fetch.__noreyoV1186)return false;priorFetch=window.fetch.bind(window);const f=function(input,init){return wrappedFetch(input,init);};f.__noreyoV1186=true;f.__noreyoV1186Prior=priorFetch;window.fetch=f;installed=true;return true;}
function cleanup(){if(installed&&window.fetch?.__noreyoV1186&&priorFetch)window.fetch=priorFetch;installed=false;priorFetch=null;}
install();window.addEventListener('pageshow',install,{passive:true});window.addEventListener('pagehide',cleanup,{passive:true});
window.NOREYO_V1186=Object.freeze({BUILD,PATHS,inputUrl,sensitive,refreshApi,preflight,wrappedFetch,patchSignOut,install,cleanup,get signOutPatched(){return signOutPatched;}});
})();