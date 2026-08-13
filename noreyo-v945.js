/* NOREYO V9.45 — expired flight offer safety.
   Search offers can expire within minutes. Disable stale selectable offers and
   provide a direct re-search action before the user reaches Verify. */
(()=>{
'use strict';
const BUILD='9.45',CHECK_MS=30000;
let observer=null,timer=0,raf=0;
function expiryMs(v){if(!v)return null;const n=Date.parse(String(v));return Number.isFinite(n)?n:null}
function expired(offer,now=Date.now()){const ms=expiryMs(offer?.expiration);return ms!==null&&ms<=now}
function cardIndex(card){const n=Number(card?.dataset?.flightOfferIndex);return Number.isInteger(n)&&n>=0?n:null}
function applyCard(card,offers,now=Date.now()){
  const idx=cardIndex(card);if(idx===null)return false;
  const offer=offers?.[idx],button=card.querySelector('.noreyo-v943-select');if(!offer||!button)return false;
  const isExpired=expired(offer,now),was=button.dataset.noreyoExpired==='1';
  if(isExpired){button.dataset.noreyoExpired='1';button.disabled=true;button.setAttribute('aria-disabled','true');button.textContent='Angebot abgelaufen · neu suchen';card.classList.add('noreyo-v945-expired');}
  else if(was){delete button.dataset.noreyoExpired;button.disabled=false;button.removeAttribute('aria-disabled');button.textContent='Angebot auswählen';card.classList.remove('noreyo-v945-expired');}
  return isExpired!==was;
}
function scan(now=Date.now()){
  raf=0;const body=document.getElementById('plannerBody');if(!body)return false;
  const offers=body.__noreyoV943Offers;if(!Array.isArray(offers))return false;
  let changed=false;body.querySelectorAll('.noreyo-v943-offer').forEach(card=>{changed=applyCard(card,offers,now)||changed});return changed;
}
function schedule(){if(raf)return;raf=requestAnimationFrame(()=>scan())}
function onClick(e){const button=e.target?.closest?.('.noreyo-v943-select[data-noreyo-expired="1"]');if(!button)return;e.preventDefault();e.stopImmediatePropagation();try{window.NOREYO_V943?.search?.()}catch(_){}}
function observe(){if(observer){observer.disconnect();observer=null}if(typeof MutationObserver==='undefined'||!document.body)return false;observer=new MutationObserver(schedule);observer.observe(document.body,{subtree:true,childList:true});schedule();if(timer)clearInterval(timer);timer=setInterval(schedule,CHECK_MS);return true}
function cleanup(){if(observer){observer.disconnect();observer=null}if(timer){clearInterval(timer);timer=0}if(raf){cancelAnimationFrame(raf);raf=0}}
document.addEventListener('click',onClick,true);observe();window.addEventListener('pagehide',cleanup,{passive:true});window.addEventListener('pageshow',observe,{passive:true});
window.NOREYO_V945=Object.freeze({BUILD,CHECK_MS,expiryMs,expired,cardIndex,applyCard,scan,schedule,observe,cleanup});
})();