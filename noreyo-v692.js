/* NOREYO V6.92 — final live-search occupancy integrity guard.
   Blocks invalid hotel/package occupancies before network dispatch instead of
   silently dropping travellers from the request. */
(function(){
'use strict';
const BUILD='6.92',MAX_ADULTS=6,MAX_CHILDREN=4,MAX_TRAVELLERS=9;

function isSearchTravel(input){const url=typeof input==='string'?input:String(input?.url||'');return url.includes('/functions/v1/search-travel');}
function parseBody(init){if(typeof init?.body!=='string')return null;try{return JSON.parse(init.body);}catch(_){return null;}}
function occupancyIssue(raw){
  if(!raw||raw.action||!Array.isArray(raw.occupancies)||!raw.occupancies.length)return'';
  const occ=raw.occupancies[0]||{},adults=Number(occ.adults),children=Array.isArray(occ.children)?occ.children:[];
  if(!Number.isInteger(adults)||adults<1||adults>MAX_ADULTS)return`Bitte 1–${MAX_ADULTS} Erwachsene auswählen.`;
  if(children.length>MAX_CHILDREN)return`Aktuell sind maximal ${MAX_CHILDREN} Kinder pro Suche möglich.`;
  if(adults+children.length>MAX_TRAVELLERS)return`Aktuell sind maximal ${MAX_TRAVELLERS} Reisende pro Suche möglich.`;
  if(children.some(v=>!Number.isInteger(Number(v))||Number(v)<0||Number(v)>17))return'Bitte für jedes Kind ein gültiges Alter von 0 bis 17 Jahren angeben.';
  return'';
}
function releaseGuards(){try{window.NOREYO_V607?.releaseGuard?.('occupancy-validation');}catch(_){ }try{window.NOREYO_V585?.releaseBusy?.();}catch(_){ }}
function notify(message){try{if(typeof showToast==='function')showToast(message);else window.toast?.(message);}catch(_){ }}
function openTravellers(){setTimeout(()=>{try{if(typeof openPlanner==='function')openPlanner('travellers');}catch(_){ }},0);}
function validationResponse(message){
  const payload=JSON.stringify({error:{code:'INVALID_OCCUPANCY',message}});
  try{return Promise.resolve(new Response(payload,{status:422,headers:{'content-type':'application/json'}}));}
  catch(_){return Promise.reject(new Error(message));}
}
function install(){
  try{
    if(typeof window.fetch!=='function'||window.fetch.__noreyoV692)return false;
    const prior=window.fetch.bind(window);
    const wrapped=function(input,init){
      if(!isSearchTravel(input))return prior(input,init);
      const raw=parseBody(init),issue=occupancyIssue(raw);
      if(!issue)return prior(input,init);
      releaseGuards();notify(issue);openTravellers();return validationResponse(issue);
    };
    wrapped.__noreyoV692=true;window.fetch=wrapped;return true;
  }catch(_){return false;}
}
install();
window.addEventListener('pageshow',install,{passive:true});
window.NOREYO_V692=Object.freeze({BUILD,isSearchTravel,parseBody,occupancyIssue,releaseGuards,validationResponse,install});
})();
