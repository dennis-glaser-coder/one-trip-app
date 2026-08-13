/* NOREYO V12.26 — checkout blocker interlock.
   V12.00 (unsupported MUST) and V12.02 (authentication) both own the same PREBOOK
   action. Each older layer can re-enable the button when its own blocker disappears,
   even while the other blocker is still active. Reconcile only toward safety:
   if any known blocker marker remains, the action must stay disabled. */
(function(){
'use strict';
const BUILD='12.26';
let observer=null,raf=0;
function action(){return document.querySelector('.noreyo-v1106-prebook .noreyo-v1106-action');}
function blockers(btn=action()){if(!btn)return Object.freeze({must:false,auth:false,any:false});const must=btn.dataset?.noreyoV1200Must==='1';const auth=btn.dataset?.noreyoV1202Auth==='1';return Object.freeze({must,auth,any:must||auth});}
function label(b){if(b.must)return'Pflichtkriterien noch nicht verifiziert';if(b.auth)return'Für Checkout anmelden';return'';}
function reconcile(){raf=0;const btn=action();if(!btn)return false;const b=blockers(btn);if(!b.any)return false;let changed=false;if(!btn.disabled){btn.disabled=true;changed=true;}if(btn.getAttribute('aria-disabled')!=='true'){btn.setAttribute('aria-disabled','true');changed=true;}const text=label(b);if(text&&btn.textContent!==text){btn.textContent=text;changed=true;}return changed;}
function schedule(){if(!raf)raf=requestAnimationFrame(reconcile);}
function install(){if(observer||typeof MutationObserver==='undefined'||!document.body)return false;observer=new MutationObserver(records=>{for(const r of records){const el=r.target?.nodeType===1?r.target:r.target?.parentElement;if(el?.closest?.('.noreyo-v1106-prebook')){schedule();return;}for(const n of r.addedNodes||[]){if(n?.nodeType===1&&(n.matches?.('.noreyo-v1106-prebook')||n.querySelector?.('.noreyo-v1106-prebook'))){schedule();return;}}}});observer.observe(document.body,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['disabled','aria-disabled','data-noreyo-v1200-must','data-noreyo-v1202-auth']});schedule();return true;}
function cleanup(){if(observer){observer.disconnect();observer=null;}if(raf){cancelAnimationFrame(raf);raf=0;}}
install();window.addEventListener('pagehide',cleanup,{passive:true});window.addEventListener('pageshow',install,{passive:true});
window.NOREYO_V1226=Object.freeze({BUILD,action,blockers,label,reconcile,schedule,install,cleanup});
})();