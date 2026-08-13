/* NOREYO V12.32 — accessible synchronous checkout blocker guard.
   V12.28 used hidden=true for its live status; hidden content is not a reliable
   VoiceOver announcement target. Retire V12.28's listener and own the capture guard
   with an off-screen status that remains in the accessibility tree. */
(function(){
'use strict';
const BUILD='12.32',STYLE_ID='noreyo-v1232-sr-status';
let bound=false;
function retirePrior(){try{return !!window.NOREYO_V1228?.cleanup?.();}catch(_){return false;}}
function installStyle(){if(document.getElementById(STYLE_ID))return false;const s=document.createElement('style');s.id=STYLE_ID;s.textContent='.noreyo-v1232-block-status{position:absolute!important;width:1px!important;height:1px!important;padding:0!important;margin:-1px!important;overflow:hidden!important;clip:rect(0,0,0,0)!important;white-space:nowrap!important;border:0!important}';document.head.appendChild(s);return true;}
function actionFrom(target){return target?.closest?.('.noreyo-v1106-prebook .noreyo-v1106-action')||null;}
function blockers(btn){if(!btn)return{must:false,auth:false,any:false};const must=btn.dataset?.noreyoV1200Must==='1';const auth=btn.dataset?.noreyoV1202Auth==='1';return{must,auth,any:must||auth};}
function message(b){if(b.must)return'Checkout bleibt gesperrt, bis alle Pflichtkriterien verifiziert sind.';if(b.auth)return'Bitte melde dich zuerst für den sicheren Checkout an.';return'';}
function status(root){if(!root)return null;let note=root.querySelector('.noreyo-v1232-block-status');if(note)return note;note=document.createElement('div');note.className='noreyo-v1232-block-status';note.setAttribute('role','status');note.setAttribute('aria-live','polite');note.setAttribute('aria-atomic','true');root.appendChild(note);return note;}
function announce(btn,text){const root=btn?.closest?.('.noreyo-v1106-prebook'),note=status(root);if(!note||!text)return false;note.textContent='';queueMicrotask(()=>{note.textContent=text;});return true;}
function onClick(e){const btn=actionFrom(e.target);if(!btn)return;const b=blockers(btn);if(!b.any)return;e.preventDefault();e.stopPropagation();e.stopImmediatePropagation?.();btn.disabled=true;btn.setAttribute('aria-disabled','true');announce(btn,message(b));}
function install(){retirePrior();installStyle();if(bound)return false;bound=true;document.addEventListener('click',onClick,true);return true;}
function cleanup(){if(!bound)return false;document.removeEventListener('click',onClick,true);bound=false;return true;}
install();window.addEventListener('pagehide',cleanup,{passive:true});window.addEventListener('pageshow',install,{passive:true});
window.NOREYO_V1232=Object.freeze({BUILD,STYLE_ID,retirePrior,installStyle,actionFrom,blockers,message,status,announce,onClick,install,cleanup});
})();