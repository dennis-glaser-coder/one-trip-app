/* NOREYO V8.13 — reversible Safari filter VisualViewport containment.
   Preserves any pre-existing inline geometry instead of blanking it when the
   filter closes or the page enters BFCache. */
(function(){
'use strict';
const BUILD='8.13',EDGE=4;
const ROOT_PROPS=['left','right','top','bottom','width','height','maxWidth','maxHeight'];
let observer=null,bound=false,raf=0,baseline=null,baselineRoot=null,baselineSheet=null;
function root(){return document.getElementById('noreyoFilter557');}
function open(el=root()){return !!el?.classList.contains('show');}
function metrics(){const vv=window.visualViewport;return{width:Math.max(1,Math.round(vv?.width||window.innerWidth||390)),height:Math.max(1,Math.round(vv?.height||window.innerHeight||700)),left:Math.max(0,Math.round(vv?.offsetLeft||0)),top:Math.max(0,Math.round(vv?.offsetTop||0))};}
function maxSheetHeight(height){return Math.max(1,height-EDGE);}
function capture(el=root()){if(!el)return false;const sheet=el.querySelector('.noreyo-v557-sheet');if(baseline&&baselineRoot===el&&baselineSheet===sheet)return false;const rootStyle={};for(const p of ROOT_PROPS)rootStyle[p]=el.style[p]||'';baseline={rootStyle,sheetMaxHeight:sheet?.style?.maxHeight||''};baselineRoot=el;baselineSheet=sheet||null;return true;}
function restore(el=root()){if(!el)return false;if(!baseline||baselineRoot!==el){for(const p of ROOT_PROPS)el.style[p]='';const s=el.querySelector('.noreyo-v557-sheet');if(s)s.style.maxHeight='';return true;}for(const p of ROOT_PROPS)el.style[p]=baseline.rootStyle[p]||'';const sheet=el.querySelector('.noreyo-v557-sheet');if(sheet)sheet.style.maxHeight=baseline.sheetMaxHeight||'';return true;}
function sync(){raf=0;const el=root();if(!el)return false;if(!open(el))return restore(el);capture(el);const m=metrics(),sheet=el.querySelector('.noreyo-v557-sheet');el.style.left=m.left+'px';el.style.right='auto';el.style.top=m.top+'px';el.style.bottom='auto';el.style.width=m.width+'px';el.style.maxWidth=m.width+'px';el.style.height=m.height+'px';el.style.maxHeight=m.height+'px';if(sheet)sheet.style.maxHeight=maxSheetHeight(m.height)+'px';return true;}
function schedule(){if(raf)return;raf=requestAnimationFrame(sync);}
function observe(){if(observer){observer.disconnect();observer=null;}if(typeof MutationObserver==='undefined'||!document.body)return false;observer=new MutationObserver(records=>{for(const r of records){if(r.type==='attributes'&&r.target?.id==='noreyoFilter557'){schedule();return;}for(const n of r.addedNodes||[])if(n?.nodeType===1&&(n.id==='noreyoFilter557'||n.querySelector?.('#noreyoFilter557'))){baseline=null;baselineRoot=null;baselineSheet=null;schedule();return;}}});observer.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['class']});schedule();return true;}
function bind(){if(bound)return false;bound=true;window.visualViewport?.addEventListener('resize',schedule);window.visualViewport?.addEventListener('scroll',schedule);window.addEventListener('resize',schedule);capture();observe();schedule();return true;}
function cleanup(){if(observer){observer.disconnect();observer=null;}if(bound){window.visualViewport?.removeEventListener('resize',schedule);window.visualViewport?.removeEventListener('scroll',schedule);window.removeEventListener('resize',schedule);bound=false;}if(raf){cancelAnimationFrame(raf);raf=0;}restore();}
bind();window.addEventListener('pagehide',cleanup,{passive:true});window.addEventListener('pageshow',bind,{passive:true});
window.NOREYO_V813=Object.freeze({BUILD,EDGE,ROOT_PROPS:ROOT_PROPS.slice(),root,open,metrics,maxSheetHeight,capture,restore,sync,schedule,observe,bind,cleanup});
})();