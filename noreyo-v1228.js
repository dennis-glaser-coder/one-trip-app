/* NOREYO V12.28 — synchronous checkout blocker click guard.
   V12.26 reconciles the shared PREBOOK button after older layers mutate disabled.
   Close the remaining transient window by blocking PREBOOK action clicks in capture
   phase whenever an auth/MUST ownership marker is still present. */
(function(){
'use strict';
const BUILD='12.28';
let bound=false;
function actionFrom(target){return target?.closest?.('.noreyo-v1106-prebook .noreyo-v1106-action')||null;}
function blockers(btn){if(!btn)return{must:false,auth:false,any:false};const must=btn.dataset?.noreyoV1200Must==='1';const auth=btn.dataset?.noreyoV1202Auth==='1';return{must,auth,any:must||auth};}
function message(b){if(b.must)return'Checkout bleibt gesperrt, bis alle Pflichtkriterien verifiziert sind.';if(b.auth)return'Bitte melde dich zuerst für den sicheren Checkout an.';return'';}
function announce(btn,text){const root=btn?.closest?.('.noreyo-v1106-prebook');if(!root||!text)return false;let note=root.querySelector('.noreyo-v1228-block-status');if(!note){note=document.createElement('div');note.className='noreyo-v1228-block-status';note.setAttribute('role','status');note.setAttribute('aria-live','polite');note.setAttribute('aria-atomic','true');note.hidden=true;root.appendChild(note);}note.textContent=text;return true;}
function onClick(e){const btn=actionFrom(e.target);if(!btn)return;const b=blockers(btn);if(!b.any)return;e.preventDefault();e.stopPropagation();e.stopImmediatePropagation?.();btn.disabled=true;btn.setAttribute('aria-disabled','true');announce(btn,message(b));}
function install(){if(bound)return false;bound=true;document.addEventListener('click',onClick,true);return true;}
function cleanup(){if(!bound)return false;document.removeEventListener('click',onClick,true);bound=false;return true;}
install();window.addEventListener('pagehide',cleanup,{passive:true});window.addEventListener('pageshow',install,{passive:true});
window.NOREYO_V1228=Object.freeze({BUILD,actionFrom,blockers,message,announce,onClick,install,cleanup});
})();