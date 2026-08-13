/* NOREYO V10.58 — reject ambiguous brand-only direct-hotel resolution.
   A single meaningful token such as "Hilton" can match many hotels worldwide.
   Even after V10.56's overlap gate, never accept a multi-token hotel candidate from
   a one-token query unless the candidate itself is effectively that same one-token name. */
(function(){
'use strict';
const BUILD='10.58';
let installed=false,prior=null;
function base(){return window.NOREYO_V1056||null;}
function meaningful(value){const b=base();return b?.tokens?.(value)||String(value||'').toLowerCase().split(/\s+/).filter(Boolean);}
function resultName(result){const b=base();return b?.resultName?.(result)||String(result?.hotelName||result?.hotel?.name||'').trim();}
function ambiguousBrandOnly(query,result){const q=meaningful(query),n=meaningful(resultName(result));return q.length===1&&n.length>1&&n.includes(q[0]);}
function validate(query,result){if(!ambiguousBrandOnly(query,result))return result;const name=resultName(result);const err=new Error(`„${String(query||'').trim()}“ ist als alleiniger Hotelname nicht eindeutig genug. Gefunden wurde „${name}“. Bitte ergänze den Ort oder den vollständigen Hotelnamen.`);err.code='NOREYO_HOTEL_RESOLVE_BRAND_AMBIGUOUS';err.query=String(query||'').trim();err.candidate=name;throw err;}
function install(){if(installed||typeof window.resolveDirectHotel!=='function'||window.resolveDirectHotel.__noreyoV1058)return false;prior=window.resolveDirectHotel;const wrapped=async function(query,...args){const result=await prior.call(this,query,...args);return validate(query,result);};wrapped.__noreyoV1058=true;wrapped.__noreyoV1058Prior=prior;window.resolveDirectHotel=wrapped;installed=true;return true;}
function restore(){if(!installed)return false;if(window.resolveDirectHotel?.__noreyoV1058&&prior)window.resolveDirectHotel=prior;installed=false;prior=null;return true;}
install();window.addEventListener('pagehide',restore,{passive:true});window.addEventListener('pageshow',install,{passive:true});
window.NOREYO_V1058=Object.freeze({BUILD,base,meaningful,resultName,ambiguousBrandOnly,validate,install,restore});
})();