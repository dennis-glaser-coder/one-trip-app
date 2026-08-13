/* NOREYO V7.72 — total-party traveller semantics.
   Corrects natural phrases where "Personen" is explicitly the total party
   (e.g. "wir sind 4 Personen, davon 2 Kinder") so children are not added
   on top of that total. Explicit adult wording always wins. */
(function(){
'use strict';
const BUILD='7.72';
const words={eins:1,eine:1,einer:1,einem:1,ein:1,zwei:2,drei:3,vier:4,fuenf:5,funf:5,sechs:6,sieben:7,acht:8,neun:9};

function norm(v){
  return String(v||'').toLowerCase()
    .replace(/ä/g,'ae').replace(/ö/g,'oe').replace(/ü/g,'ue')
    .normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/ß/g,'ss')
    .replace(/\s+/g,' ').trim();
}
function number(v){
  const s=norm(v);
  if(/^[1-9]$/.test(s))return Number(s);
  return words[s]??null;
}
function explicitAdults(text){
  const t=norm(text);
  const m=t.match(/\b([1-9]|ein|eins|eine|einer|einem|zwei|drei|vier|fuenf|funf|sechs)\s+(?:erwachsene|erwachsenen)\b/);
  return m?number(m[1]):null;
}
function childCount(text){
  const t=norm(text);
  if(/\b(?:keine|kein|ohne)\s+(?:kinder|kind)\b/.test(t))return 0;
  let m=t.match(/\b([1-4]|ein|eine|einen|einem|einer|zwei|drei|vier)\s+(?:kinder|kindern|kind)\b/);
  if(m)return number(m[1]);
  try{
    const ages=window.NOREYO_V747?.groupedChildAges?.(text);
    if(Array.isArray(ages))return ages.length;
  }catch(_){}
  return null;
}
function totalPersons(text){
  const t=norm(text),n='([1-9]|eins|zwei|drei|vier|fuenf|funf|sechs|sieben|acht|neun)';
  const patterns=[
    new RegExp('\\binsgesamt\\s+'+n+'\\s+(?:personen|person)\\b'),
    new RegExp('\\bwir\\s+sind\\s+(?:insgesamt\\s+)?'+n+'\\s+(?:personen|person)\\b'),
    new RegExp('\\b'+n+'\\s+(?:personen|person)\\s*,?\\s*davon\\b'),
    new RegExp('\\bzu\\s+'+n+'(?:t|st)?\\s*,?\\s*davon\\b')
  ];
  for(const re of patterns){
    const m=t.match(re);
    if(m)return number(m[1]);
  }
  return null;
}
function derive(text){
  const adultsExplicit=explicitAdults(text);
  if(adultsExplicit!==null)return null;
  const total=totalPersons(text),children=childCount(text);
  if(!Number.isInteger(total)||!Number.isInteger(children))return null;
  const adults=total-children;
  if(adults<1||adults>6||children<0||children>4||total>9)return null;
  return{total,children,adults};
}
function applyDerived(d){
  if(!d)return false;
  try{
    if(typeof searchState==='undefined'||!searchState)return false;
    if(Number(searchState.adults)===d.adults)return false;
    searchState.adults=d.adults;
    try{updateSearchUI?.();}catch(_){}
    try{updateCounts?.();}catch(_){}
    try{persistState?.();}catch(_){}
    return true;
  }catch(_){return false;}
}
function onApply(e){
  if(!e.target?.closest?.('.noreyo-v556-apply'))return;
  const text=document.getElementById('noreyoAi556Text')?.value||'';
  const d=derive(text);
  if(!d)return;
  setTimeout(()=>setTimeout(()=>setTimeout(()=>applyDerived(d),0),0),0);
}
document.addEventListener('click',onApply,true);
window.NOREYO_V772=Object.freeze({
  BUILD,norm,number,explicitAdults,childCount,totalPersons,derive,applyDerived
});
})();