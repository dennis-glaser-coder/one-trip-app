/* NOREYO V8.90 — truthful local profile state and inspiration affordance cleanup. */
(function(){
'use strict';
const BUILD='8.90';
let observer=null,raf=0;

function profileView(){return document.getElementById('profile');}
function setText(el,text){if(!el||el.textContent===text)return false;el.textContent=text;return true;}
function ensureKeyboardButton(el){
  if(!el)return false;
  let changed=false;
  if(el.getAttribute('role')!=='button'){el.setAttribute('role','button');changed=true;}
  if(el.getAttribute('tabindex')!=='0'){el.setAttribute('tabindex','0');changed=true;}
  if(el.dataset.noreyoKeyboardButton!=='1'){
    el.dataset.noreyoKeyboardButton='1';
    el.addEventListener('keydown',e=>{
      if(e.key!=='Enter'&&e.key!==' ')return;
      e.preventDefault();
      el.click();
    });
    changed=true;
  }
  return changed;
}
function fixProfile(){
  const root=profileView();if(!root)return false;
  let changed=false;
  const title=root.querySelector('.simple-intro h1');
  changed=setText(title,'Deine Reisepräferenzen, auf diesem Gerät gespeichert.')||changed;
  const summary=root.querySelector('#profileSummary');
  changed=setText(summary,'Suchprofil lokal auf diesem Gerät gespeichert')||changed;
  const hero=root.querySelector('.profile-hero');
  if(hero){hero.setAttribute('aria-label','Profilstatus: lokale Speicherung auf diesem Gerät');changed=ensureKeyboardButton(hero)||changed;}
  root.querySelectorAll('.menu-row').forEach(row=>{changed=ensureKeyboardButton(row)||changed;});
  const build=root.querySelector('.build-version');
  if(build)changed=setText(build,'NOREYO · BUILD 8.90')||changed;
  return changed;
}
function fixInspiration(){
  let changed=false;
  document.querySelectorAll('#discover .dest-card').forEach(card=>{
    const heart=card.querySelector('.dest-heart');if(!heart)return;
    heart.setAttribute('aria-hidden','true');heart.style.pointerEvents='none';
    const use=heart.querySelector('use');if(use&&use.getAttribute('href')!=='#chev'){use.setAttribute('href','#chev');changed=true;}
  });
  return changed;
}
function fix(){raf=0;return fixProfile()||fixInspiration();}
function schedule(){if(raf)return;raf=requestAnimationFrame(fix);}
function observe(){
  if(observer){observer.disconnect();observer=null;}
  if(typeof MutationObserver==='undefined'||!document.body)return false;
  observer=new MutationObserver(records=>{
    for(const r of records){
      if(r.target?.closest?.('#profile,#discover')){schedule();return;}
      for(const n of r.addedNodes||[]){if(n?.nodeType===1&&(n.matches?.('#profile,#discover')||n.querySelector?.('#profile,#discover'))){schedule();return;}}
    }
  });
  observer.observe(document.body,{subtree:true,childList:true,characterData:true});schedule();return true;
}
function cleanup(){if(observer){observer.disconnect();observer=null;}if(raf){cancelAnimationFrame(raf);raf=0;}}
observe();window.addEventListener('pagehide',cleanup,{passive:true});window.addEventListener('pageshow',observe,{passive:true});
window.NOREYO_V890=Object.freeze({BUILD,profileView,setText,ensureKeyboardButton,fixProfile,fixInspiration,fix,schedule,observe,cleanup});
})();