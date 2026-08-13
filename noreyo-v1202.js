/* NOREYO V12.02 — visible hotel-checkout authentication boundary.
   Server transport already rejects unauthenticated PREBOOK calls. Mirror that
   boundary in hotel detail before the click: keep the final-check button disabled
   while signed out and provide an explicit route to the profile sign-in surface. */
(function(){
'use strict';
const BUILD='12.02';
let observer=null,raf=0,bound=false;
function authenticated(){try{return !!window.NOREYO_V1178?.identity?.();}catch(_){}try{return !!window.NOREYO_V1176?.authenticated?.();}catch(_){}return false;}
function box(){return document.querySelector('.noreyo-v1106-prebook');}
function ensureLogin(root){let note=root.querySelector('.noreyo-v1202-auth-note'),changed=false;if(!note){note=document.createElement('div');note.className='backend-note noreyo-v1202-auth-note';note.innerHTML='<b>Anmeldung für den Checkout erforderlich</b><p>Preisprüfung und Checkout-Session werden deinem NOREYO-Konto zugeordnet.</p><button type="button" class="noreyo-v1202-login">Zum Profil & anmelden</button>';const action=root.querySelector('.noreyo-v1106-action');root.insertBefore(note,action||null);changed=true;}return{note,changed};}
function render(){raf=0;const root=box();if(!root)return false;const ok=authenticated(),action=root.querySelector('.noreyo-v1106-action');let note=root.querySelector('.noreyo-v1202-auth-note'),changed=false;if(!ok){const ensured=ensureLogin(root);note=ensured.note;changed=ensured.changed||changed;if(action&&action.dataset.noreyoV1202Auth!=='1'){action.dataset.noreyoV1202Auth='1';action.dataset.noreyoV1202Label=action.textContent||'Preis & Verfügbarkeit final prüfen';action.disabled=true;action.setAttribute('aria-disabled','true');if(action.dataset.noreyoV1200Must!=='1')action.textContent='Für Checkout anmelden';changed=true;}}else{if(note){note.remove();changed=true;}if(action?.dataset?.noreyoV1202Auth==='1'){delete action.dataset.noreyoV1202Auth;if(action.dataset.noreyoV1200Must!=='1'){action.disabled=false;action.setAttribute('aria-disabled','false');action.textContent=action.dataset.noreyoV1202Label||'Preis & Verfügbarkeit final prüfen';}delete action.dataset.noreyoV1202Label;changed=true;}}return changed;}
function schedule(){if(!raf)raf=requestAnimationFrame(render);}
function onClick(e){const btn=e.target?.closest?.('.noreyo-v1202-login');if(!btn)return;e.preventDefault();e.stopPropagation();try{if(typeof go==='function')go('profile');}catch(_){}setTimeout(()=>{try{window.NOREYO_V1162?.focusLogin?.();}catch(_){}},0);}
function install(){if(bound)return false;bound=true;if(typeof MutationObserver!=='undefined'&&document.body){observer=new MutationObserver(schedule);observer.observe(document.body,{subtree:true,childList:true,characterData:true});}document.addEventListener('click',onClick,true);window.addEventListener('focus',schedule,{passive:true});schedule();return true;}
function cleanup(){if(observer){observer.disconnect();observer=null;}if(bound){document.removeEventListener('click',onClick,true);window.removeEventListener('focus',schedule,false);bound=false;}if(raf){cancelAnimationFrame(raf);raf=0;}}
install();window.addEventListener('pagehide',cleanup,{passive:true});window.addEventListener('pageshow',install,{passive:true});
window.NOREYO_V1202=Object.freeze({BUILD,authenticated,box,ensureLogin,render,schedule,onClick,install,cleanup});
})();