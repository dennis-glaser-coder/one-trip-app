/* NOREYO V10.94 — verified-flight expiry and explicit change acceptance.
   LiteAPI verify responses include an expiration and may include a changes block.
   A verified snapshot is checkout-ready only while unexpired and, when provider
   changes exist, after the user explicitly accepts the updated terms/price. */
(function(){
'use strict';
const BUILD='10.94';
let observer=null,raf=0,timer=0;

function selectedId(){return String(window.NOREYO_SELECTED_FLIGHT?.offerId||'').trim();}
function verified(){return window.NOREYO_VERIFIED_FLIGHT||null;}
function parseTime(v){
  if(v===null||v===undefined||v==='')return null;
  if(typeof v==='number'&&Number.isFinite(v)){
    const ms=v<1e12?v*1000:v;
    return Number.isFinite(ms)&&ms>0?ms:null;
  }
  const n=Number(v);
  if(String(v).trim()!==''&&Number.isFinite(n)){
    const ms=n<1e12?n*1000:n;
    if(ms>0)return ms;
  }
  const ms=Date.parse(String(v));
  return Number.isFinite(ms)?ms:null;
}
function expiration(payload){
  const candidates=[
    payload?.expiration,payload?.expiresAt,payload?.expires_at,
    payload?.data?.expiration,payload?.data?.expiresAt,payload?.data?.expires_at,
    payload?.offer?.expiration,payload?.offer?.expiresAt,payload?.offer?.expires_at,
    payload?.journey?.expiration,payload?.journey?.expiresAt,payload?.journey?.expires_at
  ];
  for(const c of candidates){const ms=parseTime(c);if(ms)return ms;}
  return null;
}
function accepted(snapshot=verified()){return !!snapshot?.__noreyoChangesAccepted;}
function hasChanges(snapshot=verified()){return !!snapshot?.changed;}
function expiresAt(snapshot=verified()){return expiration(snapshot?.payload||snapshot);}
function isExpired(snapshot=verified(),now=Date.now()){const exp=expiresAt(snapshot);return exp!==null&&exp<=now;}
function ready(snapshot=verified(),now=Date.now()){
  if(!snapshot||!selectedId()||String(snapshot.offerId||'')!==selectedId())return false;
  const exp=expiresAt(snapshot);
  if(exp===null||exp<=now)return false;
  if(hasChanges(snapshot)&&!accepted(snapshot))return false;
  return true;
}
function replaceVerified(patch){
  const v=verified();if(!v)return null;
  const next=Object.freeze({...v,...patch});
  window.NOREYO_VERIFIED_FLIGHT=next;
  return next;
}
function acceptChanges(){
  const v=verified();
  if(!v||!hasChanges(v)||isExpired(v))return false;
  replaceVerified({__noreyoChangesAccepted:true});
  schedule();return true;
}
function clearExpired(){
  const v=verified();
  if(!v||!isExpired(v))return false;
  try{delete window.NOREYO_VERIFIED_FLIGHT;}catch(_){window.NOREYO_VERIFIED_FLIGHT=undefined;}
  try{showToast?.('Die Flugverifizierung ist abgelaufen. Bitte erneut verifizieren.');}catch(_){}
  return true;
}
function root(){
  const b=document.getElementById('plannerBody');
  if(!b||!b.querySelector('.noreyo-v1084-verify'))return null;
  return b;
}
function formatExpiry(ms){
  if(!ms)return'';
  try{return new Intl.DateTimeFormat('de-DE',{hour:'2-digit',minute:'2-digit'}).format(new Date(ms));}
  catch(_){return'';}
}
function sync(){
  raf=0;
  const b=root(),v=verified();
  if(!b)return false;
  let changed=false;
  if(v&&isExpired(v)){
    clearExpired();
    const state=b.querySelector('.noreyo-v1084-verify-state');
    if(state){
      const expiredHTML='<b>Verifizierung abgelaufen</b><p>Flugpreise ändern sich schnell. Bitte prüfe dieses Angebot unmittelbar vor dem nächsten Buchungsschritt erneut.</p>';
      if(state.innerHTML!==expiredHTML){state.innerHTML=expiredHTML;changed=true;}
    }
  }
  const snap=verified();
  let gate=b.querySelector('.noreyo-v1094-gate');
  if(!snap){
    if(gate){gate.remove();changed=true;}
    armTimer(null);return changed;
  }
  if(!gate){
    gate=document.createElement('div');
    gate.className='backend-note noreyo-v1094-gate';
    const back=b.querySelector('.noreyo-v943-back');
    b.insertBefore(gate,back||null);changed=true;
  }
  const exp=expiresAt(snap),expText=formatExpiry(exp);
  const nextHTML=hasChanges(snap)&&!accepted(snap)
    ?'<b>Aktualisierte Flugdetails bestätigen</b><p>Der Provider meldet Änderungen seit der Suche. Prüfe den aktualisierten Preis und bestätige ihn ausdrücklich, bevor NOREYO den nächsten Buchungsschritt freigibt.</p><button type="button" class="small-action noreyo-v1094-accept">Änderungen bestätigen</button>'
    :`<b>${ready(snap)?'Live-Verifizierung bereit':'Erneute Verifizierung erforderlich'}</b><p>${expText?`Dieses Verify-Ergebnis gilt laut Provider bis ${expText} Uhr.`:'Der Provider hat keine belastbare Ablaufzeit übermittelt; vor Prebook muss erneut live verifiziert werden.'}</p>`;
  if(gate.innerHTML!==nextHTML){gate.innerHTML=nextHTML;changed=true;}
  armTimer(exp);
  return changed;
}
function armTimer(exp){
  if(timer){clearTimeout(timer);timer=0;}
  if(!exp)return;
  const delay=Math.max(0,Math.min(exp-Date.now()+25,2147483000));
  timer=setTimeout(()=>{timer=0;schedule();},delay);
}
function onClick(e){
  if(e.target?.closest?.('.noreyo-v1094-accept')){
    e.preventDefault();e.stopPropagation();
    if(acceptChanges())try{showToast?.('Aktualisierte Flugdetails bestätigt');}catch(_){}
  }
  if(e.target?.closest?.('.noreyo-v1084-verify'))setTimeout(schedule,0);
}
function schedule(){if(!raf)raf=requestAnimationFrame(sync);}
function observe(){
  if(observer){observer.disconnect();observer=null;}
  if(typeof MutationObserver==='undefined'||!document.body)return false;
  observer=new MutationObserver(schedule);
  observer.observe(document.body,{subtree:true,childList:true,characterData:true});
  document.addEventListener('click',onClick,true);
  schedule();return true;
}
function cleanup(){
  if(observer){observer.disconnect();observer=null;}
  document.removeEventListener('click',onClick,true);
  if(raf){cancelAnimationFrame(raf);raf=0;}
  if(timer){clearTimeout(timer);timer=0;}
}
observe();
window.addEventListener('pagehide',cleanup,{passive:true});
window.addEventListener('pageshow',observe,{passive:true});
window.NOREYO_V1094=Object.freeze({BUILD,selectedId,verified,parseTime,expiration,accepted,hasChanges,expiresAt,isExpired,ready,replaceVerified,acceptChanges,clearExpired,root,formatExpiry,sync,armTimer,onClick,schedule,observe,cleanup});
})();