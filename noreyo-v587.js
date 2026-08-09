/* NOREYO V5.87 — result observer rebind safety */
(function(){
'use strict';
const BUILD='5.87';
let rootObserver=null,observedRoot=null;

function results(){return document.getElementById('results');}
function isBusy(){
  try{return !!window.NOREYO_V584?.busy;}catch(_){return false;}
}
function settleNow(){
  try{
    const api=window.NOREYO_V584;
    if(!api?.busy)return false;
    const root=results();
    const text=String(root?.textContent||'');
    if(document.querySelector('#offers .offer')||
      /keine (angebote|hotels|flüge|fluege|reisen|ergebnisse)|nichts gefunden|nicht verfügbar|nicht verfugbar|suche fehlgeschlagen|fehler bei der suche|erneut versuchen/i.test(text)){
      api.release?.();
      return true;
    }
  }catch(_){}
  return false;
}
function bind(){
  const root=results();
  if(!root)return false;
  if(root===observedRoot&&rootObserver)return true;
  try{rootObserver?.disconnect();}catch(_){}
  observedRoot=root;
  root.setAttribute('aria-live','polite');
  root.setAttribute('aria-busy',isBusy()?'true':'false');
  if(typeof MutationObserver==='undefined')return true;
  rootObserver=new MutationObserver(()=>settleNow());
  rootObserver.observe(root,{childList:true,subtree:true,characterData:true});
  return true;
}
function install(){
  bind();
  if(typeof MutationObserver!=='undefined'){
    new MutationObserver(()=>{
      if(results()!==observedRoot)bind();
      else if(isBusy())settleNow();
    }).observe(document.body,{childList:true,subtree:true});
  }
  window.addEventListener('pageshow',()=>{observedRoot=null;bind();settleNow();},{passive:true});
  window.addEventListener('pagehide',()=>{try{rootObserver?.disconnect();}catch(_){}rootObserver=null;observedRoot=null;},{passive:true});
}
window.NOREYO_V587=Object.freeze({BUILD,results,bind,settleNow,get observedRoot(){return observedRoot;}});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();