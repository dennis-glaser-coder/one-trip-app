/* NOREYO V8.88 — flightSearch compatibility for hotel/package completeness guards.
   The packed core sends action:"flightSearch". Treat all normalized flight actions
   as flight requests so hotel/package guards do not block them. */
(function(){
'use strict';
const BUILD='8.88';

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
    if(typeof Request!=='undefined'&&input instanceof Request&&!input.bodyUsed)return parse(await input.clone().text());
  }catch(_){}
  return null;
}
function normalizedAction(raw){return String(raw?.action||'').trim().toLowerCase().replace(/[\s_-]+/g,'');}
function flight(raw){return normalizedAction(raw).startsWith('flight');}

function validISO(v){
  const s=String(v||'');
  if(!/^\d{4}-\d{2}-\d{2}$/.test(s))return false;
  const d=new Date(s+'T12:00:00');
  return !Number.isNaN(d.getTime()) &&
    d.getFullYear()===+s.slice(0,4) &&
    d.getMonth()+1===+s.slice(5,7) &&
    d.getDate()===+s.slice(8,10);
}
function todayISO(){
  const d=new Date();
  return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
}
function requestProblem(raw){
  if(!raw||typeof raw!=='object'||flight(raw))return null;
  if(!Array.isArray(raw.occupancies)||raw.occupancies.length<1)
    return{message:'Bitte Reisende auswählen, bevor du suchst.',planner:'travellers'};
  if(!validISO(raw.checkin)||!validISO(raw.checkout))
    return{message:'Bitte einen vollständigen Reisezeitraum auswählen.',planner:'dates'};
  if(String(raw.checkin)<todayISO())
    return{message:'Das Abreisedatum liegt in der Vergangenheit. Bitte den Zeitraum aktualisieren.',planner:'dates'};
  if(String(raw.checkout)<=String(raw.checkin))
    return{message:'Das Rückreisedatum muss nach dem Abreisedatum liegen.',planner:'dates'};
  return null;
}
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
function release(reason){
  try{window.NOREYO_V607?.releaseGuard?.(reason);}catch(_){}
  try{window.NOREYO_V585?.releaseBusy?.();}catch(_){}
}
function notify(message,planner,reason){
  release(reason);
  try{
    if(typeof showToast==='function')showToast(message);
    else window.toast?.(message);
  }catch(_){}
  setTimeout(()=>{try{if(typeof openPlanner==='function')openPlanner(planner);}catch(_){}},0);
}
function install(){
  try{
    if(typeof window.fetch!=='function'||window.fetch.__noreyoV888)return false;
    const prior=window.fetch.bind(window);
    const wrapped=async function(input,init){
      if(!isSearchTravel(input))return prior(input,init);
      const raw=await body(input,init);
      if(!raw)return prior(input,init);

      const problem=requestProblem(raw);
      if(problem){
        notify(problem.message,problem.planner,'request-completeness');
        return local422(problem.message);
      }
      if(missingDestination(raw)){
        const message='Bitte zuerst ein Reiseziel auswählen.';
        notify(message,'destination','destination-completeness');
        return local422(message);
      }
      return prior(input,init);
    };
    wrapped.__noreyoV888=true;
    wrapped.__noreyoV826=true;
    wrapped.__noreyoV828=true;
    window.fetch=wrapped;
    return true;
  }catch(_){return false;}
}
function compat826(){
  return Object.freeze({BUILD:'8.26',inputUrl,isSearchTravel,parse,body,flight,validISO,todayISO,problem:requestProblem,local422,install});
}
function compat828(){
  return Object.freeze({BUILD:'8.28',inputUrl,isSearchTravel,parse,body,flight,validHotelIds,validIata,missingDestination,local422,install});
}
install();
window.NOREYO_V826=compat826();
window.NOREYO_V828=compat828();
window.NOREYO_V888=Object.freeze({BUILD,normalizedAction,flight,requestProblem,missingDestination,install});
window.addEventListener('pageshow',install,{passive:true});
})();