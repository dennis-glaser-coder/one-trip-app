/* NOREYO V6.60 — German party + descendant-family reconciliation.
   Preserves umlaut distinctions and lets deliberate manual traveller edits
   supersede stale AI family validation. */
(function(){
'use strict';
const BUILD='6.60';
const MAX_ADULTS=6,MAX_CHILDREN=4,MAX_TRAVELLERS=9;
let pendingDescendantAges=null,travellerOpenSnapshot=null;

function norm(v){
  return String(v||'').toLowerCase()
    .replace(/ä/g,'ae').replace(/ö/g,'oe').replace(/ü/g,'ue')
    .normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/ß/g,'ss');
}
function num(v){
  const map={ein:1,eine:1,einen:1,einem:1,einer:1,zwei:2,drei:3,vier:4,fuenf:5,funf:5,sechs:6,sieben:7,acht:8,neun:9};
  const s=norm(v).trim();return /^\d+$/.test(s)?Number(s):(map[s]??null);
}
function text(){return document.getElementById('noreyoAi556Text')?.value||'';}
function explicitAdultCount(t){
  const m=norm(t).match(/\b([1-9]|ein(?:e|en|em|er)?|zwei|drei|vier|fuenf|funf|sechs|sieben|acht|neun)\s+erwachsen(?:e|er|en)?\b/);
  return m?num(m[1]):null;
}
function partySize(t){
  const s=norm(t);let m=s.match(/\b([1-9]|ein(?:e|en|em|er)?|zwei|drei|vier|fuenf|funf|sechs|sieben|acht|neun)\s+(?:personen?|reisende)\b/);
  if(m)return num(m[1]);
  const party={zweit:2,dritt:3,viert:4,fuenft:5,funft:5,sechst:6,siebt:7,acht:8,neunt:9};
  m=s.match(/\bzu\s+(zweit|dritt|viert|fuenft|funft|sechst|siebt|acht|neunt)\b/);
  if(m){
    const before=s.slice(Math.max(0,(m.index||0)-8),m.index||0),after=s.slice((m.index||0)+m[0].length,(m.index||0)+m[0].length+18);
    if(!/^\s*(?:tage|wochen|naechte|nachte|jahre|monate)\b/.test(after)&&!/\bbis\s*$/.test(before))return party[m[1]]||null;
  }
  m=s.match(/\bwir\s+sind\s+([1-9]|ein(?:e|en|em|er)?|zwei|drei|vier|fuenf|funf|sechs|sieben|acht|neun)(?=\s*(?:$|[,.;]|und\b|davon\b|mit\b))(?!\s*(?:tage|wochen|naechte|nachte|sterne|jahre|monate)\b)/);
  if(m)return num(m[1]);
  m=s.match(/\bwir\s+reisen\s+zu\s+(zweit|dritt|viert|fuenft|funft|sechst|siebt|acht|neunt)\b/);
  if(!m)return null;
  const after=s.slice((m.index||0)+m[0].length,(m.index||0)+m[0].length+18);
  return /^\s*(?:tage|wochen|naechte|nachte|jahre|monate)\b/.test(after)?null:(party[m[1]]||null);
}
function descendantCount(t){
  const s=norm(t);
  let m=s.match(/\b([1-4]|ein(?:e|en|em|er)?|zwei|drei|vier)\s+(?:soehne|sohne|toechter|tochter|sohn)\b/);
  if(m)return num(m[1]);
  const mentions=s.match(/\b(?:mein(?:e|en|em|er)?\s+)?(?:sohn|tochter)\b/g)||[];
  return mentions.length?Math.min(MAX_CHILDREN,mentions.length):null;
}
function descendantAges(t){
  const s=norm(t),out=[];const add=v=>{const n=Number(v);if(Number.isInteger(n)&&n>=0&&n<=17&&out.length<MAX_CHILDREN)out.push(n);};let m;
  const before=/(\d{1,2})\s*(?:jahre?\s*alt|jaehrig(?:e|er|en|es)?|j\.)\s*(?:sohn|tochter)\b/g;while((m=before.exec(s)))add(m[1]);
  const after=/\b(?:sohn|tochter)\b[^;.!?]{0,32}?(\d{1,2})\s*(?:jahre?|jahr|j\.)\b/g;while((m=after.exec(s)))add(m[1]);
  if(out.length)return out;
  const plain=/\b(?:sohn|tochter)\b\s*(?:ist\s+)?(\d{1,2})(?=\s*(?:,|und\b|$))/g;while((m=plain.exec(s)))add(m[1]);
  return out.length?out:null;
}
function childCount(t){
  try{const n=window.NOREYO_V591?.childCount?.(t);if(n!==null&&n!==undefined)return Number(n);}catch(_){ }
  const s=norm(t);
  if(/\b(?:ohne|keine|kein)\s+(?:kinder|kind|babys?|soehne|sohne|toechter|tochter|sohn)\b/.test(s)||/\bnur erwachsene\b/.test(s))return 0;
  const m=s.match(/\b([1-4]|ein(?:e|en|em|er)?|zwei|drei|vier)\s+(?:kinder|kindern|kind|babys?)\b/);
  if(m)return num(m[1]);return descendantCount(s);
}
function resolvedParty(t){
  const explicit=explicitAdultCount(t),children=childCount(t);
  if(explicit!==null){
    if(explicit<1||explicit>MAX_ADULTS)return {valid:false,reason:'adults',source:'adults',adults:explicit,children,total:null};
    if(children===null)return {valid:true,source:'adults',adults:explicit,children:null,total:null};
    const total=explicit+children;
    if(children>MAX_CHILDREN||total>MAX_TRAVELLERS)return {valid:false,reason:'party',source:'adults',adults:explicit,children,total};
    return {valid:true,source:'adults',adults:explicit,children,total};
  }
  const party=partySize(t);if(party===null)return null;
  if(party<1||party>MAX_TRAVELLERS)return {valid:false,reason:'party',source:'party',adults:null,children,total:party};
  if(children===null){
    if(party>MAX_ADULTS)return {valid:false,reason:'children-required',source:'party',adults:null,children:null,total:party};
    return {valid:true,source:'party',adults:party,children:0,total:party};
  }
  if(children<0||children>MAX_CHILDREN)return {valid:false,reason:'children',source:'party',adults:null,children,total:party};
  const adults=party-children;
  if(adults<1||adults>MAX_ADULTS)return {valid:false,reason:'adults',source:'party',adults,children,total:party};
  return {valid:true,source:'party',adults,children,total:party};
}
function ppBudget(t){try{return Number(window.NOREYO_V591?.perPersonBudget?.(t))||null;}catch(_){return null;}}
function childAges(t){try{const ages=window.NOREYO_V591?.childAges?.(t);if(Array.isArray(ages))return ages.map(Number);}catch(_){ }return descendantAges(t);}
function selectedAdults(){try{const n=Math.round(Number(searchState?.adults));return Number.isInteger(n)&&n>=1&&n<=MAX_ADULTS?n:null;}catch(_){return null;}}
function snapshotState(){try{return {adults:selectedAdults()||2,childAges:Array.isArray(searchState?.childAges)?searchState.childAges.map(Number):[]};}catch(_){return {adults:2,childAges:[]};}}
function sameSnapshot(a,b){return !!a&&!!b&&a.adults===b.adults&&a.childAges.length===b.childAges.length&&a.childAges.every((v,i)=>v===b.childAges[i]);}
function validSnapshot(s){return !!s&&Number.isInteger(s.adults)&&s.adults>=1&&s.adults<=MAX_ADULTS&&Array.isArray(s.childAges)&&s.childAges.length<=MAX_CHILDREN&&s.childAges.every(v=>Number.isInteger(v)&&v>=0&&v<=17)&&s.adults+s.childAges.length<=MAX_TRAVELLERS;}
function refresh(){try{updateSearchUI?.();}catch(_){ }try{updateCounts?.();}catch(_){ }try{persistState?.();}catch(_){ }}
function notify(msg){try{if(typeof showToast==='function')showToast(msg);else window.toast?.(msg);}catch(_){ }}

function applyReconciliation(t,snapshot){
  const party=resolvedParty(t);if(!party)return false;
  if(!party.valid){
    pendingDescendantAges=null;
    if(snapshot){try{if(typeof searchState!=='undefined'&&searchState){searchState.adults=snapshot.adults;searchState.childAges=snapshot.childAges.slice();}}catch(_){ }}
    if(party.reason==='children-required')notify('Bei mehr als 6 Reisenden bitte die Kinderanzahl angeben.');
    else if(party.reason==='adults')notify(`Aktuell sind maximal ${MAX_ADULTS} Erwachsene pro Suche möglich.`);
    else notify('Bitte die Reisenden-Aufteilung prüfen.');
    refresh();return true;
  }
  let changed=false;
  try{
    if(typeof searchState!=='undefined'&&searchState){
      if(Math.round(Number(searchState.adults))!==party.adults){searchState.adults=party.adults;changed=true;}
      const ages=childAges(t);
      if(party.children!==null&&Array.isArray(ages)&&ages.length===party.children){
        const old=Array.isArray(searchState.childAges)?searchState.childAges.map(Number):[];
        if(old.length!==ages.length||old.some((v,i)=>v!==ages[i])){searchState.childAges=ages.slice();changed=true;}
        pendingDescendantAges=null;
      }else if(party.children!==null&&party.children>0){
        if(Array.isArray(searchState.childAges)&&searchState.childAges.length){searchState.childAges=[];changed=true;}
        pendingDescendantAges={count:party.children,source:/\b(?:sohn|tochter|soehne|sohne|toechter)\b/.test(norm(t))?'descendant':'children'};
      }else if(party.children===0){
        pendingDescendantAges=null;
        if(Array.isArray(searchState.childAges)&&searchState.childAges.length){searchState.childAges=[];changed=true;}
      }
    }
  }catch(_){ }
  const pp=ppBudget(t);
  try{
    if(pp&&typeof limits!=='undefined'&&limits){
      const selectedChildren=snapshot?.childAges?.length||0,travellers=party.total!==null?party.total:party.adults+selectedChildren;
      if(travellers>=1&&travellers<=MAX_TRAVELLERS){const total=pp*travellers;if(Number(limits.maxHotelPrice)!==total){limits.maxHotelPrice=total;changed=true;}}
    }
  }catch(_){ }
  if(changed)refresh();return changed;
}
function repairAnalysis(t){
  const party=resolvedParty(t),result=document.getElementById('noreyoAi556Result');if(!party||!result)return false;
  const chips=[...result.querySelectorAll('.noreyo-v556-chip')].filter(chip=>/reisende\s*·/i.test(String(chip.textContent||'')));
  if(!party.valid){chips.forEach(chip=>chip.remove());return !!chips.length;}
  const label=party.source==='adults'
    ?`${party.adults} ${party.adults===1?'Erwachsener':'Erwachsene'}${party.children>0?` · ${party.children} ${party.children===1?'Kind':'Kinder'}`:''}`
    :(party.children>0?`${party.adults} ${party.adults===1?'Erwachsener':'Erwachsene'} · ${party.children} ${party.children===1?'Kind':'Kinder'}`:`${party.total} ${party.total===1?'Person':'Personen'}`);
  chips.forEach(chip=>{chip.innerHTML='<i>✓</i>Reisende · '+label;});return !!chips.length;
}
function familyAgeError(){
  if(!pendingDescendantAges)return'';
  try{
    const ages=Array.isArray(searchState?.childAges)?searchState.childAges.map(Number):[];
    if(ages.length===pendingDescendantAges.count&&ages.every(v=>Number.isInteger(v)&&v>=0&&v<=17)){pendingDescendantAges=null;return'';}
  }catch(_){ }
  return `Bitte Alter für ${pendingDescendantAges.count} ${pendingDescendantAges.count===1?'Kind':'Kinder'} angeben.`;
}
function releaseSearchGuards(){try{window.NOREYO_V585?.releaseBusy?.();}catch(_){ }try{window.NOREYO_V607?.releaseGuard?.('family-age-validation');}catch(_){ }}
function reconcileManualTravellerClose(){
  if(!pendingDescendantAges||!travellerOpenSnapshot){travellerOpenSnapshot=null;return false;}
  const current=snapshotState(),changed=!sameSnapshot(current,travellerOpenSnapshot);travellerOpenSnapshot=null;
  if(!changed||!validSnapshot(current))return false;
  pendingDescendantAges=null;return true;
}
function installPlannerHooks(){
  try{
    if(typeof openPlanner==='function'&&!openPlanner.__noreyoV660){
      const prior=openPlanner,wrapped=function(mode){if(mode==='travellers')travellerOpenSnapshot=snapshotState();return prior.apply(this,arguments);};
      wrapped.__noreyoV660=true;openPlanner=wrapped;
    }
  }catch(_){ }
  try{
    if(typeof closePlanner==='function'&&!closePlanner.__noreyoV660){
      const prior=closePlanner,wrapped=function(){
        const wasTravellers=(()=>{try{return typeof plannerMode!=='undefined'&&plannerMode==='travellers';}catch(_){return false;}})();
        const result=prior.apply(this,arguments);if(wasTravellers)reconcileManualTravellerClose();return result;
      };
      wrapped.__noreyoV660=true;closePlanner=wrapped;
    }
  }catch(_){ }
}
function onSearchCapture(e){
  const btn=e.target instanceof Element?e.target.closest('.noreyo-v541-booking-cta,.liveSearchButton,#searchView .search-card .primary'):null;
  if(!btn)return;const error=familyAgeError();if(!error)return;
  e.preventDefault();e.stopImmediatePropagation();releaseSearchGuards();notify(error);
  setTimeout(()=>{try{if(typeof openPlanner==='function')openPlanner('travellers');}catch(_){ }},0);
}
function onApply(e){if(!e.target?.closest?.('.noreyo-v556-apply'))return;const t=text(),snapshot=snapshotState();setTimeout(()=>applyReconciliation(t,snapshot),0);}
function onAnalyze(e){if(!e.target?.closest?.('.noreyo-v556-analyze'))return;const t=text();setTimeout(()=>repairAnalysis(t),0);}
document.addEventListener('click',onApply,true);document.addEventListener('click',onAnalyze,true);window.addEventListener('click',onSearchCapture,true);
installPlannerHooks();window.addEventListener('pageshow',installPlannerHooks,{passive:true});
window.NOREYO_V636=Object.freeze({BUILD,norm,num,explicitAdultCount,partySize,descendantCount,descendantAges,childCount,resolvedParty,applyReconciliation,repairAnalysis,familyAgeError,snapshotState,sameSnapshot,validSnapshot,reconcileManualTravellerClose});
})();