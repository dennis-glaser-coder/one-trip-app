/* NOREYO V7.08 — truthful priority summary.
   The result-priority explanation now counts an active meal-plan requirement
   as a strict priority, matching the V7.07 filter behavior. */
(function(){
'use strict';
const BUILD='7.08';
let observer=null,raf=0;

function mealActive(){
  try{return !!mealPlanFilter&&String(mealPlanFilter).toUpperCase()!=='ANY';}
  catch(_){return false;}
}
function mealLabelSafe(){
  try{return typeof mealPlanLabel==='function'?String(mealPlanLabel()||'Verpflegung'):'Verpflegung';}
  catch(_){return'Verpflegung';}
}
function counts(){
  let must=0,wish=0;
  try{
    const vals=Object.values(states||{});
    must=vals.filter(v=>v==='must').length;
    wish=vals.filter(v=>v==='wish').length;
  }catch(_){}
  if(mealActive())must+=1;
  return{must,wish};
}
function copy(){
  const c=counts(),meal=mealActive(),label=mealLabelSafe();
  if(!c.must&&!c.wish){
    return{
      title:'Noch keine Prioritäten gesetzt',
      body:'Setze Wünsche oder Pflichtkriterien – dann wird aus einer normalen Hotelsuche dein persönliches Ranking.'
    };
  }
  const title=`${c.must} Pflicht · ${c.wish} ${c.wish===1?'Wunsch':'Wünsche'}`;
  const mealCopy=meal?` ${label} wird als Pflicht im geöffneten Tarif geprüft.`:'';
  return{
    title,
    body:`Pflichtkriterien werden strikt geprüft.${mealCopy} Danach zählt jede bestätigte Wunsch-Übereinstimmung für dein persönliches Ranking.`
  };
}
function fix(){
  const box=document.querySelector('#results .noreyo-results-principle');
  if(!box)return false;
  const data=copy();
  const strong=box.querySelector('strong'),p=box.querySelector('p');
  let changed=false;
  if(strong&&strong.textContent!==data.title){strong.textContent=data.title;changed=true;}
  if(p&&p.textContent!==data.body){p.textContent=data.body;changed=true;}
  return changed;
}
function schedule(){
  if(raf)return;
  raf=requestAnimationFrame(()=>{raf=0;fix();});
}
function bind(){
  const root=document.getElementById('results');
  if(observer){observer.disconnect();observer=null;}
  if(root&&typeof MutationObserver!=='undefined'){
    observer=new MutationObserver(schedule);
    observer.observe(root,{childList:true,subtree:true,characterData:true});
  }
  schedule();
}
function cleanup(){
  if(observer){observer.disconnect();observer=null;}
  if(raf){cancelAnimationFrame(raf);raf=0;}
}
bind();
window.addEventListener('pagehide',cleanup,{passive:true});
window.addEventListener('pageshow',bind,{passive:true});
window.NOREYO_V708=Object.freeze({BUILD,mealActive,mealLabelSafe,counts,copy,fix,bind,cleanup});
})();