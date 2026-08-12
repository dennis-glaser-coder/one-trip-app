/* NOREYO V9.27 — accessible live-result cards and favorite state. */
(function(){
'use strict';
const BUILD='9.27';
let observer=null,raf=0;
function favoriteState(btn){return !!btn?.classList?.contains('on');}
function labelForFavorite(on){return on?'Aus Favoriten entfernen':'Zu Favoriten hinzufügen';}
function enhanceOffer(offer){
  if(!offer)return false;
  let changed=false;
  const open=offer.querySelector('.offer-img');
  if(open){
    if(open.getAttribute('role')!=='button'){open.setAttribute('role','button');changed=true;}
    if(open.getAttribute('tabindex')!=='0'){open.setAttribute('tabindex','0');changed=true;}
    if(!open.getAttribute('aria-label')){const hotel=offer.querySelector('.hotel-name')?.textContent?.trim()||'Hotel';open.setAttribute('aria-label',hotel+' öffnen');changed=true;}
    if(open.dataset.noreyoV927!=='1'){
      open.dataset.noreyoV927='1';
      open.addEventListener('keydown',e=>{
        if(e.key!=='Enter'&&e.key!==' ')return;
        if(e.target?.closest?.('button'))return;
        e.preventDefault();open.click();
      });
      changed=true;
    }
  }
  const heart=offer.querySelector('.heart-btn');
  if(heart){
    const on=favoriteState(heart),label=labelForFavorite(on);
    if(heart.getAttribute('type')!=='button'){heart.setAttribute('type','button');changed=true;}
    if(heart.getAttribute('aria-pressed')!==String(on)){heart.setAttribute('aria-pressed',String(on));changed=true;}
    if(heart.getAttribute('aria-label')!==label){heart.setAttribute('aria-label',label);changed=true;}
  }
  return changed;
}
function sync(){raf=0;let changed=false;document.querySelectorAll('#offers .offer').forEach(o=>{changed=enhanceOffer(o)||changed;});return changed;}
function schedule(){if(!raf)raf=requestAnimationFrame(sync);}
function observe(){
  if(observer){observer.disconnect();observer=null;}
  if(typeof MutationObserver==='undefined'||!document.body)return false;
  observer=new MutationObserver(records=>{
    for(const r of records){
      if(r.target?.closest?.('#offers')||[...(r.addedNodes||[])].some(n=>n?.nodeType===1&&(n.matches?.('#offers,.offer')||n.querySelector?.('#offers,.offer')))){schedule();return;}
    }
  });
  observer.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['class']});
  schedule();return true;
}
function cleanup(){if(observer){observer.disconnect();observer=null;}if(raf){cancelAnimationFrame(raf);raf=0;}}
observe();
window.addEventListener('pagehide',cleanup,{passive:true});
window.addEventListener('pageshow',observe,{passive:true});
window.NOREYO_V927=Object.freeze({BUILD,favoriteState,labelForFavorite,enhanceOffer,sync,schedule,observe,cleanup});
})();