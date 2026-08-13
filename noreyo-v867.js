/* NOREYO V8.67 — ground-transport departure false-positive suppression.
   Keeps transfer/shuttle/taxi/pickup origins from becoming flight departure
   airports when users describe airport-to-hotel transport in natural language. */
(function(){
'use strict';
const BUILD='8.67';
let pendingSnapshot=null;
function base(){return window.NOREYO_V800||null;}
function norm(v){return base()?.norm?.(v)||String(v||'').toLowerCase();}
function hits(text){const b=base();if(!b)return[];try{return b.suppressOverlaps?.(b.airportHits?.(text)||[])||[];}catch(_){return[];}}
function transportContext(t,hit){const before=t.slice(Math.max(0,hit.index-110),hit.index);const after=t.slice(hit.end,Math.min(t.length,hit.end+70));const origin=/\b(?:transfer|shuttle|taxi|abholung|abholen|mietwagen|bus)\b[\s\S]{0,55}\b(?:von|ab)\s*$/i.test(before);if(!origin)return false;return /^\s*(?:zum|ins|zum hotel|ins hotel|nach|zur|zum hafen|zur unterkunft|zum resort|weiter|abholen|transfer)\b/i.test(after)||/\b(?:hotel|unterkunft|resort|hafen)\b/i.test(after);}
function safeDepartures(text){const b=base();if(!b)return[];const t=norm(text),all=hits(text),accepted=[],out=[];for(const hit of all){if(transportContext(t,hit))continue;if(out.includes(hit.code))continue;let ok=false;try{ok=!!b.connectedToDeparture?.(t,hit,accepted);}catch(_){}if(!ok)continue;out.push(hit.code);accepted.push(hit);}return out;}
function hasTransportHit(text){const t=norm(text);return hits(text).some(hit=>transportContext(t,hit));}
function snapshotAirports(){try{return Array.isArray(searchState?.airports)?searchState.airports.map(String):[];}catch(_){return[];}}
function setAirports(codes){try{return base()?.setAirports?.(codes)||false;}catch(_){return false;}}
function inputText(){return document.getElementById('noreyoAi556Text')?.value||'';}
function repairAnalysis(text){if(!hasTransportHit(text))return false;const codes=safeDepartures(text),root=document.getElementById('noreyoAi556Result');if(!root)return false;const groups=[...root.querySelectorAll('.noreyo-v556-group')];const travel=groups.find(g=>/reise/i.test(g.querySelector('.noreyo-v556-grouplabel')?.textContent||''));const chips=travel?.querySelector('.noreyo-v556-chips');if(!chips)return false;[...chips.querySelectorAll('.noreyo-v556-chip')].forEach(chip=>{if(/^Abflug\s*·/i.test(String(chip.textContent||'').replace(/^✓\s*/,'')))chip.remove();});if(codes.length){const chip=document.createElement('span');chip.className='noreyo-v556-chip';chip.innerHTML='<i>✓</i>Abflug · '+codes.join(' / ');chips.appendChild(chip);}return true;}
function onAnalyze(e){if(!e.target?.closest?.('.noreyo-v556-analyze'))return;const text=inputText();setTimeout(()=>repairAnalysis(text),350);}
function onApply(e){if(!e.target?.closest?.('.noreyo-v556-apply'))return;const text=inputText();if(!hasTransportHit(text)){pendingSnapshot=null;return;}pendingSnapshot=snapshotAirports();const safe=safeDepartures(text);setTimeout(()=>setTimeout(()=>setTimeout(()=>setAirports(safe.length?safe:(pendingSnapshot||[])),0),0),0);}
document.addEventListener('click',onAnalyze,true);document.addEventListener('click',onApply,true);window.NOREYO_V867=Object.freeze({BUILD,base,norm,hits,transportContext,safeDepartures,hasTransportHit,snapshotAirports,setAirports,repairAnalysis});
})();