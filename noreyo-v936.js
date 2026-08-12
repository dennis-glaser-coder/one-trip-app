/* NOREYO V9.36 — iPhone/Safari gallery modal lifecycle + swipe.
   Adds dialog semantics, focus containment, Escape handling, focus restore,
   swipe navigation and safe-area-aware visual viewport containment. */
(()=>{
'use strict';
const BUILD='9.36',SWIPE_PX=42;
let returnFocus=null,touchX=null,bound=false,raf=0;

function modal(){return document.getElementById('galleryModal');}
function open(){return !!modal()?.classList.contains('show');}
function focusables(){
  const m=modal();if(!m)return[];
  return [...m.querySelectorAll('button,[href],[tabindex]:not([tabindex="-1"])')]
    .filter(el=>!el.disabled&&el.getAttribute('aria-hidden')!=='true');
}
function syncViewport(){
  raf=0;const m=modal();if(!m||!open())return false;
  const vv=window.visualViewport;
  const top=Math.max(0,Math.round(vv?.offsetTop||0));
  const left=Math.max(0,Math.round(vv?.offsetLeft||0));
  const width=Math.max(1,Math.round(vv?.width||window.innerWidth||390));
  const height=Math.max(1,Math.round(vv?.height||window.innerHeight||700));
  Object.assign(m.style,{top:top+'px',left:left+'px',right:'auto',bottom:'auto',width:width+'px',height:height+'px',maxWidth:width+'px',maxHeight:height+'px'});
  return true;
}
function schedule(){if(!raf)raf=requestAnimationFrame(syncViewport);}
function rememberFocus(){
  try{
    const a=document.activeElement;
    if(a instanceof Element&&!modal()?.contains(a))returnFocus=a;
  }catch(_){}
}
function onOpened(){
  const m=modal();if(!m)return false;
  m.setAttribute('role','dialog');m.setAttribute('aria-modal','true');m.setAttribute('aria-label','Hotelfotos');
  rememberFocus();schedule();
  setTimeout(()=>{try{m.querySelector('.gallery-close')?.focus({preventScroll:true});}catch(_){}},0);
  return true;
}
function restoreFocus(){
  const target=returnFocus;returnFocus=null;
  setTimeout(()=>{try{if(target?.isConnected)target.focus({preventScroll:true});}catch(_){}},0);
}
function close(){
  try{
    if(typeof window.closeGallery==='function')window.closeGallery();
    else modal()?.classList.remove('show');
  }catch(_){return false}
  restoreFocus();return true;
}
function step(delta){try{if(typeof window.galleryStep==='function'){window.galleryStep(delta);return true}}catch(_){}return false}
function onKey(e){
  if(!open())return;
  if(e.key==='Escape'){e.preventDefault();e.stopPropagation();close();return}
  if(e.key==='ArrowLeft'){e.preventDefault();step(-1);return}
  if(e.key==='ArrowRight'){e.preventDefault();step(1);return}
  if(e.key!=='Tab')return;
  const f=focusables();if(!f.length){e.preventDefault();return}
  const first=f[0],last=f[f.length-1],active=document.activeElement;
  if(e.shiftKey&&active===first){e.preventDefault();last.focus()}
  else if(!e.shiftKey&&active===last){e.preventDefault();first.focus()}
}
function onTouchStart(e){if(!open())return;touchX=e.touches?.[0]?.clientX??null}
function onTouchEnd(e){
  if(!open()||touchX===null){touchX=null;return}
  const end=e.changedTouches?.[0]?.clientX;
  if(typeof end==='number'){
    const dx=end-touchX;
    if(Math.abs(dx)>=SWIPE_PX)step(dx>0?-1:1);
  }
  touchX=null;
}
function install(){
  if(bound)return false;bound=true;
  document.addEventListener('keydown',onKey,true);
  const m=modal();
  m?.addEventListener('touchstart',onTouchStart,{passive:true});
  m?.addEventListener('touchend',onTouchEnd,{passive:true});
  window.visualViewport?.addEventListener('resize',schedule);
  window.visualViewport?.addEventListener('scroll',schedule);
  window.addEventListener('resize',schedule);
  const obs=new MutationObserver(records=>{
    for(const r of records){
      if(r.type==='attributes'&&r.target===modal()){
        if(open())onOpened(); else restoreFocus();
        return;
      }
    }
  });
  if(m)obs.observe(m,{attributes:true,attributeFilter:['class']});
  window.__NOREYO_V936_OBSERVER__=obs;
  if(open())onOpened();
  return true;
}
function cleanup(){
  if(!bound)return;bound=false;
  document.removeEventListener('keydown',onKey,true);
  const m=modal();
  m?.removeEventListener('touchstart',onTouchStart);
  m?.removeEventListener('touchend',onTouchEnd);
  window.visualViewport?.removeEventListener('resize',schedule);
  window.visualViewport?.removeEventListener('scroll',schedule);
  window.removeEventListener('resize',schedule);
  try{window.__NOREYO_V936_OBSERVER__?.disconnect()}catch(_){}
  if(raf)cancelAnimationFrame(raf);raf=0;touchX=null;
}
install();
window.addEventListener('pagehide',cleanup,{passive:true});
window.addEventListener('pageshow',install,{passive:true});
window.NOREYO_V936=Object.freeze({BUILD,SWIPE_PX,modal,open,focusables,syncViewport,schedule,onOpened,restoreFocus,close,step,onKey,onTouchStart,onTouchEnd,install,cleanup});
})();