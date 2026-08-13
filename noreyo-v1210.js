/* NOREYO V12.10 — safe Magic-Link callback error handling.
   Supabase can redirect with #error / #error_description and no access_token.
   V11.58 only strips the hash on successful token ingestion. Consume failed auth
   callbacks, never echo raw provider text, clear the URL, and surface safe guidance. */
(function(){
'use strict';
const BUILD='12.10';
let message='',observer=null,raf=0;

function hashParams(){
  try{
    const h=String(location.hash||'');
    if(!h.startsWith('#'))return null;
    return new URLSearchParams(h.slice(1));
  }catch(_){return null;}
}
function safeMessage(code){
  const c=String(code||'').trim().toLowerCase();
  if(c==='access_denied'||c==='otp_expired'||c==='expired_token')return'Der Anmeldelink ist abgelaufen oder wurde bereits verwendet. Bitte fordere einen neuen Link an.';
  return'Die Anmeldung konnte mit diesem Link nicht abgeschlossen werden. Bitte fordere einen neuen Anmeldelink an.';
}
function strip(){
  try{
    if(window.NOREYO_V1158?.stripAuthHash?.())return true;
    if(!location.hash)return false;
    history.replaceState(null,'',`${location.pathname}${location.search||''}`);
    return true;
  }catch(_){return false;}
}
function consume(){
  const p=hashParams();
  if(!p||p.has('access_token')||(!p.has('error')&&!p.has('error_description')))return false;
  message=safeMessage(p.get('error'));
  strip();
  schedule();
  return true;
}
function targets(){
  return[
    document.querySelector('.noreyo-v1162-status'),
    document.querySelector('.noreyo-v1158-status')
  ].filter(Boolean);
}
function render(){
  raf=0;
  if(!message)return false;
  let changed=false;
  for(const el of targets()){
    if(el.textContent!==message){el.textContent=message;changed=true;}
    if(el.getAttribute('role')!=='alert'){el.setAttribute('role','alert');changed=true;}
    if(el.getAttribute('aria-live')!=='assertive'){el.setAttribute('aria-live','assertive');changed=true;}
    if(el.getAttribute('aria-atomic')!=='true'){el.setAttribute('aria-atomic','true');changed=true;}
  }
  return changed;
}
function clear(){
  if(!message)return false;
  message='';
  for(const el of targets()){
    if(el.getAttribute('role')==='alert')el.setAttribute('role','status');
    if(el.getAttribute('aria-live')==='assertive')el.setAttribute('aria-live','polite');
  }
  return true;
}
function schedule(){if(!raf)raf=requestAnimationFrame(render);}
function install(){
  consume();
  if(observer||typeof MutationObserver==='undefined'||!document.body)return false;
  observer=new MutationObserver(schedule);
  observer.observe(document.body,{subtree:true,childList:true});
  schedule();return true;
}
function cleanup(){if(observer){observer.disconnect();observer=null;}if(raf){cancelAnimationFrame(raf);raf=0;}}
install();
window.addEventListener('pageshow',install,{passive:true});
window.NOREYO_V1210=Object.freeze({BUILD,hashParams,safeMessage,strip,consume,targets,render,clear,schedule,install,cleanup,get message(){return message;}});
})();