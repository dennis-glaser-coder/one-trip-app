(function(){
  'use strict';
  const BUILD='6.05';
  let raf=0,observer=null;

  function fixHeroCopy(){
    document.querySelectorAll('#discover .hero-copy p').forEach(el=>{
      const text=(el.textContent||'').trim();
      const corrected=text.replace('NOREYO zeigt dir zuerst die Reisen, die wirklich zu dir passen.','NOREYO zeigt dir die Reisen, die wirklich zu dir passen.');
      if(corrected!==text)el.textContent=corrected;
    });
  }
  function schedule(){if(raf)return;raf=requestAnimationFrame(()=>{raf=0;fixHeroCopy();});}
  function relevant(records){
    for(const r of records){
      if(r.type==='characterData'&&r.target?.parentElement?.closest?.('#discover .hero-copy'))return true;
      for(const n of r.addedNodes||[]){
        if(n.nodeType===3&&n.parentElement?.closest?.('#discover .hero-copy'))return true;
        if(n.nodeType!==1)continue;
        if(n.matches?.('.hero-copy,.hero-copy p')||n.querySelector?.('.hero-copy,.hero-copy p'))return true;
      }
    }
    return false;
  }
  function installObserver(){
    const hero=document.querySelector('#discover .hero');
    if(!hero||observer||typeof MutationObserver==='undefined')return;
    observer=new MutationObserver(records=>{if(relevant(records))schedule();});
    observer.observe(hero,{childList:true,subtree:true,characterData:true});
  }
  function cleanup(){if(observer){observer.disconnect();observer=null;}raf=0;}

  fixHeroCopy();installObserver();
  setTimeout(fixHeroCopy,80);setTimeout(fixHeroCopy,250);setTimeout(fixHeroCopy,600);
  window.addEventListener('pagehide',cleanup,{passive:true});
  window.addEventListener('pageshow',()=>{fixHeroCopy();installObserver();},{passive:true});
  window.NOREYO_V547=Object.freeze({BUILD,fixHeroCopy,relevant});
})();