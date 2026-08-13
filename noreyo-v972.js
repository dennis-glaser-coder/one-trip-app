/* NOREYO V9.72 — planner form-control labels.
   Packed date/traveller/destination planners render visible text, but several
   controls are not programmatically labelled. Add stable accessible names after
   every planner render without changing layout or behavior. */
(function(){
'use strict';
const BUILD='9.72';
let observer=null,raf=0;
function setLabel(el,label){if(!el||el.getAttribute('aria-label')===label)return false;el.setAttribute('aria-label',label);return true;}
function enhance(root=document.getElementById('plannerBody')){
  if(!root)return false;let changed=false;
  changed=setLabel(root.querySelector('#checkinInput'),'Anreise')||changed;
  changed=setLabel(root.querySelector('#checkoutInput'),'Abreise')||changed;
  changed=setLabel(root.querySelector('.planner-search input[type="search"]'),'Reiseziel suchen')||changed;
  root.querySelectorAll?.('.child-age').forEach((row,i)=>{const label=row.querySelector('label')?.textContent?.trim()||`Kind ${i+1} · Alter`;changed=setLabel(row.querySelector('select'),label)||changed;});
  root.querySelectorAll?.('.counter-row').forEach(row=>{const group=row.querySelector('.counter-copy b')?.textContent?.trim()||'Reisende';const buttons=[...row.querySelectorAll('.counter button')];if(buttons[0])changed=setLabel(buttons[0],`${group} verringern`)||changed;if(buttons[1])changed=setLabel(buttons[1],`${group} erhöhen`)||changed;const value=row.querySelector('.counter strong');if(value){value.setAttribute('aria-live','polite');value.setAttribute('aria-atomic','true');}});
  return changed;
}
function run(){raf=0;enhance();}
function schedule(){if(!raf)raf=requestAnimationFrame(run);}
function observe(){if(observer){observer.disconnect();observer=null;}const root=document.getElementById('plannerBody');if(typeof MutationObserver==='undefined'||!root)return false;observer=new MutationObserver(schedule);observer.observe(root,{childList:true,subtree:true});schedule();return true;}
function cleanup(){if(observer){observer.disconnect();observer=null;}if(raf){cancelAnimationFrame(raf);raf=0;}}
observe();window.addEventListener('pagehide',cleanup,{passive:true});window.addEventListener('pageshow',observe,{passive:true});
window.NOREYO_V972=Object.freeze({BUILD,setLabel,enhance,run,schedule,observe,cleanup});
})();