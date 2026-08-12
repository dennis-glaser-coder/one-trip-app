/* NOREYO V10.66 — strict single-token hotel identity.
   V10.58 rejects one-token brand queries when the candidate has multiple meaningful
   tokens, but “Riu” -> “Hotel Riu” can still pass because “hotel” is a stopword.
   A global direct-hotel lookup with one meaningful query token is only safe when the
   normalized provider name itself is exactly the normalized query. */
(function(){
'use strict';
const BUILD='10.66';
let installed=false,prior=null;
function base(){return window.NOREYO_V1056||null;}
function norm(v){return base()?.norm?.(v)||String(v||'').toLowerCase().trim();}
function tokens(v){return base()?.tokens?.(v)||norm(v).split(/\s+/).filter(Boolean);}
function resultName(r){return base()?.resultName?.(r)||String(r?.hotelName||r?.hotel?.name||'').trim();}
function unsafeSingleToken(query,result){const qt=tokens(query);if(qt.length!==1)return false;const q=norm(query),n=norm(resultName(result));return !q||!n||q!==n;}
function validate(query,result){if(!unsafeSingleToken(query,result))return result;const name=resultName(result);const err=new Error(`„${String(query||'').trim()}“ ist als alleiniger Hotelname nicht eindeutig genug. Gefunden wurde „${name}“. Bitte ergänze den Ort oder den vollständigen Hotelnamen.`);err.code='NOREYO_HOTEL_RESOLVE_SINGLE_TOKEN_AMBIGUOUS';err.query=String(query||'').trim();err.candidate=name;throw err;}
function install(){if(installed||typeof window.resolveDirectHotel!=='function'||window.resolveDirectHotel.__noreyoV1066)return false;prior=window.resolveDirectHotel;const wrapped=async function(query,...args){const result=await prior.call(this,query,...args);return validate(query,result);};wrapped.__noreyoV1066=true;wrapped.__noreyoV1066Prior=prior;window.resolveDirectHotel=wrapped;installed=true;return true;}
function restore(){if(!installed)return false;if(window.resolveDirectHotel?.__noreyoV1066&&prior)window.resolveDirectHotel=prior;installed=false;prior=null;return true;}
install();window.addEventListener('pagehide',restore,{passive:true});window.addEventListener('pageshow',install,{passive:true});
window.NOREYO_V1066=Object.freeze({BUILD,base,norm,tokens,resultName,unsafeSingleToken,validate,install,restore});
})();