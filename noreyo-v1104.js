/* NOREYO V11.04 — normalize provider 204 no-availability responses.
   LiteAPI documents HTTP 204 for a successful hotel-rate search with no availability.
   Packed searchTrips always calls response.json(), so a legitimate 204 currently becomes
   a fake backend-read error. Convert only search-travel 204 into an empty JSON success. */
(function(){
'use strict';
const BUILD='11.04';let installed=false,prior=null;
function inputUrl(input){if(typeof input==='string')return input;try{if(typeof Request!=='undefined'&&input instanceof Request)return input.url||'';}catch(_){}return String(input?.url||'');}
function isSearchTravel(input){return inputUrl(input).includes('/functions/v1/search-travel');}
function emptySuccess(response){const route=String(response?.headers?.get?.('X-Noreyo-Provider-Route')||'').trim();const headers={'content-type':'application/json'};if(route)headers['X-Noreyo-Provider-Route']=route;return new Response(JSON.stringify({data:[],hotels:[],noreyoNoAvailability:true}),{status:200,headers});}
function install(){if(installed||typeof window.fetch!=='function'||window.fetch.__noreyoV1104)return false;prior=window.fetch.bind(window);const wrapped=async function(input,init){const response=await prior(input,init);if(isSearchTravel(input)&&response?.status===204)return emptySuccess(response);return response;};wrapped.__noreyoV1104=true;wrapped.__noreyoV1104Prior=prior;window.fetch=wrapped;installed=true;return true;}
function restore(){if(!installed)return false;if(window.fetch?.__noreyoV1104&&prior)window.fetch=prior;installed=false;prior=null;return true;}
install();window.addEventListener('pagehide',restore,{passive:true});window.addEventListener('pageshow',install,{passive:true});window.NOREYO_V1104=Object.freeze({BUILD,inputUrl,isSearchTravel,emptySuccess,install,restore});
})();