/* NOREYO V12.08 — bounded Supabase Auth network calls.
   The packed magic-link and identity calls use fetch without a client timeout.
   Bound only /auth/v1/otp and /auth/v1/user, preserve caller aborts, and keep the
   global fetch wrapper persistent across Safari BFCache so inner chains are not torn down. */
(function(){
'use strict';
const BUILD='12.08',AUTH_TIMEOUT_MS=12000;
let installed=false,priorFetch=null;

function urlOf(input){
  if(typeof input==='string')return input;
  try{if(typeof Request!=='undefined'&&input instanceof Request)return input.url||'';}catch(_){}
  return String(input?.url||'');
}
function authKind(input){
  const u=urlOf(input);
  if(!u.includes('/auth/v1/'))return'';
  if(u.includes('/auth/v1/otp'))return'otp';
  if(u.includes('/auth/v1/user'))return'user';
  return'';
}
function existingSignal(input,init){
  if(init?.signal)return init.signal;
  try{if(typeof Request!=='undefined'&&input instanceof Request)return input.signal||null;}catch(_){}
  return null;
}
function combinedSignal(parent,controller){
  if(!parent)return{signal:controller.signal,cleanup(){}};
  if(parent.aborted){controller.abort(parent.reason);return{signal:controller.signal,cleanup(){}};}
  const forward=()=>controller.abort(parent.reason);
  parent.addEventListener?.('abort',forward,{once:true});
  return{signal:controller.signal,cleanup(){try{parent.removeEventListener?.('abort',forward);}catch(_){}}};
}
async function boundedFetch(input,init){
  const kind=authKind(input);
  if(!kind)return priorFetch(input,init);
  const controller=new AbortController(),parent=existingSignal(input,init);
  const combo=combinedSignal(parent,controller);
  let timedOut=false;
  const timer=setTimeout(()=>{timedOut=true;controller.abort(new DOMException('Timeout','AbortError'));},AUTH_TIMEOUT_MS);
  try{
    return await priorFetch(input,{...(init||{}),signal:combo.signal});
  }catch(error){
    if(timedOut)throw new Error(kind==='otp'
      ?'Die Anmeldung dauert gerade zu lange. Bitte versuche es erneut.'
      :'Die Anmeldung konnte gerade nicht bestätigt werden. Bitte prüfe die Verbindung und versuche es erneut.');
    throw error;
  }finally{
    clearTimeout(timer);combo.cleanup();
  }
}
function install(){
  if(installed||typeof window.fetch!=='function'||window.fetch.__noreyoV1208)return false;
  priorFetch=window.fetch.bind(window);
  const f=function(input,init){return boundedFetch(input,init);};
  f.__noreyoV1208=true;f.__noreyoV1208Prior=priorFetch;
  window.fetch=f;installed=true;return true;
}
install();
window.addEventListener('pageshow',install,{passive:true});
window.NOREYO_V1208=Object.freeze({BUILD,AUTH_TIMEOUT_MS,urlOf,authKind,existingSignal,combinedSignal,boundedFetch,install,get installed(){return installed;}});
})();