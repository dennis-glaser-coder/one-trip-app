/* NOREYO V7.45 — natural grouped child-age parsing.
   Supports common phrases such as "2 Kinder, 5 und 8 Jahre" or
   "3 Kinder, 4, 7 und 12 Jahre" without mistaking trip duration for ages. */
(function(){
'use strict';
const BUILD='7.45';
function norm(v){return String(v||'').toLowerCase().replace(/ä/g,'ae').replace(/ö/g,'oe').replace(/ü/g,'ue').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/ß/g,'ss').replace(/\s+/g,' ').trim();}
function wordNumber(v){const map={ein:1,eine:1,einen:1,einem:1,einer:1,zwei:2,drei:3,vier:4};const s=norm(v);if(/^[1-4]$/.test(s))return Number(s);return map[s]??null;}
function explicitChildCount(text){const t=norm(text);if(/\b(?:ohne|keine|kein)\s+(?:kinder|kind|babys?)\b/.test(t)||/\bnur erwachsene\b/.test(t))return 0;const m=t.match(/\b([1-4]|ein(?:e|en|em|er)?|zwei|drei|vier)\s+(?:kinder|kindern|kind|babys?)\b/);return m?wordNumber(m[1]):null;}
function childSegment(text){const t=norm(text),m=/\b(?:kinder|kindern|kind|babys?)\b/.exec(t);if(!m)return'';const start=m.index+m[0].length;let seg=t.slice(start,start+120);const sentence=seg.search(/[.!?;]/);if(sentence>=0)seg=seg.slice(0,sentence);return seg.trim();}
function validAge(n){return Number.isInteger(n)&&n>=0&&n<=17;}
function addUnique(out,n){if(validAge(n)&&!out.includes(n)&&out.length<4)out.push(n);}
function sharedYears(segment){const out=[],re=/((?:\b\d{1,2}\b\s*(?:,\s*|\bund\b\s*)){1,3}\b\d{1,2}\b)\s*(?:jahre?|j\.)\b/g;let m;while((m=re.exec(segment))){const nums=m[1].match(/\d{1,2}/g)||[];nums.forEach(x=>addUnique(out,Number(x)));}return out;}
function sharedMonths(segment){const out=[],re=/((?:\b\d{1,2}\b\s*(?:,\s*|\bund\b\s*)){1,3}\b\d{1,2}\b)\s*monate?\b/g;let m;while((m=re.exec(segment))){const nums=m[1].match(/\d{1,2}/g)||[];nums.forEach(x=>{const n=Number(x);if(Number.isInteger(n)&&n>=0&&n<=23)addUnique(out,Math.floor(n/12));});}return out;}
function individuallyQualified(segment){const out=[],re=/\b(\d{1,2})\s*(jahre?|jahr|j\.|monate?|monat)\b/g;let m;while((m=re.exec(segment))){const n=Number(m[1]);if(/monat/.test(m[2])){if(n>=0&&n<=23)addUnique(out,Math.floor(n/12));}else addUnique(out,n);}return out;}
function groupedChildAges(text){const count=explicitChildCount(text);if(count===0)return[];const segment=childSegment(text);if(!segment)return null;let ages=sharedYears(segment);if(!ages.length)ages=sharedMonths(segment);if(!ages.length)ages=individuallyQualified(segment);if(!ages.length)return null;if(count!==null&&ages.length!==count)return null;if(count===null&&(ages.length<1||ages.length>4))return null;return ages;}
function refresh(){try{updateSearchUI?.();}catch(_){}try{updateCounts?.();}catch(_){}try{persistState?.();}catch(_){}}
function reconcile(text){const ages=groupedChildAges(text);if(!Array.isArray(ages))return false;try{if(typeof searchState==='undefined'||!searchState)return false;const old=Array.isArray(searchState.childAges)?searchState.childAges.map(Number):[];if(old.length===ages.length&&old.every((v,i)=>v===ages[i]))return false;searchState.childAges=ages.slice();refresh();return true;}catch(_){return false;}}
function onApply(e){if(!e.target?.closest?.('.noreyo-v556-apply'))return;const text=document.getElementById('noreyoAi556Text')?.value||'';setTimeout(()=>setTimeout(()=>reconcile(text),0),0);}
document.addEventListener('click',onApply,true);
window.NOREYO_V745=Object.freeze({BUILD,norm,wordNumber,explicitChildCount,childSegment,sharedYears,sharedMonths,individuallyQualified,groupedChildAges,reconcile});
})();