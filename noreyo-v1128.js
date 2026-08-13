/* NOREYO V11.28 — final hotel checkout-readiness gate.
   A future BOOK step may proceed only when the current PREBOOK session is still
   valid, any final price change is acknowledged, final cancellation terms belong
   to the same prebookId and are unambiguous, and a non-refundable tariff has been
   explicitly acknowledged. No booking/payment is triggered here. */
(function(){
'use strict';
const BUILD='11.28';
let observer=null,raf=0,bound=false;
function snap(){return window.NOREYO_HOTEL_PREBOOK||null;}
function terms(){return window.NOREYO_HOTEL_PREBOOK_TERMS||null;}
function cancelAccepted(){return window.NOREYO_HOTEL_CANCEL_ACCEPTED||null;}
function clearCancelAccepted(){if(!cancelAccepted())return false;try{delete window.NOREYO_HOTEL_CANCEL_ACCEPTED;}catch(_){window.NOREYO_HOTEL_CANCEL_ACCEPTED=undefined;}return true;}
function termsOwned(){
  const s=snap(),t=terms();if(!s||!t)return false;
  try{if(window.NOREYO_V1120?.owned)return !!window.NOREYO_V1120.owned(t,s);}catch(_){}
  return String(t.offerId||'')===String(s.offerId||'')&&String(t.prebookId||'')!==''&&String(t.prebookId||'')===String(s.prebookId||'');
}
function priceReady(){
  try{return !!window.NOREYO_V1114?.checkoutReady?.();}catch(_){return false;}
}
function cancellationKind(){return termsOwned()?String(terms()?.summary?.kind||'unknown'):'unknown';}
function cancellationAccepted(){const s=snap(),a=cancelAccepted();return !!s&&!!a&&String(a.prebookId||'')!==''&&String(a.prebookId||'')===String(s.prebookId||'');}
function checkoutReady(){
  const s=snap();if(!s||!String(s.prebookId||'').trim())return false;
  if(!priceReady()||!termsOwned())return false;
  const kind=cancellationKind();
  if(kind==='unknown')return false;
  if(kind==='nonrefundable'&&!cancellationAccepted())return false;
  return kind==='refundable'||kind==='nonrefundable';
}
function model(){return{prebook:!!snap(),priceReady:priceReady(),termsOwned:termsOwned(),kind:cancellationKind(),cancellationAccepted:cancellationAccepted(),ready:checkoutReady()};}
function render(){
  raf=0;
  const status=document.querySelector('.noreyo-v1106-status'),s=snap();if(!status||!s)return false;
  if(cancelAccepted()&&!cancellationAccepted())clearCancelAccepted();
  const m=model();let changed=false;
  let box=status.querySelector('.noreyo-v1128-ready');
  if(!box){box=document.createElement('div');box.className='noreyo-v1128-ready';status.appendChild(box);changed=true;}
  let text='';
  if(!m.termsOwned||m.kind==='unknown')text='Noch nicht buchungsbereit: Finale Stornierungsbedingungen sind nicht eindeutig bestätigt.';
  else if(!m.priceReady)text='Noch nicht buchungsbereit: Eine finale Preisänderung muss zuerst bestätigt werden.';
  else if(m.kind==='nonrefundable'&&!m.cancellationAccepted)text='Nicht stornierbarer Tarif: Bitte bestätige diese finale Bedingung ausdrücklich.';
  else text='Tarif ist für den nächsten sicheren Buchungsschritt vorbereitet. Es wurde weiterhin nichts gebucht oder bezahlt.';
  let p=box.querySelector('p');if(!p){p=document.createElement('p');box.appendChild(p);changed=true;}if(p.textContent!==text){p.textContent=text;changed=true;}
  let btn=box.querySelector('.noreyo-v1128-cancel-ack');
  if(m.kind==='nonrefundable'&&!m.cancellationAccepted){
    if(!btn){btn=document.createElement('button');btn.type='button';btn.className='noreyo-v1128-cancel-ack';btn.setAttribute('aria-label','Nicht stornierbare Tarifbedingung bestätigen');box.appendChild(btn);changed=true;}
    if(btn.textContent!=='Nicht stornierbare Bedingung bestätigen'){btn.textContent='Nicht stornierbare Bedingung bestätigen';changed=true;}
  }else if(btn){btn.remove();changed=true;}
  box.setAttribute('data-checkout-ready',m.ready?'true':'false');
  return changed;
}
function onClick(e){const btn=e.target?.closest?.('.noreyo-v1128-cancel-ack');if(!btn)return;e.preventDefault();e.stopPropagation();const s=snap();if(!s||cancellationKind()!=='nonrefundable')return;window.NOREYO_HOTEL_CANCEL_ACCEPTED=Object.freeze({prebookId:String(s.prebookId),acceptedAt:new Date().toISOString()});render();}
function schedule(){if(!raf)raf=requestAnimationFrame(render);}
function install(){if(bound)return false;bound=true;if(typeof MutationObserver!=='undefined'&&document.body){observer=new MutationObserver(schedule);observer.observe(document.body,{subtree:true,childList:true,characterData:true});}document.addEventListener('click',onClick,true);schedule();return true;}
function cleanup(){if(observer){observer.disconnect();observer=null;}if(bound){document.removeEventListener('click',onClick,true);bound=false;}if(raf){cancelAnimationFrame(raf);raf=0;}}
install();window.addEventListener('pagehide',cleanup,{passive:true});window.addEventListener('pageshow',install,{passive:true});
window.NOREYO_V1128=Object.freeze({BUILD,snap,terms,cancelAccepted,clearCancelAccepted,termsOwned,priceReady,cancellationKind,cancellationAccepted,checkoutReady,model,render,onClick,schedule,install,cleanup});
})();