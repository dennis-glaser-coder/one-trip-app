/* NOREYO V8.28 — destination completeness guard.
   Prevents hotel/package searches without a resolved hotel target or destination
   IATA from reaching Supabase/LiteAPI. Missing destination reopens the destination planner. */
(function(){
'use strict';
const BUILD='8.28';

function inputUrl(input){
  if(typeof input==='string')return input;
  try{if(typeof Request!=='undefined'&&input instanceof Request)return input.url||'';}catch(_){}
  return String(input?.url||'');
}
function isSearchTravel(input){return inputUrl(input).includes('/functions/v1/search-travel');}
function parse(text){
  if(typeof text!=='string'||!text.trim())return null;
  try{return JSON.parse(text);}catch(_){return null;}
}
async function body(input,init){
  if(typeof init?.body==='string')return parse(init.body);
  try{
    if(typeof Request!=='undefined'&&input instanceof Request&&!input.bodyUsed)
      return parse(await input.clone().text());
  }catch(_){}
  return null;
}
function flight(raw){return String(raw?.action||'').trim().toLowerCase()==='flight';}
function validHotelIds(v){
  return Array.isArray(v)&&v.some(x=>/^[A-Za-z0-9][A-Za-z0-9._:/-]{0,127}$/.test(String(x||'').trim()));
}
function validIata(v){return /^[A-Z]{3}$/.test(String(v||'').trim().toUpperCase());}
function missingDestination(raw){
  if(!raw||typeof raw!=='object'||flight(raw))return false;
  return !validHotelIds(raw.hotelIds)&&!validIata(raw.iataCode);
}
function local422(message){
  return new Response(JSON.stringify({error:{code:'INVALID_SEARCH_REQUEST',message}}),{
    status:422,headers:{'content-type':'application/json'}
  });
}
function block(){
  const message='Bitte zuerst ein Reiseziel auswählen.';
  try{window.NOREYO_V607?.releaseGuard?.('destination-completeness');}catch(_){}
  try{window.NOREYO_V585?.releaseBusy?.();}catch(_){}
  try{
    if(typeof showToast==='function')showToast(message);
    else window.toast?.(message);
  }catch(_){}
  setTimeout(()=>{try{if(typeof openPlanner==='function')openPlanner('destination');}catch(_){}},0);
  return local422(message);
}
function install(){
  try{
    if(typeof window.fetch!=='function'||window.fetch.__noreyoV828)return false;
    const prior=window.fetch.bind(window);
    const wrapped=async function(input,init){
      if(!isSearchTravel(input))return prior(input,init);
      const raw=await body(input,init);
      if(!raw||!missingDestination(raw))return prior(input,init);
      return block();
    };
    wrapped.__noreyoV828=true;
    window.fetch=wrapped;
    return true;
  }catch(_){return false;}
}
install();
window.addEventListener('pageshow',install,{passive:true});
window.NOREYO_V828=Object.freeze({BUILD,inputUrl,isSearchTravel,parse,body,flight,validHotelIds,validIata,missingDestination,local422,install});
})();