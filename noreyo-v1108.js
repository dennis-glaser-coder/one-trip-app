/* NOREYO V11.08 — hotel PREBOOK lifecycle + accessibility.
   Prebook sessions belong only to the current live hotel-detail context. Retire the
   session when starting a new search or leaving detail, and expose the verification
   feedback as a polite atomic live status. */
(function(){
'use strict';
const BUILD='11.08',STYLE_ID='noreyo-v1108-prebook-a11y';
let observer=null,raf=0;
const priorSearch=window.searchTrips,priorGo=window.go;
function clear(){try{return !!window.NOREYO_V1106?.clear?.();}catch(_){return false;}}
function enhance(){
  raf=0;
  const box=document.querySelector('.noreyo-v1106-prebook');if(!box)return false;
  let changed=false;
  const status=box.querySelector('.noreyo-v1106-status');
  if(status){
    if(status.getAttribute('role')!=='status'){status.setAttribute('role','status');changed=true;}
    if(status.getAttribute('aria-live')!=='polite'){status.setAttribute('aria-live','polite');changed=true;}
    if(status.getAttribute('aria-atomic')!=='true'){status.setAttribute('aria-atomic','true');changed=true;}
  }
  const btn=box.querySelector('.noreyo-v1106-action');
  if(btn&&!btn.getAttribute('aria-label')){btn.setAttribute('aria-label','Hotelpreis und Verfügbarkeit final prüfen');changed=true;}
  return changed;
}
function schedule(){if(!raf)raf=requestAnimationFrame(enhance);}
function installStyle(){
  if(document.getElementById(STYLE_ID))return false;
  const style=document.createElement('style');style.id=STYLE_ID;
  style.textContent='.noreyo-v1106-action{width:100%;min-height:48px;margin-top:10px}.noreyo-v1106-action:focus-visible{outline:3px solid #1fa2a4;outline-offset:3px}';
  document.head.appendChild(style);return true;
}
if(typeof priorSearch==='function')window.searchTrips=function(...args){clear();return priorSearch.apply(this,args);};
if(typeof priorGo==='function')window.go=function(view,...args){if(view!=='detail')clear();return priorGo.call(this,view,...args);};
function observe(){
  if(observer){observer.disconnect();observer=null;}
  if(typeof MutationObserver==='undefined'||!document.body)return false;
  observer=new MutationObserver(schedule);observer.observe(document.body,{subtree:true,childList:true});
  schedule();return true;
}
function cleanup(){if(observer){observer.disconnect();observer=null;}if(raf){cancelAnimationFrame(raf);raf=0;}}
installStyle();observe();
window.addEventListener('pagehide',cleanup,{passive:true});
window.addEventListener('pageshow',()=>{installStyle();observe();},{passive:true});
window.NOREYO_V1108=Object.freeze({BUILD,STYLE_ID,clear,enhance,schedule,installStyle,observe,cleanup});
})();