/* NOREYO V7.86 — destination planner VisualViewport containment.
   Keeps the destination planner inside Safari's actually visible viewport and
   clamps the scroll body to a non-negative height in extreme keyboard states. */
(function(){
'use strict';
const BUILD='7.86',HEADER_RESERVE=68,MIN_BODY=1;
let observer=null,bound=false,raf=0;
function sheet(){return document.getElementById('plannerSheet');}
function metrics(){const vv=window.visualViewport;return{width:Math.max(1,Math.round(vv?.width||window.innerWidth||390)),height:Math.max(1,Math.round(vv?.height||window.innerHeight||700)),left:Math.max(0,Math.round(vv?.offsetLeft||0)),top:Math.max(0,Math.round(vv?.offsetTop||0))};}
function bodyHeight(height){return Math.max(MIN_BODY,Math.min(height,Math.max(MIN_BODY,height-HEADER_RESERVE)));}
function active(root=sheet()){return !!root&&root.classList.contains('noreyo-destination-sheet')&&root.classList.contains('show')&&document.body?.classList.contains('noreyo-planner-keyboard');}
function sync(){raf=0;const root=sheet();if(!active(root))return false;const m=metrics(),body=root.querySelector('.planner-body');root.style.left=m.left+'px';root.style.right='auto';root.style.top=(m.top+4)+'px';root.style.width=m.width+'px';root.style.maxWidth=m.width+'px';root.style.height=Math.max(1,m.height-4)+'px';root.style.maxHeight=Math.max(1,m.height-4)+'px';if(body){const h=bodyHeight(m.height);body.style.height=h+'px';body.style.maxHeight=h+'px';}return true;}
function schedule(){if(raf)return;raf=requestAnimationFrame(sync);}
function observe(){if(observer){observer.disconnect();observer=null;}if(typeof MutationObserver==='undefined'||!document.body)return false;observer=new MutationObserver(()=>schedule());observer.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['class']});return true;}
function bind(){if(bound)return false;bound=true;window.visualViewport?.addEventListener('resize',schedule);window.visualViewport?.addEventListener('scroll',schedule);window.addEventListener('resize',schedule);document.addEventListener('focusin',schedule,true);observe();schedule();return true;}
function cleanup(){if(observer){observer.disconnect();observer=null;}if(bound){window.visualViewport?.removeEventListener('resize',schedule);window.visualViewport?.removeEventListener('scroll',schedule);window.removeEventListener('resize',schedule);document.removeEventListener('focusin',schedule,true);bound=false;}if(raf){cancelAnimationFrame(raf);raf=0;}}
bind();window.addEventListener('pagehide',cleanup,{passive:true});window.addEventListener('pageshow',bind,{passive:true});
window.NOREYO_V786=Object.freeze({BUILD,HEADER_RESERVE,MIN_BODY,sheet,metrics,bodyHeight,active,sync,schedule,observe,bind,cleanup});
})();