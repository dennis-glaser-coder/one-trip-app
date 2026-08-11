/* NOREYO V8.44 — natural "ab/von Flughafen …" departure phrasing.
   Complements V8.00 without changing its proven airport dictionary. */
(function(){
'use strict';
const BUILD='8.44';
function base(){return window.NOREYO_V800||null;}
function norm(v){return base()?.norm?.(v)||String(v||'').toLowerCase();}
function hits(text){const b=base();if(!b)return[];try{return b.suppressOverlaps?.(b.airportHits?.(text)||[])||[];}catch(_){return[];}}
function firstCue(t,hit){const before=t.slice(Math.max(0,hit.index-72),hit.index);return /(?:^|\s)(?:ab|von|abflug\s+ab|flug\s+ab|start(?:en)?\s+ab|fliegen\s+ab)\s+(?:dem\s+)?flughafen\s*$/i.test(before);}
function parseAirportKeyword(text){const t=norm(text),all=hits(text),accepted=[],out=[];for(const hit of all){if(out.includes(hit.code))continue;let ok=false;if(!accepted.length)ok=firstCue(t,hit);else{const prev=accepted[accepted.length-1],between=t.slice(prev.end,hit.index);ok=/^\s*(?:,|\/|\+|\bund\b|\boder\b)\s*$/i.test(between);}if(!ok)continue;out.push(hit.code);accepted.push(hit);}return out;}
function setAirports(codes){const b=base();try{return b?.setAirports?.(codes)||false;}catch(_){return false;}}
function inputText(){return document.getElementById('noreyoAi556Text')?.value||'';}
function repairAnalysis(text){const codes=parseAirportKeyword(text);if(!codes.length)return false;const root=document.getElementById('noreyoAi556Result');if(!root)return false;const groups=[...root.querySelectorAll('.noreyo-v556-group')];const travel=groups.find(g=>/reise/i.test(g.querySelector('.noreyo-v556-grouplabel')?.textContent||''));const chips=travel?.querySelector('.noreyo-v556-chips');if(!chips)return false;[...chips.querySelectorAll('.noreyo-v556-chip')].forEach(chip=>{if(/^Abflug\s*·/i.test(String(chip.textContent||'').replace(/^✓\s*/,'')))chip.remove();});const chip=document.createElement('span');chip.className='noreyo-v556-chip';chip.innerHTML='<i>✓</i>Abflug · '+codes.join(' / ');chips.appendChild(chip);return true;}
function onAnalyze(e){if(!e.target?.closest?.('.noreyo-v556-analyze'))return;const text=inputText();setTimeout(()=>repairAnalysis(text),220);}
function onApply(e){if(!e.target?.closest?.('.noreyo-v556-apply'))return;const text=inputText(),codes=parseAirportKeyword(text);if(!codes.length)return;setTimeout(()=>setTimeout(()=>setAirports(codes),0),0);}
document.addEventListener('click',onAnalyze,true);document.addEventListener('click',onApply,true);window.NOREYO_V844=Object.freeze({BUILD,base,norm,hits,firstCue,parseAirportKeyword,setAirports,repairAnalysis});
})();