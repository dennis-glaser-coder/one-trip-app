/* NOREYO V9.80 — accessible result summary and result-region semantics. */
(function(){
'use strict';
const BUILD='9.80';
let observer=null,raf=0;

function makeButton(el,label){
  if(!el)return false;
  let changed=false;
  if(el.getAttribute('role')!=='button'){el.setAttribute('role','button');changed=true;}
  if(el.getAttribute('tabindex')!=='0'){el.setAttribute('tabindex','0');changed=true;}
  if(el.getAttribute('aria-label')!==label){el.setAttribute('aria-label',label);changed=true;}
  if(el.dataset.noreyoV980!=='1'){
    el.dataset.noreyoV980='1';
    el.addEventListener('keydown',e=>{
      if(e.key!=='Enter'&&e.key!==' ')return;
      e.preventDefault();e.stopPropagation();el.click();
    });
    changed=true;
  }
  return changed;
}
function enhance(){
  let changed=false;
  const summary=document.querySelector('#results .result-summary');
  if(summary)changed=makeButton(summary,'Suche ändern')||changed;
  const results=document.getElementById('results');
  if(results){
    if(results.getAttribute('aria-label')!=='Suchergebnisse'){results.setAttribute('aria-label','Suchergebnisse');changed=true;}
    if(results.getAttribute('role')!=='region'){results.setAttribute('role','region');changed=true;}
  }
  const list=document.getElementById('list');
  if(list){
    if(list.getAttribute('aria-live')!=='polite'){list.setAttribute('aria-live','polite');changed=true;}
    if(list.getAttribute('aria-atomic')!=='false'){list.setAttribute('aria-atomic','false');changed=true;}
  }
  return changed;
}
function run(){raf=0;enhance();}
function schedule(){if(!raf)raf=requestAnimationFrame(run);}
function observe(){
  if(observer){observer.disconnect();observer=null;}
  if(typeof MutationObserver==='undefined'||!document.body)return false;
  observer=new MutationObserver(schedule);
  observer.observe(document.body,{childList:true,subtree:true});
  schedule();return true;
}
function cleanup(){if(observer){observer.disconnect();observer=null;}if(raf){cancelAnimationFrame(raf);raf=0;}}
observe();
window.addEventListener('pagehide',cleanup,{passive:true});
window.addEventListener('pageshow',observe,{passive:true});
window.NOREYO_V980=Object.freeze({BUILD,makeButton,enhance,run,schedule,observe,cleanup});
})();