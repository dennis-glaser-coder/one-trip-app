/* NOREYO V7.17 — symmetric request-shape integrity.
   Applies the same required travellers/date/target rules to fetch(url,{body})
   and fetch(Request). Only the real flight action bypasses hotel/package shape checks. */
(function(){
'use strict';
const BUILD='7.17';

function isSearchTravel(input){
  const url=typeof input==='string'?input:String(input?.url||'');
  return url.includes('/functions/v1/search-travel');
}
function parseText(text){
  if(typeof text!=='string'||!text.trim())return null;
  try{return JSON.parse(text);}catch(_){return null;}
}
async function requestJson(input,init){
  if(typeof init?.body==='string')return parseText(init.body);
  try{
    if(typeof Request!=='undefined'&&input instanceof Request){
      if(input.bodyUsed)return null;
      return parseText(await input.clone().text());
    }
  }catch(_){}
  return null;
}
function validHotelId(value){
  if(typeof value!=='string'&&typeof value!=='number')return false;
  const s=String(value).trim();
  return /^[A-Za-z0-9][A-Za-z0-9._:/-]{0,127}$/.test(s);
}
function hasTarget(raw){
  if(Array.isArray(raw?.hotelIds)&&raw.hotelIds.some(validHotelId))return true;
  return /^[A-Z]{3}$/i.test(String(raw?.iataCode||'').trim());
}
function isFlightAction(raw){
  return String(raw?.action||'').trim().toLowerCase()==='flight';
}
function shapeIssue(raw){
  if(!raw||typeof raw!=='object')
    return {message:'Die Suchanfrage ist unvollständig. Bitte erneut suchen.',planner:'travellers'};
  if(isFlightAction(raw))return null;
  if(!Array.isArray(raw.occupancies)||!raw.occupancies.length)
    return{message:'Bitte Reisende auswählen.',planner:'travellers'};
  if(!raw.checkin||!raw.checkout)
    return{message:'Bitte einen vollständigen Reisezeitraum auswählen.',planner:'dates'};
  if(!hasTarget(raw))
    return{message:'Bitte ein Reiseziel auswählen.',planner:'destination'};
  return null;
}
function release(){
  try{window.NOREYO_V607?.releaseGuard?.('request-shape');}catch(_){}
  try{window.NOREYO_V585?.releaseBusy?.();}catch(_){}
}
function block(problem){
  release();
  try{
    if(typeof showToast==='function')showToast(problem.message);
    else window.toast?.(problem.message);
  }catch(_){}
  setTimeout(()=>{try{if(typeof openPlanner==='function')openPlanner(problem.planner);}catch(_){}},0);
  return new Response(JSON.stringify({error:{code:'INVALID_SEARCH_REQUEST',message:problem.message}}),{
    status:422,headers:{'content-type':'application/json'}
  });
}
function install(){
  try{
    if(typeof window.fetch!=='function'||window.fetch.__noreyoV717)return false;
    const prior=window.fetch.bind(window);
    const wrapped=function(input,init){
      if(!isSearchTravel(input))return prior(input,init);

      if(typeof init?.body==='string'){
        const raw=parseText(init.body);
        const problem=shapeIssue(raw);
        return problem?Promise.resolve(block(problem)):prior(input,init);
      }

      if(typeof Request!=='undefined'&&input instanceof Request){
        return requestJson(input,init).then(raw=>{
          const problem=shapeIssue(raw);
          return problem?block(problem):prior(input,init);
        },()=>prior(input,init));
      }

      return prior(input,init);
    };
    wrapped.__noreyoV717=true;
    window.fetch=wrapped;
    return true;
  }catch(_){return false;}
}

install();
window.addEventListener('pageshow',install,{passive:true});
window.NOREYO_V717=Object.freeze({
  BUILD,isSearchTravel,parseText,requestJson,validHotelId,hasTarget,
  isFlightAction,shapeIssue,install
});
})();