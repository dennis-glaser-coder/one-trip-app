/* NOREYO V7.82 — hard visualViewport ceiling for the AI sheet.
   The AI sheet can never exceed Safari's actually visible viewport, even in
   extreme keyboard/landscape states below the former 120px minimum. */
(function(){
'use strict';
const BUILD='7.82',MIN_SHEET_HEIGHT=40;
let observer=null,bound=false,raf=0;
function ai(){return document.getElementById('noreyoAi556');}
function metrics(){const vv=window.visualViewport;return{height:Math.max(1,Math.round(vv?.height||window.innerHeight||700)),top:Math.max(0,Math.round(vv?.offsetTop||0))};}
function sheetHeight(height){return Math.max(1,Math.min(Math.max(MIN_SHEET_HEIGHT,height-4),height));}
function sync(){raf=0;const root=ai();if(!root||!root.classList.contains('show'))return false;const m=metrics(),sheet=root.querySelector('.noreyo-v556-sheet');root.style.height=m.height+'px';root.style.top=m.top+'px';if(sheet)sheet.style.maxHeight=sheetHeight(m.height)+'px';return true;}
function schedule(){if(raf)return;raf=requestAnimationFrame(sync);}
function observe(){if(observer){observer.disconnect();observer=null;}if(typeof MutationObserver==='undefined'||!document.body)return false;observer=new MutationObserver(records=>{for(const r of records){if(r.type==='attributes'&&r.target?.id==='noreyoAi556'&&r.attributeName==='class'){schedule();return;}for(const n of r.addedNodes||[]){if(n?.nodeType===1&&(n.id==='noreyoAi556'||n.querySelector?.('#noreyoAi556'))){schedule();return;}}}});observer.observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});return true;}
function bind(){if(bound)return false;bound=true;window.visualViewport?.addEventListener('resize',schedule);window.visualViewport?.addEventListener('scroll',schedule);window.addEventListener('resize',schedule);observe();schedule();return true;}
function cleanup(){if(observer){observer.disconnect();observer=null;}if(bound){window.visualViewport?.removeEventListener('resize',schedule);window.visualViewport?.removeEventListener('scroll',schedule);window.removeEventListener('resize',schedule);bound=false;}if(raf){cancelAnimationFrame(raf);raf=0;}}
bind();window.addEventListener('pagehide',cleanup,{passive:true});window.addEventListener('pageshow',bind,{passive:true});
window.NOREYO_V782=Object.freeze({BUILD,MIN_SHEET_HEIGHT,ai,metrics,sheetHeight,sync,schedule,observe,bind,cleanup});
})();