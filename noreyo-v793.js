/* NOREYO V7.93 — atomic AI traveller reconciliation.
   Applies derived adults and parsed child ages together after the legacy AI
   handlers settle, preventing transient old-adult validation from discarding
   otherwise valid baby/toddler ages. */
(function(){
'use strict';
const BUILD='7.93',MAX_ADULTS=6,MAX_CHILDREN=4,MAX_TRAVELLERS=9;
function current(){try{if(typeof searchState==='undefined'||!searchState)return null;return{adults:Math.round(Number(searchState.adults)),childAges:Array.isArray(searchState.childAges)?searchState.childAges.map(Number):[]};}catch(_){return null;}}
function derived(text){try{return window.NOREYO_V787?.derive?.(text)||null;}catch(_){return null;}}
function parsedAges(text){try{const v=window.NOREYO_V788?.groupedChildAges?.(text);return Array.isArray(v)?v.slice():null;}catch(_){return null;}}
function valid(s){return !!s&&Number.isInteger(s.adults)&&s.adults>=1&&s.adults<=MAX_ADULTS&&Array.isArray(s.childAges)&&s.childAges.length<=MAX_CHILDREN&&s.childAges.every(v=>Number.isInteger(v)&&v>=0&&v<=17)&&s.adults+s.childAges.length<=MAX_TRAVELLERS&&s.childAges.filter(v=>v<=1).length<=s.adults;}
function plan(text,base=current()){if(!base)return null;const d=derived(text),ages=parsedAges(text);if(!d&&ages===null)return null;const next={adults:d?.adults??base.adults,childAges:ages!==null?ages:base.childAges.slice()};if(d&&ages===null&&Number.isInteger(d.children)&&next.childAges.length!==d.children)return null;if(d&&ages!==null&&Number.isInteger(d.children)&&ages.length!==d.children)return null;return valid(next)?next:null;}
function equal(a,b){return !!a&&!!b&&a.adults===b.adults&&a.childAges.length===b.childAges.length&&a.childAges.every((v,i)=>v===b.childAges[i]);}
function apply(next){if(!valid(next))return false;const before=current();if(!before||equal(before,next))return false;try{searchState.adults=next.adults;searchState.childAges=next.childAges.slice();try{updateSearchUI?.();}catch(_){}try{updateCounts?.();}catch(_){}try{persistState?.();}catch(_){}return true;}catch(_){return false;}}
function reconcile(text){const next=plan(text,current());return next?apply(next):false;}
function later(fn){setTimeout(()=>setTimeout(()=>setTimeout(()=>setTimeout(fn,0),0),0),0);}
function onApply(e){if(!e.target?.closest?.('.noreyo-v556-apply'))return;const text=document.getElementById('noreyoAi556Text')?.value||'';later(()=>reconcile(text));}
document.addEventListener('click',onApply,true);
window.NOREYO_V793=Object.freeze({BUILD,MAX_ADULTS,MAX_CHILDREN,MAX_TRAVELLERS,current,derived,parsedAges,valid,plan,equal,apply,reconcile,onApply});
})();