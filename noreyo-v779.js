/* NOREYO V7.79 — exact AI-sheet VisualViewport sizing.
   Removes the legacy 360px minimum max-height while the iPhone keyboard or
   landscape mode leaves less visible space. The AI sheet follows the real
   Safari visualViewport and never intentionally extends under the keyboard. */
(function(){
'use strict';
const BUILD='7.79',MIN_USABLE_HEIGHT=120;
let observer=null,bound=false,raf=0;
function ai(){return document.getElementById('noreyoAi556');}
function open(){return !!ai()?.classList.contains('show');}
function metrics(){const vv=window.visualViewport;return{height:Math.max(1,Math.round(vv?.height||window.innerHeight||700)),top:Math.max(0,Math.round(vv?.offsetTop||0))};}
function sync(){raf=0;const root=ai();if(!root||!root.classList.contains('show'))return false;const m=metrics(),sheet=root.querySelector('.noreyo-v556-sheet');root.style.height=m.height+'px';root.style.top=m.top+'px';if(sheet)sheet.style.maxHeight=Math.max(MIN_USABLE_HEIGHT,m.height-4)+'px';return true;}
function schedule(){if(raf)return;raf=requestAnimationFrame(sync);}
function observe(){if(observer){observer.disconnect();observer=null;}if(typeof MutationObserver==='undefined'||!document.body)return false;observer=new MutationObserver(records=>{for(const r of records){if(r.type==='attributes'&&r.target?.id==='noreyoAi556'&&r.attributeName==='class'){schedule();return;}for(const n of r.addedNodes||[]){if(n?.nodeType===1&&(n.id==='noreyoAi556'||n.querySelector?.('#noreyoAi556'))){schedule();return;}}}});observer.observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});return true;}
function bind(){if(bound)return false;bound=true;window.visualViewport?.addEventListener('resize',schedule);window.visualViewport?.addEventListener('scroll',schedule);window.addEventListener('resize',schedule);observe();schedule();return true;}
function cleanup(){if(observer){observer.disconnect();observer=null;}if(bound){window.visualViewport?.removeEventListener('resize',schedule);window.visualViewport?.removeEventListener('scroll',schedule);window.removeEventListener('resize',schedule);bound=false;}if(raf){cancelAnimationFrame(raf);raf=0;}}
bind();window.addEventListener('pagehide',cleanup,{passive:true});window.addEventListener('pageshow',bind,{passive:true});
window.NOREYO_V779=Object.freeze({BUILD,MIN_USABLE_HEIGHT,ai,open,metrics,sync,schedule,observe,bind,cleanup});
})();