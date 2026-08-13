/* NOREYO V9.32 — truthful profile affordances and current runtime build label. */
(function(){
'use strict';
const BUILD='9.32';let observer=null,raf=0;
function neutralize(el,label){
  if(!el)return false;let changed=false;
  for(const attr of ['onclick','role','tabindex'])if(el.hasAttribute(attr)){el.removeAttribute(attr);changed=true;}
  if(el.dataset?.noreyoKeyboardButton){delete el.dataset.noreyoKeyboardButton;changed=true;}
  if(label&&el.getAttribute('aria-label')!==label){el.setAttribute('aria-label',label);changed=true;}
  return changed;
}
function fixProfile(root=document){
  const profile=root.getElementById?.('profile')||root.querySelector?.('#profile');if(!profile)return false;
  let changed=false;
  const hero=profile.querySelector('.profile-hero');
  changed=neutralize(hero,'Profilstatus – lokal auf diesem Gerät gespeichert')||changed;
  const loyalty=[...profile.querySelectorAll('.menu-row')].find(r=>/Treueprogramme/i.test(r.textContent||''));
  if(loyalty){
    changed=neutralize(loyalty,'Treueprogramme – noch nicht verfügbar')||changed;
    if(loyalty.getAttribute('aria-disabled')!=='true'){loyalty.setAttribute('aria-disabled','true');changed=true;}
    const small=loyalty.querySelector('small');
    if(small&&small.textContent!=='Noch nicht verfügbar · keine Daten hinterlegt'){small.textContent='Noch nicht verfügbar · keine Daten hinterlegt';changed=true;}
    const chev=loyalty.querySelector('svg.icon.mini');if(chev&&chev.getAttribute('aria-hidden')!=='true'){chev.setAttribute('aria-hidden','true');changed=true;}
  }
  const build=profile.querySelector('.build-version');
  if(build&&build.textContent!=='NOREYO · BUILD 9.32'){build.textContent='NOREYO · BUILD 9.32';changed=true;}
  return changed;
}
function run(){raf=0;return fixProfile();}
function schedule(){if(!raf)raf=requestAnimationFrame(run);}
function observe(){if(observer){observer.disconnect();observer=null;}if(typeof MutationObserver==='undefined'||!document.body)return false;observer=new MutationObserver(schedule);observer.observe(document.body,{subtree:true,childList:true,characterData:true});schedule();return true;}
function cleanup(){if(observer){observer.disconnect();observer=null;}if(raf){cancelAnimationFrame(raf);raf=0;}}
observe();window.addEventListener('pagehide',cleanup,{passive:true});window.addEventListener('pageshow',observe,{passive:true});
window.NOREYO_V932=Object.freeze({BUILD,neutralize,fixProfile,run,schedule,observe,cleanup});
})();