/* NOREYO V9.94 — flight offer expiry safety. */
(function(){
'use strict';
const BUILD='9.94',CHECK_MS=15000;
let observer=null,timer=0,raf=0;
function body(){return document.getElementById('plannerBody');}
function sheet(){return document.getElementById('plannerSheet');}
function isFlightOpen(){return !!sheet()?.classList?.contains('show')&&document.getElementById('plannerTitle')?.textContent?.trim()==='Flüge';}
function expired(value,now=Date.now()){if(!value)return false;const t=Date.parse(String(value));return Number.isFinite(t)&&t<=now;}
function clearExpiredSelection(now=Date.now()){const selected=window.NOREYO_SELECTED_FLIGHT;if(!selected||!expired(selected.expiration,now))return false;try{delete window.NOREYO_SELECTED_FLIGHT;}catch(_){window.NOREYO_SELECTED_FLIGHT=undefined;}return true;}
function sync(now=Date.now()){raf=0;const b=body();if(!b||!isFlightOpen())return false;let changed=clearExpiredSelection(now);const offers=Array.isArray(b.__noreyoV943Offers)?b.__noreyoV943Offers:[];b.querySelectorAll?.('.noreyo-v943-select').forEach(btn=>{const idx=Number(btn.dataset.flightOfferIndex),offer=offers[idx],isExpired=expired(offer?.expiration,now);if(isExpired){if(!btn.disabled){btn.disabled=true;changed=true;}if(btn.textContent!=='Angebot abgelaufen – neu suchen'){btn.textContent='Angebot abgelaufen – neu suchen';changed=true;}if(btn.getAttribute('aria-disabled')!=='true'){btn.setAttribute('aria-disabled','true');changed=true;}}});return changed;}
function schedule(){if(!raf)raf=requestAnimationFrame(()=>sync());}
function startTimer(){if(timer)return false;timer=setInterval(()=>{if(isFlightOpen())sync();},CHECK_MS);return true;}
function stopTimer(){if(!timer)return false;clearInterval(timer);timer=0;return true;}
function observe(){if(observer){observer.disconnect();observer=null;}const b=body();if(typeof MutationObserver==='undefined'||!b)return false;observer=new MutationObserver(schedule);observer.observe(b,{childList:true,subtree:true});schedule();startTimer();return true;}
function cleanup(){if(observer){observer.disconnect();observer=null;}if(raf){cancelAnimationFrame(raf);raf=0;}stopTimer();}
observe();window.addEventListener('pagehide',cleanup,{passive:true});window.addEventListener('pageshow',observe,{passive:true});window.NOREYO_V994=Object.freeze({BUILD,CHECK_MS,body,sheet,isFlightOpen,expired,clearExpiredSelection,sync,schedule,startTimer,stopTimer,observe,cleanup});
})();