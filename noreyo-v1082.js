/* NOREYO V10.82 — browser/provider route integrity check.
   search-travel v3 exposes X-Noreyo-Provider-Route. Successful browser searches
   must come back from the expected hotels/flights provider route; a mismatch is
   converted to a safe local 502 so wrong-domain data cannot be rendered silently. */
(function(){
'use strict';
const BUILD='10.82';let installed=false,prior=null;
function inputUrl(input){if(typeof input==='string')return input;try{if(typeof Request!=='undefined'&&input instanceof Request)return input.url||'';}catch(_){}return String(input?.url||'');}
function isSearchTravel(input){return inputUrl(input).includes('/functions/v1/search-travel');}
function parse(text){if(typeof text!=='string'||!text.trim())return null;try{return JSON.parse(text);}catch(_){return null;}}
async function requestBody(input,init){if(typeof init?.body==='string')return parse(init.body);try{if(typeof Request!=='undefined'&&input instanceof Request&&!input.bodyUsed)return parse(await input.clone().text());}catch(_){}return null;}
function action(raw){return String(raw?.action||'').trim().toLowerCase().replace(/[\s_-]+/g,'');}
function expectedRoute(raw){return action(raw).startsWith('flight')?'flights':'hotels';}
function mismatchResponse(expected,actual){return new Response(JSON.stringify({error:{code:'PROVIDER_ROUTE_MISMATCH',message:'Die Live-Suche hat eine unerwartete Providerroute geliefert. Bitte erneut versuchen.'}}),{status:502,headers:{'content-type':'application/json','x-noreyo-expected-route':expected,'x-noreyo-actual-route':actual||'missing'}});}
function install(){if(installed||typeof window.fetch!=='function'||window.fetch.__noreyoV1082)return false;prior=window.fetch.bind(window);const wrapped=async function(input,init){if(!isSearchTravel(input))return prior(input,init);const raw=await requestBody(input,init);const response=await prior(input,init);if(!response?.ok||!raw||typeof raw!=='object')return response;const expected=expectedRoute(raw);const actual=String(response.headers?.get?.('X-Noreyo-Provider-Route')||'').trim().toLowerCase();if(actual&&actual!==expected)return mismatchResponse(expected,actual);return response;};wrapped.__noreyoV1082=true;wrapped.__noreyoV1082Prior=prior;window.fetch=wrapped;installed=true;return true;}
function restore(){if(!installed)return false;if(window.fetch?.__noreyoV1082&&prior)window.fetch=prior;installed=false;prior=null;return true;}
install();window.addEventListener('pagehide',restore,{passive:true});window.addEventListener('pageshow',install,{passive:true});window.NOREYO_V1082=Object.freeze({BUILD,inputUrl,isSearchTravel,parse,requestBody,action,expectedRoute,mismatchResponse,install,restore});
})();