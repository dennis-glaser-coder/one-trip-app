/* NOREYO V7.12 — exact search action boundary.
   Only the real flight action bypasses hotel/package shape requirements.
   Unknown or accidental action values must still satisfy travellers, dates and target. */
(function(){
'use strict';
const BUILD='7.12';
function isSearchTravel(input){
  const url=typeof input==='string'?input:String(input?.url||'');
  return url.includes('/functions/v1/search-travel');
}
async function requestJson(input){
  try{
    if(typeof Request==='undefined'||!(input instanceof Request)||input.bodyUsed)return null;
    const text=(await input.clone().text()).trim();
    if(!text)return null;
    return JSON.parse(text);
  }catch(_){return null;}
}
function hasTarget(raw){
  if(Array.isArray(raw?.hotelIds)&&raw.hotelIds.some(x=>String(x||'').trim()))return true;
  return /^[A-Z]{3}$/i.test(String(raw?.iataCode||'').trim());
}
function isFlightAction(raw){
  return String(raw?.action||'').trim().toLowerCase()==='flight';
}
function shapeIssue(raw){
  if(!raw||typeof raw!=='object')return null;
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
  const body=JSON.stringify({error:{code:'INVALID_SEARCH_REQUEST',message:problem.message}});
  return new Response(body,{status:422,headers:{'content-type':'application/json'}});
}
function install(){
  try{
    if(typeof window.fetch!=='function'||window.fetch.__noreyoV712)return false;
    const prior=window.fetch.bind(window);
    const wrapped=function(input,init){
      if(!isSearchTravel(input)||typeof Request==='undefined'||!(input instanceof Request))
        return prior(input,init);
      return requestJson(input).then(raw=>{
        const problem=shapeIssue(raw);
        return problem?block(problem):prior(input,init);
      },()=>prior(input,init));
    };
    wrapped.__noreyoV712=true;
    window.fetch=wrapped;
    return true;
  }catch(_){return false;}
}
install();
window.addEventListener('pageshow',install,{passive:true});
window.NOREYO_V712=Object.freeze({
  BUILD,isSearchTravel,requestJson,hasTarget,isFlightAction,shapeIssue,install
});
})();