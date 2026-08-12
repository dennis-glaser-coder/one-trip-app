/* NOREYO V11.20 — PREBOOK terms lifecycle ownership.
   Final cancellation terms belong to one concrete prebook session, not merely to
   an offerId. Clear stale terms whenever the hotel PREBOOK session is cleared or
   replaced, and bind captured terms to both offerId and prebookId when available. */
(function(){
'use strict';
const BUILD='11.20';
let observer=null,raf=0;
function snap(){return window.NOREYO_HOTEL_PREBOOK||null;}
function terms(){return window.NOREYO_HOTEL_PREBOOK_TERMS||null;}
function clear(){
  if(!terms())return false;
  try{delete window.NOREYO_HOTEL_PREBOOK_TERMS;}catch(_){window.NOREYO_HOTEL_PREBOOK_TERMS=undefined;}
  return true;
}
function prebookId(){return String(snap()?.prebookId||'').trim();}
function offerId(){return String(snap()?.offerId||'').trim();}
function owned(term=terms(),session=snap()){
  if(!term||!session)return false;
  if(String(term.offerId||'').trim()!==String(session.offerId||'').trim())return false;
  const termPid=String(term.prebookId||'').trim(),pid=String(session.prebookId||'').trim();
  return !termPid||!pid?false:termPid===pid;
}
function sync(){
  raf=0;
  const session=snap(),term=terms();
  if(term&&(!session||!owned(term,session)))return clear();
  return false;
}
function upgradeCapturedTerms(){
  const session=snap(),term=terms();
  if(!session||!term)return false;
  const pid=String(session.prebookId||'').trim();
  if(!pid||String(term.offerId||'').trim()!==String(session.offerId||'').trim())return false;
  if(String(term.prebookId||'').trim()===pid)return false;
  const next=Object.freeze({...term,prebookId:pid});
  window.NOREYO_HOTEL_PREBOOK_TERMS=next;
  return true;
}
function schedule(){if(!raf)raf=requestAnimationFrame(()=>{raf=0;upgradeCapturedTerms();sync();});}
function install(){
  if(observer||typeof MutationObserver==='undefined'||!document.body)return false;
  observer=new MutationObserver(schedule);
  observer.observe(document.body,{subtree:true,childList:true,characterData:true});
  schedule();return true;
}
function cleanup(){
  if(observer){observer.disconnect();observer=null;}
  if(raf){cancelAnimationFrame(raf);raf=0;}
}
install();
window.addEventListener('pagehide',cleanup,{passive:true});
window.addEventListener('pageshow',install,{passive:true});
window.NOREYO_V1120=Object.freeze({BUILD,snap,terms,clear,prebookId,offerId,owned,sync,upgradeCapturedTerms,schedule,install,cleanup});
})();