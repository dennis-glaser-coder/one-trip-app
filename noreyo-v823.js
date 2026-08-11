/* NOREYO V8.23 — Safari-safe cruise picker accessibility and viewport containment.
   Keeps the existing cruise option sheets inside the visible iPhone viewport and
   adds Escape handling, close-button labelling and focus restoration. */
(function(){
'use strict';
const BUILD='8.23',EDGE=4;
let observer=null,bound=false,raf=0,returnFocus=null;

function root(){return document.querySelector('.noreyo-v552-sheet-backdrop');}
function sheet(el=root()){return el?.querySelector('.noreyo-v552-sheet')||null;}
function metrics(){
  const vv=window.visualViewport;
  return{
    width:Math.max(1,Math.round(vv?.width||window.innerWidth||390)),
    height:Math.max(1,Math.round(vv?.height||window.innerHeight||700)),
    left:Math.max(0,Math.round(vv?.offsetLeft||0)),
    top:Math.max(0,Math.round(vv?.offsetTop||0))
  };
}
function maxSheetHeight(height){return Math.max(1,height-EDGE);}
function enhance(el=root()){
  if(!el)return false;
  const panel=sheet(el);if(!panel)return false;
  const m=metrics();
  el.style.left=m.left+'px';el.style.right='auto';
  el.style.top=m.top+'px';el.style.bottom='auto';
  el.style.width=m.width+'px';el.style.maxWidth=m.width+'px';
  el.style.height=m.height+'px';el.style.maxHeight=m.height+'px';
  panel.style.maxHeight=maxSheetHeight(m.height)+'px';
  panel.style.overflowY='auto';
  if(!panel.hasAttribute('tabindex'))panel.setAttribute('tabindex','-1');
  const close=el.querySelector('[data-close-cruise-sheet]');
  if(close&&!close.getAttribute('aria-label'))close.setAttribute('aria-label','Auswahl schließen');
  if(el.dataset.noreyoV823!=='1'){
    el.dataset.noreyoV823='1';
    try{returnFocus=document.activeElement instanceof Element?document.activeElement:null;}catch(_){returnFocus=null;}
    setTimeout(()=>{try{(close||panel).focus({preventScroll:true});}catch(_){ }},0);
  }
  return true;
}
function sync(){raf=0;return enhance();}
function schedule(){if(raf)return;raf=requestAnimationFrame(sync);}
function restoreFocus(){
  const target=returnFocus;returnFocus=null;
  setTimeout(()=>{try{if(target?.isConnected)target.focus({preventScroll:true});}catch(_){ }},0);
}
function closeCurrent(){
  const el=root();if(!el)return false;
  const close=el.querySelector('[data-close-cruise-sheet]');
  try{if(close)close.click();else el.remove();}catch(_){return false;}
  restoreFocus();return true;
}
function onKeydown(e){
  if(e.key!=='Escape'||!root())return;
  e.preventDefault();e.stopPropagation();closeCurrent();
}
function observe(){
  if(observer){observer.disconnect();observer=null;}
  if(typeof MutationObserver==='undefined'||!document.body)return false;
  observer=new MutationObserver(records=>{
    let sawOpen=false,sawClose=false;
    for(const r of records){
      for(const n of r.addedNodes||[])if(n?.nodeType===1&&(n.matches?.('.noreyo-v552-sheet-backdrop')||n.querySelector?.('.noreyo-v552-sheet-backdrop')))sawOpen=true;
      for(const n of r.removedNodes||[])if(n?.nodeType===1&&(n.matches?.('.noreyo-v552-sheet-backdrop')||n.querySelector?.('.noreyo-v552-sheet-backdrop')))sawClose=true;
    }
    if(sawOpen)schedule();
    if(sawClose)restoreFocus();
  });
  observer.observe(document.body,{childList:true,subtree:true});
  schedule();return true;
}
function bind(){
  if(bound)return false;bound=true;
  window.visualViewport?.addEventListener('resize',schedule);
  window.visualViewport?.addEventListener('scroll',schedule);
  window.addEventListener('resize',schedule);
  document.addEventListener('keydown',onKeydown,true);
  observe();schedule();return true;
}
function cleanup(){
  if(observer){observer.disconnect();observer=null;}
  if(bound){
    window.visualViewport?.removeEventListener('resize',schedule);
    window.visualViewport?.removeEventListener('scroll',schedule);
    window.removeEventListener('resize',schedule);
    document.removeEventListener('keydown',onKeydown,true);
    bound=false;
  }
  if(raf){cancelAnimationFrame(raf);raf=0;}
  returnFocus=null;
}
bind();
window.addEventListener('pagehide',cleanup,{passive:true});
window.addEventListener('pageshow',bind,{passive:true});
window.NOREYO_V823=Object.freeze({BUILD,EDGE,root,sheet,metrics,maxSheetHeight,enhance,sync,schedule,restoreFocus,closeCurrent,onKeydown,observe,bind,cleanup});
})();