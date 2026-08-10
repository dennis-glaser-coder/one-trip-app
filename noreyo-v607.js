/* NOREYO V6.13 — race-safe search completion/network lifecycle guard.
   Terminal observer only releases on terminal text. Successful searches release
   only after renderOffers completes, so stale cards cannot end a new search early. */
(function(){
'use strict';
const BUILD='6.14';
let observer=null,root=null,raf=0;

function norm(v){
  return String(v||'').toLowerCase().normalize('NFD')
    .replace(/[\u0300-\u036f]/g,'').replace(/ß/g,'ss').replace(/\s+/g,' ').trim();
}
function terminalText(text){
  const t=norm(text);
  return /keine (?:angebote|hotels|fluge|reisen|ergebnisse)|nichts gefunden|suche fehlgeschlagen|fehler bei der suche|erneut versuchen|keine vollstandige ubereinstimmung|keine verfugbarkeit gefunden|aktive filter ohne treffer|aktuell keine bestatigte .*rate|in den aktuellen daten nicht bestatigt/.test(t);
}
function releaseBusy(){
  try{
    const api=window.NOREYO_V585;
    if(api?.busy){api.releaseBusy?.();return true;}
  }catch(_){ }
  return false;
}
function releaseTerminalIfVisible(){
  raf=0;
  const results=document.getElementById('results');
  if(!window.NOREYO_V585?.busy||!results||!terminalText(results.textContent||''))return false;
  return releaseBusy();
}
function scheduleTerminal(){
  if(raf)return;
  raf=requestAnimationFrame(releaseTerminalIfVisible);
}
function bind(){
  const next=document.getElementById('results');
  if(next===root&&observer)return;
  if(observer){observer.disconnect();observer=null;}
  root=next;
  if(!root||typeof MutationObserver==='undefined')return;
  observer=new MutationObserver(scheduleTerminal);
  observer.observe(root,{childList:true,subtree:true,characterData:true});
  scheduleTerminal();
}
function isSearchTravel(input){
  const url=typeof input==='string'?input:String(input?.url||'');
  return url.includes('/functions/v1/search-travel');
}
function installFetchHook(){
  try{
    if(typeof window.fetch!=='function'||window.fetch.__noreyoV613)return;
    const prior=window.fetch.bind(window);
    const wrapped=async function(input,init){
      const target=isSearchTravel(input);
      try{
        const response=await prior(input,init);
        if(target&&window.NOREYO_V585?.busy&&response&&response.ok===false)releaseBusy();
        return response;
      }catch(error){
        if(target&&window.NOREYO_V585?.busy)releaseBusy();
        throw error;
      }
    };
    wrapped.__noreyoV613=true;
    window.fetch=wrapped;
  }catch(_){ }
}
function hasRenderedOffers(){
  const results=document.getElementById('results');
  return !!results?.querySelector?.('#offers .offer,.offer');
}
function installRenderHook(){
  try{
    if(typeof renderOffers!=='function'||renderOffers.__noreyoV613)return;
    const prior=renderOffers;
    const wrapped=function(){
      let result;
      try{result=prior.apply(this,arguments);}
      catch(error){releaseBusy();throw error;}
      const done=()=>{
        if(!window.NOREYO_V585?.busy)return;
        if(hasRenderedOffers()||terminalText(document.getElementById('results')?.textContent||''))releaseBusy();
      };
      const failed=()=>{releaseBusy();};
      if(result&&typeof result.then==='function')result.then(done,failed);
      else setTimeout(done,0);
      return result;
    };
    wrapped.__noreyoV613=true;
    renderOffers=wrapped;
  }catch(_){ }
}
function installNavigationHook(){
  try{
    if(typeof go!=='function'||go.__noreyoV613)return;
    const prior=go;
    const wrapped=function(){
      const result=prior.apply(this,arguments);
      setTimeout(bind,0);
      return result;
    };
    wrapped.__noreyoV613=true;
    go=wrapped;
  }catch(_){ }
}
function install(){bind();installFetchHook();installRenderHook();installNavigationHook();}
function cleanup(){
  if(observer){observer.disconnect();observer=null;}
  if(raf){cancelAnimationFrame(raf);raf=0;}
  root=null;
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
window.addEventListener('pagehide',cleanup,{passive:true});
window.addEventListener('pageshow',install,{passive:true});
window.NOREYO_V607=Object.freeze({BUILD,terminalText,isSearchTravel,hasRenderedOffers,releaseTerminalIfVisible,bind});
})();