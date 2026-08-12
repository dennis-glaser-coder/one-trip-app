/* NOREYO V11.40 — PREBOOK freshness UI truth.
   V11.38 correctly relocks checkout after 60s, but V11.36's original render closure
   can still display “live confirmed”. Reconcile the visible button/note/data state
   against the authoritative V11.38 freshness result after every render/mutation. */
(function(){
'use strict';
const BUILD='11.40';
let observer=null,raf=0,timer=0;
function fresh(){try{return !!window.NOREYO_V1138?.fresh?.();}catch(_){return false;}}
function box(){return document.querySelector('.noreyo-v1128-ready');}
function reconcile(){raf=0;const root=box();if(!root)return false;const btn=root.querySelector('.noreyo-v1136-session-check'),note=root.querySelector('.noreyo-v1136-session-note');const ready=!!window.NOREYO_V1128?.checkoutReady?.();let changed=false;if(root.getAttribute('data-checkout-ready')!==(ready?'true':'false')){root.setAttribute('data-checkout-ready',ready?'true':'false');changed=true;}if(btn){const text=fresh()?'Checkout-Session erneut live prüfen':'Checkout-Session jetzt live prüfen';if(btn.textContent!==text&&!btn.disabled){btn.textContent=text;changed=true;}}if(note){const text=fresh()?'Checkout-Session wurde vor weniger als 60 Sekunden live bestätigt.':'Die letzte Session-Prüfung ist nicht mehr frisch genug. Vor dem nächsten Buchungsschritt bitte erneut live bestätigen.';if(note.textContent!==text){note.textContent=text;changed=true;}}scheduleExpiry();return changed;}
function scheduleExpiry(){if(timer){clearTimeout(timer);timer=0;}const status=window.NOREYO_HOTEL_PREBOOK_STATUS;if(!status||!fresh())return false;const checked=Date.parse(String(status.checkedAt||''));if(!Number.isFinite(checked))return false;const max=Number(window.NOREYO_V1138?.MAX_AGE_MS)||60000;timer=setTimeout(()=>{timer=0;schedule();},Math.max(10,checked+max-Date.now()+35));return true;}
function schedule(){if(!raf)raf=requestAnimationFrame(reconcile);}
function patchRender(){const prior=window.NOREYO_V1136;if(!prior||prior.__noreyoV1140)return false;const render=prior.render;window.NOREYO_V1136=Object.freeze({...prior,__noreyoV1140:true,render(...args){const result=render?.apply(this,args);schedule();return result;}});return true;}
function install(){patchRender();if(observer||typeof MutationObserver==='undefined'||!document.body)return false;observer=new MutationObserver(schedule);observer.observe(document.body,{subtree:true,childList:true,characterData:true});schedule();return true;}
function cleanup(){if(observer){observer.disconnect();observer=null;}if(raf){cancelAnimationFrame(raf);raf=0;}if(timer){clearTimeout(timer);timer=0;}}
install();window.addEventListener('pagehide',cleanup,{passive:true});window.addEventListener('pageshow',install,{passive:true});
window.NOREYO_V1140=Object.freeze({BUILD,fresh,box,reconcile,scheduleExpiry,schedule,patchRender,install,cleanup});
})();