/* NOREYO V6.77 — async-safe soft-wish ranking.
   Ensures "Wichtig" preferences still affect ordering when filterAndRankOffers
   returns a Promise, while preserving sync arrays and rejection semantics. */
(function(){
'use strict';
const BUILD='6.77';

const checks=[
 ['Zimmer0',o=>o?.confirmed?.balcony===true],
 ['Zimmer1',o=>o?.confirmed?.seaView===true],
 ['Zimmer2',o=>o?.confirmed?.terrace===true],
 ['Hotel0',o=>Number(o?.stars||0)>=4],
 ['Hotel4',o=>o?.confirmed?.spa===true],
 ['Hotel5',o=>o?.confirmed?.fitness===true],
 ['Hotel6',o=>o?.confirmed?.breakfast===true],
 ['Hotel7',o=>o?.confirmed?.allInclusive===true],
 ['Preis2',o=>o?.refundable===true]
];
function stateOf(key){try{return states?.[key]||'any';}catch(_){return'any';}}
function hasWishes(){return checks.some(([key])=>stateOf(key)==='wish');}
function wishScore(o){
  let score=0;
  for(const [key,test] of checks)if(stateOf(key)==='wish'&&test(o))score++;
  return score;
}
function rating(o){return Number(String(o?.rating||0).replace(',','.'))||0;}
function price(o){const n=Number(o?.price);return Number.isFinite(n)&&n>0?n:Infinity;}
function rank(out){
  if(!Array.isArray(out)||!hasWishes())return out;
  return out.sort((a,b)=>{
    const wish=wishScore(b)-wishScore(a);if(wish)return wish;
    const review=rating(b)-rating(a);if(review)return review;
    return price(a)-price(b);
  });
}
function afterResult(result){
  return result&&typeof result.then==='function'?result.then(rank):rank(result);
}
function install(){
  try{
    if(typeof filterAndRankOffers!=='function'||filterAndRankOffers.__noreyoV677)return;
    const prior=filterAndRankOffers;
    const wrapped=function(){return afterResult(prior.apply(this,arguments));};
    wrapped.__noreyoV677=true;
    filterAndRankOffers=wrapped;
  }catch(_){ }
}
install();
window.addEventListener('pageshow',install,{passive:true});
window.NOREYO_V677=Object.freeze({BUILD,stateOf,hasWishes,wishScore,rank,afterResult,install});
})();