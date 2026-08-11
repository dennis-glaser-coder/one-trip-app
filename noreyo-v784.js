/* NOREYO V7.84 — iPhone/Safari visualViewport width arbiter.
   Keeps the AI sheet inside the horizontally visible Safari viewport during
   keyboard zoom, landscape and VisualViewport offset changes. */
(function(){
'use strict';
const BUILD='7.84';
let observer=null,bound=false,raf=0;
function ai(){return document.getElementById('noreyoAi556');}
function metrics(){const vv=window.visualViewport;return{width:Math.max(1,Math.round(vv?.width||window.innerWidth||390)),height:Math.max(1,Math.round(vv?.height||window.innerHeight||700)),left:Math.max(0,Math.round(vv?.offsetLeft||0)),top:Math.max(0,Math.round(vv?.offsetTop||0))};}
function sheetWidth(width){return Math.max(1,width);}
function sync(){raf=0;const root=ai();if(!root||!root.classList.contains('show'))return false;const m=metrics();root.style.width=sheetWidth(m.width)+'px';root.style.maxWidth=sheetWidth(m.width)+'px';root.style.left=m.left+'px';root.style.right='auto';return true;}
function schedule(){if(raf)return;raf=requestAnimationFrame(sync);}
function observe(){if(observer){observer.disconnect();observer=null;}if(typeof MutationObserver==='undefined'||!document.body)return false;observer=new MutationObserver(records=>{for(const r of records){if(r.type==='attributes'&&r.target?.id==='noreyoAi556'&&r.attributeName==='class'){schedule();return;}for(const n of r.addedNodes||[]){if(n?.nodeType===1&&(n.id==='noreyoAi556'||n.querySelector?.('#noreyoAi556'))){schedule();return;}}}});observer.observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});return true;}
function bind(){if(bound)return false;bound=true;window.visualViewport?.addEventListener('resize',schedule);window.visualViewport?.addEventListener('scroll',schedule);window.addEventListener('resize',schedule);observe();schedule();return true;}
function cleanup(){if(observer){observer.disconnect();observer=null;}if(bound){window.visualViewport?.removeEventListener('resize',schedule);window.visualViewport?.removeEventListener('scroll',schedule);window.removeEventListener('resize',schedule);bound=false;}if(raf){cancelAnimationFrame(raf);raf=0;}}
bind();window.addEventListener('pagehide',cleanup,{passive:true});window.addEventListener('pageshow',bind,{passive:true});
window.NOREYO_V784=Object.freeze({BUILD,ai,metrics,sheetWidth,sync,schedule,observe,bind,cleanup});
})();