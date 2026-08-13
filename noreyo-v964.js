/* NOREYO V9.64 — accessible toast announcements.
   The packed core uses #toast for validation and action feedback, but the element
   has no live-region semantics. Add polite, atomic status announcements without
   changing the existing visual/timing behavior. */
(function(){
'use strict';
const BUILD='9.64';
let observer=null,raf=0;

function toast(){return document.getElementById('toast');}
function enhance(){
  const el=toast();
  if(!el)return false;
  let changed=false;
  if(el.getAttribute('role')!=='status'){el.setAttribute('role','status');changed=true;}
  if(el.getAttribute('aria-live')!=='polite'){el.setAttribute('aria-live','polite');changed=true;}
  if(el.getAttribute('aria-atomic')!=='true'){el.setAttribute('aria-atomic','true');changed=true;}
  return changed;
}
function run(){raf=0;enhance();}
function schedule(){if(!raf)raf=requestAnimationFrame(run);}
function observe(){
  if(observer){observer.disconnect();observer=null;}
  if(typeof MutationObserver==='undefined'||!document.body)return false;
  observer=new MutationObserver(records=>{
    for(const r of records){
      for(const n of r.addedNodes||[]){
        if(n?.nodeType===1&&(n.id==='toast'||n.querySelector?.('#toast'))){schedule();return;}
      }
    }
  });
  observer.observe(document.body,{childList:true,subtree:true});
  schedule();
  return true;
}
function cleanup(){
  if(observer){observer.disconnect();observer=null;}
  if(raf){cancelAnimationFrame(raf);raf=0;}
}
observe();
window.addEventListener('pagehide',cleanup,{passive:true});
window.addEventListener('pageshow',observe,{passive:true});
window.NOREYO_V964=Object.freeze({BUILD,toast,enhance,run,schedule,observe,cleanup});
})();