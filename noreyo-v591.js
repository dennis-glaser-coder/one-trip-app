/* NOREYO V5.91 — natural-language adult/budget ambiguity guard.
   Prevents duration phrases such as "für zwei Wochen" from acting like an adult count. */
(function(){
'use strict';
const BUILD='5.91';

function norm(v){return String(v||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/ß/g,'ss');}
function naturalText(){return document.getElementById('noreyoAi556Text')?.value||'';}
function explicitAdults(text){
  const t=norm(text);
  return /\bzu zweit\b/.test(t)||/\b(?:[1-9]|ein(?:e|en|em|er)?|zwei|drei|vier|fuenf|funf|sechs|sieben|acht|neun)\s+(?:erwachsen(?:e|er|en)?|personen?|reisende)\b/.test(t);
}
function currentAdults(){
  try{
    const n=Math.round(Number(searchState?.adults));
    return Number.isInteger(n)&&n>=1&&n<=6?n:null;
  }catch(_){return null;}
}
function perPersonBudget(text){
  const t=norm(text);
  if(!/\b(?:pro person|je person|p\.?\s*p\.?)\b/.test(t))return null;
  const patterns=[
    /(?:max(?:imal)?\.?|bis|budget(?: von)?|hoechstens|hochstens)\s*(?:ca\.?\s*)?([0-9][0-9\.\s]{2,})\s*(?:€|euro)/i,
    /([0-9][0-9\.\s]{2,})\s*(?:€|euro)\s*(?:max(?:imal)?\.?|budget|pro person|je person|p\.?\s*p\.?)?/i
  ];
  for(const re of patterns){
    const m=t.match(re);if(!m)continue;
    const n=Number(m[1].replace(/[\.\s]/g,''));
    if(Number.isFinite(n)&&n>=100&&n<=50000)return n;
  }
  return null;
}
function refresh(){
  try{if(typeof updateSearchUI==='function')updateSearchUI();}catch(_){ }
  try{if(typeof updateCounts==='function')updateCounts();}catch(_){ }
  try{if(typeof persistState==='function')persistState();}catch(_){ }
}
function repairAnalysis(text){
  if(explicitAdults(text))return;
  const result=document.getElementById('noreyoAi556Result');if(!result)return;
  result.querySelectorAll('.noreyo-v556-chip').forEach(chip=>{
    if(/reisende\s*·/i.test(String(chip.textContent||'')))chip.remove();
  });
  result.querySelectorAll('.noreyo-v556-group').forEach(group=>{
    const chips=group.querySelector('.noreyo-v556-chips');
    if(chips&&!chips.children.length)group.remove();
  });
}
function onAnalyzeCapture(e){
  if(!e.target?.closest?.('.noreyo-v556-analyze'))return;
  const text=naturalText();
  setTimeout(()=>repairAnalysis(text),0);
}
function onApplyCapture(e){
  if(!e.target?.closest?.('.noreyo-v556-apply'))return;
  const text=naturalText();if(explicitAdults(text))return;
  const adults=currentAdults();if(!adults)return;
  const pp=perPersonBudget(text);
  setTimeout(()=>{
    let changed=false;
    try{
      if(typeof searchState!=='undefined'&&searchState&&Math.round(Number(searchState.adults))!==adults){searchState.adults=adults;changed=true;}
    }catch(_){ }
    try{
      if(pp&&typeof limits!=='undefined'&&limits){const total=pp*adults;if(Number(limits.maxHotelPrice)!==total){limits.maxHotelPrice=total;changed=true;}}
    }catch(_){ }
    if(changed)refresh();
  },0);
}

document.addEventListener('click',onAnalyzeCapture,true);
document.addEventListener('click',onApplyCapture,true);
window.NOREYO_V591=Object.freeze({BUILD,explicitAdults,perPersonBudget,currentAdults,repairAnalysis});
})();