/* NOREYO V9.70 — icon-only button accessible names.
   The packed core contains repeated header/filter icon buttons without accessible
   names. Label them from their stable action semantics and normalize type=button. */
(function(){
'use strict';
const BUILD='9.70';
let observer=null,raf=0;
function inferredLabel(button){
  const onclick=String(button?.getAttribute?.('onclick')||'');
  if(button?.classList?.contains('avatar')||/go\(['"]profile['"]\)/.test(onclick))return'Profil öffnen';
  if(/Keine neuen Hinweise/.test(onclick))return'Benachrichtigungen';
  if(button?.classList?.contains('back')||/go\(['"]searchView['"]\)/.test(onclick))return'Zurück zur Suche';
  if(button?.classList?.contains('close')||/closeFilter\(\)/.test(onclick))return'Filter schließen';
  if(button?.classList?.contains('ai')&&/openFilter\(/.test(onclick))return'Filter öffnen';
  return'';
}
function enhanceButton(button){
  if(!button)return false;
  let changed=false;
  const label=inferredLabel(button);
  if(label&&!button.getAttribute('aria-label')){button.setAttribute('aria-label',label);changed=true;}
  if(!button.getAttribute('type')){button.setAttribute('type','button');changed=true;}
  return changed;
}
function enhance(root=document){let changed=false;root.querySelectorAll?.('button').forEach(b=>{changed=enhanceButton(b)||changed;});return changed;}
function run(){raf=0;enhance();}
function schedule(){if(!raf)raf=requestAnimationFrame(run);}
function observe(){
  if(observer){observer.disconnect();observer=null;}
  if(typeof MutationObserver==='undefined'||!document.body)return false;
  observer=new MutationObserver(records=>{for(const r of records){for(const n of r.addedNodes||[]){if(n?.nodeType===1&&(n.matches?.('button')||n.querySelector?.('button'))){schedule();return;}}}});
  observer.observe(document.body,{childList:true,subtree:true});schedule();return true;
}
function cleanup(){if(observer){observer.disconnect();observer=null;}if(raf){cancelAnimationFrame(raf);raf=0;}}
observe();window.addEventListener('pagehide',cleanup,{passive:true});window.addEventListener('pageshow',observe,{passive:true});
window.NOREYO_V970=Object.freeze({BUILD,inferredLabel,enhanceButton,enhance,run,schedule,observe,cleanup});
})();