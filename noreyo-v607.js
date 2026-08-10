/* NOREYO V6.09 — scoped search completion lifecycle guard.
   Releases disabled search CTAs on real terminal states and completed offer renders,
   including repeated searches that return identical cards. */
(function(){
'use strict';
const BUILD='6.09';
let observer=null,root=null,raf=0;

function norm(v){
  return String(v||'').toLowerCase().normalize('NFD')
    .replace(/[\u0300-\u036f]/g,'').replace(/ß/g,'ss').replace(/\s+/g,' ').trim();
}
function terminalText(text){
  const t=norm(text);
  return /keine (?:angebote|hotels|fluge|reisen|ergebnisse)|nichts gefunden|suche fehlgeschlagen|fehler bei der suche|erneut versuchen|keine vollstandige ubereinstimmung|keine verfugbarkeit gefunden|aktive filter ohne treffer|aktuell keine bestatigte .*rate|in den aktuellen daten nicht bestatigt/.test(t);
}
function settledResultVisible(){
  const results=document.getElementById('results');
  if(!results)return false;
  if(results.querySelector?.('#offers .offer,.offer'))return true;
  return terminalText(results.textContent||'');
}
function releaseIfSettled(){
  raf=0;
  const api=window.NOREYO_V585;
  if(!api?.busy||!settledResultVisible())return false;
  try{api.releaseBusy?.();return true;}catch(_){return false;}
}
function schedule(){
  if(raf)return;
  raf=requestAnimationFrame(releaseIfSettled);
}
function bind(){
  const next=document.getElementById('results');
  if(next===root&&observer)return;
  if(observer){observer.disconnect();observer=null;}
  root=next;
  if(!root||typeof MutationObserver==='undefined')return;
  observer=new MutationObserver(schedule);
  observer.observe(root,{childList:true,subtree:true,characterData:true});
  schedule();
}
function installRenderHook(){
  try{
    if(typeof renderOffers!=='function'||renderOffers.__noreyoV609)return;
    const prior=renderOffers;
    const wrapped=function(){
      const result=prior.apply(this,arguments);
      const done=()=>{if(window.NOREYO_V585?.busy&&settledResultVisible())window.NOREYO_V585.releaseBusy?.();};
      if(result&&typeof result.then==='function')result.then(done,done);
      else setTimeout(done,0);
      return result;
    };
    wrapped.__noreyoV609=true;
    renderOffers=wrapped;
  }catch(_){ }
}
function installNavigationHook(){
  try{
    if(typeof go!=='function'||go.__noreyoV609)return;
    const prior=go;
    const wrapped=function(){
      const result=prior.apply(this,arguments);
      setTimeout(bind,0);
      return result;
    };
    wrapped.__noreyoV609=true;
    go=wrapped;
  }catch(_){ }
}
function install(){bind();installRenderHook();installNavigationHook();}
function cleanup(){
  if(observer){observer.disconnect();observer=null;}
  if(raf){cancelAnimationFrame(raf);raf=0;}
  root=null;
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
window.addEventListener('pagehide',cleanup,{passive:true});
window.addEventListener('pageshow',install,{passive:true});
window.NOREYO_V607=Object.freeze({BUILD,terminalText,settledResultVisible,releaseIfSettled,bind});
})();