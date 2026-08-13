/* NOREYO V11.02 — flight-verify provider-route integrity.
   flight-verify v2 identifies successful provider responses with
   X-Noreyo-Provider-Route: flights/verify. Refuse a successful response when the
   route marker is missing or wrong, rather than trusting ambiguous provider data. */
(function(){
'use strict';
const BUILD='11.02',EXPECTED='flights/verify';let installed=false,prior=null;
function inputUrl(input){if(typeof input==='string')return input;try{if(typeof Request!=='undefined'&&input instanceof Request)return input.url||'';}catch(_){}return String(input?.url||'');}
function isVerify(input){return inputUrl(input).includes('/functions/v1/flight-verify');}
function mismatch(actual){return new Response(JSON.stringify({error:{code:'VERIFY_ROUTE_MISMATCH',message:'Die Flugverifizierung hat eine unerwartete Providerroute geliefert. Bitte erneut verifizieren.'}}),{status:502,headers:{'content-type':'application/json','x-noreyo-expected-route':EXPECTED,'x-noreyo-actual-route':actual||'missing'}});}
function install(){if(installed||typeof window.fetch!=='function'||window.fetch.__noreyoV1102)return false;prior=window.fetch.bind(window);const wrapped=async function(input,init){const response=await prior(input,init);if(!isVerify(input)||!response?.ok)return response;const actual=String(response.headers?.get?.('X-Noreyo-Provider-Route')||'').trim().toLowerCase();return actual===EXPECTED?response:mismatch(actual);};wrapped.__noreyoV1102=true;wrapped.__noreyoV1102Prior=prior;window.fetch=wrapped;installed=true;return true;}
function restore(){if(!installed)return false;if(window.fetch?.__noreyoV1102&&prior)window.fetch=prior;installed=false;prior=null;return true;}
install();window.addEventListener('pagehide',restore,{passive:true});window.addEventListener('pageshow',install,{passive:true});window.NOREYO_V1102=Object.freeze({BUILD,EXPECTED,inputUrl,isVerify,mismatch,install,restore});
})();