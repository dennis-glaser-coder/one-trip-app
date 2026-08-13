/* NOREYO V8.42 — pre-open filter focus-origin capture for Safari.
   Captures the real interactive trigger during pointerdown so the later class
   MutationObserver can still restore focus even if Safari already moved focus
   into the filter before the observer callback runs. */
(function(){
'use strict';
const BUILD='8.42',CANDIDATE_TTL_MS=1200;
let observer=null,root=null,wasOpen=false,opener=null,candidate=null,candidateAt=0,restoreTimer=0,bound=false;
function sheet(){return document.getElementById('noreyoFilter557');}
function open(el=sheet()){return !!el?.classList.contains('show');}
function validOpener(el,filter=sheet()){return !!el&&el instanceof Element&&el!==document.body&&el.isConnected&&!filter?.contains?.(el);}
function interactive(el){if(!(el instanceof Element))return null;return el.closest?.('button,a[href],input,select,textarea,[tabindex]:not([tabindex="-1"])')||el;}
function freshCandidate(now=Date.now()){return validOpener(candidate)&&now-candidateAt<=CANDIDATE_TTL_MS?candidate:null;}
function onPointerDown(e){const filter=sheet();if(open(filter))return;const target=interactive(e.target);if(!validOpener(target,filter))return;candidate=target;candidateAt=Date.now();}
function capture(){const filter=sheet();let active=null;try{active=document.activeElement;}catch(_){}if(validOpener(active,filter))opener=active;else{const recent=freshCandidate();if(recent)opener=recent;}candidate=null;candidateAt=0;return opener;}
function restore(){const target=opener;opener=null;candidate=null;candidateAt=0;if(restoreTimer){clearTimeout(restoreTimer);restoreTimer=0;}if(!target?.isConnected)return false;restoreTimer=setTimeout(()=>{restoreTimer=0;try{target.focus({preventScroll:true});}catch(_){}},0);return true;}
function sync(){const filter=sheet(),now=open(filter);if(now&&!wasOpen)capture();else if(!now&&wasOpen)restore();wasOpen=now;return now;}
function observe(){const next=sheet();if(observer){observer.disconnect();observer=null;}root=next;wasOpen=open(next);if(!next||typeof MutationObserver==='undefined')return false;observer=new MutationObserver(records=>{if(records.some(r=>r.type==='attributes'&&r.attributeName==='class'))sync();});observer.observe(next,{attributes:true,attributeFilter:['class']});return true;}
function bind(){if(!bound){bound=true;document.addEventListener('pointerdown',onPointerDown,true);}if(observe())return true;if(typeof MutationObserver==='undefined'||!document.body)return false;observer=new MutationObserver(records=>{for(const r of records)for(const n of r.addedNodes||[]){if(n?.nodeType===1&&(n.id==='noreyoFilter557'||n.querySelector?.('#noreyoFilter557'))){observe();sync();return;}}});observer.observe(document.body,{childList:true,subtree:true});return true;}
function cleanup(){if(observer){observer.disconnect();observer=null;}if(bound){document.removeEventListener('pointerdown',onPointerDown,true);bound=false;}if(restoreTimer){clearTimeout(restoreTimer);restoreTimer=0;}root=null;wasOpen=false;opener=null;candidate=null;candidateAt=0;}
bind();window.addEventListener('pagehide',cleanup,{passive:true});window.addEventListener('pageshow',bind,{passive:true});
window.NOREYO_V842=Object.freeze({BUILD,CANDIDATE_TTL_MS,sheet,open,validOpener,interactive,freshCandidate,onPointerDown,capture,restore,sync,observe,bind,cleanup,get opener(){return opener;},get candidate(){return candidate;}});
})();