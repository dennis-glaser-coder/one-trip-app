/* NOREYO V6.56 — authoritative search completion/network lifecycle guard.
   Active package/hotel requests never unlock solely because of the UI timer;
   stalled search-travel calls are aborted while preserving caller abort signals. */
(function(){
'use strict';
const BUILD='6.56';
const REQUEST_TIMEOUT_MS=30000;
let observer=null,root=null,raf=0;
let guardActive=false,guardButton=null,buttonObserver=null,guardTimer=0,lockTimer=0;
let networkSuccess=false,networkFailures=0,renderSequence=0,guardRenderSequence=0,targetRequests=0;
let resultSequence=0,guardResultSequence=0;

function norm(v){return String(v||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/ß/g,'ss').replace(/\s+/g,' ').trim();}
function terminalText(text){
  const t=norm(text);
  return /keine (?:angebote|hotels|fluge|reisen|ergebnisse)|nichts gefunden|suche fehlgeschlagen|fehler bei der suche|erneut versuchen|keine vollstandige ubereinstimmung|keine verfugbarkeit gefunden|keine verfugbarkeit fur diesen zeitraum|fur diese reisedaten aktuell kein bestatigtes angebot|aktive filter ohne treffer|aktuelle auswahl ohne vollstandigen treffer|aktuell keine bestatigte .*rate|in den aktuellen daten nicht bestatigt/.test(t);
}
function releaseLegacyBusy(){try{const api=window.NOREYO_V585;if(api?.busy){api.releaseBusy?.();return true;}}catch(_){ }return false;}
function currentMode(){
  const active=document.querySelector('.view.active .product-mode.on')||document.querySelector('#discover .product-mode.on');
  const t=norm(active?.textContent||'');
  if(t.includes('flug'))return'flight';if(t.includes('kreuzfahrt'))return'cruise';if(t.includes('hotel'))return'hotel';
  try{if(typeof productMode==='string'&&productMode)return productMode;}catch(_){ }
  return'package';
}
function authoritativeMode(){const m=currentMode();return m==='package'||m==='hotel';}
function isSearchButton(target){if(!(target instanceof Element))return null;return target.closest('.noreyo-v541-booking-cta,.liveSearchButton,#searchView .search-card .primary');}
function enforceButtonLock(){if(!guardActive||!guardButton)return;if(!guardButton.disabled)guardButton.disabled=true;if(guardButton.getAttribute('aria-disabled')!=='true')guardButton.setAttribute('aria-disabled','true');}
function bindButtonObserver(){if(buttonObserver){buttonObserver.disconnect();buttonObserver=null;}if(!guardButton||typeof MutationObserver==='undefined')return;buttonObserver=new MutationObserver(enforceButtonLock);buttonObserver.observe(guardButton,{attributes:true,attributeFilter:['disabled','aria-disabled']});}
function scheduleButtonLock(btn){clearTimeout(lockTimer);lockTimer=setTimeout(()=>{lockTimer=0;if(guardActive&&guardButton===btn)enforceButtonLock();},0);}
function resetCompletionState(){networkSuccess=false;networkFailures=0;targetRequests=0;guardRenderSequence=renderSequence;guardResultSequence=resultSequence;}
function onGuardTimeout(){guardTimer=0;if(!guardActive)return;if(targetRequests>0){guardTimer=setTimeout(onGuardTimeout,5000);return;}releaseGuard('timeout-idle');}
function startGuard(btn){if(guardActive)return false;guardActive=true;guardButton=btn||null;resetCompletionState();bindButtonObserver();scheduleButtonLock(guardButton);clearTimeout(guardTimer);guardTimer=setTimeout(onGuardTimeout,16000);return true;}
function releaseGuard(reason){
  if(!guardActive){releaseLegacyBusy();return false;}
  guardActive=false;clearTimeout(lockTimer);lockTimer=0;clearTimeout(guardTimer);guardTimer=0;
  if(buttonObserver){buttonObserver.disconnect();buttonObserver=null;}if(guardButton){guardButton.disabled=false;guardButton.removeAttribute('aria-disabled');}
  guardButton=null;networkSuccess=false;networkFailures=0;targetRequests=0;guardRenderSequence=renderSequence;guardResultSequence=resultSequence;releaseLegacyBusy();return true;
}
function onSearchCapture(e){const btn=isSearchButton(e.target);if(!btn||!authoritativeMode())return;if(guardActive){e.preventDefault();e.stopImmediatePropagation();enforceButtonLock();return;}startGuard(btn);}
function terminalCompletionReady(){if(!guardActive||!networkSuccess||targetRequests>0)return false;if(resultSequence<=guardResultSequence)return false;const results=document.getElementById('results');return !!results&&terminalText(results.textContent||'');}
function releaseTerminalIfVisible(){raf=0;if(!terminalCompletionReady())return false;return releaseGuard('terminal-after-network');}
function scheduleTerminal(){if(raf)return;raf=requestAnimationFrame(releaseTerminalIfVisible);}
function bind(){const next=document.getElementById('results');if(next===root&&observer)return;if(observer){observer.disconnect();observer=null;}root=next;if(!root||typeof MutationObserver==='undefined')return;observer=new MutationObserver(records=>{if(records?.length)resultSequence++;scheduleTerminal();});observer.observe(root,{childList:true,subtree:true,characterData:true});}
function isSearchTravel(input){const url=typeof input==='string'?input:String(input?.url||'');return url.includes('/functions/v1/search-travel');}
function hasRenderedOffers(){const results=document.getElementById('results');return !!results?.querySelector?.('#offers .offer,.offer');}
function completionReady(){if(!guardActive||!networkSuccess||targetRequests>0)return false;if(renderSequence<=guardRenderSequence)return false;return hasRenderedOffers();}
function completeAfterNetwork(){if(!guardActive||targetRequests>0)return false;if(networkSuccess){if(completionReady())return releaseGuard('rendered-after-network');scheduleTerminal();return false;}if(networkFailures>0)return releaseGuard('all-network-requests-failed');return false;}
function requestSignal(input,init){
  if(init?.signal)return init.signal;
  try{if(typeof Request!=='undefined'&&input instanceof Request)return input.signal||null;}catch(_){ }
  return null;
}
function timedRequestInit(input,init){
  if(typeof AbortController==='undefined')return {init,cleanup(){}};
  const controller=new AbortController(),upstream=requestSignal(input,init);let upstreamAbort=null;
  if(upstream){
    if(upstream.aborted)controller.abort(upstream.reason);
    else{upstreamAbort=()=>controller.abort(upstream.reason);upstream.addEventListener?.('abort',upstreamAbort,{once:true});}
  }
  const timer=setTimeout(()=>{if(!controller.signal.aborted)controller.abort();},REQUEST_TIMEOUT_MS);
  return {init:{...(init||{}),signal:controller.signal},cleanup(){clearTimeout(timer);if(upstream&&upstreamAbort)upstream.removeEventListener?.('abort',upstreamAbort);}};
}
function installFetchHook(){
  try{
    if(typeof window.fetch!=='function'||window.fetch.__noreyoV656)return;
    const prior=window.fetch.bind(window);
    const wrapped=async function(input,init){
      const target=isSearchTravel(input)&&guardActive;let timed=null,requestInit=init;
      if(target){targetRequests++;timed=timedRequestInit(input,init);requestInit=timed.init;}
      try{
        const response=await prior(input,requestInit);
        if(target&&guardActive){targetRequests=Math.max(0,targetRequests-1);if(response?.ok===true)networkSuccess=true;else networkFailures++;completeAfterNetwork();}
        return response;
      }catch(error){
        if(target&&guardActive){targetRequests=Math.max(0,targetRequests-1);networkFailures++;completeAfterNetwork();}
        throw error;
      }finally{timed?.cleanup?.();}
    };
    wrapped.__noreyoV656=true;window.fetch=wrapped;
  }catch(_){ }
}
function installRenderHook(){
  try{
    if(typeof renderOffers!=='function'||renderOffers.__noreyoV656)return;
    const prior=renderOffers;
    const wrapped=function(){let result;try{result=prior.apply(this,arguments);}catch(error){releaseGuard('render-error');throw error;}const done=()=>{renderSequence++;completeAfterNetwork();};const failed=()=>{releaseGuard('render-rejected');};if(result&&typeof result.then==='function')result.then(done,failed);else setTimeout(done,0);return result;};
    wrapped.__noreyoV656=true;renderOffers=wrapped;
  }catch(_){ }
}
function installNavigationHook(){
  try{
    if(typeof go!=='function'||go.__noreyoV656)return;
    const prior=go;
    const wrapped=function(view){const result=prior.apply(this,arguments);if(guardActive&&['favorites','trips','profile','discover'].includes(String(view||'')))releaseGuard('navigation-away');setTimeout(bind,0);return result;};
    wrapped.__noreyoV656=true;go=wrapped;
  }catch(_){ }
}
function install(){bind();installFetchHook();installRenderHook();installNavigationHook();if(!window.__noreyoV656SearchCapture){window.__noreyoV656SearchCapture=true;window.addEventListener('click',onSearchCapture,true);}}
function cleanup(){releaseGuard('pagehide');clearTimeout(lockTimer);lockTimer=0;if(observer){observer.disconnect();observer=null;}if(raf){cancelAnimationFrame(raf);raf=0;}root=null;}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
window.addEventListener('pagehide',cleanup,{passive:true});
window.addEventListener('pageshow',()=>{installFetchHook();installRenderHook();installNavigationHook();bind();},{passive:true});
window.NOREYO_V607=Object.freeze({
  BUILD,REQUEST_TIMEOUT_MS,currentMode,authoritativeMode,terminalText,isSearchTravel,hasRenderedOffers,completionReady,terminalCompletionReady,
  releaseTerminalIfVisible,completeAfterNetwork,requestSignal,timedRequestInit,bind,startGuard,releaseGuard,onGuardTimeout,
  get active(){return guardActive;},get networkSuccess(){return networkSuccess;},get networkFailures(){return networkFailures;},get targetRequests(){return targetRequests;},get resultSequence(){return resultSequence;}
});
})();