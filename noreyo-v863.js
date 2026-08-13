/* NOREYO V8.63 — departure false-positive suppression for destination/location prose.
   Prevents phrases like "Hotel 10 km von Frankfurt" or "in der Nähe von Frankfurt"
   from overwriting departure airports while keeping explicit departure cues intact. */
(function(){
'use strict';
const BUILD='8.63';
let pendingSnapshot=null;
function base(){return window.NOREYO_V800||null;}
function norm(v){return base()?.norm?.(v)||String(v||'').toLowerCase();}
function hits(text){const b=base();if(!b)return[];try{return b.suppressOverlaps?.(b.airportHits?.(text)||[])||[];}catch(_){return[];}}
function positionalContext(t,hit){const before=t.slice(Math.max(0,hit.index-100),hit.index);return /(?:\b\d+(?:[.,]\d+)?\s*(?:km|kilometer|minuten?|stunden?)\s+(?:entfernt\s+)?von|\b(?:entfernt|nahe|in\s+der\s+naehe)\s+von)\s*$/i.test(before);}
function safeDepartures(text){const b=base();if(!b)return[];const t=norm(text),all=hits(text),accepted=[],out=[];for(const hit of all){if(positionalContext(t,hit))continue;if(out.includes(hit.code))continue;let ok=false;try{ok=!!b.connectedToDeparture?.(t,hit,accepted);}catch(_){}if(!ok)continue;out.push(hit.code);accepted.push(hit);}return out;}
function hasSuppressedHit(text){const t=norm(text);return hits(text).some(hit=>positionalContext(t,hit));}
function snapshotAirports(){try{return Array.isArray(searchState?.airports)?searchState.airports.map(String):[];}catch(_){return[];}}
function setAirports(codes){try{return base()?.setAirports?.(codes)||false;}catch(_){return false;}}
function inputText(){return document.getElementById('noreyoAi556Text')?.value||'';}
function repairAnalysis(text){if(!hasSuppressedHit(text))return false;const codes=safeDepartures(text),root=document.getElementById('noreyoAi556Result');if(!root)return false;const groups=[...root.querySelectorAll('.noreyo-v556-group')],travel=groups.find(g=>/reise/i.test(g.querySelector('.noreyo-v556-grouplabel')?.textContent||'')),chips=travel?.querySelector('.noreyo-v556-chips');if(!chips)return false;[...chips.querySelectorAll('.noreyo-v556-chip')].forEach(chip=>{if(/^Abflug\s*·/i.test(String(chip.textContent||'').replace(/^✓\s*/,'')))chip.remove();});if(codes.length){const chip=document.createElement('span');chip.className='noreyo-v556-chip';chip.innerHTML='<i>✓</i>Abflug · '+codes.join(' / ');chips.appendChild(chip);}return true;}
function onAnalyze(e){if(!e.target?.closest?.('.noreyo-v556-analyze'))return;const text=inputText();setTimeout(()=>repairAnalysis(text),330);}
function onApply(e){if(!e.target?.closest?.('.noreyo-v556-apply'))return;const text=inputText();if(!hasSuppressedHit(text)){pendingSnapshot=null;return;}pendingSnapshot=snapshotAirports();const safe=safeDepartures(text);setTimeout(()=>setTimeout(()=>setTimeout(()=>{setAirports(safe.length?safe:(pendingSnapshot||[]));pendingSnapshot=null;},0),0),0);}
document.addEventListener('click',onAnalyze,true);document.addEventListener('click',onApply,true);window.NOREYO_V863=Object.freeze({BUILD,base,norm,hits,positionalContext,safeDepartures,hasSuppressedHit,snapshotAirports,setAirports,repairAnalysis});
})();