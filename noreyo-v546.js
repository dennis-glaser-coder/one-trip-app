(function(){
'use strict';
const BUILD='6.66';
function currentMealLabel(){try{return typeof mealPlanLabel==='function'?String(mealPlanLabel()||''):'';}catch{return'';}}
function allInclusiveRequired(){
  try{if(typeof mealPlanFilter!=='undefined'&&mealPlanFilter&&mealPlanFilter!=='ANY'){const label=currentMealLabel();if(/all\s*[- ]?inclusive|all\s*[- ]?in/i.test(label))return true;const raw=String(mealPlanFilter).trim().toUpperCase();if(raw==='AI'||raw==='ALL_INCLUSIVE'||raw==='ALLINCLUSIVE')return true;}}catch{}
  try{return typeof states!=='undefined'&&states?.Hotel7==='must';}catch{return false;}
}
function boardSource(o){
  if(!o)return'';const direct=[o.board,o.boardName,o.mealPlan,o.mealPlanName,o.boardBasis,o.boardType].find(v=>typeof v==='string'&&v.trim());if(direct)return direct.trim();
  if(Array.isArray(o.features)){const candidate=o.features.find(v=>typeof v==='string'&&/all\s*[- ]?inclusive|all\s*[- ]?in|frühstück|breakfast|halbpension|half\s*board|vollpension|full\s*board|room\s*only|ohne\s*verpflegung/i.test(v));if(candidate)return candidate.trim();}
  return'';
}
function isAllInclusiveOffer(o){
  const board=boardSource(o);
  try{if(typeof mealPlanCodeFromBoard==='function'){const actual=mealPlanCodeFromBoard(board),ai=mealPlanCodeFromBoard('All Inclusive');if(actual!=null&&ai!=null&&String(actual).toUpperCase()===String(ai).toUpperCase())return true;if(actual!=null&&String(actual).trim()!==''&&ai!=null)return false;}}catch{}
  return /all\s*[- ]?inclusive|all\s*[- ]?in/i.test(board);
}
function applyRequirement(out,required){return required&&Array.isArray(out)?out.filter(isAllInclusiveOffer):out;}
if(typeof filterAndRankOffers==='function'&&!filterAndRankOffers.__noreyoV666){
  const base=filterAndRankOffers;
  const wrapped=function(){
    const required=allInclusiveRequired(),result=base.apply(this,arguments);
    return result&&typeof result.then==='function'?result.then(out=>applyRequirement(out,required)):applyRequirement(result,required);
  };
  wrapped.__noreyoV666=true;filterAndRankOffers=wrapped;
}
window.NOREYO_V546=Object.freeze({BUILD,allInclusiveRequired,isAllInclusiveOffer,boardSource,applyRequirement});
})();