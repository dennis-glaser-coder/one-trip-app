(function(){
  'use strict';
  const BUILD='6.20';
  let raf=0,observer=null;

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
    const mode=currentMode(),label=labels[mode]||labels.package;
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

  function wrap(name,marker){
    try{
      const fn=globalThis[name];
      if(typeof fn!=='function'||fn[marker])return;
      const wrapped=function(){
        const result=fn.apply(this,arguments);
        schedule();
        return result;
      };
      wrapped[marker]=true;
      globalThis[name]=wrapped;
    }catch(_){ }
  }

  function installHooks(){
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
    }catch(_){ }
    wrap('renderProductControls','__noreyoV553');
    wrap('updateCounts','__noreyoV620');
  }

  function installObserver(){
    const discover=document.getElementById('discover');
    if(!discover||observer||typeof MutationObserver==='undefined')return;
    observer=new MutationObserver(records=>{if(mutationRelevant(records))schedule();});
    observer.observe(discover,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});
  }

  function cleanup(){
    if(observer){observer.disconnect();observer=null;}
    if(raf){cancelAnimationFrame(raf);raf=0;}
  }

  installHooks();
  applyHeading();
  installObserver();
  setTimeout(applyHeading,80);
  setTimeout(applyHeading,240);
  window.addEventListener('pagehide',cleanup,{passive:true});
  window.addEventListener('pageshow',()=>{installHooks();applyHeading();installObserver();},{passive:true});
  window.NOREYO_V553=Object.freeze({BUILD,currentMode,applyHeading,mutationRelevant});
})();