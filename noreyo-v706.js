/* NOREYO V7.06 — strict MUST before WISH ranking.
   Factually checkable MUST criteria are filtered first; soft wishes only rank
   the remaining valid offers and can never compensate for a missing MUST. */
(function(){
'use strict';
const BUILD='7.06';
const checks=[['Zimmer0',o=>o?.confirmed?.balcony===true],['Zimmer1',o=>o?.confirmed?.seaView===true],['Zimmer2',o=>o?.confirmed?.terrace===true],['Hotel0',o=>Number(o?.stars||0)>=4],['Hotel4',o=>o?.confirmed?.spa===true],['Hotel5',o=>o?.confirmed?.fitness===true],['Hotel6',o=>o?.confirmed?.breakfast===true],['Hotel7',o=>o?.confirmed?.allInclusive===true],['Preis2',o=>o?.refundable===true]];
function stateOf(key){try{return states?.[key]||'any';}catch(_){return'any';}}
function mealWanted(){try{return String(mealPlanFilter||'ANY').toUpperCase();}catch(_){return'ANY';}}
function mealCode(board){try{if(window.NOREYO_V548?.codeFromBoard)return String(window.NOREYO_V548.codeFromBoard(board)||'ANY').toUpperCase();}catch(_){}const b=String(board||'').toLowerCase();if(/all\s*[- ]?inclusive|\bai\d*\b|\bti\b/.test(b))return'AI';if(/vollpension|full\s*board|\bfb\d*\b/.test(b))return'FB';if(/halbpension|half\s*board|\bhb\d*\b|\bbd\b/.test(b))return'HB';if(/frühstück|fruhstuck|breakfast|\bbb\d*\b|\bbi\b/.test(b))return'BB';if(/nur\s*übernachtung|nur\s*ubernachtung|room\s*only|\bro\d*\b/.test(b))return'RO';return'ANY';}
function mustChecks(){return checks.filter(([key])=>stateOf(key)==='must');}
function wishChecks(){return checks.filter(([key])=>stateOf(key)==='wish');}
function passesMust(o){for(const [,test] of mustChecks())if(!test(o))return false;const wanted=mealWanted();if(wanted!=='ANY'&&mealCode(o?.board)!==wanted)return false;return true;}
function wishScore(o){let score=0;for(const [,test] of wishChecks())if(test(o))score++;return score;}
function rating(o){return Number(String(o?.rating||0).replace(',','.'))||0;}
function price(o){const n=Number(o?.price);return Number.isFinite(n)&&n>0?n:Infinity;}
function strictRank(out){if(!Array.isArray(out))return out;const hasMust=mustChecks().length>0||mealWanted()!=='ANY',hasWish=wishChecks().length>0;if(!hasMust&&!hasWish)return out;const filtered=hasMust?out.filter(passesMust):out.slice();if(hasWish)filtered.sort((a,b)=>{const wish=wishScore(b)-wishScore(a);if(wish)return wish;const review=rating(b)-rating(a);if(review)return review;return price(a)-price(b);});return filtered;}
function afterResult(result){return result&&typeof result.then==='function'?result.then(strictRank):strictRank(result);}
function install(){try{if(typeof filterAndRankOffers!=='function'||filterAndRankOffers.__noreyoV706)return false;const prior=filterAndRankOffers,wrapped=function(){return afterResult(prior.apply(this,arguments));};wrapped.__noreyoV706=true;filterAndRankOffers=wrapped;return true;}catch(_){return false;}}
install();window.addEventListener('pageshow',install,{passive:true});
window.NOREYO_V706=Object.freeze({BUILD,stateOf,mealWanted,mealCode,mustChecks,wishChecks,passesMust,wishScore,strictRank,afterResult,install});
})();
