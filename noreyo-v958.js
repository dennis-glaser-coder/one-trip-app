/* NOREYO V9.58 — dynamic visible runtime build label.
   Older profile reconciliation layers hard-coded historical build labels.
   Always display the numerically newest active NOREYO runtime build instead. */
(function(){
'use strict';
const BUILD='9.58';
let observer=null,raf=0,timer=0;

function activeBuild(){
  let best=null;
  try{
    for(const key of Object.keys(window)){
      const m=/^NOREYO_V(\d+)$/.exec(key);
      if(!m)continue;
      const n=Number(m[1]);
      if(!Number.isInteger(n))continue;
      const value=window[key];
      const raw=String(value?.BUILD||'').trim();
      if(!raw)continue;
      if(!best||n>best.n)best={n,raw};
    }
  }catch(_){}
  if(!best)return BUILD;
  return best.raw.replace(/-safe$/i,'');
}
function label(){return 'NOREYO · BUILD '+activeBuild();}
function fix(root=document){
  const profile=root.getElementById?.('profile')||root.querySelector?.('#profile');
  const el=profile?.querySelector?.('.build-version');
  if(!el)return false;
  const next=label();
  if(el.textContent===next)return false;
  el.textContent=next;
  return true;
}
function run(){raf=0;return fix();}
function schedule(){if(!raf)raf=requestAnimationFrame(run);}
function observe(){
  if(observer){observer.disconnect();observer=null;}
  if(typeof MutationObserver==='undefined'||!document.body)return false;
  observer=new MutationObserver(schedule);
  observer.observe(document.body,{subtree:true,childList:true,characterData:true});
  schedule();
  if(timer)clearTimeout(timer);
  timer=setTimeout(schedule,0);
  return true;
}
function cleanup(){
  if(observer){observer.disconnect();observer=null;}
  if(raf){cancelAnimationFrame(raf);raf=0;}
  if(timer){clearTimeout(timer);timer=0;}
}
observe();
window.addEventListener('pagehide',cleanup,{passive:true});
window.addEventListener('pageshow',observe,{passive:true});
window.NOREYO_V958=Object.freeze({BUILD,activeBuild,label,fix,run,schedule,observe,cleanup});
})();