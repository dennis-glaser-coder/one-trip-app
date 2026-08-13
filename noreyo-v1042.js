/* NOREYO V10.42 — flight offer blocker arbiter.
   Independent truth layers (baggage, unsupported MUST, strict exclusions/max-time,
   expiry) must compose monotonically: clearing one blocker may never re-enable an
   offer while another blocker is still active. */
(function(){
'use strict';
const BUILD='10.42';let observer=null,raf=0;
function body(){return document.getElementById('plannerBody');}
function flightOpen(){return document.getElementById('plannerSheet')?.classList?.contains('show')&&String(document.getElementById('plannerTitle')?.textContent||'').trim()==='Flüge';}
function offers(){const b=body();return Array.isArray(b?.__noreyoV943Offers)?b.__noreyoV943Offers:[];}
function expired(offer){try{return !!window.NOREYO_V994?.expired?.(offer?.expiration);}catch(_){return false;}}
function blockers(btn,offer){const out=[];if(expired(offer))out.push('expired');if(btn?.dataset?.noreyoV1040Strict==='1')out.push('strict');if(btn?.dataset?.noreyoV1008Must==='1')out.push('must');if(btn?.dataset?.noreyoV1004Bag==='1')out.push('baggage');return out;}
function copyFor(list){if(list.includes('expired'))return'Angebot abgelaufen – neu suchen';if(list.includes('strict'))return'Harte Fluggrenze nicht verifiziert';if(list.includes('must'))return'Pflichtkriterium nicht verifiziert';if(list.includes('baggage'))return'Pflichtkriterium Gepäck nicht bestätigt';return'Angebot auswählen';}
function sync(){raf=0;if(!flightOpen())return false;const list=offers(),b=body();if(!b)return false;let changed=false;b.querySelectorAll?.('.noreyo-v943-offer').forEach(card=>{const btn=card.querySelector('.noreyo-v943-select');if(!btn)return;const offer=list[Number(card.dataset.flightOfferIndex)],active=blockers(btn,offer);if(active.length){if(btn.dataset.noreyoV1042Original===undefined)btn.dataset.noreyoV1042Original=btn.textContent||'Angebot auswählen';if(!btn.disabled){btn.disabled=true;changed=true;}if(btn.getAttribute('aria-disabled')!=='true'){btn.setAttribute('aria-disabled','true');changed=true;}const text=copyFor(active);if(btn.textContent!==text){btn.textContent=text;changed=true;}btn.dataset.noreyoV1042Arbiter='1';}else if(btn.dataset.noreyoV1042Arbiter==='1'){delete btn.dataset.noreyoV1042Arbiter;const text=btn.dataset.noreyoV1042Original||'Angebot auswählen';delete btn.dataset.noreyoV1042Original;if(btn.disabled){btn.disabled=false;changed=true;}if(btn.getAttribute('aria-disabled')!=='false'){btn.setAttribute('aria-disabled','false');changed=true;}if(btn.textContent!==text){btn.textContent=text;changed=true;}}});return changed;}
function schedule(){if(!raf)raf=requestAnimationFrame(sync);}
function observe(){if(observer){observer.disconnect();observer=null;}const b=body();if(typeof MutationObserver==='undefined'||!b)return false;observer=new MutationObserver(schedule);observer.observe(b,{subtree:true,childList:true,attributes:true,attributeFilter:['disabled','data-noreyo-v1004-bag','data-noreyo-v1008-must','data-noreyo-v1040-strict']});schedule();return true;}
function cleanup(){if(observer){observer.disconnect();observer=null;}if(raf){cancelAnimationFrame(raf);raf=0;}}
observe();window.addEventListener('pagehide',cleanup,{passive:true});window.addEventListener('pageshow',observe,{passive:true});
window.NOREYO_V1042=Object.freeze({BUILD,body,flightOpen,offers,expired,blockers,copyFor,sync,schedule,observe,cleanup});
})();