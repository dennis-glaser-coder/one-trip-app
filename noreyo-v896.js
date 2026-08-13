/* NOREYO V8.96 — generic planner dialog keyboard/focus lifecycle. */
(function(){
'use strict';
const BUILD='8.96';
let observer=null,returnFocus=null,lastOpen=false,raf=0,bound=false;

function sheet(){return document.getElementById('plannerSheet');}
function open(root=sheet()){return !!root?.classList?.contains('show');}
function focusables(root=sheet()){
  if(!root)return[];
  return [...root.querySelectorAll('button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),a[href],[tabindex]:not([tabindex="-1"])')]
    .filter(el=>{const r=el.getBoundingClientRect();const s=getComputedStyle(el);return r.width>0&&r.height>0&&s.visibility!=='hidden'&&s.display!=='none';});
}
function rememberFocus(){
  try{
    const active=document.activeElement;
    if(active instanceof Element&&active!==document.body&&!sheet()?.contains(active))returnFocus=active;
  }catch(_){}
}
function focusDialog(){
  const root=sheet();if(!open(root))return false;
  root.setAttribute('aria-labelledby','plannerTitle');
  const close=root.querySelector('.planner-close');
  if(close&&!close.getAttribute('aria-label'))close.setAttribute('aria-label','Auswahl schließen');
  const target=close||focusables(root)[0]||root;
  if(target===root&&!root.hasAttribute('tabindex'))root.setAttribute('tabindex','-1');
  try{target.focus({preventScroll:true});return true;}catch(_){return false;}
}
function restoreFocus(){
  const target=returnFocus;returnFocus=null;
  if(!target?.isConnected)return false;
  setTimeout(()=>{try{target.focus({preventScroll:true});}catch(_){}},0);return true;
}
function closeDialog(){
  if(!open())return false;
  try{if(typeof closePlanner==='function')closePlanner();else{sheet()?.classList.remove('show');document.getElementById('plannerBackdrop')?.classList.remove('show');}}catch(_){return false;}
  restoreFocus();return true;
}
function onKeydown(e){
  const root=sheet();if(!open(root))return;
  if(e.key==='Escape'){
    e.preventDefault();e.stopPropagation();closeDialog();return;
  }
  if(e.key!=='Tab')return;
  const items=focusables(root);if(!items.length){e.preventDefault();try{root.focus({preventScroll:true});}catch(_){}return;}
  const first=items[0],last=items[items.length-1],active=document.activeElement;
  if(e.shiftKey&&(active===first||!root.contains(active))){e.preventDefault();last.focus();}
  else if(!e.shiftKey&&(active===last||!root.contains(active))){e.preventDefault();first.focus();}
}
function sync(){
  raf=0;const isOpen=open();
  if(isOpen&&!lastOpen){rememberFocus();setTimeout(focusDialog,0);}
  else if(!isOpen&&lastOpen)restoreFocus();
  lastOpen=isOpen;
}
function schedule(){if(raf)return;raf=requestAnimationFrame(sync);}
function observe(){
  if(observer){observer.disconnect();observer=null;}
  const root=sheet();if(typeof MutationObserver==='undefined'||!root)return false;
  lastOpen=open(root);
  observer=new MutationObserver(schedule);observer.observe(root,{attributes:true,attributeFilter:['class'],childList:true,subtree:true});
  return true;
}
function bind(){
  if(bound)return false;bound=true;
  document.addEventListener('keydown',onKeydown,true);observe();schedule();return true;
}
function cleanup(){
  if(observer){observer.disconnect();observer=null;}
  if(bound){document.removeEventListener('keydown',onKeydown,true);bound=false;}
  if(raf){cancelAnimationFrame(raf);raf=0;}returnFocus=null;lastOpen=false;
}
bind();
window.addEventListener('pagehide',cleanup,{passive:true});
window.addEventListener('pageshow',bind,{passive:true});
window.NOREYO_V896=Object.freeze({BUILD,sheet,open,focusables,rememberFocus,focusDialog,restoreFocus,closeDialog,onKeydown,sync,schedule,observe,bind,cleanup});
})();
