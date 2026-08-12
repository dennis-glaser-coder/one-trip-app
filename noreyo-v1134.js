/* NOREYO V11.34 — non-refundable acknowledgement bound to exact final terms.
   A cancellation acknowledgement must not survive a mutation of the final PREBOOK
   cancellation policy within the same prebookId. Bind it to prebookId + canonical
   policy fingerprint; stale acknowledgements are retired immediately. */
(function(){
'use strict';
const BUILD='11.34';
let observer=null,raf=0,bound=false;
function snap(){return window.NOREYO_HOTEL_PREBOOK||null;}
function terms(){return window.NOREYO_HOTEL_PREBOOK_TERMS||null;}
function accepted(){return window.NOREYO_HOTEL_CANCEL_ACCEPTED||null;}
function normalizeRow(r){return{amount:Number.isFinite(Number(r?.amount))?Number(r.amount):String(r?.amount??''),cancelTime:String(r?.cancelTime||'').trim()};}
function normalizePolicy(p){return{refundableTag:String(p?.refundableTag||'').trim().toUpperCase(),cancelPolicyInfos:Array.isArray(p?.cancelPolicyInfos)?p.cancelPolicyInfos.map(normalizeRow):null};}
function fingerprint(){
  const s=snap(),t=terms();
  if(!s||!t||!String(s.prebookId||'').trim())return null;
  const policies=Array.isArray(t.policies)?t.policies.map(normalizePolicy):null;
  if(!policies)return null;
  return Object.freeze({prebookId:String(s.prebookId).trim(),offerId:String(s.offerId||'').trim(),kind:String(t.summary?.kind||'unknown'),policies:JSON.stringify(policies)});
}
function same(a,b){return !!a&&!!b&&String(a.prebookId||'')===String(b.prebookId||'')&&String(a.offerId||'')===String(b.offerId||'')&&String(a.kind||'')===String(b.kind||'')&&String(a.policies||'')===String(b.policies||'');}
function clear(){if(!accepted())return false;try{delete window.NOREYO_HOTEL_CANCEL_ACCEPTED;}catch(_){window.NOREYO_HOTEL_CANCEL_ACCEPTED=undefined;}return true;}
function isAccepted(){return same(accepted(),fingerprint());}
function sync(){raf=0;const a=accepted(),f=fingerprint();if(a&&(!f||!same(a,f)))return clear();return false;}
function patchGate(){
  const prior=window.NOREYO_V1128;
  if(!prior||prior.__noreyoV1134)return false;
  window.NOREYO_V1128=Object.freeze({...prior,__noreyoV1134:true,cancellationAccepted:isAccepted,checkoutReady(){
    const s=snap();if(!s||!String(s.prebookId||'').trim())return false;
    if(!prior.priceReady?.()||!prior.termsOwned?.())return false;
    const kind=prior.cancellationKind?.()||'unknown';
    if(kind==='unknown')return false;
    if(kind==='nonrefundable'&&!isAccepted())return false;
    return kind==='refundable'||kind==='nonrefundable';
  }});
  return true;
}
function onClick(e){
  const btn=e.target?.closest?.('.noreyo-v1128-cancel-ack');if(!btn)return;
  const f=fingerprint();if(!f||f.kind!=='nonrefundable')return;
  setTimeout(()=>{window.NOREYO_HOTEL_CANCEL_ACCEPTED=Object.freeze({...f,acceptedAt:new Date().toISOString()});schedule();try{window.NOREYO_V1128?.render?.();}catch(_){}},0);
}
function schedule(){if(!raf)raf=requestAnimationFrame(()=>{raf=0;sync();patchGate();});}
function install(){patchGate();if(bound)return false;bound=true;if(typeof MutationObserver!=='undefined'&&document.body){observer=new MutationObserver(schedule);observer.observe(document.body,{subtree:true,childList:true,characterData:true});}document.addEventListener('click',onClick,true);schedule();return true;}
function cleanup(){if(observer){observer.disconnect();observer=null;}if(bound){document.removeEventListener('click',onClick,true);bound=false;}if(raf){cancelAnimationFrame(raf);raf=0;}}
install();window.addEventListener('pagehide',cleanup,{passive:true});window.addEventListener('pageshow',install,{passive:true});
window.NOREYO_V1134=Object.freeze({BUILD,snap,terms,accepted,normalizeRow,normalizePolicy,fingerprint,same,clear,isAccepted,sync,patchGate,onClick,schedule,install,cleanup});
})();