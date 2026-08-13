/* NOREYO V12.48 — visualViewport-safe filter sheet on iPhone/Safari.
   Packed #sheet and #sheetScroll still use fixed 92vh calculations. Safari browser
   chrome can make that taller than the currently visible viewport. Bound the filter
   sheet to visualViewport and keep its scroll area inside the visible sheet. */
(function(){
'use strict';
const BUILD='12.48',MIN_SHEET_HEIGHT=240,CHROME_RESERVE=175;
let bound=false,raf=0;

function sheet(){return document.getElementById('sheet');}
function scroll(){return document.getElementById('sheetScroll');}
function open(){return !!sheet()?.classList?.contains('show');}
function viewportHeight(){
  const raw=Number(window.visualViewport?.height||window.innerHeight||700);
  return Math.max(1,Math.round(Number.isFinite(raw)?raw:700));
}
function metrics(height=viewportHeight()){
  const h=Math.max(1,Math.round(Number(height)||1));
  const sheetHeight=Math.max(1,Math.min(h-4,Math.max(MIN_SHEET_HEIGHT,Math.floor(h*.92))));
  const scrollHeight=Math.max(80,sheetHeight-CHROME_RESERVE);
  return Object.freeze({viewportHeight:h,sheetHeight,scrollHeight});
}
function sync(){
  raf=0;
  const sh=sheet(),sc=scroll();
  if(!sh||!sc||!open())return false;
  const m=metrics();
  let changed=false;
  const hh=`${m.sheetHeight}px`,hs=`${m.scrollHeight}px`;
  if(sh.style.height!==hh){sh.style.height=hh;changed=true;}
  if(sh.style.maxHeight!==`${m.viewportHeight}px`){sh.style.maxHeight=`${m.viewportHeight}px`;changed=true;}
  if(sc.style.height!==hs){sc.style.height=hs;changed=true;}
  return changed;
}
function reset(){
  const sh=sheet(),sc=scroll();let changed=false;
  if(sh?.style.height){sh.style.height='';changed=true;}
  if(sh?.style.maxHeight){sh.style.maxHeight='';changed=true;}
  if(sc?.style.height){sc.style.height='';changed=true;}
  return changed;
}
function schedule(){if(!raf)raf=requestAnimationFrame(()=>{if(open())sync();else reset();});}
function bind(){
  if(bound)return false;bound=true;
  window.visualViewport?.addEventListener('resize',schedule);
  window.visualViewport?.addEventListener('scroll',schedule);
  window.addEventListener('resize',schedule);
  document.addEventListener('click',schedule,true);
  schedule();return true;
}
function cleanup(){
  if(bound){
    window.visualViewport?.removeEventListener('resize',schedule);
    window.visualViewport?.removeEventListener('scroll',schedule);
    window.removeEventListener('resize',schedule);
    document.removeEventListener('click',schedule,true);
    bound=false;
  }
  if(raf){cancelAnimationFrame(raf);raf=0;}
  reset();
}
bind();
window.addEventListener('pagehide',cleanup,{passive:true});
window.addEventListener('pageshow',bind,{passive:true});
window.NOREYO_V1248=Object.freeze({BUILD,MIN_SHEET_HEIGHT,CHROME_RESERVE,sheet,scroll,open,viewportHeight,metrics,sync,reset,schedule,bind,cleanup});
})();