/* NOREYO V11.10 — hotel PREBOOK provider-route integrity.
   hotel-prebook v1 identifies every JSON response with
   X-Noreyo-Provider-Route: hotels/prebook. Refuse a successful response when the
   route marker is missing or wrong instead of trusting ambiguous checkout data. */
(function(){
'use strict';
const BUILD='11.10',EXPECTED='hotels/prebook';let installed=false,prior=null;
function inputUrl(input){if(typeof input==='string')return input;try{if(typeof Request!=='undefined'&&input instanceof Request)return input.url||'';}catch(_){}return String(input?.url||'');}
function isPrebook(input){return inputUrl(input).includes('/functions/v1/hotel-prebook');}
function mismatch(actual){return new Response(JSON.stringify({error:{code:'PREBOOK_ROUTE_MISMATCH',message:'Die Tarifprüfung hat eine unerwartete Providerroute geliefert. Bitte erneut prüfen.'}}),{status:502,headers:{'content-type':'application/json','x-noreyo-expected-route':EXPECTED,'x-noreyo-actual-route':actual||'missing'}});}
function install(){
  if(installed||typeof window.fetch!=='function'||window.fetch.__noreyoV1110)return false;
  prior=window.fetch.bind(window);
  const wrapped=async function(input,init){
    const response=await prior(input,init);
    if(!isPrebook(input)||!response?.ok)return response;
    const actual=String(response.headers?.get?.('X-Noreyo-Provider-Route')||'').trim().toLowerCase();
    return actual===EXPECTED?response:mismatch(actual);
  };
  wrapped.__noreyoV1110=true;wrapped.__noreyoV1110Prior=prior;window.fetch=wrapped;installed=true;return true;
}
function restore(){if(!installed)return false;if(window.fetch?.__noreyoV1110&&prior)window.fetch=prior;installed=false;prior=null;return true;}
install();window.addEventListener('pagehide',restore,{passive:true});window.addEventListener('pageshow',install,{passive:true});
window.NOREYO_V1110=Object.freeze({BUILD,EXPECTED,inputUrl,isPrebook,mismatch,install,restore});
})();