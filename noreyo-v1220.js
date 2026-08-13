/* NOREYO V12.20 — sanitize public authError at the source.
   V11.66 renders auth().authError() directly in the profile. Earlier layers can
   retain raw Supabase error_description text, so mapping only in V12.16 is too late.
   Wrap the currently consumption-aware authError boundary with safe generic copy.
   V12.18 still fingerprints/consumes the underlying raw value through its captured
   priorAuthError, so one-shot retirement remains intact. */
(function(){
'use strict';
const BUILD='12.20';
let patched=false,priorAuthError=null;
function safe(value){
  const s=String(value||'').trim();
  if(!s)return'';
  const lower=s.toLowerCase();
  if(/expired|otp|token|anmeldelink|link/.test(lower))return'Der Anmeldelink ist abgelaufen oder nicht mehr gültig. Bitte fordere einen neuen Link an.';
  return'Die Anmeldung konnte mit diesem Link nicht abgeschlossen werden. Bitte fordere einen neuen Anmeldelink an.';
}
function patch(){
  const a=window.NOREYO_V1158;
  if(!a||a.__noreyoV1220)return false;
  priorAuthError=a.authError;
  if(typeof priorAuthError!=='function')return false;
  const authError=function(){
    let value='';try{value=priorAuthError();}catch(_){}
    return safe(value);
  };
  window.NOREYO_V1158=Object.freeze({...a,__noreyoV1220:true,authError});
  patched=true;return true;
}
function install(){return patch();}
install();window.addEventListener('pageshow',install,{passive:true});
window.NOREYO_V1220=Object.freeze({BUILD,safe,patch,install,get patched(){return patched;}});
})();