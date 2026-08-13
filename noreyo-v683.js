/* NOREYO V6.86 — departure-context airport reconciliation.
   Distinguishes real departure intent from date/price wording such as
   "ab 10.08." or "ab 900 Euro" while retaining unknown-city correction. */
(function(){
'use strict';
const BUILD='6.86';
const airportMap={duesseldorf:'DUS',dusseldorf:'DUS',dus:'DUS',koeln:'CGN',koln:'CGN','koeln/bonn':'CGN','koln/bonn':'CGN',cgn:'CGN',paderborn:'PAD',pad:'PAD',muenster:'FMO',munster:'FMO',fmo:'FMO',frankfurt:'FRA',fra:'FRA',hannover:'HAJ',haj:'HAJ',dortmund:'DTM',dtm:'DTM',hamburg:'HAM',ham:'HAM',muenchen:'MUC',munchen:'MUC',muc:'MUC',berlin:'BER',ber:'BER'};
const temporalHeads=/^(?:heute|morgen|uebermorgen|ubermorgen|sofort|montag|dienstag|mittwoch|donnerstag|freitag|samstag|sonntag|januar|februar|maerz|marz|april|mai|juni|juli|august|september|oktober|november|dezember|anfang|mitte|ende|naechste[nmrs]?|nachste[nmrs]?|dem|der)\b/;
function norm(v){return String(v||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/ß/g,'ss');}
function escRe(v){return String(v).replace(/[.*+?^${}()|[\]\\]/g,'\\$&');}
function occurrenceContext(t,start){const before=t.slice(Math.max(0,start-90),start),markers=[...before.matchAll(/\b(?:abflughafen|abflug|ab|von)\b/g)];if(!markers.length)return null;const m=markers[markers.length-1],segment=before.slice((m.index||0)+m[0].length);if(/\b(?:nach|ziel|zielort)\b/.test(segment))return null;return segment;}
function departureAirports(text){const t=norm(text),out=[];for(const [name,code] of Object.entries(airportMap)){const re=new RegExp('(^|[^a-z0-9])'+escRe(name)+'([^a-z0-9]|$)','g');let m;while((m=re.exec(t))){const start=(m.index||0)+m[1].length;if(occurrenceContext(t,start)!==null){if(!out.includes(code))out.push(code);break;}}}return out;}
function knownAirportMention(text){const t=norm(text);return Object.keys(airportMap).some(name=>new RegExp('(^|[^a-z0-9])'+escRe(name)+'([^a-z0-9]|$)').test(t));}
function departureIntent(text){
  const t=norm(text);
  if(/\b(?:abflughafen|abflug)\b/.test(t))return true;
  const re=/\b(?:ab|von)\s+([^,.;]{1,40})/g;let m;
  while((m=re.exec(t))){
    const tail=String(m[1]||'').trim();
    if(!tail||/^\d/.test(tail)||temporalHeads.test(tail))continue;
    if(/^(?:ca\.?\s*)?\d/.test(tail)||/^(?:max(?:imal)?|mindestens|unter|ueber|uber)\s+\d/.test(tail))continue;
    return true;
  }
  return false;
}
function airportDecision(text,current=[],m=''){const parsed=departureAirports(text),selected=Array.isArray(current)?current.map(String).filter(Boolean):[];if(parsed.length)return{airports:parsed,source:'text',missing:false};if(departureIntent(text))return{airports:selected,source:'unresolved',missing:['package','flight'].includes(m)};if(selected.length)return{airports:selected,source:'existing',missing:false};return{airports:[],source:'none',missing:['package','flight'].includes(m)};}
function mode(){return document.getElementById('noreyoAi556')?.dataset.mode||'';}
function inputText(){return document.getElementById('noreyoAi556Text')?.value||'';}
function snapshotAirports(){try{return Array.isArray(searchState?.airports)?searchState.airports.map(String):[];}catch(_){return[];}}
function refresh(){try{updateSearchUI?.();}catch(_){ }try{updateCounts?.();}catch(_){ }try{persistState?.();}catch(_){ }}
function applyAirports(text,snapshot=[]){const m=mode();if(!['package','flight'].includes(m))return false;const decision=airportDecision(text,snapshot,m);if(decision.source!=='text'&&!knownAirportMention(text))return false;try{if(typeof searchState==='undefined'||!searchState)return false;const old=Array.isArray(searchState.airports)?searchState.airports.map(String):[];if(old.length===decision.airports.length&&old.every((v,i)=>v===decision.airports[i]))return false;searchState.airports=decision.airports.slice();refresh();return true;}catch(_){return false;}}
function missingParts(open){if(!open)return[];const m=String(open.textContent||'').match(/Noch offen:\s*(.*?)\.\s*Du kannst/i);return(m?.[1]||'').split('·').map(x=>x.trim()).filter(Boolean);}
function renderMissing(root,parts){let open=root.querySelector('.noreyo-v556-open');const unique=[...new Set(parts.filter(Boolean))];if(!unique.length){open?.remove();return;}if(!open){open=document.createElement('p');open.className='noreyo-v556-open';const anchor=root.querySelector('.noreyo-v556-safe,.noreyo-v556-actions');anchor?.insertAdjacentElement('beforebegin',open);}open.innerHTML='<b>Noch offen:</b> '+unique.join(' · ')+'. Du kannst das anschließend in der normalen Suche ergänzen.';}
function repairAnalysis(text){const root=document.getElementById('noreyoAi556Result');if(!root?.querySelector('.noreyo-v556-result'))return false;const m=mode(),decision=airportDecision(text,snapshotAirports(),m),chips=[...root.querySelectorAll('.noreyo-v556-chip')];let old=chips.find(ch=>/^Abflug\s*·/i.test(String(ch.textContent||'').replace(/^✓\s*/,'')));if(decision.airports.length&&!decision.missing){const label='Abflug · '+decision.airports.join(' / ')+(decision.source==='existing'?' · bereits gewählt':'');if(old)old.innerHTML='<i>✓</i>'+label;else{const travel=[...root.querySelectorAll('.noreyo-v556-group')].find(g=>/reise/i.test(g.querySelector('.noreyo-v556-grouplabel')?.textContent||''));travel?.querySelector('.noreyo-v556-chips')?.insertAdjacentHTML('beforeend','<span class="noreyo-v556-chip"><i>✓</i>'+label+'</span>');}}else old?.remove();let parts=missingParts(root.querySelector('.noreyo-v556-open')).filter(x=>!/^Abflughafen$/i.test(x));if(decision.missing)parts.push('Abflughafen');renderMissing(root,parts);return true;}
function onApply(e){if(!e.target?.closest?.('.noreyo-v556-apply'))return;const text=inputText(),snapshot=snapshotAirports();setTimeout(()=>applyAirports(text,snapshot),0);}
function onAnalyze(e){if(!e.target?.closest?.('.noreyo-v556-analyze'))return;const text=inputText();setTimeout(()=>repairAnalysis(text),0);}
document.addEventListener('click',onApply,true);document.addEventListener('click',onAnalyze,true);
window.NOREYO_V683=Object.freeze({BUILD,departureAirports,knownAirportMention,departureIntent,airportDecision,applyAirports,repairAnalysis});
})();