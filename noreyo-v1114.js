/* NOREYO V11.14 — explicit hotel PREBOOK price-change acknowledgement.
   A changed final PREBOOK price must be acknowledged before a future BOOK step can
   treat this session as checkout-ready. No booking or payment is triggered here. */
(function(){
'use strict';
const BUILD='11.14';
let observer=null,raf=0;
function snap(){return window.NOREYO_HOTEL_PREBOOK||null;}
function model(){try{return window.NOREYO_V1112?.model?.()||null;}catch(_){return null;}}
function accepted(){return window.NOREYO_HOTEL_PREBOOK_ACCEPTED||null;}
function clearAccepted(){if(!accepted())return false;try{delete window.NOREYO_HOTEL_PREBOOK_ACCEPTED;}catch(_){window.NOREYO_HOTEL_PREBOOK_ACCEPTED=undefined;}return true;}
function isAccepted(){const s=snap(),a=accepted();return !!s&&!!a&&String(a.prebookId||'')===String(s.prebookId||'');}
function checkoutReady(){const s=snap(),m=model();if(!s||!window.NOREYO_V1106?.sameOffer?.())return false;return !m?.changed||isAccepted();}
function render(){raf=0;const status=document.querySelector('.noreyo-v1106-status'),s=snap(),m=model();if(!status||!s)return false;if(accepted()&&!isAccepted())clearAccepted();let box=status.querySelector('.noreyo-v1114-ack');if(!m?.changed){if(box){box.remove();return true;}return false;}if(!box){box=document.createElement('div');box.className='noreyo-v1114-ack';const p=document.createElement('p'),btn=document.createElement('button');p.textContent='Der Anbieter hat einen anderen finalen Preis bestätigt. Bitte bestätige die Änderung ausdrücklich, bevor es später zur Buchung weitergeht.';btn.type='button';btn.className='noreyo-v1114-confirm';btn.setAttribute('aria-label','Finale Hotelpreisänderung bestätigen');box.append(p,btn);status.appendChild(box);}const btn=box.querySelector('.noreyo-v1114-confirm');if(btn){btn.textContent=isAccepted()?'Preisänderung bestätigt ✓':'Preisänderung bestätigen';btn.disabled=isAccepted();btn.setAttribute('aria-pressed',isAccepted()?'true':'false');}return true;}
function schedule(){if(!raf)raf=requestAnimationFrame(render);}
function onClick(e){const btn=e.target?.closest?.('.noreyo-v1114-confirm');if(!btn)return;e.preventDefault();e.stopPropagation();const s=snap(),m=model();if(!s||!m?.changed)return;window.NOREYO_HOTEL_PREBOOK_ACCEPTED=Object.freeze({prebookId:String(s.prebookId),acceptedAt:new Date().toISOString()});render();}
function observe(){if(observer){observer.disconnect();observer=null;}if(typeof MutationObserver==='undefined'||!document.body)return false;observer=new MutationObserver(schedule);observer.observe(document.body,{subtree:true,childList:true,characterData:true});document.addEventListener('click',onClick,true);schedule();return true;}
function cleanup(){if(observer){observer.disconnect();observer=null;}document.removeEventListener('click',onClick,true);if(raf){cancelAnimationFrame(raf);raf=0;}}
observe();window.addEventListener('pagehide',cleanup,{passive:true});window.addEventListener('pageshow',observe,{passive:true});
window.NOREYO_V1114=Object.freeze({BUILD,snap,model,accepted,clearAccepted,isAccepted,checkoutReady,render,schedule,onClick,observe,cleanup});
})();