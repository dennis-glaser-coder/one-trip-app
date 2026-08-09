(function(){
  'use strict';

  function fixHeroCopy(){
    document.querySelectorAll('#discover .hero-copy p').forEach(el=>{
      const text=(el.textContent||'').trim();
      const corrected=text.replace('NOREYO zeigt dir zuerst die Reisen, die wirklich zu dir passen.','NOREYO zeigt dir die Reisen, die wirklich zu dir passen.');
      if(corrected!==text)el.textContent=corrected;
    });
  }

  let raf=0;
  function schedule(){
    if(raf)return;
    raf=requestAnimationFrame(()=>{raf=0;fixHeroCopy();});
  }

  fixHeroCopy();
  setTimeout(fixHeroCopy,80);
  setTimeout(fixHeroCopy,250);
  setTimeout(fixHeroCopy,600);

  const discover=document.getElementById('discover');
  if(discover&&typeof MutationObserver!=='undefined'){
    new MutationObserver(schedule).observe(discover,{childList:true,subtree:true,characterData:true});
  }
  window.addEventListener('pageshow',schedule,{passive:true});
})();
