/* NOREYO V12.52 — gallery media follows Safari visualViewport height.
   V9.36 correctly bounds the modal itself to visualViewport, but the packed image
   still uses max-height:82vh from the layout viewport. Keep the image below the
   actually visible Safari viewport so browser chrome/rotation cannot clip it. */
(function(){
'use strict';
const BUILD='12.52',VERTICAL_RESERVE=96;
let bound=false,raf=0;

function modal(){return document.getElementById('galleryModal');}
function image(){return modal()?.querySelector('img')||null;}
function open(){return !!modal()?.classList?.contains('show');}
function viewportHeight(){
  const raw=Number(window.visualViewport?.height||window.innerHeight||700);
  return Math.max(1,Math.round(Number.isFinite(raw)?raw:700));
}
function maxImageHeight(height=viewportHeight()){
  const h=Math.max(1,Math.round(Number(height)||1));
  return Math.max(80,h-VERTICAL_RESERVE);
}
function sync(){
  raf=0;
  const img=image();if(!img||!open())return false;
  const wanted=`${maxImageHeight()}px`;
  if(img.style.maxHeight===wanted)return false;
  img.style.maxHeight=wanted;return true;
}
function reset(){const img=image();if(!img?.style.maxHeight)return false;img.style.maxHeight='';return true;}
function schedule(){if(!raf)raf=requestAnimationFrame(()=>{if(open())sync();else reset();});}
function bind(){
  if(bound)return false;bound=true;
  window.visualViewport?.addEventListener('resize',schedule);
  window.visualViewport?.addEventListener('scroll',schedule);
  window.addEventListener('resize',schedule);
  const m=modal();m&&new MutationObserver(schedule).observe(m,{attributes:true,attributeFilter:['class']});
  schedule();return true;
}
function cleanup(){
  if(!bound)return;bound=false;
  window.visualViewport?.removeEventListener('resize',schedule);
  window.visualViewport?.removeEventListener('scroll',schedule);
  window.removeEventListener('resize',schedule);
  if(raf){cancelAnimationFrame(raf);raf=0;}
  reset();
}
bind();
window.addEventListener('pagehide',cleanup,{passive:true});
window.addEventListener('pageshow',bind,{passive:true});
window.NOREYO_V1252=Object.freeze({BUILD,VERTICAL_RESERVE,modal,image,open,viewportHeight,maxImageHeight,sync,reset,schedule,bind,cleanup});
})();