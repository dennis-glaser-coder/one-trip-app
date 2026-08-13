/* NOREYO V8.94 — iPhone touch-target and control labelling hardening. */
(function(){
'use strict';
const BUILD='8.94',MIN_TARGET=44,STYLE_ID='noreyo-v894-touch-targets';
let observer=null,raf=0;

function styleText(){return `
@media (pointer:coarse),(max-width:640px){
  .round,.planner-close,#sheet .close{min-width:${MIN_TARGET}px!important;min-height:${MIN_TARGET}px!important}
  .product-mode{min-height:${MIN_TARGET}px!important;height:auto!important}
  .section-head>button{min-height:${MIN_TARGET}px!important;padding:8px 6px!important}
  #sheet .tab{min-height:${MIN_TARGET}px!important;padding-top:8px!important;padding-bottom:8px!important}
  #sheet .seg>button{min-height:${MIN_TARGET}px!important}
  #sheet .reset{min-height:${MIN_TARGET}px!important;padding:8px 6px!important}
  #sheet .switch{min-width:${MIN_TARGET}px!important;min-height:${MIN_TARGET}px!important}
  .planner-save,.small-action,.ghost-btn,.favorite-remove{min-height:${MIN_TARGET}px!important}
}`;}
function ensureStyle(){
  let el=document.getElementById(STYLE_ID);
  if(el)return false;
  el=document.createElement('style');el.id=STYLE_ID;el.textContent=styleText();
  (document.head||document.documentElement).appendChild(el);return true;
}
function iconHref(button){
  const use=button?.querySelector?.('use');
  return String(use?.getAttribute?.('href')||use?.getAttribute?.('xlink:href')||'');
}
function ensureLabel(button,label){
  if(!button||button.getAttribute('aria-label'))return false;
  button.setAttribute('aria-label',label);return true;
}
function labelControls(){
  let changed=false;
  document.querySelectorAll('.planner-close').forEach(el=>{changed=ensureLabel(el,'Auswahl schließen')||changed;});
  document.querySelectorAll('#sheet .close').forEach(el=>{changed=ensureLabel(el,'Filter schließen')||changed;});
  document.querySelectorAll('.round').forEach(el=>{
    const href=iconHref(el);
    if(href.includes('#bell'))changed=ensureLabel(el,'Hinweise')||changed;
    else if(href.includes('#user'))changed=ensureLabel(el,'Profil öffnen')||changed;
  });
  document.querySelectorAll('.favorite-remove').forEach(el=>{changed=ensureLabel(el,'Favorit entfernen')||changed;});
  return changed;
}
function run(){raf=0;ensureStyle();labelControls();}
function schedule(){if(raf)return;raf=requestAnimationFrame(run);}
function observe(){
  if(observer){observer.disconnect();observer=null;}
  if(typeof MutationObserver==='undefined'||!document.body)return false;
  observer=new MutationObserver(schedule);
  observer.observe(document.body,{subtree:true,childList:true});
  schedule();return true;
}
function cleanup(){if(observer){observer.disconnect();observer=null;}if(raf){cancelAnimationFrame(raf);raf=0;}}
ensureStyle();observe();
window.addEventListener('pagehide',cleanup,{passive:true});
window.addEventListener('pageshow',observe,{passive:true});
window.NOREYO_V894=Object.freeze({BUILD,MIN_TARGET,STYLE_ID,styleText,ensureStyle,iconHref,ensureLabel,labelControls,run,schedule,observe,cleanup});
})();
