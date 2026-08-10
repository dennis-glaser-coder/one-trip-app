/* NOREYO V5.93 — natural-language traveller + budget disambiguation.
   Repairs legacy V5.56 ambiguity after explicit AI apply without disturbing manual search edits. */
(function(){
'use strict';
const BUILD='5.93';

function norm(v){return String(v||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/ß/g,'ss');}
function naturalText(){return document.getElementById('noreyoAi556Text')?.value||'';}
function wordNumber(v){
  const map={ein:1,eine:1,einen:1,einem:1,einer:1,zwei:2,drei:3,vier:4,fuenf:5,funf:5,sechs:6};
  const s=norm(v).trim();
  return /^\d$/.test(s)?Number(s):(map[s]??null);
}
function adultCount(text){
  const t=norm(text);
  let m=t.match(/\b([1-6]|ein(?:e|en|em|er)?|zwei|drei|vier|fuenf|funf|sechs)\s+(?:erwachsen(?:e|er|en)?|personen?|reisende)\b/);
  if(m)return wordNumber(m[1]);
  const party={zweit:2,dritt:3,viert:4,fuenft:5,funft:5,sechst:6};
  m=t.match(/\bzu\s+(zweit|dritt|viert|fuenft|funft|sechst)\b/);
  if(m)return party[m[1]]||null;
  m=t.match(/\bwir\s+sind\s+([1-6]|zwei|drei|vier|fuenf|funf|sechs)\b/);
  return m?wordNumber(m[1]):null;
}
function explicitAdults(text){return adultCount(text)!==null;}
function currentAdults(){
  try{
    const n=Math.round(Number(searchState?.adults));
    return Number.isInteger(n)&&n>=1&&n<=6?n:null;
  }catch(_){return null;}
}
function money(v){
  const n=Number(String(v||'').replace(/[.\s]/g,'').replace(',','.'));
  return Number.isFinite(n)&&n>=100&&n<=50000?n:null;
}
function euroMentions(t){
  return [...t.matchAll(/([0-9][0-9.\s]{2,})\s*(?:€|euro)/gi)].map(m=>({
    amount:money(m[1]),index:m.index||0,end:(m.index||0)+m[0].length,text:m[0]
  })).filter(x=>x.amount!==null);
}
function perPersonBudget(text){
  const t=norm(text),mentions=euroMentions(t);
  if(!mentions.length)return null;

  for(const x of mentions){
    const before=t.slice(Math.max(0,x.index-42),x.index);
    const after=t.slice(x.end,Math.min(t.length,x.end+24));
    const ppAfter=/^\s*(?:pro person|je person|p\.?\s*p\.?)/.test(after);
    const ppBefore=/(?:pro person|je person|p\.?\s*p\.?)\s*(?:max(?:imal)?\.?|bis|budget(?: von)?|hoechstens|hochstens)?\s*(?:ca\.?\s*)?$/.test(before);
    const budgetBefore=/(?:max(?:imal)?\.?|bis|budget(?: von)?|hoechstens|hochstens)\s*(?:ca\.?\s*)?$/.test(before);
    if((ppAfter&&budgetBefore)||ppBefore)return x.amount;
  }

  if(mentions.length===1){
    const x=mentions[0],after=t.slice(x.end,Math.min(t.length,x.end+24)),before=t.slice(Math.max(0,x.index-24),x.index);
    if(/^\s*(?:pro person|je person|p\.?\s*p\.?)/.test(after)||
       /(?:pro person|je person|p\.?\s*p\.?)\s*(?:ca\.?\s*)?$/.test(before))return x.amount;
  }
  return null;
}
function refresh(){
  try{if(typeof updateSearchUI==='function')updateSearchUI();}catch(_){ }
  try{if(typeof updateCounts==='function')updateCounts();}catch(_){ }
  try{if(typeof persistState==='function')persistState();}catch(_){ }
}
function repairAnalysis(text){
  const adults=adultCount(text),result=document.getElementById('noreyoAi556Result');if(!result)return;
  const travellerChips=[...result.querySelectorAll('.noreyo-v556-chip')].filter(chip=>/reisende\s*·/i.test(String(chip.textContent||'')));
  if(adults===null)travellerChips.forEach(chip=>chip.remove());
  else travellerChips.forEach(chip=>{chip.innerHTML='<i>✓</i>Reisende · '+adults+' '+(adults===1?'Person':'Personen');});
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
  const text=naturalText();
  const selected=currentAdults(),parsed=adultCount(text),effective=parsed||selected;
  if(!effective)return;
  const pp=perPersonBudget(text);
  setTimeout(()=>{
    let changed=false;
    try{
      if(parsed&&typeof searchState!=='undefined'&&searchState&&Math.round(Number(searchState.adults))!==parsed){
        searchState.adults=parsed;changed=true;
      }else if(!parsed&&selected&&typeof searchState!=='undefined'&&searchState&&Math.round(Number(searchState.adults))!==selected){
        searchState.adults=selected;changed=true;
      }
    }catch(_){ }
    try{
      if(pp&&typeof limits!=='undefined'&&limits){
        const total=pp*effective;
        if(Number(limits.maxHotelPrice)!==total){limits.maxHotelPrice=total;changed=true;}
      }
    }catch(_){ }
    if(changed)refresh();
  },0);
}

document.addEventListener('click',onAnalyzeCapture,true);
document.addEventListener('click',onApplyCapture,true);
window.NOREYO_V591=Object.freeze({BUILD,adultCount,explicitAdults,perPersonBudget,currentAdults,repairAnalysis});
})();