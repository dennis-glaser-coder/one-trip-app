/* NOREYO V7.02 — VisualViewport arbitration.
   Older planner handlers may still write 260px-clamped viewport CSS variables
   after V6.94. This final arbiter corrects stale/clamped values back to the
   actual Safari VisualViewport. */
(function(){
'use strict';
const BUILD='7.02';
let observer=null,bound=false,raf=0;
function metrics(){const vv=window.visualViewport;return{width:Math.max(1,Math.round(vv?.width||window.innerWidth||390)),height:Math.max(1,Math.round(vv?.height||window.innerHeight||700)),top:Math.max(0,Math.round(vv?.offsetTop||0)),left:Math.max(0,Math.round(vv?.offsetLeft||0))};}
function px(value){const n=parseFloat(String(value||''));return Number.isFinite(n)?Math.round(n):null;}
function stale(root=document.documentElement,m=metrics()){if(!root?.style)return false;return px(root.style.getPropertyValue('--noreyo-vv-width'))!==m.width||px(root.style.getPropertyValue('--noreyo-vv-height'))!==m.height||px(root.style.getPropertyValue('--noreyo-vv-top'))!==m.top||px(root.style.getPropertyValue('--noreyo-vv-left'))!==m.left;}
function sync(){raf=0;const root=document.documentElement,m=metrics();if(!root?.style||!stale(root,m))return false;root.style.setProperty('--noreyo-vv-width',m.width+'px');root.style.setProperty('--noreyo-vv-height',m.height+'px');root.style.setProperty('--noreyo-vv-top',m.top+'px');root.style.setProperty('--noreyo-vv-left',m.left+'px');return true;}
function schedule(){if(raf)return;raf=requestAnimationFrame(sync);}
function onFocus(e){if(e.target?.closest?.('#plannerSheet .planner-search input'))schedule();}
function bind(){if(bound)return;bound=true;window.visualViewport?.addEventListener('resize',schedule);window.visualViewport?.addEventListener('scroll',schedule);window.addEventListener('resize',schedule);document.addEventListener('focusin',onFocus,true);if(typeof MutationObserver!=='undefined'&&document.documentElement){observer=new MutationObserver(records=>{if(records.some(r=>r.type==='attributes'&&r.attributeName==='style'))schedule();});observer.observe(document.documentElement,{attributes:true,attributeFilter:['style']});}sync();}
function cleanup(){if(!bound)return;bound=false;window.visualViewport?.removeEventListener('resize',schedule);window.visualViewport?.removeEventListener('scroll',schedule);window.removeEventListener('resize',schedule);document.removeEventListener('focusin',onFocus,true);if(observer){observer.disconnect();observer=null;}if(raf){cancelAnimationFrame(raf);raf=0;}}
bind();window.addEventListener('pagehide',cleanup,{passive:true});window.addEventListener('pageshow',bind,{passive:true});
window.NOREYO_V702=Object.freeze({BUILD,metrics,px,stale,sync,schedule,bind,cleanup});
})();
