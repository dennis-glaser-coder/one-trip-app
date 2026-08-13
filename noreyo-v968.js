/* NOREYO V9.68 — destination-row interaction dedupe and accessibility.
   Packed home/search rows attach onclick to the row and to both inner controls,
   so tapping the input/button bubbles and can open the destination planner twice.
   Stop inner-control bubbling, label readonly destination inputs and make Enter/Space
   activate them once. */
(function(){
'use strict';
const BUILD='9.68';
let observer=null,raf=0;

function bindInput(input){
  if(!input)return false;
  let changed=false;
  if(input.getAttribute('aria-label')!=='Reiseziel auswählen'){input.setAttribute('aria-label','Reiseziel auswählen');changed=true;}
  if(input.dataset.noreyoV968!=='1'){
    input.dataset.noreyoV968='1';
    input.addEventListener('click',e=>e.stopPropagation());
    input.addEventListener('keydown',e=>{
      if(e.key!=='Enter'&&e.key!==' ')return;
      e.preventDefault();e.stopPropagation();input.click();
    });
    changed=true;
  }
  return changed;
}
function bindButton(button){
  if(!button)return false;
  let changed=false;
  if(button.getAttribute('aria-label')!=='Reiseziel auswählen'){button.setAttribute('aria-label','Reiseziel auswählen');changed=true;}
  if(button.dataset.noreyoV968!=='1'){
    button.dataset.noreyoV968='1';
    button.addEventListener('click',e=>e.stopPropagation());
    changed=true;
  }
  return changed;
}
function enhanceRow(row){
  if(!row)return false;
  let changed=false;
  changed=bindInput(row.querySelector('.destinationInput'))||changed;
  changed=bindButton(row.querySelector('.dest-open'))||changed;
  return changed;
}
function enhance(root=document){
  let changed=false;
  root.querySelectorAll?.('.dest-row').forEach(row=>{changed=enhanceRow(row)||changed;});
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
        if(n?.nodeType===1&&(n.matches?.('.dest-row')||n.querySelector?.('.dest-row'))){schedule();return;}
      }
    }
  });
  observer.observe(document.body,{childList:true,subtree:true});
  schedule();return true;
}
function cleanup(){if(observer){observer.disconnect();observer=null;}if(raf){cancelAnimationFrame(raf);raf=0;}}
observe();
window.addEventListener('pagehide',cleanup,{passive:true});
window.addEventListener('pageshow',observe,{passive:true});
window.NOREYO_V968=Object.freeze({BUILD,bindInput,bindButton,enhanceRow,enhance,run,schedule,observe,cleanup});
})();