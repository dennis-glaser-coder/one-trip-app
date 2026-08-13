/* NOREYO V7.70 — future-aware numeric AI date ranges.
   Explicit numeric ranges without a year resolve to the next valid occurrence
   instead of first creating past dates that startup repair then moves to tomorrow.
   Cross-year ranges such as 28.12.–04.01. are handled naturally. */
(function(){
'use strict';
const BUILD='7.70';

function validParts(y,m,d){
  const x=new Date(y,m-1,d,12);
  return x.getFullYear()===y&&x.getMonth()===m-1&&x.getDate()===d;
}
function iso(y,m,d){
  return String(y).padStart(4,'0')+'-'+String(m).padStart(2,'0')+'-'+String(d).padStart(2,'0');
}
function todayParts(now=new Date()){
  return {y:now.getFullYear(),m:now.getMonth()+1,d:now.getDate()};
}
function parseNoYearRange(text,now=new Date()){
  const raw=String(text||'');
  const re=/\b(\d{1,2})[.\/]\s*(\d{1,2})\.?\s*(?:bis|[-–])\s*(\d{1,2})[.\/]\s*(\d{1,2})\.?(?!\s*\d)/i;
  const m=raw.match(re);
  if(!m)return null;

  const d1=+m[1],mo1=+m[2],d2=+m[3],mo2=+m[4];
  let y1=now.getFullYear();
  if(!validParts(y1,mo1,d1))return null;

  let y2=y1+(mo2<mo1||(mo2===mo1&&d2<=d1)?1:0);
  if(!validParts(y2,mo2,d2))return null;

  const today=todayParts(now);
  const todayIso=iso(today.y,today.m,today.d);
  let checkin=iso(y1,mo1,d1),checkout=iso(y2,mo2,d2);

  if(checkin<todayIso){
    y1++;
    y2=y1+(mo2<mo1||(mo2===mo1&&d2<=d1)?1:0);
    if(!validParts(y1,mo1,d1)||!validParts(y2,mo2,d2))return null;
    checkin=iso(y1,mo1,d1);
    checkout=iso(y2,mo2,d2);
  }
  if(checkout<=checkin)return null;
  return {checkin,checkout,label:`${d1}.${mo1}. – ${d2}.${mo2}.`,rolled:y1>today.y};
}
function inputText(){
  return document.getElementById('noreyoAi556Text')?.value||'';
}
function applyRange(range){
  if(!range)return false;
  try{
    if(typeof searchState==='undefined'||!searchState)return false;
    if(searchState.checkin===range.checkin&&searchState.checkout===range.checkout)return false;
    searchState.checkin=range.checkin;
    searchState.checkout=range.checkout;
    try{updateSearchUI?.();}catch(_){}
    try{updateCounts?.();}catch(_){}
    try{persistState?.();}catch(_){}
    return true;
  }catch(_){return false;}
}
function repairAnalysis(text){
  const range=parseNoYearRange(text);
  if(!range)return false;
  const root=document.getElementById('noreyoAi556Result');
  if(!root)return false;
  const chips=[...root.querySelectorAll('.noreyo-v556-chip')];
  const chip=chips.find(x=>/^Zeitraum\s*·/i.test(String(x.textContent||'').replace(/^✓\s*/,'').trim()));
  if(!chip)return false;
  const suffix=range.rolled?` · ${range.checkin.slice(0,4)}`:'';
  chip.innerHTML='<i>✓</i>Zeitraum · '+range.label+suffix;
  return true;
}
function onAnalyze(e){
  if(!e.target?.closest?.('.noreyo-v556-analyze'))return;
  const text=inputText();
  setTimeout(()=>repairAnalysis(text),180);
}
function onApply(e){
  if(!e.target?.closest?.('.noreyo-v556-apply'))return;
  const range=parseNoYearRange(inputText());
  if(!range)return;
  setTimeout(()=>setTimeout(()=>applyRange(range),0),0);
}
document.addEventListener('click',onAnalyze,true);
document.addEventListener('click',onApply,true);
window.NOREYO_V770=Object.freeze({
  BUILD,validParts,iso,todayParts,parseNoYearRange,inputText,applyRange,repairAnalysis
});
})();