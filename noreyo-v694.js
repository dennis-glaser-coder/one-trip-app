/* NOREYO V6.94 — exact VisualViewport metrics for destination planner.
   Overrides the older 260px minimum so Safari zoom/landscape/keyboard states
   never make the destination sheet larger than the actually visible viewport. */
(function(){
'use strict';
const BUILD='6.94';
let bound=false;

function metrics(){
  const vv=window.visualViewport;
  return {
    width:Math.max(1,Math.round(vv?.width||window.innerWidth||390)),
    height:Math.max(1,Math.round(vv?.height||window.innerHeight||700)),
    top:Math.max(0,Math.round(vv?.offsetTop||0)),
    left:Math.max(0,Math.round(vv?.offsetLeft||0))
  };
}
function destinationOpen(){
  try{return typeof plannerMode!=='undefined'&&plannerMode==='destination'&&document.getElementById('plannerSheet')?.classList.contains('show');}
  catch(_){return false;}
}
function sync(){
  const m=metrics(),root=document.documentElement;
  root.style.setProperty('--noreyo-vv-width',m.width+'px');
  root.style.setProperty('--noreyo-vv-height',m.height+'px');
  root.style.setProperty('--noreyo-vv-top',m.top+'px');
  root.style.setProperty('--noreyo-vv-left',m.left+'px');
  return m;
}
function installOpenHook(){
  try{
    if(typeof openPlanner!=='function'||openPlanner.__noreyoV694)return false;
    const prior=openPlanner;
    const wrapped=function(mode){
      const result=prior.apply(this,arguments);
      if(mode==='destination'){
        requestAnimationFrame(sync);
        setTimeout(sync,80);
      }
      return result;
    };
    wrapped.__noreyoV694=true;openPlanner=wrapped;return true;
  }catch(_){return false;}
}
function onViewport(){sync();}
function bind(){
  if(bound)return;bound=true;
  window.visualViewport?.addEventListener('resize',onViewport);
  window.visualViewport?.addEventListener('scroll',onViewport);
  window.addEventListener('resize',onViewport);
}
function unbind(){
  if(!bound)return;bound=false;
  window.visualViewport?.removeEventListener('resize',onViewport);
  window.visualViewport?.removeEventListener('scroll',onViewport);
  window.removeEventListener('resize',onViewport);
}
function install(){bind();installOpenHook();sync();}
function cleanup(){unbind();}
install();
window.addEventListener('pagehide',cleanup,{passive:true});
window.addEventListener('pageshow',install,{passive:true});
window.NOREYO_V694=Object.freeze({BUILD,metrics,destinationOpen,sync,installOpenHook,install,get bound(){return bound;}});
})();
