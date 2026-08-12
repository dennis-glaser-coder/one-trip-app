/* NOREYO V11.56 — booking-form UI follows exact provider binding.
   V11.48 can invalidate the in-memory draft after price/terms/session changes.
   Keep the rendered form from still looking prepared, and scrub PII only when the
   authoritative provider binding changed — never merely because the user edits a field. */
(function(){
'use strict';
const BUILD='11.56';
let observer=null,raf=0,lastBinding='',hadPrepared=false;
function draft(){return window.NOREYO_HOTEL_BOOKING_DRAFT||null;}
function binding(){try{return window.NOREYO_V1148?.binding?.()||null;}catch(_){return null;}}
function canonical(b){return b?JSON.stringify(b):'';}
function section(){return document.querySelector('.noreyo-v1146-booking-data');}
function scrubFields(root=section()){if(!root)return false;let changed=false;root.querySelectorAll?.('input').forEach(input=>{if(input.value!==''){input.value='';changed=true;}});return changed;}
function resetCopy(root=section(),message=''){if(!root)return false;let changed=false;const feedback=root.querySelector('.noreyo-v1146-feedback'),btn=root.querySelector('.noreyo-v1146-prepare');const text=message||'Bitte prüfe die Buchungsdaten für die aktuellen finalen Tarifbedingungen erneut.';if(feedback&&feedback.textContent!==text){feedback.textContent=text;changed=true;}if(btn&&btn.textContent!=='Buchungsdaten prüfen'){btn.textContent='Buchungsdaten prüfen';changed=true;}return changed;}
function sync(){raf=0;const d=draft(),now=canonical(binding()),root=section();let changed=false;if(d){hadPrepared=true;lastBinding=canonical(d.finalBinding||binding());return false;}if(hadPrepared){const providerChanged=!now||!lastBinding||now!==lastBinding;if(providerChanged){changed=scrubFields(root)||changed;changed=resetCopy(root,'Finale Tarifdaten haben sich geändert. Bitte gib die Buchungsdaten für den aktuellen Tarif erneut ein.')||changed;}else{changed=resetCopy(root,'Buchungsdaten wurden geändert. Bitte erneut prüfen.')||changed;}hadPrepared=false;lastBinding=now;}return changed;}
function schedule(){if(!raf)raf=requestAnimationFrame(sync);}
function install(){if(observer||typeof MutationObserver==='undefined'||!document.body)return false;if(draft()){hadPrepared=true;lastBinding=canonical(draft().finalBinding||binding());}observer=new MutationObserver(schedule);observer.observe(document.body,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['data-checkout-ready']});document.addEventListener('input',schedule,true);schedule();return true;}
function cleanup(){if(observer){observer.disconnect();observer=null;}document.removeEventListener('input',schedule,true);if(raf){cancelAnimationFrame(raf);raf=0;}lastBinding='';hadPrepared=false;}
install();window.addEventListener('pagehide',cleanup,{passive:true});window.addEventListener('pageshow',install,{passive:true});
window.NOREYO_V1156=Object.freeze({BUILD,draft,binding,canonical,section,scrubFields,resetCopy,sync,schedule,install,cleanup});
})();