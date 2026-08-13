/* NOREYO V11.24 — PREBOOK request-context race guard.
   V11.06 deduplicates an in-flight hotel PREBOOK by offerId. Capture the exact
   search occupancy/date context at request start and reject/retire a success when
   that context changes before the PREBOOK session is committed. */
(function(){
'use strict';
const BUILD='11.24';
let installed=false,priorFetch=null,observer=null,raf=0,lastRequest=null;
function inputUrl(input){if(typeof input==='string')return input;try{if(typeof Request!=='undefined'&&input instanceof Request)return input.url||'';}catch(_){}return String(input?.url||'');}
function isPrebook(input){return inputUrl(input).includes('/functions/v1/hotel-prebook');}
function context(){
  let s={};try{s=typeof searchState!=='undefined'&&searchState?searchState:{};}catch(_){}
  return{checkin:String(s.checkin||''),checkout:String(s.checkout||''),adults:Number(s.adults)||1,childAges:Array.isArray(s.childAges)?s.childAges.map(Number):[]};
}
function same(a,b){return !!a&&!!b&&a.checkin===b.checkin&&a.checkout===b.checkout&&a.adults===b.adults&&JSON.stringify(a.childAges||[])===JSON.stringify(b.childAges||[]);}
function requestOfferId(input,init){
  try{if(typeof init?.body==='string')return String(JSON.parse(init.body)?.offerId||'').trim();}catch(_){}
  return'';
}
function staleResponse(){return new Response(JSON.stringify({error:{code:'PREBOOK_CONTEXT_CHANGED',message:'Zeitraum oder Reisende haben sich während der Tarifprüfung geändert. Bitte den Tarif erneut prüfen.'}}),{status:409,headers:{'content-type':'application/json','x-noreyo-prebook-context':'stale'}});}
function remember(offerId,ctx){lastRequest=Object.freeze({offerId:String(offerId||''),context:Object.freeze({...ctx,childAges:Object.freeze([...(ctx.childAges||[])])}),startedAt:new Date().toISOString()});return lastRequest;}
function install(){
  if(installed||typeof window.fetch!=='function'||window.fetch.__noreyoV1124)return false;
  priorFetch=window.fetch.bind(window);
  const wrapped=async function(input,init){
    if(!isPrebook(input))return priorFetch(input,init);
    const id=requestOfferId(input,init),start=context();remember(id,start);
    const response=await priorFetch(input,init);
    if(response?.ok&&!same(start,context()))return staleResponse();
    return response;
  };
  wrapped.__noreyoV1124=true;wrapped.__noreyoV1124Prior=priorFetch;window.fetch=wrapped;installed=true;return true;
}
function snap(){return window.NOREYO_HOTEL_PREBOOK||null;}
function clearCheckoutState(){
  let changed=false;
  try{changed=!!window.NOREYO_V1106?.clear?.()||changed;}catch(_){}
  try{if(window.NOREYO_HOTEL_PREBOOK_TERMS){delete window.NOREYO_HOTEL_PREBOOK_TERMS;changed=true;}}catch(_){window.NOREYO_HOTEL_PREBOOK_TERMS=undefined;changed=true;}
  try{if(window.NOREYO_HOTEL_PREBOOK_ACCEPTED){delete window.NOREYO_HOTEL_PREBOOK_ACCEPTED;changed=true;}}catch(_){window.NOREYO_HOTEL_PREBOOK_ACCEPTED=undefined;changed=true;}
  return changed;
}
function sync(){
  raf=0;
  const s=snap(),r=lastRequest;if(!s||!r)return false;
  if(String(s.offerId||'').trim()!==r.offerId)return false;
  if(!same(s.context,r.context))return clearCheckoutState();
  return false;
}
function schedule(){if(!raf)raf=requestAnimationFrame(sync);}
function observe(){if(observer){observer.disconnect();observer=null;}if(typeof MutationObserver==='undefined'||!document.body)return false;observer=new MutationObserver(schedule);observer.observe(document.body,{subtree:true,childList:true,characterData:true});schedule();return true;}
function cleanup(){if(observer){observer.disconnect();observer=null;}if(raf){cancelAnimationFrame(raf);raf=0;}if(installed&&window.fetch?.__noreyoV1124&&priorFetch)window.fetch=priorFetch;installed=false;priorFetch=null;lastRequest=null;}
install();observe();window.addEventListener('pagehide',cleanup,{passive:true});window.addEventListener('pageshow',()=>{install();observe();},{passive:true});
window.NOREYO_V1124=Object.freeze({BUILD,inputUrl,isPrebook,context,same,requestOfferId,staleResponse,remember,install,snap,clearCheckoutState,sync,schedule,observe,cleanup});
})();