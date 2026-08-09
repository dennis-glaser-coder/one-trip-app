(function(){
  'use strict';
  let raf=0;

  const labels={
    package:'DEINE PAUSCHALREISE',
    hotel:'DEIN HOTEL',
    flight:'DEIN FLUG',
    cruise:'DEINE KREUZFAHRT'
  };

  function currentMode(){
    const active=document.querySelector('#discover .product-mode.on[data-noreyo-product]');
    if(active?.dataset?.noreyoProduct)return active.dataset.noreyoProduct;
    try{if(typeof productMode==='string')return productMode;}catch(_){ }
    return 'package';
  }

  function applyHeading(){
    const mode=currentMode();
    const label=labels[mode]||labels.package;
    document.querySelectorAll('#discover .search-console-head span,#discover .noreyo-v552-search-head span').forEach(el=>{
      if(el.textContent!==label)el.textContent=label;
    });
  }

  function schedule(){
    if(raf)return;
    raf=requestAnimationFrame(()=>{raf=0;applyHeading();});
  }

  try{
    if(typeof setProductMode==='function'){
      const base=setProductMode;
      setProductMode=function(mode){
        const result=base(mode);
        schedule();
        setTimeout(applyHeading,40);
        return result;
      };
    }
    if(typeof renderProductControls==='function'){
      const base=renderProductControls;
      renderProductControls=function(){
        const result=base();
        schedule();
        return result;
      };
    }
  }catch(e){console.warn('NOREYO V5.53 heading hook',e);}

  applyHeading();
  setTimeout(applyHeading,80);
  setTimeout(applyHeading,240);
  const discover=document.getElementById('discover');
  if(discover&&typeof MutationObserver!=='undefined'){
    new MutationObserver(schedule).observe(discover,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});
  }
  window.addEventListener('pageshow',schedule,{passive:true});
})();
