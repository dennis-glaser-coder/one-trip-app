/* NOREYO V12.50 — visualViewport-safe generic planner sheet on iPhone/Safari.
   Packed plannerSheet/plannerBody still use 82vh max-height. Browser chrome can make
   that exceed Safari's currently visible viewport. Bound both surfaces to the live
   visualViewport while preserving the packed 82vh fallback when the sheet is closed. */
(function(){
'use strict';
const BUILD='12.50',MIN_SHEET_HEIGHT=220,HEADER_RESERVE=72;
let observer=null,bound=false,raf=0;

function sheet(){return document.getElementById('plannerSheet');}
function body(){return document.getElementById('plannerBody');}
function open(){return !!sheet()?.classList?.contains('show');}
function viewportHeight(){
  const raw=Number(window.visualViewport?.height||window.innerHeight||700);
  return Math.max(1,Math.round(Number.isFinite(raw)?raw:700));
}
function metrics(height=viewportHeight()){
  const h=Math.max(1,Math.round(Number(height)||1));
  const sheetMax=Math.max(1,Math.min(Math.max(1,h-4),Math.max(MIN_SHEET_HEIGHT,Math.floor(h*.82))));
  const bodyMax=Math.max(80,sheetMax-HEADER_RESERVE);
  return Object.freeze({viewportHeight:h,sheetMax,bodyMax});
}
function sync(){
  raf=0;const sh=sheet(),b=body();
  if(!sh||!b||!open())return false;
  const m=metrics();let changed=false;
  const shMax=`${m.sheetMax}px`,bodyMax=`${m.bodyMax}px`;
  if(sh.style.maxHeight!==shMax){sh.style.maxHeight=shMax;changed=true;}
  if(b.style.maxHeight!==bodyMax){b.style.maxHeight=bodyMax;changed=true;}
  return changed;
}
function reset(){
  const sh=sheet(),b=body();let changed=false;
  if(sh?.style.maxHeight){sh.style.maxHeight='';changed=true;}
  if(b?.style.maxHeight){b.style.maxHeight='';changed=true;}
  return changed;
}
function schedule(){if(!raf)raf=requestAnimationFrame(()=>{if(open())sync();else reset();});}
function bind(){
  if(bound)return false;bound=true;
  const sh=sheet();
  if(typeof MutationObserver!=='undefined'&&sh){
    observer=new MutationObserver(schedule);
    observer.observe(sh,{subtree:true,childList:true,attributes:true,attributeFilter:['class']});
  }
  window.visualViewport?.addEventListener('resize',schedule);
  window.visualViewport?.addEventListener('scroll',schedule);
  window.addEventListener('resize',schedule);
  schedule();return true;
}
function cleanup(){
  if(observer){observer.disconnect();observer=null;}
  if(bound){
    window.visualViewport?.removeEventListener('resize',schedule);
    window.visualViewport?.removeEventListener('scroll',schedule);
    window.removeEventListener('resize',schedule);
    bound=false;
  }
  if(raf){cancelAnimationFrame(raf);raf=0;}
  reset();
}
bind();
window.addEventListener('pagehide',cleanup,{passive:true});
window.addEventListener('pageshow',bind,{passive:true});
window.NOREYO_V1250=Object.freeze({BUILD,MIN_SHEET_HEIGHT,HEADER_RESERVE,sheet,body,open,viewportHeight,metrics,sync,reset,schedule,bind,cleanup});
})();