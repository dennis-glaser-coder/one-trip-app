/* NOREYO V9.30 — navigation state and inspiration/header accessibility. */
(function(){
'use strict';
const BUILD='9.30';let observer=null,raf=0;
function setAttr(el,k,v){if(!el||el.getAttribute(k)===v)return false;el.setAttribute(k,v);return true;}
function syncNav(root=document){
  let changed=false;const nav=root.getElementById?.('nav')||root.querySelector?.('#nav');
  if(nav)changed=setAttr(nav,'aria-label','Hauptnavigation')||changed;
  root.querySelectorAll?.('#nav .nav-btn').forEach(btn=>{
    const active=btn.classList.contains('active');
    if(active)changed=setAttr(btn,'aria-current','page')||changed;
    else if(btn.hasAttribute('aria-current')){btn.removeAttribute('aria-current');changed=true;}
  });
  return changed;
}
function syncHeader(root=document){
  let changed=false;
  root.querySelectorAll?.('.head-actions .round.avatar').forEach(b=>{changed=setAttr(b,'aria-label','Profil öffnen')||changed;});
  root.querySelectorAll?.('.head-actions .round:not(.avatar)').forEach(b=>{if(!b.getAttribute('aria-label'))changed=setAttr(b,'aria-label','Hinweise öffnen')||changed;});
  return changed;
}
function syncInspiration(root=document){
  let changed=false;
  root.querySelectorAll?.('.hero img').forEach(img=>{if(img.getAttribute('alt')!==''){img.setAttribute('alt','');changed=true;}});
  root.querySelectorAll?.('.dest-card').forEach(card=>{
    const img=card.querySelector('img'),name=card.querySelector('.dest-copy b')?.textContent?.trim()||'Reiseziel';
    if(img&&!img.getAttribute('alt')){img.setAttribute('alt',name+' – Reiseinspiration');changed=true;}
    if(!card.getAttribute('aria-label')){card.setAttribute('aria-label',name+' als Reiseziel auswählen');changed=true;}
  });
  return changed;
}
function run(){raf=0;return syncNav()||syncHeader()||syncInspiration();}
function schedule(){if(!raf)raf=requestAnimationFrame(run);}
function observe(){if(observer){observer.disconnect();observer=null;}if(typeof MutationObserver==='undefined'||!document.body)return false;observer=new MutationObserver(schedule);observer.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['class']});schedule();return true;}
function cleanup(){if(observer){observer.disconnect();observer=null;}if(raf){cancelAnimationFrame(raf);raf=0;}}
observe();window.addEventListener('pagehide',cleanup,{passive:true});window.addEventListener('pageshow',observe,{passive:true});
window.NOREYO_V930=Object.freeze({BUILD,setAttr,syncNav,syncHeader,syncInspiration,run,schedule,observe,cleanup});
})();