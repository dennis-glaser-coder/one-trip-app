/* NOREYO V11.80 — fail-closed authenticated checkout ownership.
   V11.78 transports the validated user JWT and server-issued PREBOOK ownership token.
   If Supabase rejects auth/ownership or reports an expired PREBOOK, retire every
   sensitive local checkout artifact immediately instead of leaving stale "ready"
   state or guest data behind. */
(function(){
'use strict';
const BUILD='11.80';
const PATHS=Object.freeze([
  '/functions/v1/hotel-prebook',
  '/functions/v1/hotel-prebook-status',
  '/functions/v1/hotel-checkout-status'
]);
const RETIRE_CODES=new Set([
  'AUTH_REQUIRED',
  'CHECKOUT_OWNERSHIP_REQUIRED',
  'CHECKOUT_OWNERSHIP_DENIED',
  'PREBOOK_EXPIRED'
]);
let installed=false,priorFetch=null,lastReason='';
function inputUrl(input){if(typeof input==='string')return input;try{if(typeof Request!=='undefined'&&input instanceof Request)return input.url||'';}catch(_){}return String(input?.url||'');}
function sensitive(input){const url=inputUrl(input);return PATHS.some(path=>url.includes(path));}
async function errorCode(response){if(!response||response.ok)return'';try{const payload=await response.clone().json();return String(payload?.error?.code||payload?.code||'').trim().toUpperCase();}catch(_){return'';}}
function retire(reason=''){lastReason=String(reason||'').trim().toUpperCase();let changed=false;try{changed=!!window.NOREYO_V1178?.clearOwnership?.()||changed;}catch(_){}try{changed=!!window.NOREYO_V1148?.clear?.()||changed;}catch(_){}try{if(window.NOREYO_HOTEL_BOOKING_DRAFT){delete window.NOREYO_HOTEL_BOOKING_DRAFT;changed=true;}}catch(_){window.NOREYO_HOTEL_BOOKING_DRAFT=undefined;changed=true;}try{if(window.NOREYO_HOTEL_PREBOOK){delete window.NOREYO_HOTEL_PREBOOK;changed=true;}}catch(_){window.NOREYO_HOTEL_PREBOOK=undefined;changed=true;}try{window.NOREYO_V1144?.render?.();}catch(_){}return changed;}
function shouldRetire(response,code){if(!response||response.ok)return false;if(RETIRE_CODES.has(code))return true;return response.status===401||response.status===403;}
async function wrappedFetch(input,init){if(!sensitive(input))return priorFetch(input,init);const response=await priorFetch(input,init);if(response?.ok)return response;const code=await errorCode(response);if(shouldRetire(response,code))retire(code||`HTTP_${response.status}`);return response;}
function identityValid(){try{return !!window.NOREYO_V1178?.identity?.();}catch(_){return false;}}
function sync(){if(identityValid())return false;const hasSensitive=!!window.NOREYO_HOTEL_PREBOOK||!!window.NOREYO_HOTEL_BOOKING_DRAFT||!!window.NOREYO_V1178?.currentOwnership?.();return hasSensitive?retire('AUTH_LOST'):false;}
function install(){if(installed||typeof window.fetch!=='function'||window.fetch.__noreyoV1180)return false;priorFetch=window.fetch.bind(window);const f=function(input,init){return wrappedFetch(input,init);};f.__noreyoV1180=true;f.__noreyoV1180Prior=priorFetch;window.fetch=f;installed=true;sync();return true;}
function cleanup(){retire('PAGEHIDE');if(installed&&window.fetch?.__noreyoV1180&&priorFetch)window.fetch=priorFetch;installed=false;priorFetch=null;}
function state(){return Object.freeze({installed,lastReason,identityValid:identityValid()});}
install();window.addEventListener('pageshow',install,{passive:true});window.addEventListener('pagehide',cleanup,{passive:true});
window.NOREYO_V1180=Object.freeze({BUILD,PATHS,RETIRE_CODES,inputUrl,sensitive,errorCode,retire,shouldRetire,wrappedFetch,identityValid,sync,install,cleanup,state});
})();