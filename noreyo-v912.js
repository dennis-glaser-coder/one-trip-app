/* NOREYO V9.12 — planner hot-load/BFCache dialog rehydration.
   V8.96 skips its open transition when it binds while plannerSheet is already
   open. Rehydrate dialog semantics/focus once without duplicating its key handlers. */
(function(){
'use strict';
const BUILD='9.12',MARK='noreyoV912Hydrated';
let observer=null,raf=0;
function root(){return document.getElementById('plannerSheet');}
function open(el=root()){return !!el?.classList?.contains('show');}
function rehydrate(){
  raf=0;const el=root();if(!open(el))return false;
  el.setAttribute('role','dialog');el.setAttribute('aria-modal','true');
  if(!el.getAttribute('aria-labelledby')&&document.getElementById('plannerTitle'))el.setAttribute('aria-labelledby','plannerTitle');
  const close=el.querySelector('.planner-close');if(close&&!close.getAttribute('aria-label'))close.setAttribute('aria-label','Auswahl schließen');
  if(el.dataset[MARK]!=='1'){
    el.dataset[MARK]='1';
    try{window.NOREYO_V896?.rememberFocus?.();}catch(_){}
    setTimeout(()=>{try{window.NOREYO_V896?.focusDialog?.();}catch(_){}},0);
  }
  return true;
}
function clearMark(){const el=root();if(el&&!open(el))delete el.dataset[MARK];}
function sync(){raf=0;if(open())rehydrate();else clearMark();}
function schedule(){if(!raf)raf=requestAnimationFrame(sync);}
function observe(){
  if(observer){observer.disconnect();observer=null;}
  const el=root();if(typeof MutationObserver==='undefined'||!el)return false;
  observer=new MutationObserver(schedule);observer.observe(el,{attributes:true,attributeFilter:['class']});
  schedule();return true;
}
function cleanup(){if(observer){observer.disconnect();observer=null;}if(raf){cancelAnimationFrame(raf);raf=0;}const el=root();if(el)delete el.dataset[MARK];}
observe();window.addEventListener('pagehide',cleanup,{passive:true});window.addEventListener('pageshow',observe,{passive:true});
window.NOREYO_V912=Object.freeze({BUILD,MARK,root,open,rehydrate,clearMark,sync,schedule,observe,cleanup});
})();
