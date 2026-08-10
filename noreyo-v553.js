(function(){
  'use strict';
  const BUILD='5.87';
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

  function mutationRelevant(records){
    for(const r of records){
      if(r.type==='attributes'){
        const t=r.target;
        if(t instanceof Element&&(t.matches('.product-mode')||t.closest('.product-switch')))return true;
        continue;
      }
      for(const n of r.addedNodes||[]){
        if(n.nodeType!==1)continue;
        if(n.matches?.('.search-console-head,.noreyo-v552-search-head,.product-switch,.product-mode')||
           n.querySelector?.('.search-console-head,.noreyo-v552-search-head,.product-switch,.product-mode'))return true;
      }
    }
    return false;
  }

  try{
    if(typeof setProductMode==='function'&&!setProductMode.__noreyoV553){
      const base=setProductMode;
      const wrapped=function(mode){
        const result=base.apply(this,arguments);
        schedule();
        setTimeout(applyHeading,40);
        return result;
      };
      wrapped.__noreyoV553=true;
      setProductMode=wrapped;
    }
    if(typeof renderProductControls==='function'&&!renderProductControls.__noreyoV553){
      const base=renderProductControls;
      const wrapped=function(){
        const result=base.apply(this,arguments);
        schedule();
        return result;
      };
      wrapped.__noreyoV553=true;
      renderProductControls=wrapped;
    }
  }catch(e){console.warn('NOREYO '+BUILD+' heading hook',e);}

  applyHeading();
  setTimeout(applyHeading,80);
  setTimeout(applyHeading,240);
  const discover=document.getElementById('discover');
  if(discover&&typeof MutationObserver!=='undefined'){
    new MutationObserver(records=>{if(mutationRelevant(records))schedule();})
      .observe(discover,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});
  }
  window.addEventListener('pageshow',schedule,{passive:true});
})();
