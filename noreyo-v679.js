/* NOREYO V6.84 — AI sheet VisualViewport exact-bound safety.
   Keeps the AI bottom sheet inside the actual visible Safari viewport even
   under strong zoom / landscape / keyboard shrink and clears stale sheet sizing. */
(function(){
'use strict';
const BUILD='6.84';
let modalObserver=null,rootObserver=null,bound=false;

function metrics(){
  const vv=window.visualViewport;
  const width=Math.round(vv?.width||window.innerWidth||390);
  const height=Math.round(vv?.height||window.innerHeight||700);
  return {
    width:Math.max(1,width),
    height:Math.max(1,height),
    top:Math.max(0,Math.round(vv?.offsetTop||0)),
    left:Math.max(0,Math.round(vv?.offsetLeft||0))
  };
}
function modal(){return document.getElementById('noreyoAi556');}
function shown(){return !!modal()?.classList.contains('show');}
function clear(){
  const w=modal();if(!w)return false;
  for(const prop of ['width','height','top','left','right','bottom'])w.style[prop]='';
  const sheet=w.querySelector('.noreyo-v556-sheet');
  if(sheet)sheet.style.maxHeight='';
  return true;
}
function sync(){
  const w=modal();if(!w||!w.classList.contains('show')){clear();return false;}
  const m=metrics();
  w.style.width=m.width+'px';
  w.style.height=m.height+'px';
  w.style.top=m.top+'px';
  w.style.left=m.left+'px';
  w.style.right='auto';
  w.style.bottom='auto';
  const sheet=w.querySelector('.noreyo-v556-sheet');
  if(sheet)sheet.style.maxHeight=Math.max(1,Math.min(820,m.height-4))+'px';
  return true;
}
function bindModal(){
  const w=modal();if(!w)return false;
  if(modalObserver){modalObserver.disconnect();modalObserver=null;}
  if(typeof MutationObserver!=='undefined'){
    modalObserver=new MutationObserver(records=>{
      if(records.some(r=>r.type==='attributes'&&r.attributeName==='class'))sync();
    });
    modalObserver.observe(w,{attributes:true,attributeFilter:['class']});
  }
  sync();
  return true;
}
function findModal(){
  if(bindModal()){
    if(rootObserver){rootObserver.disconnect();rootObserver=null;}
    return true;
  }
  if(!rootObserver&&document.body&&typeof MutationObserver!=='undefined'){
    rootObserver=new MutationObserver(()=>{if(bindModal()){rootObserver.disconnect();rootObserver=null;}});
    rootObserver.observe(document.body,{childList:true,subtree:true});
  }
  return false;
}
function onViewport(){sync();}
function bindEvents(){
  if(bound)return;bound=true;
  window.visualViewport?.addEventListener('resize',onViewport);
  window.visualViewport?.addEventListener('scroll',onViewport);
  window.addEventListener('resize',onViewport);
}
function unbindEvents(){
  if(!bound)return;bound=false;
  window.visualViewport?.removeEventListener('resize',onViewport);
  window.visualViewport?.removeEventListener('scroll',onViewport);
  window.removeEventListener('resize',onViewport);
}
function cleanup(){
  clear();
  if(modalObserver){modalObserver.disconnect();modalObserver=null;}
  if(rootObserver){rootObserver.disconnect();rootObserver=null;}
  unbindEvents();
}
function install(){bindEvents();findModal();sync();}

install();
window.addEventListener('pagehide',cleanup,{passive:true});
window.addEventListener('pageshow',install,{passive:true});
window.NOREYO_V679=Object.freeze({BUILD,metrics,shown,sync,clear,findModal,cleanup,get bound(){return bound;}});
})();