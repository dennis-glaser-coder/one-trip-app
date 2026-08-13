/* NOREYO V7.96 — total-party semantics on expanded child vocabulary. */
(function(){
'use strict';
const BUILD='7.96';
const words={eins:1,eine:1,einer:1,einem:1,ein:1,einen:1,zwei:2,zweit:2,drei:3,dritt:3,vier:4,viert:4,fuenf:5,funf:5,fuenft:5,funft:5,sechs:6,sechst:6,sieben:7,siebt:7,acht:8,neun:9,neunt:9};
function norm(v){return window.NOREYO_V795?.norm?.(v)||String(v||'').toLowerCase();}
function number(v){const s=norm(v);if(/^[1-9]$/.test(s))return Number(s);return words[s]??null;}
function explicitAdults(text){const t=norm(text),m=t.match(/\b([1-9]|ein|eins|eine|einer|einem|zwei|drei|vier|fuenf|funf|sechs)\s+(?:erwachsene|erwachsenen)\b/);return m?number(m[1]):null;}
function childCount(text){try{const n=window.NOREYO_V795?.explicitChildCount?.(text);if(n!==null&&n!==undefined)return n;}catch(_){}try{const ages=window.NOREYO_V795?.groupedChildAges?.(text);if(Array.isArray(ages))return ages.length;}catch(_){}return null;}
function totalPersons(text){const t=norm(text),n='([1-9]|eins|zwei|drei|vier|fuenf|funf|sechs|sieben|acht|neun)',group='(zweit|dritt|viert|fuenft|funft|sechst|siebt|acht|neunt)';const patterns=[new RegExp('\\binsgesamt\\s+'+n+'\\s+(?:personen|person)\\b'),new RegExp('\\bwir\\s+sind\\s+(?:insgesamt\\s+)?'+n+'\\s+(?:personen|person)\\b'),new RegExp('\\b'+n+'\\s+(?:personen|person)\\s*,?\\s*davon\\b'),new RegExp('\\bwir\\s+sind\\s+'+n+'\\s*,?\\s*davon\\b'),new RegExp('\\bwir\\s+sind\\s+zu\\s+'+group+'\\b'),new RegExp('\\bzu\\s+'+group+'\\s*,?\\s*davon\\b')];for(const re of patterns){const m=t.match(re);if(m)return number(m[1]);}return null;}
function derive(text){if(explicitAdults(text)!==null)return null;const total=totalPersons(text),children=childCount(text);if(!Number.isInteger(total)||!Number.isInteger(children))return null;const adults=total-children;if(adults<1||adults>6||children<0||children>4||total>9)return null;return{total,children,adults};}
window.NOREYO_V796=Object.freeze({BUILD,norm,number,explicitAdults,childCount,totalPersons,derive});
})();