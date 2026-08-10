/* NOREYO V6.24 — AI modal BFCache/page-lock cleanup for iPhone Safari. */
(function(){
'use strict';
const BUILD='6.24';
let restoreY=0;

function aiWrap(){
  return document.getElementById('noreyoAi556');
}
function legacyWrap(){
  return document.getElementById('noreyoAi555');
}
function lockedScrollY(){
  const top=parseFloat(document.body?.style?.top||'');
  if(Number.isFinite(top)&&top<0)return Math.max(0,-top);
  return Math.max(0,window.scrollY||0);
}
function clearAiTransientState(restoreScroll){
  const body=document.body;
  if(!body)return false;
  const hadLock=body.classList.contains('noreyo-v556-lock');
  if(hadLock)restoreY=lockedScrollY();
  body.classList.remove('noreyo-v556-lock');
  body.style.top='';
  const w=aiWrap();
  if(w){
    w.classList.remove('show');
    w.style.height='';
    w.style.top='';
    w.querySelector('textarea')?.blur?.();
  }
  const old=legacyWrap();
  if(old){old.classList.remove('show');old.querySelector('textarea')?.blur?.();}
  if(restoreScroll&&hadLock){
    try{window.scrollTo(0,restoreY);}catch(_){ }
  }
  return hadLock||!!w?.classList||!!old?.classList;
}
function onPageHide(){
  clearAiTransientState(true);
}
function onPageShow(){
  const body=document.body;if(!body)return;
  if(body.classList.contains('noreyo-v556-lock')&&!aiWrap()?.classList.contains('show')){
    clearAiTransientState(false);
  }
}
window.addEventListener('pagehide',onPageHide,{passive:true});
window.addEventListener('pageshow',onPageShow,{passive:true});
window.NOREYO_V624=Object.freeze({BUILD,clearAiTransientState,lockedScrollY});
})();