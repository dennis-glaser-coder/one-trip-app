(function(){
  'use strict';

  function currentMealLabel(){
    try{return typeof mealPlanLabel==='function'?String(mealPlanLabel()||''):'';}catch{return '';}
  }

  function allInclusiveRequired(){
    try{
      if(typeof mealPlanFilter!=='undefined'&&mealPlanFilter&&mealPlanFilter!=='ANY'){
        const label=currentMealLabel();
        if(/all\s*[- ]?inclusive|all\s*[- ]?in/i.test(label))return true;
        const raw=String(mealPlanFilter).trim().toUpperCase();
        if(raw==='AI'||raw==='ALL_INCLUSIVE'||raw==='ALLINCLUSIVE')return true;
      }
    }catch{}
    try{return typeof states!=='undefined'&&states?.Hotel7==='must';}catch{return false;}
  }

  function boardSource(o){
    if(!o)return '';
    const direct=[o.board,o.boardName,o.mealPlan,o.mealPlanName,o.boardBasis,o.boardType].find(v=>typeof v==='string'&&v.trim());
    if(direct)return direct.trim();
    if(Array.isArray(o.features)){
      const candidate=o.features.find(v=>typeof v==='string'&&/all\s*[- ]?inclusive|all\s*[- ]?in|frühstück|breakfast|halbpension|half\s*board|vollpension|full\s*board|room\s*only|ohne\s*verpflegung/i.test(v));
      if(candidate)return candidate.trim();
    }
    return '';
  }

  function isAllInclusiveOffer(o){
    const board=boardSource(o);
    try{
      if(typeof mealPlanCodeFromBoard==='function'){
        const actual=mealPlanCodeFromBoard(board);
        const ai=mealPlanCodeFromBoard('All Inclusive');
        if(actual!=null&&ai!=null&&String(actual).toUpperCase()===String(ai).toUpperCase())return true;
        if(actual!=null&&String(actual).trim()!==''&&ai!=null)return false;
      }
    }catch{}
    return /all\s*[- ]?inclusive|all\s*[- ]?in/i.test(board);
  }

  if(typeof filterAndRankOffers==='function'){
    const baseFilterAndRankOffers=filterAndRankOffers;
    filterAndRankOffers=function(input){
      const out=baseFilterAndRankOffers(input);
      if(!allInclusiveRequired())return out;
      return out.filter(isAllInclusiveOffer);
    };
  }

  window.NOREYO_V546=Object.freeze({allInclusiveRequired,isAllInclusiveOffer});
})();
