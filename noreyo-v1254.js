/* NOREYO V12.54 — truthful missing hotel-rating presentation.
   Packed renderDetail can interpolate a missing rating into visible score surfaces.
   Never invent a score: replace only invalid/non-positive rating text with an
   explicit unknown state, preserving every finite positive provider rating. */
(function(){
'use strict';
const BUILD='12.54';
let observer=null,raf=0;

function numeric(text){
  const s=String(text??'').trim().replace(',','.');
  const n=Number(s);
  return Number.isFinite(n)&&n>0?n:null;
}
function saved(root=document.getElementById('detail')){
  return !!root?.querySelector?.('.noreyo-v1014-saved-note,.noreyo-v1010-saved-note');
}
function fixScore(score,label,isSaved=false){
  if(!score||numeric(score.textContent)!==null)return false;
  let changed=false;
  if(score.textContent!=='–'){score.textContent='–';changed=true;}
  const wanted=isSaved?'Bewertung nicht gespeichert':'Bewertung noch nicht verfügbar';
  if(label&&label.textContent!==wanted){label.textContent=wanted;changed=true;}
  return changed;
}
function sync(root=document.getElementById('detail')){
  raf=0;if(!root)return false;
  const isSaved=saved(root);let changed=false;
  const top=root.querySelector('.detail-rating');
  if(top)changed=fixScore(top.querySelector('.rating'),top.querySelector('.detail-rating-copy b'),isSaved)||changed;
  const reviews=root.querySelector('.review-detail-cta');
  if(reviews)changed=fixScore(reviews.querySelector('.review-detail-score'),reviews.querySelector('.copy b'),isSaved)||changed;
  return changed;
}
function schedule(){if(!raf)raf=requestAnimationFrame(sync);}
function install(){
  if(observer||typeof MutationObserver==='undefined'||!document.body)return false;
  observer=new MutationObserver(records=>{
    for(const r of records){
      const el=r.target?.nodeType===1?r.target:r.target?.parentElement;
      if(el?.closest?.('#detail')){schedule();return;}
      for(const n of r.addedNodes||[]){
        if(n?.nodeType===1&&(n.id==='detail'||n.matches?.('#detail *')||n.querySelector?.('#detail'))){schedule();return;}
      }
    }
  });
  observer.observe(document.body,{subtree:true,childList:true,characterData:true});
  sync();return true;
}
function cleanup(){if(observer){observer.disconnect();observer=null;}if(raf){cancelAnimationFrame(raf);raf=0;}}
install();
window.addEventListener('pagehide',cleanup,{passive:true});
window.addEventListener('pageshow',install,{passive:true});
window.NOREYO_V1254=Object.freeze({BUILD,numeric,saved,fixScore,sync,schedule,install,cleanup});
})();