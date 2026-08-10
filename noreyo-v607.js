/* NOREYO V6.25 — authoritative search completion/network lifecycle guard.
   Keeps an independent request lock for package/hotel searches while delaying
   the physical disabled state until the initiating click has finished dispatching. */
(function(){
'use strict';
const BUILD='6.25';
let observer=null,root=null,raf=0;
let guardActive=false,guardButton=null,buttonObserver=null,guardTimer=0,lockTimer=0;

function norm(v){
  return String(v||'').toLowerCase().normalize('NFD')
    .replace(/[\u0300-\u036f]/g,'').replace(/ß/g,'ss').replace(/\s+/g,' ').trim();
}
function terminalText(text){
  const t=norm(text);
  return /keine (?:angebote|hotels|fluge|reisen|ergebnisse)|nichts gefunden|suche fehlgeschlagen|fehler bei der suche|erneut versuchen|keine vollstandige ubereinstimmung|keine verfugbarkeit gefunden|keine verfugbarkeit fur diesen zeitraum|fur diese reisedaten aktuell kein bestatigtes angebot|aktive filter ohne treffer|aktuelle auswahl ohne vollstandigen treffer|aktuell keine bestatigte .*rate|in den aktuellen daten nicht bestatigt/.test(t);
}
function releaseLegacyBusy(){
  try{
    const api=window.NOREYO_V585;
    if(api?.busy){api.releaseBusy?.();return true;}
  }catch(_){ }
  return false;
}
function currentMode(){
  const active=document.querySelector('.view.active .product-mode.on')||document.querySelector('#discover .product-mode.on');
  const t=norm(active?.textContent||'');
  if(t.includes('flug'))return'flight';
  if(t.includes('kreuzfahrt'))return'cruise';
  if(t.includes('hotel'))return'hotel';
  try{if(typeof productMode==='string'&&productMode)return productMode;}catch(_){ }
  return'package';
}
function authoritativeMode(){
  const m=currentMode();
  return m==='package'||m==='hotel';
}
function isSearchButton(target){
  if(!(target instanceof Element))return null;
  return target.closest('.noreyo-v541-booking-cta,.liveSearchButton,#searchView .search-card .primary');
}
function enforceButtonLock(){
  if(!guardActive||!guardButton)return;
  if(!guardButton.disabled)guardButton.disabled=true;
  if(guardButton.getAttribute('aria-disabled')!=='true')guardButton.setAttribute('aria-disabled','true');
}
function bindButtonObserver(){
  if(buttonObserver){buttonObserver.disconnect();buttonObserver=null;}
  if(!guardButton||typeof MutationObserver==='undefined')return;
  buttonObserver=new MutationObserver(enforceButtonLock);
  buttonObserver.observe(guardButton,{attributes:true,attributeFilter:['disabled','aria-disabled']});
}
function scheduleButtonLock(btn){
  clearTimeout(lockTimer);
  lockTimer=setTimeout(()=>{
    lockTimer=0;
    if(guardActive&&guardButton===btn)enforceButtonLock();
  },0);
}
function startGuard(btn){
  if(guardActive)return false;
  guardActive=true;guardButton=btn||null;
  bindButtonObserver();
  scheduleButtonLock(guardButton);
  clearTimeout(guardTimer);guardTimer=setTimeout(()=>releaseGuard('timeout'),16000);
  return true;
}
function releaseGuard(reason){
  if(!guardActive){releaseLegacyBusy();return false;}
  guardActive=false;
  clearTimeout(lockTimer);lockTimer=0;
  clearTimeout(guardTimer);guardTimer=0;
  if(buttonObserver){buttonObserver.disconnect();buttonObserver=null;}
  if(guardButton){
    guardButton.disabled=false;
    guardButton.removeAttribute('aria-disabled');
  }
  guardButton=null;
  releaseLegacyBusy();
  return true;
}
function onSearchCapture(e){
  const btn=isSearchButton(e.target);if(!btn||!authoritativeMode())return;
  if(guardActive){
    e.preventDefault();
    e.stopImmediatePropagation();
    enforceButtonLock();
    return;
  }
  startGuard(btn);
}
function releaseTerminalIfVisible(){
  raf=0;
  const results=document.getElementById('results');
  if(!guardActive||!results||!terminalText(results.textContent||''))return false;
  return releaseGuard('terminal');
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
    if(typeof window.fetch!=='function'||window.fetch.__noreyoV616)return;
    const prior=window.fetch.bind(window);
    const wrapped=async function(input,init){
      const target=isSearchTravel(input);
      try{
        const response=await prior(input,init);
        if(target&&guardActive&&response&&response.ok===false)releaseGuard('http-error');
        return response;
      }catch(error){
        if(target&&guardActive)releaseGuard('network-error');
        throw error;
      }
    };
    wrapped.__noreyoV616=true;
    window.fetch=wrapped;
  }catch(_){ }
}
function hasRenderedOffers(){
  const results=document.getElementById('results');
  return !!results?.querySelector?.('#offers .offer,.offer');
}
function installRenderHook(){
  try{
    if(typeof renderOffers!=='function'||renderOffers.__noreyoV616)return;
    const prior=renderOffers;
    const wrapped=function(){
      let result;
      try{result=prior.apply(this,arguments);}
      catch(error){releaseGuard('render-error');throw error;}
      const done=()=>{
        if(!guardActive)return;
        if(hasRenderedOffers()||terminalText(document.getElementById('results')?.textContent||''))releaseGuard('rendered');
      };
      const failed=()=>{releaseGuard('render-rejected');};
      if(result&&typeof result.then==='function')result.then(done,failed);
      else setTimeout(done,0);
      return result;
    };
    wrapped.__noreyoV616=true;
    renderOffers=wrapped;
  }catch(_){ }
}
function installNavigationHook(){
  try{
    if(typeof go!=='function'||go.__noreyoV616)return;
    const prior=go;
    const wrapped=function(view){
      const result=prior.apply(this,arguments);
      if(guardActive&&['favorites','trips','profile','discover'].includes(String(view||'')))releaseGuard('navigation-away');
      setTimeout(bind,0);
      return result;
    };
    wrapped.__noreyoV616=true;
    go=wrapped;
  }catch(_){ }
}
function install(){
  bind();installFetchHook();installRenderHook();installNavigationHook();
  window.addEventListener('click',onSearchCapture,true);
}
function cleanup(){
  releaseGuard('pagehide');
  clearTimeout(lockTimer);lockTimer=0;
  if(observer){observer.disconnect();observer=null;}
  if(raf){cancelAnimationFrame(raf);raf=0;}
  root=null;
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
window.addEventListener('pagehide',cleanup,{passive:true});
window.addEventListener('pageshow',()=>{installFetchHook();installRenderHook();installNavigationHook();bind();},{passive:true});
window.NOREYO_V607=Object.freeze({
  BUILD,currentMode,authoritativeMode,terminalText,isSearchTravel,hasRenderedOffers,releaseTerminalIfVisible,
  bind,startGuard,releaseGuard,get active(){return guardActive;}
});
})();