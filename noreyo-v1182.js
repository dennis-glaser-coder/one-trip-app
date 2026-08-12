/* NOREYO V11.82 — stale-rate PREBOOK failure retirement.
   LiteAPI PREBOOK can reject an outdated offer (408 -> RATE_EXPIRED) or a no-longer
   prebookable rate (400 -> PREBOOK_REJECTED). If a user already had an older PREBOOK,
   V11.78 clears only ownership on the failed new request. Retire the stale checkout
   snapshot/draft as well so an old session can never remain actionable after a failed
   replacement PREBOOK. */
(function(){
'use strict';
const BUILD='11.82';
const PREBOOK='/functions/v1/hotel-prebook';
const CODES=new Set(['RATE_EXPIRED','PREBOOK_REJECTED']);
let installed=false,priorFetch=null;
function inputUrl(input){if(typeof input==='string')return input;try{if(typeof Request!=='undefined'&&input instanceof Request)return input.url||'';}catch(_){}return String(input?.url||'');}
function isPrebook(input){const url=inputUrl(input);return url.includes(PREBOOK)&&!url.includes('/hotel-prebook-status');}
async function code(response){if(!response||response.ok)return'';try{const p=await response.clone().json();return String(p?.error?.code||p?.code||'').trim().toUpperCase();}catch(_){return'';}}
function retire(reason){try{return !!window.NOREYO_V1180?.retire?.(reason);}catch(_){return false;}}
async function wrappedFetch(input,init){if(!isPrebook(input))return priorFetch(input,init);const response=await priorFetch(input,init);if(response?.ok)return response;const c=await code(response);if(CODES.has(c))retire(c);return response;}
function install(){if(installed||typeof window.fetch!=='function'||window.fetch.__noreyoV1182)return false;priorFetch=window.fetch.bind(window);const f=function(input,init){return wrappedFetch(input,init);};f.__noreyoV1182=true;f.__noreyoV1182Prior=priorFetch;window.fetch=f;installed=true;return true;}
function cleanup(){if(installed&&window.fetch?.__noreyoV1182&&priorFetch)window.fetch=priorFetch;installed=false;priorFetch=null;}
install();window.addEventListener('pageshow',install,{passive:true});window.addEventListener('pagehide',cleanup,{passive:true});
window.NOREYO_V1182=Object.freeze({BUILD,PREBOOK,CODES,inputUrl,isPrebook,code,retire,wrappedFetch,install,cleanup});
})();