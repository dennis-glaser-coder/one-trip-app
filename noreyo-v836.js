/* NOREYO V8.36 — filter focus-origin preservation across modal lock handoff.
   Captures the opener when the filter becomes visible, not only when V8.02 later
   acquires the body lock after AI-sheet handoff. */
(function(){
'use strict';
const BUILD='8.36';
let observer=null,root=null,wasOpen=false,opener=null,restoreTimer=0;
function sheet(){return document.getElementById('noreyoFilter557');}
function open(el=sheet()){return !!el?.classList.contains('show');}
function validOpener(el,filter=sheet()){return !!el&&el instanceof Element&&el!==document.body&&el.isConnected&&!filter?.contains?.(el);}
function capture(){const filter=sheet();let active=null;try{active=document.activeElement;}catch(_){}if(validOpener(active,filter))opener=active;return opener;}
function restore(){const target=opener;opener=null;if(restoreTimer){clearTimeout(restoreTimer);restoreTimer=0;}if(!target?.isConnected)return false;restoreTimer=setTimeout(()=>{restoreTimer=0;try{target.focus({preventScroll:true});}catch(_){}},0);return true;}
function sync(){const filter=sheet(),now=open(filter);if(now&&!wasOpen)capture();else if(!now&&wasOpen)restore();wasOpen=now;return now;}
function observe(){const next=sheet();if(observer){observer.disconnect();observer=null;}root=next;wasOpen=open(next);if(!next||typeof MutationObserver==='undefined')return false;observer=new MutationObserver(records=>{if(records.some(r=>r.type==='attributes'&&r.attributeName==='class'))sync();});observer.observe(next,{attributes:true,attributeFilter:['class']});return true;}
function bind(){if(observe())return true;if(typeof MutationObserver==='undefined'||!document.body)return false;observer=new MutationObserver(records=>{for(const r of records)for(const n of r.addedNodes||[]){if(n?.nodeType===1&&(n.id==='noreyoFilter557'||n.querySelector?.('#noreyoFilter557'))){observe();sync();return;}}});observer.observe(document.body,{childList:true,subtree:true});return true;}
function cleanup(){if(observer){observer.disconnect();observer=null;}if(restoreTimer){clearTimeout(restoreTimer);restoreTimer=0;}root=null;wasOpen=false;opener=null;}
bind();window.addEventListener('pagehide',cleanup,{passive:true});window.addEventListener('pageshow',bind,{passive:true});
window.NOREYO_V836=Object.freeze({BUILD,sheet,open,validOpener,capture,restore,sync,observe,bind,cleanup,get opener(){return opener;}});
})();