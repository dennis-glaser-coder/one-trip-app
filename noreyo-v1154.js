/* NOREYO V11.54 — booking PII scrub across Safari BFCache lifecycle.
   V11.46 clears the in-memory draft on pagehide, but Safari BFCache can preserve
   form control values in the DOM. Explicitly blank booking fields before caching
   and again when restoring a persisted page. No PII is written to storage. */
(function(){
'use strict';
const BUILD='11.54';
const SELECTOR='.noreyo-v1146-first,.noreyo-v1146-last,.noreyo-v1146-email,.noreyo-v1146-phone';
function fields(root=document){try{return [...root.querySelectorAll(SELECTOR)];}catch(_){return[];}}
function scrub(root=document){let changed=false;for(const input of fields(root)){if(input.value!==''){input.value='';changed=true;}}const feedback=root.querySelector?.('.noreyo-v1146-feedback');if(feedback&&feedback.textContent!==''){feedback.textContent='';changed=true;}try{window.NOREYO_V1148?.clear?.();}catch(_){try{window.NOREYO_V1146?.clear?.();}catch(_){}}return changed;}
function onPageHide(){scrub();}
function onPageShow(e){if(e?.persisted)scrub();}
window.addEventListener('pagehide',onPageHide,{capture:true,passive:true});
window.addEventListener('pageshow',onPageShow,{capture:true,passive:true});
window.NOREYO_V1154=Object.freeze({BUILD,SELECTOR,fields,scrub,onPageHide,onPageShow});
})();