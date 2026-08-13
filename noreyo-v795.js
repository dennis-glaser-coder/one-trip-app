/* NOREYO V7.95 — expanded natural child vocabulary and age parsing.
   Accepts common German forms such as Babys/Babies, Kleinkinder/Kleinkindern
   and Säugling/Säuglinge while preserving duration false-positive protection. */
(function(){
'use strict';
const BUILD='7.95';
const CHILD='(?:kinder|kindern|kind|bab(?:y|ys|ies)|kleinkind(?:er|ern)?|saeugling(?:e|en)?)';
function norm(v){return String(v||'').toLowerCase().replace(/ä/g,'ae').replace(/ö/g,'oe').replace(/ü/g,'ue').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/ß/g,'ss').replace(/\s+/g,' ').trim();}
function wordNumber(v){const map={ein:1,eine:1,einen:1,einem:1,einer:1,eins:1,zwei:2,drei:3,vier:4};const s=norm(v);if(/^[1-4]$/.test(s))return Number(s);return map[s]??null;}
function explicitChildCount(text){
  const t=norm(text);
  if(new RegExp('\\b(?:ohne|keine|kein)\\s+'+CHILD+'\\b').test(t)||/\bnur erwachsene\b/.test(t))return 0;
  const m=t.match(new RegExp('\\b([1-4]|ein(?:e|en|em|er|s)?|zwei|drei|vier)\\s+(?:kleine\\s+)?'+CHILD+'\\b'));
  return m?wordNumber(m[1]):null;
}
function childSegment(text){
  const t=norm(text),m=new RegExp('\\b'+CHILD+'\\b').exec(t);
  if(!m)return'';
  const start=m.index+m[0].length;
  let seg=t.slice(start,start+140);
  const sentence=seg.search(/[.!?;]/);
  if(sentence>=0)seg=seg.slice(0,sentence);
  return seg.trim();
}
function validAge(n){return Number.isInteger(n)&&n>=0&&n<=17;}
function addAge(out,n){if(validAge(n)&&out.length<4)out.push(n);}
function sharedYears(segment){
  const out=[],re=/((?:\b\d{1,2}\b\s*(?:,\s*|\bund\b\s*)){1,3}\b\d{1,2}\b)\s*(?:jahre?|j\.)\b/g;let m;
  while((m=re.exec(segment)))(m[1].match(/\d{1,2}/g)||[]).forEach(x=>addAge(out,Number(x)));
  return out;
}
function sharedMonths(segment){
  const out=[],re=/((?:\b\d{1,2}\b\s*(?:,\s*|\bund\b\s*)){0,3}\b\d{1,2}\b)\s*monate?\b/g;let m;
  while((m=re.exec(segment)))(m[1].match(/\d{1,2}/g)||[]).forEach(x=>{const n=Number(x);if(Number.isInteger(n)&&n>=0&&n<=23)addAge(out,Math.floor(n/12));});
  return out;
}
function individuallyQualified(segment){
  const out=[],re=/\b(\d{1,2})\s*(jahre?|jahr|j\.|monate?|monat)\b/g;let m;
  while((m=re.exec(segment))){const n=Number(m[1]);if(/monat/.test(m[2])){if(n>=0&&n<=23)addAge(out,Math.floor(n/12));}else addAge(out,n);}
  return out;
}
function bareGrouped(segment,count){
  if(!Number.isInteger(count)||count<1||count>4)return[];
  const m=segment.match(/^[\s,:-]*(?:(?:im\s+alter\s+von|alter(?:n)?(?:\s+von)?|sind)\s+)?((?:\d{1,2}\s*(?:,|\bund\b)\s*){0,3}\d{1,2})\b/i);
  if(!m)return[];
  const tail=segment.slice((m.index||0)+m[0].length);
  if(/^\s*(?:tage?|naechte?|nachte|wochen?|stunden?|euro|€)\b/i.test(tail))return[];
  const nums=(m[1].match(/\d{1,2}/g)||[]).map(Number);
  if(nums.length!==count||nums.some(n=>!validAge(n)))return[];
  return nums;
}
function groupedChildAges(text){
  const count=explicitChildCount(text);
  if(count===0)return[];
  const segment=childSegment(text);
  if(!segment)return null;
  let ages=sharedYears(segment);
  if(!ages.length)ages=sharedMonths(segment);
  if(!ages.length)ages=individuallyQualified(segment);
  if(!ages.length)ages=bareGrouped(segment,count);
  if(!ages.length)return null;
  if(count!==null&&ages.length!==count)return null;
  if(count===null&&(ages.length<1||ages.length>4))return null;
  return ages;
}
window.NOREYO_V795=Object.freeze({BUILD,CHILD,norm,wordNumber,explicitChildCount,childSegment,validAge,sharedYears,sharedMonths,individuallyQualified,bareGrouped,groupedChildAges});
})();