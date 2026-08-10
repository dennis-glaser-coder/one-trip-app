/* NOREYO V6.35 — natural-language traveller, budget, child-age and implicit-date safety. */
(function(){
'use strict';
const BUILD='6.35';

function norm(v){return String(v||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/ß/g,'ss');}
function naturalText(){return document.getElementById('noreyoAi556Text')?.value||'';}
function wordNumber(v){
  const map={ein:1,eine:1,einen:1,einem:1,einer:1,zwei:2,drei:3,vier:4,fuenf:5,funf:5,sechs:6};
  const s=norm(v).trim();
  return /^\d$/.test(s)?Number(s):(map[s]??null);
}
function explicitAdultCount(text){
  const t=norm(text);
  const m=t.match(/\b([1-6]|ein(?:e|en|em|er)?|zwei|drei|vier|fuenf|funf|sechs)\s+erwachsen(?:e|er|en)?\b/);
  return m?wordNumber(m[1]):null;
}
function partySize(text){
  const t=norm(text);
  let m=t.match(/\b([1-9]|ein(?:e|en|em|er)?|zwei|drei|vier|fuenf|funf|sechs)\s+(?:personen?|reisende)\b/);
  if(m)return wordNumber(m[1]);
  const party={zweit:2,dritt:3,viert:4,fuenft:5,funft:5,sechst:6};
  m=t.match(/\bzu\s+(zweit|dritt|viert|fuenft|funft|sechst)\b/);
  if(m)return party[m[1]]||null;
  m=t.match(/\bwir\s+sind\s+([1-6]|zwei|drei|vier|fuenf|funf|sechs)(?=\s*(?:$|[,.;]|und\b))(?!\s*(?:tage|wochen|naechte|nachte|sterne|jahre|monate)\b)/);
  return m?wordNumber(m[1]):null;
}
function adultCount(text){
  const explicit=explicitAdultCount(text);if(explicit!==null)return explicit;
  const party=partySize(text);if(party===null)return null;
  const parsedChildren=childCount(text);
  if(parsedChildren===null)return party<=6?party:null;
  const adults=party-Math.max(0,parsedChildren||0);
  return adults>=1&&adults<=6?adults:null;
}
function explicitAdults(text){return explicitAdultCount(text)!==null||partySize(text)!==null;}
function currentAdults(){
  try{const n=Math.round(Number(searchState?.adults));return Number.isInteger(n)&&n>=1&&n<=6?n:null;}catch(_){return null;}
}
function childCount(text){
  const t=norm(text);
  if(/\b(?:ohne|keine|kein)\s+(?:kinder|kind|babys?)\b/.test(t)||/\bnur erwachsene\b/.test(t))return 0;
  const m=t.match(/\b([1-4]|ein(?:e|en|em|er)?|zwei|drei|vier)\s+(?:kinder|kindern|kind|babys?)\b/);
  return m?wordNumber(m[1]):null;
}
function childAges(text){
  const t=norm(text),count=childCount(t);
  if(count===0)return [];
  const anchor=t.search(/\b(?:kinder|kindern|kind|babys?)\b/);
  if(anchor<0)return null;
  const seg=t.slice(anchor,anchor+120),ages=[];
  const re=/(\d{1,2})\s*(jahre?|jahr|j\.|monate?|monat)\b/g;
  let m;
  while((m=re.exec(seg))){
    const n=Number(m[1]);
    if(/monat/.test(m[2])){if(n>=0&&n<=23)ages.push(Math.floor(n/12));}
    else if(n>=0&&n<=17)ages.push(n);
    if(ages.length>=4)break;
  }
  if(!ages.length)return null;
  if(count!==null&&ages.length!==count)return null;
  return ages;
}
function selectedChildCount(){try{return Array.isArray(searchState?.childAges)?searchState.childAges.length:0;}catch(_){return 0;}}
function travellerCount(text){
  const party=partySize(text);
  if(party!==null){
    if(party<1||party>9)return null;
    const parsedChildren=childCount(text);
    if(parsedChildren===null)return party<=6?party:null;
    if(parsedChildren<0||parsedChildren>4)return null;
    const adults=party-parsedChildren;
    return adults>=1&&adults<=6?party:null;
  }
  const adults=adultCount(text)||currentAdults();
  if(!adults)return null;
  const parsedChildren=childCount(text);
  const children=parsedChildren===null?selectedChildCount():parsedChildren;
  const total=adults+Math.max(0,children||0);
  return total>=1&&total<=9?total:null;
}

const monthMap={januar:0,februar:1,maerz:2,marz:2,april:3,mai:4,juni:5,juli:6,august:7,september:8,oktober:9,november:10,dezember:11};
function isoDate(d){return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');}
function validDateParts(y,m,d){const x=new Date(y,m,d,12);return x.getFullYear()===y&&x.getMonth()===m&&x.getDate()===d;}
function implicitDayMonth(text,now=new Date()){
  const t=norm(text);
  const m=t.match(/\b(?:ab|vom)?\s*(\d{1,2})[.\s]+(januar|februar|maerz|marz|april|mai|juni|juli|august|september|oktober|november|dezember)(?:\s*(20\d{2}))?/);
  if(!m||m[3])return null;
  const day=Number(m[1]),month=monthMap[m[2]];let year=now.getFullYear();
  if(!validDateParts(year,month,day))return null;
  const candidate=new Date(year,month,day,12),today=new Date(now.getFullYear(),now.getMonth(),now.getDate(),12);
  if(candidate<today){year++;if(!validDateParts(year,month,day))return null;}
  return isoDate(new Date(year,month,day,12));
}
function dayDelta(a,b){
  if(!/^\d{4}-\d{2}-\d{2}$/.test(String(a||''))||!/^\d{4}-\d{2}-\d{2}$/.test(String(b||'')))return 7;
  const x=new Date(String(a)+'T12:00:00'),y=new Date(String(b)+'T12:00:00'),n=Math.round((y-x)/86400000);
  return Number.isFinite(n)&&n>=1&&n<=30?n:7;
}
function repairImplicitDate(text){
  const checkin=implicitDayMonth(text);if(!checkin)return false;
  try{
    if(typeof searchState==='undefined'||!searchState)return false;
    const oldIn=String(searchState.checkin||''),oldOut=String(searchState.checkout||''),days=dayDelta(oldIn,oldOut);
    if(oldIn===checkin)return false;
    const out=new Date(checkin+'T12:00:00');out.setDate(out.getDate()+days);
    searchState.checkin=checkin;searchState.checkout=isoDate(out);return true;
  }catch(_){return false;}
}
function money(v){const n=Number(String(v||'').replace(/[.\s]/g,'').replace(',','.'));return Number.isFinite(n)&&n>=100&&n<=50000?n:null;}
function euroMentions(t){return [...t.matchAll(/([0-9][0-9.\s]{2,})\s*(?:€|euro)/gi)].map(m=>({amount:money(m[1]),index:m.index||0,end:(m.index||0)+m[0].length})).filter(x=>x.amount!==null);}
function perPersonBudget(text){
  const t=norm(text),mentions=euroMentions(t);if(!mentions.length)return null;
  for(const x of mentions){
    const before=t.slice(Math.max(0,x.index-42),x.index),after=t.slice(x.end,Math.min(t.length,x.end+24));
    const ppAfter=/^\s*(?:pro person|je person|p\.?\s*p\.?)/.test(after);
    const ppBefore=/(?:pro person|je person|p\.?\s*p\.?)\s*(?:max(?:imal)?\.?|bis|budget(?: von)?|hoechstens|hochstens)?\s*(?:ca\.?\s*)?$/.test(before);
    const budgetBefore=/(?:max(?:imal)?\.?|bis|budget(?: von)?|hoechstens|hochstens)\s*(?:ca\.?\s*)?$/.test(before);
    if((ppAfter&&budgetBefore)||ppBefore)return x.amount;
  }
  if(mentions.length===1){
    const x=mentions[0],after=t.slice(x.end,Math.min(t.length,x.end+24)),before=t.slice(Math.max(0,x.index-24),x.index);
    if(/^\s*(?:pro person|je person|p\.?\s*p\.?)/.test(after)||/(?:pro person|je person|p\.?\s*p\.?)\s*(?:ca\.?\s*)?$/.test(before))return x.amount;
  }
  return null;
}
function budgetTotal(text){const pp=perPersonBudget(text),people=travellerCount(text);return pp&&people?pp*people:null;}
function refresh(){try{if(typeof updateSearchUI==='function')updateSearchUI();}catch(_){ }try{if(typeof updateCounts==='function')updateCounts();}catch(_){ }try{if(typeof persistState==='function')persistState();}catch(_){ }}
function partyLabel(text){
  const party=partySize(text),explicit=explicitAdultCount(text),children=childCount(text);
  if(party!==null){
    if(children!==null&&children>0){
      const adults=party-children;
      if(adults>=1)return adults+' '+(adults===1?'Erwachsener':'Erwachsene')+' · '+children+' '+(children===1?'Kind':'Kinder');
    }
    return party+' '+(party===1?'Person':'Personen');
  }
  if(explicit===null)return null;
  const parts=[explicit+' '+(explicit===1?'Erwachsener':'Erwachsene')];
  if(children!==null&&children>0)parts.push(children+' '+(children===1?'Kind':'Kinder'));
  return parts.join(' · ');
}
function repairAnalysis(text){
  const adults=adultCount(text),label=partyLabel(text),result=document.getElementById('noreyoAi556Result');if(!result)return;
  const travellerChips=[...result.querySelectorAll('.noreyo-v556-chip')].filter(chip=>/reisende\s*·/i.test(String(chip.textContent||'')));
  if(adults===null)travellerChips.forEach(chip=>chip.remove());
  else travellerChips.forEach(chip=>{chip.innerHTML='<i>✓</i>Reisende · '+label;});
  result.querySelectorAll('.noreyo-v556-group').forEach(group=>{const chips=group.querySelector('.noreyo-v556-chips');if(chips&&!chips.children.length)group.remove();});
}
function onAnalyzeCapture(e){if(!e.target?.closest?.('.noreyo-v556-analyze'))return;const text=naturalText();setTimeout(()=>repairAnalysis(text),0);}
function onApplyCapture(e){
  if(!e.target?.closest?.('.noreyo-v556-apply'))return;
  const text=naturalText(),selected=currentAdults(),parsed=adultCount(text),party=partySize(text),parsedChildren=childCount(text),effectiveAdults=parsed||selected,ages=childAges(text),totalBudget=budgetTotal(text);
  if(!effectiveAdults&&!ages&&!totalBudget)return;
  setTimeout(()=>{
    let changed=false;
    try{
      if(parsed&&typeof searchState!=='undefined'&&searchState&&Math.round(Number(searchState.adults))!==parsed){searchState.adults=parsed;changed=true;}
      else if(!parsed&&selected&&typeof searchState!=='undefined'&&searchState&&Math.round(Number(searchState.adults))!==selected){searchState.adults=selected;changed=true;}
      if(typeof searchState!=='undefined'&&searchState&&party!==null&&parsedChildren===null&&party<=6){
        if(Math.round(Number(searchState.adults))!==party){searchState.adults=party;changed=true;}
        const old=Array.isArray(searchState.childAges)?searchState.childAges:[];
        if(old.length){searchState.childAges=[];changed=true;}
      }else if(Array.isArray(ages)&&typeof searchState!=='undefined'&&searchState){
        const old=Array.isArray(searchState.childAges)?searchState.childAges.map(Number):[];
        if(old.length!==ages.length||old.some((v,i)=>v!==ages[i])){searchState.childAges=ages.slice();changed=true;}
      }
      if(repairImplicitDate(text))changed=true;
    }catch(_){ }
    try{
      if(totalBudget&&typeof limits!=='undefined'&&limits&&Number(limits.maxHotelPrice)!==totalBudget){limits.maxHotelPrice=totalBudget;changed=true;}
    }catch(_){ }
    if(changed)refresh();
  },0);
}

document.addEventListener('click',onAnalyzeCapture,true);
document.addEventListener('click',onApplyCapture,true);
window.NOREYO_V591=Object.freeze({BUILD,adultCount,explicitAdultCount,partySize,explicitAdults,childCount,childAges,travellerCount,perPersonBudget,budgetTotal,partyLabel,currentAdults,implicitDayMonth,repairImplicitDate,repairAnalysis});
})();