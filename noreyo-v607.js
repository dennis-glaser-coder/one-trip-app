/* NOREYO V6.07 — search terminal-state busy release guard.
   Releases disabled search CTAs as soon as a real NOREYO result/error/empty state is visible. */
(function(){
'use strict';
const BUILD='6.07';
let observer=null,root=null,raf=0,bodyObserver=null;

function norm(v){
  return String(v||'').toLowerCase().normalize('NFD')
    .replace(/[\u0300-\u036f]/g,'').replace(/ß/g,'ss').replace(/\s+/g,' ').trim();
}
function terminalText(text){
  const t=norm(text);
  return /keine (?:angebote|hotels|fluge|reisen|ergebnisse)|nichts gefunden|suche fehlgeschlagen|fehler bei der suche|erneut versuchen|keine vollstandige ubereinstimmung|keine verfugbarkeit gefunden|aktive filter ohne treffer|aktuell keine bestatigte .*rate|in den aktuellen daten nicht bestatigt/.test(t);
}
function releaseIfSettled(){
  raf=0;
  const api=window.NOREYO_V585;
  if(!api?.busy)return false;
  const results=document.getElementById('results');
  if(!results||!terminalText(results.textContent||''))return false;
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
function install(){
  bind();
  if(!bodyObserver&&document.body&&typeof MutationObserver!=='undefined'){
    bodyObserver=new MutationObserver(()=>{if(document.getElementById('results')!==root)bind();});
    bodyObserver.observe(document.body,{childList:true,subtree:true});
  }
}
function cleanup(){
  if(observer){observer.disconnect();observer=null;}
  if(bodyObserver){bodyObserver.disconnect();bodyObserver=null;}
  if(raf){cancelAnimationFrame(raf);raf=0;}
  root=null;
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
window.addEventListener('pagehide',cleanup,{passive:true});
window.addEventListener('pageshow',install,{passive:true});
window.NOREYO_V607=Object.freeze({BUILD,terminalText,releaseIfSettled,bind});
})();