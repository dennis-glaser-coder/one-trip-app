/* NOREYO V8.21 — mixed-unit child-age parsing.
   Extends the V7.95 parser so phrases such as "2 Kinder, 6 Monate und 4 Jahre"
   are treated as two complete child ages rather than an incomplete year-only match. */
(function(){
'use strict';
const BUILD='8.21';
const prior=window.NOREYO_V795;

function mixedGroupedChildAges(text){
  if(!prior)return null;
  const count=prior.explicitChildCount?.(text);
  if(count===0)return[];

  let original=null;
  try{original=prior.groupedChildAges?.(text)??null;}catch(_){}
  if(Array.isArray(original)&&(count===null||original.length===count))return original.slice();

  const segment=prior.childSegment?.(text)||'';
  if(!segment)return null;

  let mixed=[];
  try{mixed=prior.individuallyQualified?.(segment)||[];}catch(_){mixed=[];}
  if(!Array.isArray(mixed)||!mixed.length)return null;
  if(count!==null&&mixed.length!==count)return null;
  if(count===null&&(mixed.length<1||mixed.length>4))return null;
  return mixed.slice();
}

if(prior){
  const replacement={...prior,groupedChildAges:mixedGroupedChildAges,BUILD_MIXED:BUILD};
  try{window.NOREYO_V795=Object.freeze(replacement);}catch(_){window.NOREYO_V795=replacement;}
}
window.NOREYO_V821=Object.freeze({BUILD,prior,mixedGroupedChildAges});
})();