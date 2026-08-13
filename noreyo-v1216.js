/* NOREYO V12.16 — bridge legacy scrubbed auth callback errors into safe UI.
   V11.64 scrubs Supabase auth error hashes before V12.10 runs and retains only a
   captured authError() string. Consume that older state without echoing raw provider
   text, surface a safe message, and extend the current V12.10 clear boundary so
   retries/success retire both sources together. */
(function(){
'use strict';
const BUILD='12.16';
let message='',patched=false,priorClear=null,observer=null,raf=0;
function raw(){try{return String(window.NOREYO_V1158?.authError?.()||'').trim();}catch(_){return'';}}
function safe(rawText){const s=String(rawText||'').toLowerCase();if(/expired|otp|token|link/.test(s))return'Der Anmeldelink ist abgelaufen oder nicht mehr gültig. Bitte fordere einen neuen Link an.';return'Die Anmeldung konnte mit diesem Link nicht abgeschlossen werden. Bitte fordere einen neuen Anmeldelink an.';}
function targets(){return[document.querySelector('.noreyo-v1162-status'),document.querySelector('.noreyo-v1158-status')].filter(Boolean);}
function capture(){if(window.NOREYO_V1210?.message)return false;const r=raw();if(!r||message)return false;message=safe(r);schedule();return true;}
function render(){raf=0;if(!message)return false;let changed=false;for(const el of targets()){if(el.textContent!==message){el.textContent=message;changed=true;}if(el.getAttribute?.('role')!=='alert'){el.setAttribute?.('role','alert');changed=true;}if(el.getAttribute?.('aria-live')!=='assertive'){el.setAttribute?.('aria-live','assertive');changed=true;}if(el.getAttribute?.('aria-atomic')!=='true'){el.setAttribute?.('aria-atomic','true');changed=true;}}return changed;}
function clear(){const stale=message;message='';if(stale)for(const el of targets()){if(el.textContent===stale)el.textContent='';if(el.getAttribute?.('role')==='alert')el.setAttribute?.('role','status');if(el.getAttribute?.('aria-live')==='assertive')el.setAttribute?.('aria-live','polite');}return !!stale;}
function patch(){const api=window.NOREYO_V1210;if(!api||api.__noreyoV1216)return false;priorClear=api.clear;const wrapped=function(...args){let a=false,b=false;try{a=typeof priorClear==='function'?!!priorClear.apply(this,args):false;}finally{b=clear();}return a||b;};window.NOREYO_V1210=Object.freeze({...api,__noreyoV1216:true,clear:wrapped});patched=true;return true;}
function schedule(){if(!raf)raf=requestAnimationFrame(render);}
function install(){patch();capture();if(observer||typeof MutationObserver==='undefined'||!document.body)return false;observer=new MutationObserver(()=>{capture();schedule();});observer.observe(document.body,{subtree:true,childList:true});schedule();return true;}
function cleanup(){if(observer){observer.disconnect();observer=null;}if(raf){cancelAnimationFrame(raf);raf=0;}}
install();window.addEventListener('pageshow',install,{passive:true});
window.NOREYO_V1216=Object.freeze({BUILD,raw,safe,targets,capture,render,clear,patch,schedule,install,cleanup,get message(){return message;},get patched(){return patched;}});
})();