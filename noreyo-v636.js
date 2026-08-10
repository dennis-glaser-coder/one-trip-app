/* NOREYO V6.36 — German 7–9 party wording reconciliation.
   Extends the AI safety layer for ausgeschriebene Gruppen ("sieben/acht/neun Personen")
   and prevents invalid >6-adult wording from leaking into the search state. */
(function(){
'use strict';
const BUILD='6.36';
const MAX_ADULTS=6,MAX_CHILDREN=4,MAX_TRAVELLERS=9;

function norm(v){return String(v||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/ß/g,'ss');}
function num(v){
  const map={ein:1,eine:1,einen:1,einem:1,einer:1,zwei:2,drei:3,vier:4,fuenf:5,funf:5,sechs:6,sieben:7,acht:8,neun:9};
  const s=norm(v).trim();
  return /^\d+$/.test(s)?Number(s):(map[s]??null);
}
function text(){return document.getElementById('noreyoAi556Text')?.value||'';}
function explicitAdultCount(t){
  const m=norm(t).match(/\b([1-9]|ein(?:e|en|em|er)?|zwei|drei|vier|fuenf|funf|sechs|sieben|acht|neun)\s+erwachsen(?:e|er|en)?\b/);
  return m?num(m[1]):null;
}
function partySize(t){
  const s=norm(t);
  let m=s.match(/\b([1-9]|ein(?:e|en|em|er)?|zwei|drei|vier|fuenf|funf|sechs|sieben|acht|neun)\s+(?:personen?|reisende)\b/);
  if(m)return num(m[1]);
  const party={zweit:2,dritt:3,viert:4,fuenft:5,funft:5,sechst:6,siebt:7,acht:8,neunt:9};
  m=s.match(/\bzu\s+(zweit|dritt|viert|fuenft|funft|sechst|siebt|acht|neunt)\b/);
  return m?(party[m[1]]||null):null;
}
function childCount(t){
  try{
    const api=window.NOREYO_V591;
    if(api?.childCount){
      const n=api.childCount(t);
      if(n!==null&&n!==undefined)return Number(n);
    }
  }catch(_){ }
  const s=norm(t);
  if(/\b(?:ohne|keine|kein)\s+(?:kinder|kind|babys?)\b/.test(s)||/\bnur erwachsene\b/.test(s))return 0;
  const m=s.match(/\b([1-4]|ein(?:e|en|em|er)?|zwei|drei|vier)\s+(?:kinder|kindern|kind|babys?)\b/);
  return m?num(m[1]):null;
}
function resolvedParty(t){
  const explicit=explicitAdultCount(t);
  const children=childCount(t);
  if(explicit!==null){
    if(explicit<1||explicit>MAX_ADULTS)return {valid:false,reason:'adults',adults:explicit,children,total:null};
    const c=children===null?0:children;
    const total=explicit+c;
    if(c>MAX_CHILDREN||total>MAX_TRAVELLERS)return {valid:false,reason:'party',adults:explicit,children:c,total};
    return {valid:true,adults:explicit,children:c,total};
  }
  const party=partySize(t);
  if(party===null)return null;
  if(party<1||party>MAX_TRAVELLERS)return {valid:false,reason:'party',adults:null,children,total:party};
  if(children===null){
    if(party>MAX_ADULTS)return {valid:false,reason:'children-required',adults:null,children:null,total:party};
    return {valid:true,adults:party,children:0,total:party};
  }
  if(children<0||children>MAX_CHILDREN)return {valid:false,reason:'children',adults:null,children,total:party};
  const adults=party-children;
  if(adults<1||adults>MAX_ADULTS)return {valid:false,reason:'adults',adults,children,total:party};
  return {valid:true,adults,children,total:party};
}
function ppBudget(t){
  try{return Number(window.NOREYO_V591?.perPersonBudget?.(t))||null;}catch(_){return null;}
}
function childAges(t){
  try{
    const ages=window.NOREYO_V591?.childAges?.(t);
    return Array.isArray(ages)?ages.map(Number):null;
  }catch(_){return null;}
}
function refresh(){
  try{if(typeof updateSearchUI==='function')updateSearchUI();}catch(_){ }
  try{if(typeof updateCounts==='function')updateCounts();}catch(_){ }
  try{if(typeof persistState==='function')persistState();}catch(_){ }
}
function notify(msg){try{if(typeof showToast==='function')showToast(msg);else window.toast?.(msg);}catch(_){ }}
function applyReconciliation(t,snapshot){
  const party=resolvedParty(t);
  if(!party)return false;
  if(!party.valid){
    if(snapshot){
      try{
        if(typeof searchState!=='undefined'&&searchState){
          searchState.adults=snapshot.adults;
          searchState.childAges=snapshot.childAges.slice();
        }
      }catch(_){ }
    }
    if(party.reason==='children-required')notify('Bei mehr als 6 Reisenden bitte die Kinderanzahl angeben.');
    else if(party.reason==='adults')notify(`Aktuell sind maximal ${MAX_ADULTS} Erwachsene pro Suche möglich.`);
    else notify('Bitte die Reisenden-Aufteilung prüfen.');
    refresh();
    return true;
  }
  let changed=false;
  try{
    if(typeof searchState!=='undefined'&&searchState){
      if(Math.round(Number(searchState.adults))!==party.adults){searchState.adults=party.adults;changed=true;}
      const ages=childAges(t);
      if(Array.isArray(ages)&&ages.length===party.children){
        const old=Array.isArray(searchState.childAges)?searchState.childAges.map(Number):[];
        if(old.length!==ages.length||old.some((v,i)=>v!==ages[i])){searchState.childAges=ages.slice();changed=true;}
      }else if(party.children===0&&Array.isArray(searchState.childAges)&&searchState.childAges.length){
        searchState.childAges=[];changed=true;
      }
    }
  }catch(_){ }
  const pp=ppBudget(t);
  try{
    if(pp&&typeof limits!=='undefined'&&limits){
      const total=pp*party.total;
      if(Number(limits.maxHotelPrice)!==total){limits.maxHotelPrice=total;changed=true;}
    }
  }catch(_){ }
  if(changed)refresh();
  return changed;
}
function repairAnalysis(t){
  const party=resolvedParty(t),result=document.getElementById('noreyoAi556Result');
  if(!party||!result)return false;
  const chips=[...result.querySelectorAll('.noreyo-v556-chip')].filter(chip=>/reisende\s*·/i.test(String(chip.textContent||'')));
  if(!party.valid){chips.forEach(chip=>chip.remove());return !!chips.length;}
  const label=party.children>0
    ?`${party.adults} ${party.adults===1?'Erwachsener':'Erwachsene'} · ${party.children} ${party.children===1?'Kind':'Kinder'}`
    :`${party.total} ${party.total===1?'Person':'Personen'}`;
  chips.forEach(chip=>{chip.innerHTML='<i>✓</i>Reisende · '+label;});
  return !!chips.length;
}
function snapshotState(){
  try{
    if(typeof searchState==='undefined'||!searchState)return null;
    const adults=Math.round(Number(searchState.adults));
    return {adults:Number.isInteger(adults)&&adults>=1&&adults<=MAX_ADULTS?adults:2,childAges:Array.isArray(searchState.childAges)?searchState.childAges.map(Number):[]};
  }catch(_){return null;}
}
function onApply(e){
  if(!e.target?.closest?.('.noreyo-v556-apply'))return;
  const t=text(),snapshot=snapshotState();
  setTimeout(()=>applyReconciliation(t,snapshot),0);
}
function onAnalyze(e){
  if(!e.target?.closest?.('.noreyo-v556-analyze'))return;
  const t=text();setTimeout(()=>repairAnalysis(t),0);
}
document.addEventListener('click',onApply,true);
document.addEventListener('click',onAnalyze,true);
window.NOREYO_V636=Object.freeze({BUILD,num,explicitAdultCount,partySize,childCount,resolvedParty,applyReconciliation,repairAnalysis});
})();