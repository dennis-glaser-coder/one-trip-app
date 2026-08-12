/* NOREYO V10.46 — flight blocker label restoration.
   V10.42 may snapshot an already-blocked label as its "original" because baggage,
   MUST or strict layers run before the arbiter. When all blockers later clear, the
   button can become enabled while still saying "Pflichtkriterium ...". Normalize
   arbiter snapshots and unlocked button copy back to the selectable action label. */
(function(){
'use strict';
const BUILD='10.46';
const BLOCKED_LABELS=Object.freeze(['Angebot abgelaufen – neu suchen','Harte Fluggrenze nicht verifiziert','Pflichtkriterium nicht verifiziert','Pflichtkriterium Gepäck nicht bestätigt']);
let observer=null,raf=0;
function isBlockedLabel(text){const t=String(text||'').trim();return BLOCKED_LABELS.includes(t)||/^Pflichtkriterium\b/i.test(t)||/^Harte Fluggrenze\b/i.test(t);}
function selectableLabel(btn){const candidates=[btn?.dataset?.noreyoV943Label,btn?.dataset?.noreyoV1004Label,btn?.dataset?.noreyoV1008Label,btn?.dataset?.noreyoV1040Label,'Angebot auswählen'];return candidates.find(x=>x&&!isBlockedLabel(x))||'Angebot auswählen';}
function repairButton(btn){if(!btn)return false;let changed=false;if(btn.dataset?.noreyoV1042Original!==undefined&&isBlockedLabel(btn.dataset.noreyoV1042Original)){btn.dataset.noreyoV1042Original=selectableLabel(btn);changed=true;}const arbiterActive=btn.dataset?.noreyoV1042Arbiter==='1';const externallyBlocked=btn.dataset?.noreyoV1040Strict==='1'||btn.dataset?.noreyoV1008Must==='1'||btn.dataset?.noreyoV1004Bag==='1';if(!arbiterActive&&!externallyBlocked&&!btn.disabled&&isBlockedLabel(btn.textContent)){btn.textContent=selectableLabel(btn);changed=true;}return changed;}
function body(){return document.getElementById('plannerBody');}
function sync(){raf=0;const b=body();if(!b)return false;let changed=false;b.querySelectorAll?.('.noreyo-v943-select').forEach(btn=>{changed=repairButton(btn)||changed;});return changed;}
function schedule(){if(!raf)raf=requestAnimationFrame(sync);}
function observe(){if(observer){observer.disconnect();observer=null;}const b=body();if(typeof MutationObserver==='undefined'||!b)return false;observer=new MutationObserver(schedule);observer.observe(b,{subtree:true,childList:true,attributes:true,attributeFilter:['disabled','data-noreyo-v1042-arbiter','data-noreyo-v1042-original']});schedule();return true;}
function cleanup(){if(observer){observer.disconnect();observer=null;}if(raf){cancelAnimationFrame(raf);raf=0;}}
observe();window.addEventListener('pagehide',cleanup,{passive:true});window.addEventListener('pageshow',observe,{passive:true});
window.NOREYO_V1046=Object.freeze({BUILD,BLOCKED_LABELS,isBlockedLabel,selectableLabel,repairButton,body,sync,schedule,observe,cleanup});
})();