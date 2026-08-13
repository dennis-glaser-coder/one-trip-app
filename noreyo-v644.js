/* NOREYO V6.59 — descendant-only family reconciliation.
   Supports singular/plural child wording, preserves selected adults,
   blocks over-limit family requests, and lets deliberate manual traveller
   corrections supersede stale AI family intent. */
(function(){
'use strict';
const BUILD='6.59';
const MAX_ADULTS=6,MAX_CHILDREN=4,MAX_TRAVELLERS=9;
let pending=null,travellerOpenSnapshot=null;

function norm(v){
  return String(v||'').toLowerCase()
    .replace(/ä/g,'ae').replace(/ö/g,'oe').replace(/ü/g,'ue')
    .normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/ß/g,'ss');
}
function naturalText(){return document.getElementById('noreyoAi556Text')?.value||'';}
function hasExplicitParty(t){try{const api=window.NOREYO_V636;return api?.explicitAdultCount?.(t)!==null||api?.partySize?.(t)!==null;}catch(_){return false;}}
function pluralAgeInfo(t){
  const s=norm(t);let m;
  const list=/\b(?:soehne|sohne|toechter)\b\s*(?:sind\s+)?(\d{1,2}(?:\s*(?:,|und|&|\/)\s*\d{1,2}){1,3})(?=\s*(?:jahre?\b|jahr\b|j\.|[,.;]|$))/g;
  while((m=list.exec(s))){
    const raw=(m[1].match(/\d{1,2}/g)||[]).map(Number).slice(0,MAX_CHILDREN);
    if(raw.length<2)continue;
    const valid=raw.every(n=>Number.isInteger(n)&&n>=0&&n<=17);
    return {count:raw.length,ages:valid?raw:null,valid};
  }
  return null;
}
function pluralAges(t){return pluralAgeInfo(t)?.ages||null;}
function descendantCount(t){
  const plural=pluralAgeInfo(t);if(plural)return plural.count;
  try{const n=window.NOREYO_V636?.descendantCount?.(t);if(n!==null&&n!==undefined)return Number(n);}catch(_){ }
  const s=norm(t);
  if(/\b(?:meine|unsere)\s+beiden\s+(?:soehne|sohne|toechter)\b/.test(s))return 2;
  return null;
}
function descendantAges(t){
  const plural=pluralAgeInfo(t);if(plural)return plural.ages;
  const base=(()=>{try{const a=window.NOREYO_V636?.descendantAges?.(t);return Array.isArray(a)?a.map(Number):null;}catch(_){return null;}})();
  if(base?.length)return base;
  const s=norm(t),out=[];let m;
  const add=v=>{const n=Number(v);if(Number.isInteger(n)&&n>=0&&n<=17&&out.length<MAX_CHILDREN)out.push(n);};
  const hyphen=/(\d{1,2})\s*[- ]?\s*jaehrig(?:e|er|en|es)?\s+(?:sohn|tochter)\b/g;
  while((m=hyphen.exec(s)))add(m[1]);
  const direct=/\b(?:sohn|tochter)\b\s*(?:ist\s+|:\s*)?(\d{1,2})(?=\s*(?:,|und\b|$|jahre?\b|jahr\b|j\.))/g;
  while((m=direct.exec(s)))add(m[1]);
  return out.length?out:null;
}
function selectedAdults(){try{const n=Math.round(Number(searchState?.adults));return Number.isInteger(n)&&n>=1&&n<=MAX_ADULTS?n:null;}catch(_){return null;}}
function snapshot(){try{return {adults:selectedAdults(),childAges:Array.isArray(searchState?.childAges)?searchState.childAges.map(Number):[]};}catch(_){return {adults:null,childAges:[]};}}
function sameSnapshot(a,b){return !!a&&!!b&&a.adults===b.adults&&a.childAges.length===b.childAges.length&&a.childAges.every((v,i)=>v===b.childAges[i]);}
function validSnapshot(s){
  if(!s||!Number.isInteger(s.adults)||s.adults<1||s.adults>MAX_ADULTS)return false;
  if(!Array.isArray(s.childAges)||s.childAges.length>MAX_CHILDREN)return false;
  if(!s.childAges.every(v=>Number.isInteger(v)&&v>=0&&v<=17))return false;
  return s.adults+s.childAges.length<=MAX_TRAVELLERS;
}
function ppBudget(t){try{return Number(window.NOREYO_V591?.perPersonBudget?.(t))||null;}catch(_){return null;}}
function isDescendantOnly(t){return !hasExplicitParty(t)&&descendantCount(t)!==null;}
function clearPending(){const had=!!pending;pending=null;return had;}
function refresh(){try{if(typeof updateSearchUI==='function')updateSearchUI();}catch(_){ }try{if(typeof updateCounts==='function')updateCounts();}catch(_){ }try{if(typeof persistState==='function')persistState();}catch(_){ }}
function notify(msg){try{if(typeof showToast==='function')showToast(msg);else window.toast?.(msg);}catch(_){ }}

function apply(t,before){
  if(!isDescendantOnly(t))return false;
  const adults=before?.adults||selectedAdults(),count=descendantCount(t),ages=descendantAges(t);
  if(!adults||!count||count<1||count>MAX_CHILDREN)return false;
  const overLimit=adults+count>MAX_TRAVELLERS;
  let changed=false;
  try{
    if(typeof searchState!=='undefined'&&searchState){
      if(Math.round(Number(searchState.adults))!==adults){searchState.adults=adults;changed=true;}
      const old=Array.isArray(searchState.childAges)?searchState.childAges.map(Number):[];
      if(Array.isArray(ages)&&ages.length===count){
        if(old.length!==ages.length||old.some((v,i)=>v!==ages[i])){searchState.childAges=ages.slice();changed=true;}
      }else if(old.length){searchState.childAges=[];changed=true;}
    }
  }catch(_){ }
  if(overLimit){
    pending={count,reason:'party-limit',createdAt:Date.now()};
    notify(`Aktuell sind maximal ${MAX_TRAVELLERS} Reisende pro Suche möglich.`);
    if(changed)refresh();
    return true;
  }
  if(Array.isArray(ages)&&ages.length===count)pending=null;
  else pending={count,reason:'ages',createdAt:Date.now()};
  const pp=ppBudget(t);
  try{if(pp&&typeof limits!=='undefined'&&limits){const total=pp*(adults+count);if(Number(limits.maxHotelPrice)!==total){limits.maxHotelPrice=total;changed=true;}}}catch(_){ }
  if(changed)refresh();return changed;
}
function familyAgeError(){
  if(!pending)return'';
  const adults=selectedAdults();
  if(!adults||adults+pending.count>MAX_TRAVELLERS)return `Aktuell sind maximal ${MAX_TRAVELLERS} Reisende pro Suche möglich.`;
  try{
    const ages=Array.isArray(searchState?.childAges)?searchState.childAges.map(Number):[];
    if(ages.length===pending.count&&ages.every(v=>Number.isInteger(v)&&v>=0&&v<=17)){pending=null;return'';}
  }catch(_){ }
  return `Bitte Alter für ${pending.count} ${pending.count===1?'Kind':'Kinder'} angeben.`;
}
function repairAnalysis(t){
  if(!isDescendantOnly(t))return false;
  const result=document.getElementById('noreyoAi556Result'),adults=selectedAdults(),count=descendantCount(t);if(!result||!adults||!count)return false;
  const chips=[...result.querySelectorAll('.noreyo-v556-chip')].filter(chip=>/reisende\s*·/i.test(String(chip.textContent||'')));
  if(adults+count>MAX_TRAVELLERS){chips.forEach(chip=>chip.remove());return !!chips.length;}
  const label=`${adults} ${adults===1?'Erwachsener':'Erwachsene'} · ${count} ${count===1?'Kind':'Kinder'}`;
  if(chips.length)chips.forEach(chip=>{chip.innerHTML='<i>✓</i>Reisende · '+label;});return !!chips.length;
}
function releaseSearchGuards(){try{window.NOREYO_V585?.releaseBusy?.();}catch(_){ }try{window.NOREYO_V607?.releaseGuard?.('descendant-family-validation');}catch(_){ }}
function searchButton(target){return target instanceof Element?target.closest('.noreyo-v541-booking-cta,.liveSearchButton,#searchView .search-card .primary'):null;}

function reconcileManualTravellerClose(){
  if(!pending||!travellerOpenSnapshot){travellerOpenSnapshot=null;return false;}
  const current=snapshot(),changed=!sameSnapshot(current,travellerOpenSnapshot);
  travellerOpenSnapshot=null;
  if(!changed||!validSnapshot(current))return false;
  pending=null;
  return true;
}
function installPlannerHooks(){
  try{
    if(typeof openPlanner==='function'&&!openPlanner.__noreyoV659){
      const prior=openPlanner;
      const wrapped=function(mode){
        if(mode==='travellers')travellerOpenSnapshot=snapshot();
        return prior.apply(this,arguments);
      };
      wrapped.__noreyoV659=true;openPlanner=wrapped;
    }
  }catch(_){ }
  try{
    if(typeof closePlanner==='function'&&!closePlanner.__noreyoV659){
      const prior=closePlanner;
      const wrapped=function(){
        const wasTravellers=(()=>{try{return typeof plannerMode!=='undefined'&&plannerMode==='travellers';}catch(_){return false;}})();
        const result=prior.apply(this,arguments);
        if(wasTravellers)reconcileManualTravellerClose();
        return result;
      };
      wrapped.__noreyoV659=true;closePlanner=wrapped;
    }
  }catch(_){ }
}

function onApply(e){
  if(!e.target?.closest?.('.noreyo-v556-apply'))return;
  const t=naturalText(),before=snapshot();
  if(!isDescendantOnly(t)){clearPending();return;}
  setTimeout(()=>apply(t,before),0);
}
function onAnalyze(e){if(!e.target?.closest?.('.noreyo-v556-analyze'))return;const t=naturalText();if(isDescendantOnly(t))setTimeout(()=>repairAnalysis(t),0);}
function onSearch(e){
  const btn=searchButton(e.target);if(!btn)return;const error=familyAgeError();if(!error)return;
  e.preventDefault();e.stopImmediatePropagation();releaseSearchGuards();notify(error);
  setTimeout(()=>{try{if(typeof openPlanner==='function')openPlanner('travellers');}catch(_){ }},0);
}
document.addEventListener('click',onApply,true);document.addEventListener('click',onAnalyze,true);window.addEventListener('click',onSearch,true);
installPlannerHooks();
window.addEventListener('pageshow',installPlannerHooks,{passive:true});
window.NOREYO_V644=Object.freeze({
  BUILD,norm,isDescendantOnly,descendantCount,descendantAges,pluralAgeInfo,pluralAges,selectedAdults,
  apply,familyAgeError,repairAnalysis,clearPending,snapshot,sameSnapshot,validSnapshot,reconcileManualTravellerClose
});
})();