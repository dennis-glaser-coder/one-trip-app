/* NOREYO V11.72 — truthful profile-hero interaction semantics.
   V11.62 always marks the hero as a button, but when authenticated focusLogin()
   has no visible target because the login row is hidden. Keep button semantics only
   while signed out; authenticated account summary becomes non-interactive. */
(function(){
'use strict';
const BUILD='11.72';
let observer=null,raf=0;
function hero(){return document.querySelector('#profile .profile-hero');}
function authenticated(){try{return !!window.NOREYO_V1162?.model?.().authenticated;}catch(_){return false;}}
function sync(){raf=0;const h=hero();if(!h)return false;const ok=authenticated();let changed=false;if(ok){if(h.hasAttribute('role')){h.removeAttribute('role');changed=true;}if(h.hasAttribute('tabindex')){h.removeAttribute('tabindex');changed=true;}if(h.getAttribute('aria-label')?.startsWith('Mein Konto')!==true){const email=String(window.NOREYO_V1162?.model?.().email||'').trim();h.setAttribute('aria-label',email?`Mein Konto, ${email}`:'Mein Konto');changed=true;}if(h.getAttribute('aria-disabled')!=='true'){h.setAttribute('aria-disabled','true');changed=true;}}else{if(h.getAttribute('role')!=='button'){h.setAttribute('role','button');changed=true;}if(h.getAttribute('tabindex')!=='0'){h.setAttribute('tabindex','0');changed=true;}if(h.getAttribute('aria-label')!=='Bei NOREYO anmelden'){h.setAttribute('aria-label','Bei NOREYO anmelden');changed=true;}if(h.hasAttribute('aria-disabled')){h.removeAttribute('aria-disabled');changed=true;}}return changed;}
function schedule(){if(!raf)raf=requestAnimationFrame(sync);}
function install(){if(observer||typeof MutationObserver==='undefined'||!document.body)return false;observer=new MutationObserver(schedule);observer.observe(document.body,{subtree:true,childList:true});schedule();return true;}
function cleanup(){if(observer){observer.disconnect();observer=null;}if(raf){cancelAnimationFrame(raf);raf=0;}}
install();window.addEventListener('pagehide',cleanup,{passive:true});window.addEventListener('pageshow',install,{passive:true});
window.NOREYO_V1172=Object.freeze({BUILD,hero,authenticated,sync,schedule,install,cleanup});
})();