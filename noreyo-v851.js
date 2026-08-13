/* NOREYO V8.51 — complete natural Flughafen departure cues.
   Extends V8.44 with common "vom Flughafen …" phrasing while excluding
   pickup/transfer wording that describes ground transport, not departure. */
(function(){
'use strict';
const BUILD='8.51';
function base(){return window.NOREYO_V800||null;}
function norm(v){return base()?.norm?.(v)||String(v||'').toLowerCase();}
function hits(text){const b=base();if(!b)return[];try{return b.suppressOverlaps?.(b.airportHits?.(text)||[])||[];}catch(_){return[];}}
function cueBefore(t,hit){const before=t.slice(Math.max(0,hit.index-90),hit.index);return /(?:^|\s)(?:(?:ab|von)\s+(?:dem\s+)?flughafen|vom\s+flughafen|abflug\s+ab\s+(?:dem\s+)?flughafen|flug\s+ab\s+(?:dem\s+)?flughafen|start(?:en)?\s+ab\s+(?:dem\s+)?flughafen|fliegen\s+ab\s+(?:dem\s+)?flughafen)\s*$/i.test(before);}
function groundTransportContext(t,hit){const before=t.slice(Math.max(0,hit.index-100),hit.index),after=t.slice(hit.end,Math.min(t.length,hit.end+48));if(/\b(?:transfer|abholung|abholen|shuttle|taxi)\b[\s\S]{0,45}\b(?:vom|von dem)\s+flughafen\s*$/i.test(before))return true;if(/^\s*(?:abholen|abholung|zum hotel|ins hotel|nach hause|mit dem taxi|per taxi|transfer)\b/i.test(after))return true;return false;}
function firstCue(t,hit){return cueBefore(t,hit)&&!groundTransportContext(t,hit);}
function parseAirportKeyword(text){const t=norm(text),all=hits(text),accepted=[],out=[];for(const hit of all){if(out.includes(hit.code))continue;let ok=false;if(!accepted.length)ok=firstCue(t,hit);else{const prev=accepted[accepted.length-1],between=t.slice(prev.end,hit.index);ok=/^\s*(?:,|\/|\+|\bund\b|\boder\b)\s*$/i.test(between)&&!groundTransportContext(t,hit);}if(!ok)continue;out.push(hit.code);accepted.push(hit);}return out;}
function setAirports(codes){try{return base()?.setAirports?.(codes)||false;}catch(_){return false;}}
function inputText(){return document.getElementById('noreyoAi556Text')?.value||'';}
function repairAnalysis(text){const codes=parseAirportKeyword(text);if(!codes.length)return false;const root=document.getElementById('noreyoAi556Result');if(!root)return false;const groups=[...root.querySelectorAll('.noreyo-v556-group')],travel=groups.find(g=>/reise/i.test(g.querySelector('.noreyo-v556-grouplabel')?.textContent||'')),chips=travel?.querySelector('.noreyo-v556-chips');if(!chips)return false;[...chips.querySelectorAll('.noreyo-v556-chip')].forEach(chip=>{if(/^Abflug\s*·/i.test(String(chip.textContent||'').replace(/^✓\s*/,'')))chip.remove();});const chip=document.createElement('span');chip.className='noreyo-v556-chip';chip.innerHTML='<i>✓</i>Abflug · '+codes.join(' / ');chips.appendChild(chip);return true;}
function onAnalyze(e){if(!e.target?.closest?.('.noreyo-v556-analyze'))return;const text=inputText();setTimeout(()=>repairAnalysis(text),260);}
function onApply(e){if(!e.target?.closest?.('.noreyo-v556-apply'))return;const codes=parseAirportKeyword(inputText());if(!codes.length)return;setTimeout(()=>setTimeout(()=>setAirports(codes),0),0);}
document.addEventListener('click',onAnalyze,true);document.addEventListener('click',onApply,true);window.NOREYO_V851=Object.freeze({BUILD,base,norm,hits,cueBefore,groundTransportContext,firstCue,parseAirportKeyword,setAirports,repairAnalysis});
})();