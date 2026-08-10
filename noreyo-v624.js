/* NOREYO V6.52 — AI modal BFCache cleanup + async-safe detail meal-truth audit. */
(function(){
'use strict';
const BUILD='6.52';
let restoreY=0;

function aiWrap(){return document.getElementById('noreyoAi556');}
function legacyWrap(){return document.getElementById('noreyoAi555');}
function lockedScrollY(){
  const top=parseFloat(document.body?.style?.top||'');
  if(Number.isFinite(top)&&top<0)return Math.max(0,-top);
  return Math.max(0,window.scrollY||0);
}
function clearAiTransientState(restoreScroll){
  const body=document.body;if(!body)return false;
  const hadLock=body.classList.contains('noreyo-v556-lock');
  if(hadLock)restoreY=lockedScrollY();
  body.classList.remove('noreyo-v556-lock');body.style.top='';
  const w=aiWrap();if(w){w.classList.remove('show');w.style.height='';w.style.top='';w.querySelector('textarea')?.blur?.();}
  const old=legacyWrap();if(old){old.classList.remove('show');old.querySelector('textarea')?.blur?.();}
  if(restoreScroll&&hadLock){try{window.scrollTo(0,restoreY);}catch(_){ }}
  return hadLock||!!w||!!old;
}
function requestedMealCode(){try{return typeof mealPlanFilter==='string'?String(mealPlanFilter||'ANY').toUpperCase():'ANY';}catch(_){return'ANY';}}
function codeFromBoard(board){
  try{if(window.NOREYO_V548?.codeFromBoard)return String(window.NOREYO_V548.codeFromBoard(board)||'ANY').toUpperCase();}catch(_){ }
  const b=String(board||'').toLowerCase();
  if(/all\s*[- ]?inclusive|\bai\d*\b|\bti\b/.test(b))return'AI';
  if(/vollpension|full\s*board|\bfb\d*\b/.test(b))return'FB';
  if(/halbpension|half\s*board|\bhb\d*\b|\bbd\b/.test(b))return'HB';
  if(/frühstück|fruhstuck|breakfast|\bbb\d*\b|\bbi\b/.test(b))return'BB';
  if(/nur\s*übernachtung|nur\s*ubernachtung|room\s*only|\bro\d*\b/.test(b))return'RO';
  return'ANY';
}
function mealLabel(){try{return typeof mealPlanLabel==='function'?String(mealPlanLabel()||'Verpflegung'):'Verpflegung';}catch(_){return'Verpflegung';}}
function selectedBoardConfirmed(o){const wanted=requestedMealCode();return wanted==='ANY'||codeFromBoard(o?.board)===wanted;}
function auditDetailMeal(o){
  const wanted=requestedMealCode();if(wanted==='ANY')return false;
  const root=document.getElementById('detailContent');if(!root)return false;
  const label=mealLabel().toLowerCase(),confirmed=selectedBoardConfirmed(o);let changed=false;
  root.querySelectorAll('.noreyo-detail-chip').forEach(chip=>{
    const text=String(chip.textContent||'').toLowerCase();if(!text.includes(label))return;
    if(!confirmed){chip.remove();changed=true;}
  });
  if(!confirmed){
    const score=root.querySelector('.noreyo-detail-score strong'),why=root.querySelector('.noreyo-detail-why p');
    if(score&&score.textContent!=='TARIF PRÜFEN'){score.textContent='TARIF PRÜFEN';changed=true;}
    const copy=`Die gewählte Verpflegung „${mealLabel()}“ ist in diesem geöffneten Tarif nicht bestätigt. Bitte prüfe Verpflegung und Tarif vor der Auswahl.`;
    if(why&&why.textContent!==copy){why.textContent=copy;changed=true;}
  }
  return changed;
}
function afterResult(result,after){
  if(result&&typeof result.then==='function')return result.then(value=>{after();return value;});
  after();return result;
}
function installDetailHook(){
  try{
    if(typeof renderDetail!=='function'||renderDetail.__noreyoV652)return false;
    const prior=renderDetail;
    const wrapped=function(o){const result=prior.apply(this,arguments);return afterResult(result,()=>auditDetailMeal(o));};
    wrapped.__noreyoV652=true;renderDetail=wrapped;return true;
  }catch(_){return false;}
}
function onPageHide(){clearAiTransientState(true);}
function onPageShow(){
  const body=document.body;
  if(body&&body.classList.contains('noreyo-v556-lock')&&!aiWrap()?.classList.contains('show'))clearAiTransientState(false);
  installDetailHook();
}
installDetailHook();
window.addEventListener('pagehide',onPageHide,{passive:true});
window.addEventListener('pageshow',onPageShow,{passive:true});
window.NOREYO_V624=Object.freeze({BUILD,clearAiTransientState,lockedScrollY,requestedMealCode,codeFromBoard,selectedBoardConfirmed,auditDetailMeal,afterResult,installDetailHook});
})();