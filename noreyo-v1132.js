/* NOREYO V11.32 — final-price acknowledgement bound to exact PREBOOK price.
   The legacy acknowledgement only matched prebookId. If the provider returned a second
   price update inside the same PREBOOK session, an earlier acceptance could still count.
   Bind acceptance to prebookId + normalized price + currency and retire stale acceptances. */
(function(){
'use strict';
const BUILD='11.32';
let observer=null,raf=0,bound=false;

function snap(){return window.NOREYO_HOTEL_PREBOOK||null;}
function model(){try{return window.NOREYO_V1112?.model?.()||null;}catch(_){return null;}}
function accepted(){return window.NOREYO_HOTEL_PREBOOK_ACCEPTED||null;}
function finite(v){const n=Number(v);return Number.isFinite(n)&&n>=0?n:null;}
function cents(v){const n=finite(v);return n===null?null:Math.round(n*100);}
function currency(){return String(model()?.currency||snap()?.currency||'EUR').trim().toUpperCase().slice(0,3)||'EUR';}
function fingerprint(){
  const s=snap(),m=model();
  if(!s||!String(s.prebookId||'').trim())return null;
  const price=cents(m?.after??s.price);
  if(price===null)return null;
  return Object.freeze({prebookId:String(s.prebookId).trim(),priceCents:price,currency:currency()});
}
function sameFingerprint(a,b){
  return !!a&&!!b&&String(a.prebookId||'')===String(b.prebookId||'')&&Number(a.priceCents)===Number(b.priceCents)&&String(a.currency||'')===String(b.currency||'');
}
function clear(){
  if(!accepted())return false;
  try{delete window.NOREYO_HOTEL_PREBOOK_ACCEPTED;}catch(_){window.NOREYO_HOTEL_PREBOOK_ACCEPTED=undefined;}
  return true;
}
function isAccepted(){
  const a=accepted(),f=fingerprint();
  return !!a&&!!f&&sameFingerprint(a,f);
}
function sync(){
  raf=0;
  const a=accepted(),f=fingerprint();
  if(!a)return false;
  if(!f||!sameFingerprint(a,f))return clear();
  return false;
}
function onClick(e){
  const btn=e.target?.closest?.('.noreyo-v1114-confirm');
  if(!btn)return;
  const m=model(),f=fingerprint();
  if(!m?.changed||!f)return;
  setTimeout(()=>{
    window.NOREYO_HOTEL_PREBOOK_ACCEPTED=Object.freeze({...f,acceptedAt:new Date().toISOString()});
    try{window.NOREYO_V1114?.render?.();}catch(_){}
    schedule();
  },0);
}
function patchCheckout(){
  const prior=window.NOREYO_V1114;
  if(!prior||prior.__noreyoV1132)return false;
  const replacement=Object.freeze({...prior,__noreyoV1132:true,isAccepted,checkoutReady(){
    const s=snap(),m=model();
    if(!s||!window.NOREYO_V1106?.sameOffer?.())return false;
    return !m?.changed||isAccepted();
  }});
  window.NOREYO_V1114=replacement;
  return true;
}
function schedule(){if(!raf)raf=requestAnimationFrame(()=>{raf=0;sync();patchCheckout();});}
function install(){
  patchCheckout();
  if(bound)return false;
  bound=true;
  if(typeof MutationObserver!=='undefined'&&document.body){
    observer=new MutationObserver(schedule);
    observer.observe(document.body,{subtree:true,childList:true,characterData:true});
  }
  document.addEventListener('click',onClick,true);
  schedule();return true;
}
function cleanup(){
  if(observer){observer.disconnect();observer=null;}
  if(bound){document.removeEventListener('click',onClick,true);bound=false;}
  if(raf){cancelAnimationFrame(raf);raf=0;}
}
install();
window.addEventListener('pagehide',cleanup,{passive:true});
window.addEventListener('pageshow',install,{passive:true});
window.NOREYO_V1132=Object.freeze({BUILD,snap,model,accepted,finite,cents,currency,fingerprint,sameFingerprint,clear,isAccepted,sync,onClick,patchCheckout,schedule,install,cleanup});
})();