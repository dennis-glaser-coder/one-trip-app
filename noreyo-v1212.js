/* NOREYO V12.12 — Magic-Link callback error lifecycle.
   V12.10 safely surfaces failed callback state, but that state must not outlive a
   retry or later successful identity hydration. Clear it before a new send attempt
   and once the validated auth boundary reports an authenticated identity. */
(function(){
'use strict';
const BUILD='12.12';
let observer=null,raf=0,bound=false;

function callback(){return window.NOREYO_V1210||null;}
function authenticated(){
  try{if(window.NOREYO_V1178?.identity?.())return true;}catch(_){}
  try{if(window.NOREYO_V1176?.authenticated?.())return true;}catch(_){}
  try{if(window.NOREYO_V1158?.identityValidated?.()&&window.NOREYO_V1158?.authenticated?.())return true;}catch(_){}
  return false;
}
function clear(){
  try{return !!callback()?.clear?.();}catch(_){return false;}
}
function sync(){
  raf=0;
  if(authenticated())return clear();
  return false;
}
function schedule(){if(!raf)raf=requestAnimationFrame(sync);}
function onClick(e){
  if(e.target?.closest?.('.noreyo-v1162-send,.noreyo-v1158-send'))clear();
}
function install(){
  if(bound)return false;
  bound=true;
  if(typeof MutationObserver!=='undefined'&&document.body){
    observer=new MutationObserver(schedule);
    observer.observe(document.body,{subtree:true,childList:true});
  }
  document.addEventListener('click',onClick,true);
  window.addEventListener('focus',schedule,{passive:true});
  schedule();return true;
}
function cleanup(){
  if(observer){observer.disconnect();observer=null;}
  if(bound){
    document.removeEventListener('click',onClick,true);
    window.removeEventListener('focus',schedule,false);
    bound=false;
  }
  if(raf){cancelAnimationFrame(raf);raf=0;}
}
install();
window.addEventListener('pagehide',cleanup,{passive:true});
window.addEventListener('pageshow',install,{passive:true});
window.NOREYO_V1212=Object.freeze({BUILD,callback,authenticated,clear,sync,schedule,onClick,install,cleanup});
})();