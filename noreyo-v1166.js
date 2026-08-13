/* NOREYO V11.66 — profile uses the secure Supabase logout lifecycle.
   V11.62's delegated logout calls the older local-only clear(). Replace only the
   profile logout control with a separately owned button so signOut() can revoke the
   server session before local checkout/auth state is retired. */
(function(){
'use strict';
const BUILD='11.66';
let observer=null,raf=0,bound=false,busy=false;
function profile(){return document.getElementById('profile');}
function auth(){return window.NOREYO_V1158||null;}
function model(){try{return window.NOREYO_V1162?.model?.()||{authenticated:false,email:''};}catch(_){return{authenticated:false,email:''};}}
function panel(){return profile()?.querySelector('.noreyo-v1162-account')||null;}
function secureButton(){const p=panel();if(!p)return null;let btn=p.querySelector('.noreyo-v1166-logout');if(btn)return btn;const legacy=p.querySelector('.noreyo-v1162-logout');if(!legacy)return null;legacy.classList.remove('noreyo-v1162-logout');legacy.classList.add('noreyo-v1166-logout');legacy.type='button';legacy.textContent='Sicher abmelden';return legacy;}
function render(){raf=0;const p=panel(),btn=secureButton();if(!p||!btn)return false;const m=model(),status=p.querySelector('.noreyo-v1162-status');let changed=false;const hidden=!m.authenticated;if(btn.hidden!==hidden){btn.hidden=hidden;changed=true;}if(btn.disabled!==busy){btn.disabled=busy;changed=true;}const label=busy?'Abmeldung läuft …':'Sicher abmelden';if(btn.textContent!==label){btn.textContent=label;changed=true;}const err=String(auth()?.authError?.()||'').trim();if(!m.authenticated&&err&&status&&!status.textContent){status.textContent=`Anmeldung nicht abgeschlossen: ${err}`;changed=true;}return changed;}
async function logout(root=panel()){const a=auth(),status=root?.querySelector('.noreyo-v1162-status');if(busy)return false;busy=true;render();try{if(typeof a?.signOut==='function')await a.signOut();else a?.clear?.();try{window.NOREYO_V1162?.render?.();}catch(_){}if(status)status.textContent='Du bist sicher abgemeldet.';return true;}catch(_){try{a?.clear?.();}catch(__){}if(status)status.textContent='Die lokale Sitzung wurde beendet.';return false;}finally{busy=false;render();}}
function onClick(e){const btn=e.target?.closest?.('.noreyo-v1166-logout');if(!btn)return;e.preventDefault();e.stopImmediatePropagation?.();e.stopPropagation();logout(btn.closest('.noreyo-v1162-account'));}
function schedule(){if(!raf)raf=requestAnimationFrame(render);}
function install(){if(bound)return false;bound=true;if(typeof MutationObserver!=='undefined'&&document.body){observer=new MutationObserver(schedule);observer.observe(document.body,{subtree:true,childList:true});}document.addEventListener('click',onClick,true);schedule();return true;}
function cleanup(){if(observer){observer.disconnect();observer=null;}if(bound){document.removeEventListener('click',onClick,true);bound=false;}if(raf){cancelAnimationFrame(raf);raf=0;}}
install();window.addEventListener('pagehide',cleanup,{passive:true});window.addEventListener('pageshow',install,{passive:true});
window.NOREYO_V1166=Object.freeze({BUILD,profile,auth,model,panel,secureButton,render,logout,onClick,schedule,install,cleanup,get busy(){return busy;}});
})();