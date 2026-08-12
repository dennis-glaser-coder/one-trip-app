/* NOREYO V11.44 — authoritative checkout-readiness UI reconciliation.
   Later safety layers patch window.NOREYO_V1128.checkoutReady(), but V11.28's
   original render/model closures still call their older lexical functions. That can
   make the visible checkout status claim "ready" while the authoritative public
   gate correctly returns false. Reconcile the rendered status with the latest gate. */
(function(){
'use strict';
const BUILD='11.44';
let observer=null,raf=0;

function gate(){return window.NOREYO_V1128||null;}
function snap(){return window.NOREYO_HOTEL_PREBOOK||null;}
function authoritative(){
  const g=gate(),s=snap();
  if(!g||!s||!String(s.prebookId||'').trim())return{ready:false,reason:'missing-session'};
  let price=false,terms=false,kind='unknown',cancel=false,complete=true;
  try{price=!!g.priceReady?.();}catch(_){}
  try{terms=!!g.termsOwned?.();}catch(_){}
  try{kind=String(g.cancellationKind?.()||'unknown');}catch(_){}
  try{cancel=!!g.cancellationAccepted?.();}catch(_){}
  try{if(window.NOREYO_V1134?.isAccepted&&kind==='nonrefundable')cancel=!!window.NOREYO_V1134.isAccepted();}catch(_){}
  try{if(window.NOREYO_V1142?.complete)complete=!!window.NOREYO_V1142.complete();}catch(_){}
  let ready=false;
  try{ready=!!g.checkoutReady?.();}catch(_){}
  if(!complete)return{ready:false,price,terms,kind,cancel,complete,reason:'revalidation-incomplete'};
  if(!terms||kind==='unknown')return{ready:false,price,terms,kind,cancel,complete,reason:'terms'};
  if(!price)return{ready:false,price,terms,kind,cancel,complete,reason:'price'};
  if(kind==='nonrefundable'&&!cancel)return{ready:false,price,terms,kind,cancel,complete,reason:'cancel-ack'};
  return{ready,price,terms,kind,cancel,complete,reason:ready?'ready':'gate'};
}
function copy(model){
  if(model.reason==='revalidation-incomplete')return'Noch nicht buchungsbereit: Die Checkout-Session wurde noch nicht vollständig mit finalem Preis und finalen Stornierungsbedingungen revalidiert.';
  if(model.reason==='terms')return'Noch nicht buchungsbereit: Finale Stornierungsbedingungen sind nicht eindeutig bestätigt.';
  if(model.reason==='price')return'Noch nicht buchungsbereit: Eine finale Preisänderung muss zuerst bestätigt werden.';
  if(model.reason==='cancel-ack')return'Nicht stornierbarer Tarif: Bitte bestätige diese finalen Bedingungen ausdrücklich.';
  if(model.ready)return'Tarif ist für den nächsten sicheren Buchungsschritt vorbereitet. Es wurde weiterhin nichts gebucht oder bezahlt.';
  return'Noch nicht buchungsbereit: Bitte bestätige die aktuellen Tarifdaten erneut.';
}
function render(){
  raf=0;
  const box=document.querySelector('.noreyo-v1128-ready');
  if(!box||!snap())return false;
  const model=authoritative(),text=copy(model);
  let changed=false;
  let p=box.querySelector('p');
  if(!p){p=document.createElement('p');box.prepend(p);changed=true;}
  if(p.textContent!==text){p.textContent=text;changed=true;}
  const aria=model.ready?'true':'false';
  if(box.getAttribute('data-checkout-ready')!==aria){box.setAttribute('data-checkout-ready',aria);changed=true;}
  if(box.getAttribute('aria-live')!=='polite'){box.setAttribute('aria-live','polite');changed=true;}
  if(box.getAttribute('aria-atomic')!=='true'){box.setAttribute('aria-atomic','true');changed=true;}
  return changed;
}
function schedule(){if(!raf)raf=requestAnimationFrame(render);}
function install(){
  if(observer||typeof MutationObserver==='undefined'||!document.body)return false;
  observer=new MutationObserver(records=>{
    for(const r of records){
      const el=r.target?.nodeType===1?r.target:r.target?.parentElement;
      if(el?.closest?.('.noreyo-v1106-status,.noreyo-v1128-ready')){schedule();return;}
      for(const n of r.addedNodes||[]){
        if(n?.nodeType===1&&(n.matches?.('.noreyo-v1128-ready')||n.querySelector?.('.noreyo-v1128-ready'))){schedule();return;}
      }
    }
  });
  observer.observe(document.body,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['data-checkout-ready']});
  schedule();return true;
}
function cleanup(){if(observer){observer.disconnect();observer=null;}if(raf){cancelAnimationFrame(raf);raf=0;}}
install();
window.addEventListener('pagehide',cleanup,{passive:true});
window.addEventListener('pageshow',install,{passive:true});
window.NOREYO_V1144=Object.freeze({BUILD,gate,snap,authoritative,copy,render,schedule,install,cleanup});
})();