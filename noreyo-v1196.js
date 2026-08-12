/* NOREYO V11.96 — local checkout state bound to authenticated user identity.
   Server-issued PREBOOK ownership is already enforced server-side. Also bind the
   local sensitive checkout state to the authenticated user id so an account switch
   retires old PREBOOK/draft state before the next status request. */
(function(){
'use strict';
const BUILD='11.96';
const PREBOOK='/functions/v1/hotel-prebook';
let ownerUserId='',installed=false,priorFetch=null,observer=null,raf=0;

function authIdentity(){
  try{
    const a=window.NOREYO_V1178;
    const id=a?.identity?.();
    return id?.userId?String(id.userId):'';
  }catch(_){return'';}
}
function hasSensitive(){
  try{return !!window.NOREYO_HOTEL_PREBOOK||!!window.NOREYO_HOTEL_BOOKING_DRAFT||!!window.NOREYO_V1178?.currentOwnership?.();}catch(_){return false;}
}
function retire(reason='AUTH_USER_CHANGED'){
  ownerUserId='';
  try{return !!window.NOREYO_V1180?.retire?.(reason);}catch(_){
    let changed=false;
    try{changed=!!window.NOREYO_V1178?.clearOwnership?.()||changed;}catch(_){}
    try{if(window.NOREYO_HOTEL_BOOKING_DRAFT){delete window.NOREYO_HOTEL_BOOKING_DRAFT;changed=true;}}catch(_){}
    try{if(window.NOREYO_HOTEL_PREBOOK){delete window.NOREYO_HOTEL_PREBOOK;changed=true;}}catch(_){}
    return changed;
  }
}
function bind(){
  const id=authIdentity();
  if(!id||!hasSensitive())return false;
  if(ownerUserId===id)return false;
  ownerUserId=id;
  return true;
}
function sync(){
  raf=0;
  if(!hasSensitive()){ownerUserId='';return false;}
  const id=authIdentity();
  if(!id)return retire('AUTH_LOST');
  if(!ownerUserId){ownerUserId=id;return true;}
  if(ownerUserId!==id)return retire('AUTH_USER_CHANGED');
  return false;
}
function inputUrl(input){
  if(typeof input==='string')return input;
  try{if(typeof Request!=='undefined'&&input instanceof Request)return input.url||'';}catch(_){}
  return String(input?.url||'');
}
async function wrappedFetch(input,init){
  const response=await priorFetch(input,init);
  if(inputUrl(input).includes(PREBOOK)&&response?.ok){
    ownerUserId=authIdentity();
    if(!ownerUserId)retire('AUTH_LOST_AFTER_PREBOOK');
  }
  return response;
}
function schedule(){if(!raf)raf=requestAnimationFrame(sync);}
function install(){
  if(!installed&&typeof window.fetch==='function'&&!window.fetch.__noreyoV1196){
    priorFetch=window.fetch.bind(window);
    const f=(input,init)=>wrappedFetch(input,init);
    f.__noreyoV1196=true;f.__noreyoV1196Prior=priorFetch;
    window.fetch=f;installed=true;
  }
  if(!observer&&typeof MutationObserver!=='undefined'&&document.body){
    observer=new MutationObserver(schedule);
    observer.observe(document.body,{subtree:true,childList:true,characterData:true});
  }
  sync();
  return true;
}
function cleanup(){
  if(observer){observer.disconnect();observer=null;}
  if(raf){cancelAnimationFrame(raf);raf=0;}
  if(installed&&window.fetch?.__noreyoV1196&&priorFetch)window.fetch=priorFetch;
  installed=false;priorFetch=null;ownerUserId='';
}
install();
window.addEventListener('focus',sync,{passive:true});
window.addEventListener('pageshow',install,{passive:true});
window.addEventListener('pagehide',cleanup,{passive:true});
window.NOREYO_V1196=Object.freeze({BUILD,PREBOOK,authIdentity,hasSensitive,retire,bind,sync,inputUrl,wrappedFetch,schedule,install,cleanup,get ownerUserId(){return ownerUserId;}});
})();