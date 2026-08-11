/* NOREYO V7.87 — total-party semantics including babies and toddlers.
   Natural totals such as “4 Personen, davon 1 Baby” now derive adults correctly
   instead of silently skipping the total-party correction. */
(function(){
'use strict';
const BUILD='7.87';
const words={eins:1,eine:1,einer:1,einem:1,ein:1,einen:1,zwei:2,zweit:2,drei:3,dritt:3,vier:4,viert:4,fuenf:5,funf:5,fuenft:5,funft:5,sechs:6,sechst:6,sieben:7,siebt:7,acht:8,neun:9,neunt:9};
function norm(v){return String(v||'').toLowerCase().replace(/ä/g,'ae').replace(/ö/g,'oe').replace(/ü/g,'ue').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/ß/g,'ss').replace(/\s+/g,' ').trim();}
function number(v){const s=norm(v);if(/^[1-9]$/.test(s))return Number(s);return words[s]??null;}
function explicitAdults(text){const t=norm(text),m=t.match(/\b([1-9]|ein|eins|eine|einer|einem|zwei|drei|vier|fuenf|funf|sechs)\s+(?:erwachsene|erwachsenen)\b/);return m?number(m[1]):null;}
function childCount(text){const t=norm(text);if(/\b(?:keine|kein|ohne)\s+(?:kinder|kind|babys?|kleinkinder?|kleinkind)\b/.test(t)||/\bnur erwachsene\b/.test(t))return 0;const m=t.match(/\b([1-4]|ein|eins|eine|einen|einem|einer|zwei|drei|vier)\s+(?:kinder|kindern|kind|babys?|kleinkinder?|kleinkind)\b/);if(m)return number(m[1]);for(const api of [window.NOREYO_V774,window.NOREYO_V747]){try{const ages=api?.groupedChildAges?.(text);if(Array.isArray(ages))return ages.length;}catch(_){}}return null;}
function totalPersons(text){const t=norm(text),n='([1-9]|eins|zwei|drei|vier|fuenf|funf|sechs|sieben|acht|neun)',group='(zweit|dritt|viert|fuenft|funft|sechst|siebt|acht|neunt)';const patterns=[new RegExp('\\binsgesamt\\s+'+n+'\\s+(?:personen|person)\\b'),new RegExp('\\bwir\\s+sind\\s+(?:insgesamt\\s+)?'+n+'\\s+(?:personen|person)\\b'),new RegExp('\\b'+n+'\\s+(?:personen|person)\\s*,?\\s*davon\\b'),new RegExp('\\bwir\\s+sind\\s+'+n+'\\s*,?\\s*davon\\b'),new RegExp('\\bwir\\s+sind\\s+zu\\s+'+group+'\\b'),new RegExp('\\bzu\\s+'+group+'\\s*,?\\s*davon\\b')];for(const re of patterns){const m=t.match(re);if(m)return number(m[1]);}return null;}
function derive(text){const adultsExplicit=explicitAdults(text);if(adultsExplicit!==null)return null;const total=totalPersons(text),children=childCount(text);if(!Number.isInteger(total)||!Number.isInteger(children))return null;const adults=total-children;if(adults<1||adults>6||children<0||children>4||total>9)return null;return{total,children,adults};}
function applyDerived(d){if(!d)return false;try{if(typeof searchState==='undefined'||!searchState)return false;if(Number(searchState.adults)===d.adults)return false;searchState.adults=d.adults;try{updateSearchUI?.();}catch(_){}try{updateCounts?.();}catch(_){}try{persistState?.();}catch(_){}return true;}catch(_){return false;}}
function onApply(e){if(!e.target?.closest?.('.noreyo-v556-apply'))return;const text=document.getElementById('noreyoAi556Text')?.value||'';const d=derive(text);if(!d)return;setTimeout(()=>setTimeout(()=>setTimeout(()=>applyDerived(d),0),0),0);}
document.addEventListener('click',onApply,true);
window.NOREYO_V787=Object.freeze({BUILD,norm,number,explicitAdults,childCount,totalPersons,derive,applyDerived});
})();