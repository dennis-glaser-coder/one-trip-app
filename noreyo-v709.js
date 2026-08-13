/* NOREYO V7.09 — multi-occupancy transport preservation.
   The legacy V6.63 fetch sanitizer collapses URL+body requests to occupancies[0].
   For already-structured multi-occupancy searches, transport them as Request
   objects so the legacy sanitizer cannot silently remove rooms/travellers. */
(function(){
'use strict';
const BUILD='7.09';

function isSearchTravel(input){
  const url=typeof input==='string'?input:String(input?.url||'');
  return url.includes('/functions/v1/search-travel');
}
function parsedBody(init){
  if(typeof init?.body!=='string')return null;
  try{return JSON.parse(init.body);}catch(_){return null;}
}
function needsRequestTransport(input,init){
  if(typeof input!=='string'||!isSearchTravel(input))return false;
  const raw=parsedBody(init);
  return !raw?.action&&Array.isArray(raw?.occupancies)&&raw.occupancies.length>1;
}
function asRequest(input,init){
  const url=new URL(input,location.href).href;
  return new Request(url,init);
}
function install(){
  try{
    if(typeof window.fetch!=='function'||window.fetch.__noreyoV709)return false;
    const prior=window.fetch.bind(window);
    const wrapped=function(input,init){
      if(!needsRequestTransport(input,init))return prior(input,init);
      let req;
      try{req=asRequest(input,init);}catch(_){return prior(input,init);}
      return prior(req);
    };
    wrapped.__noreyoV709=true;
    window.fetch=wrapped;
    return true;
  }catch(_){return false;}
}

install();
window.addEventListener('pageshow',install,{passive:true});
window.NOREYO_V709=Object.freeze({BUILD,isSearchTravel,parsedBody,needsRequestTransport,asRequest,install});
})();