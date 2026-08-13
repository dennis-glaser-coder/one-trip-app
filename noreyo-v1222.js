/* NOREYO V12.22 — safe Magic-Link request errors.
   V11.58 throws Supabase /auth/v1/otp error text directly and V11.62 renders the
   thrown message in the profile. Wrap the public sendMagicLink boundary so rate
   limits, provider rejections and network failures become stable German guidance
   without exposing raw Supabase/provider detail. */
(function(){
'use strict';
const BUILD='12.22';
let patched=false,priorSend=null;
function message(error){
  const raw=String(error?.message||error||'').trim();
  if(!raw)return'Der Anmeldelink konnte gerade nicht gesendet werden. Bitte versuche es erneut.';
  if(/^Bitte gib eine gültige E-Mail-Adresse ein\.$/.test(raw))return raw;
  if(/dauert gerade zu lange|nicht bestätigt/.test(raw))return raw;
  const s=raw.toLowerCase();
  if(/rate.?limit|security purposes|too many|over_email_send_rate_limit|after \d+ second/.test(s))
    return'Du hast gerade bereits einen Anmeldelink angefordert. Bitte warte kurz und versuche es dann erneut.';
  if(/network|fetch|connection|unavailable|timeout|timed out/.test(s))
    return'Der Anmeldedienst ist gerade nicht erreichbar. Bitte prüfe deine Verbindung und versuche es erneut.';
  return'Der Anmeldelink konnte gerade nicht gesendet werden. Bitte versuche es erneut.';
}
function patch(){
  const a=window.NOREYO_V1158;
  if(!a||a.__noreyoV1222)return false;
  priorSend=a.sendMagicLink;
  if(typeof priorSend!=='function')return false;
  const sendMagicLink=async function(...args){
    try{return await priorSend.apply(this,args);}
    catch(error){throw new Error(message(error));}
  };
  window.NOREYO_V1158=Object.freeze({...a,__noreyoV1222:true,sendMagicLink});
  patched=true;return true;
}
function install(){return patch();}
install();window.addEventListener('pageshow',install,{passive:true});
window.NOREYO_V1222=Object.freeze({BUILD,message,patch,install,get patched(){return patched;}});
})();