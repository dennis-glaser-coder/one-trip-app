/* NOREYO V7.13 — strict target-shape integrity. */
(function(){
'use strict';
const BUILD='7.13';
function isSearchTravel(input){const url=typeof input==='string'?input:String(input?.url||'');return url.includes('/functions/v1/search-travel');}
async function requestJson(input){try{if(typeof Request==='undefined'||!(input instanceof Request)||input.bodyUsed)return null;const text=(await input.clone().text()).trim();if(!text)return null;return JSON.parse(text);}catch(_){return null;}}
function validHotelId(value){if(typeof value!=='string'&&typeof value!=='number')return false;const s=String(value).trim();return /^[A-Za-z0-9][A-Za-z0-9._:/-]{0,127}$/.test(s);}
function hasTarget(raw){if(Array.isArray(raw?.hotelIds)&&raw.hotelIds.some(validHotelId))return true;return /^[A-Z]{3}$/i.test(String(raw?.iataCode||'').trim());}
function isFlightAction(raw){return String(raw?.action||'').trim().toLowerCase()==='flight';}
function shapeIssue(raw){if(!raw||typeof raw!=='object')return null;if(isFlightAction(raw))return null;if(!Array.isArray(raw.occupancies)||!raw.occupancies.length)return{message:'Bitte Reisende auswählen.',planner:'travellers'};if(!raw.checkin||!raw.checkout)return{message:'Bitte einen vollständigen Reisezeitraum auswählen.',planner:'dates'};if(!hasTarget(raw))return{message:'Bitte ein Reiseziel auswählen.',planner:'destination'};return null;}
function release(){try{window.NOREYO_V607?.releaseGuard?.('request-shape');}catch(_){}try{window.NOREYO_V585?.releaseBusy?.();}catch(_){} }
function block(problem){release();try{if(typeof showToast==='function')showToast(problem.message);else window.toast?.(problem.message);}catch(_){}setTimeout(()=>{try{if(typeof openPlanner==='function')openPlanner(problem.planner);}catch(_){}},0);return new Response(JSON.stringify({error:{code:'INVALID_SEARCH_REQUEST',message:problem.message}}),{status:422,headers:{'content-type':'application/json'}});}
function install(){try{if(typeof window.fetch!=='function'||window.fetch.__noreyoV713)return false;const prior=window.fetch.bind(window);const wrapped=function(input,init){if(!isSearchTravel(input)||typeof Request==='undefined'||!(input instanceof Request))return prior(input,init);return requestJson(input).then(raw=>{const problem=shapeIssue(raw);return problem?block(problem):prior(input,init);},()=>prior(input,init));};wrapped.__noreyoV713=true;window.fetch=wrapped;return true;}catch(_){return false;}}
install();window.addEventListener('pageshow',install,{passive:true});
window.NOREYO_V713=Object.freeze({BUILD,isSearchTravel,requestJson,validHotelId,hasTarget,isFlightAction,shapeIssue,install});
})();