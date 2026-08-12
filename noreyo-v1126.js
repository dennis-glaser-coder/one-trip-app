/* NOREYO V11.26 — conservative final PREBOOK cancellation summary.
   Do not claim “no positive cancellation fee” when RFN policy rows are missing,
   malformed or contain a positive fee without a usable timestamp. Reconcile the
   captured PREBOOK terms to a truth-preserving summary. */
(function(){
'use strict';
const BUILD='11.26';
let observer=null,raf=0;
function rows(policy){return Array.isArray(policy?.cancelPolicyInfos)?policy.cancelPolicyInfos:null;}
function validTime(value){const s=String(value||'').trim();return !!s&&Number.isFinite(Date.parse(s));}
function safeSummary(list){
  if(!Array.isArray(list)||!list.length)return{kind:'unknown',text:'Finale Stornierungsbedingungen konnten aus der PREBOOK-Antwort nicht vollständig gelesen werden.'};
  const tags=list.map(p=>String(p?.refundableTag||'').trim().toUpperCase());
  if(tags.some(t=>t==='NRFN'))return{kind:'nonrefundable',text:'Final bestätigt: Mindestens ein Tarifbestandteil ist nicht stornierbar.'};
  if(tags.some(t=>t!=='RFN'))return{kind:'unknown',text:'Finale Stornierbarkeit ist für mindestens einen Tarifbestandteil nicht eindeutig bestätigt.'};
  const deadlines=[];
  for(const policy of list){
    const info=rows(policy);
    if(!info)return{kind:'unknown',text:'Der Tarif ist als stornierbar markiert, aber die finalen Stornierungsregeln wurden nicht vollständig übermittelt.'};
    for(const row of info){
      const amount=Number(row?.amount);
      if(!Number.isFinite(amount))return{kind:'unknown',text:'Die finale Stornierungsgebühr konnte nicht eindeutig gelesen werden.'};
      if(amount<=0)continue;
      if(!validTime(row?.cancelTime))return{kind:'unknown',text:'Eine positive Stornierungsgebühr ist ausgewiesen, ihr Beginn wurde aber nicht eindeutig übermittelt.'};
      deadlines.push(String(row.cancelTime).trim());
    }
  }
  if(!deadlines.length)return{kind:'refundable',text:'Final bestätigt: Tarif ist stornierbar; in den vollständig übermittelten Regeln ist keine positive Stornogebühr ausgewiesen.'};
  deadlines.sort((a,b)=>Date.parse(a)-Date.parse(b));
  return{kind:'refundable',text:`Final bestätigt: Tarif ist stornierbar. Erste positive Stornogebühr kann ab ${deadlines[0]} greifen.`};
}
function terms(){return window.NOREYO_HOTEL_PREBOOK_TERMS||null;}
function reconcile(){
  raf=0;
  const term=terms();if(!term||!Array.isArray(term.policies))return false;
  const summary=safeSummary(term.policies),old=term.summary||{};
  if(old.kind===summary.kind&&old.text===summary.text)return false;
  window.NOREYO_HOTEL_PREBOOK_TERMS=Object.freeze({...term,summary:Object.freeze(summary)});
  try{window.NOREYO_V1118?.schedule?.();}catch(_){}
  return true;
}
function schedule(){if(!raf)raf=requestAnimationFrame(reconcile);}
function install(){if(observer||typeof MutationObserver==='undefined'||!document.body)return false;observer=new MutationObserver(schedule);observer.observe(document.body,{subtree:true,childList:true,characterData:true});schedule();return true;}
function cleanup(){if(observer){observer.disconnect();observer=null;}if(raf){cancelAnimationFrame(raf);raf=0;}}
install();window.addEventListener('pagehide',cleanup,{passive:true});window.addEventListener('pageshow',install,{passive:true});
window.NOREYO_V1126=Object.freeze({BUILD,rows,validTime,safeSummary,terms,reconcile,schedule,install,cleanup});
})();