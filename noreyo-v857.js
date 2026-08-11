/* NOREYO V8.57 — idempotent favorite fallback stale-state repair.
   Supersedes V8.55: identical stale-card reconciliation, with BFCache/pageshow-safe
   event binding so favorite navigation never accumulates duplicate listeners. */
(function(){
'use strict';
const BUILD='8.57';
let observer=null,raf=0,repairing=false,bound=false;
function saved(){try{return typeof savedFavorites!=='undefined'&&Array.isArray(savedFavorites)?savedFavorites:null;}catch(_){return null;}}
function key(v){try{return decodeURIComponent(String(v||''));}catch(_){return String(v||'');}}
function savedKeys(list=saved()){if(!Array.isArray(list))return null;return list.map(x=>String(x?.key||'')).filter(Boolean);}
function fallbackCards(listEl=document.getElementById('favList')){if(!listEl)return[];return [...listEl.children].filter(x=>x?.hasAttribute?.('data-v584-open'));}
function renderedKeys(listEl=document.getElementById('favList')){const cards=fallbackCards(listEl);return cards.length?cards.map(x=>key(x.getAttribute('data-v584-open'))):[];}
function sameSet(a,b){if(!Array.isArray(a)||!Array.isArray(b)||a.length!==b.length)return false;const x=[...a].sort(),y=[...b].sort();return x.every((v,i)=>v===y[i]);}
function repair(){raf=0;if(repairing)return false;const data=saved(),list=document.getElementById('favList'),empty=document.getElementById('favEmpty');if(!data||!list||!empty)return false;const cards=fallbackCards(list),allFallback=cards.length>0&&cards.length===list.children.length,want=savedKeys(data),have=renderedKeys(list);if(!want.length&&allFallback){repairing=true;try{list.replaceChildren();empty.style.display='';}finally{repairing=false;}return true;}if(want.length&&!list.children.length){repairing=true;try{window.NOREYO_V584?.refreshFavorites?.();}finally{repairing=false;}return true;}if(allFallback&&!sameSet(want,have)){repairing=true;try{list.replaceChildren();window.NOREYO_V584?.refreshFavorites?.();}finally{repairing=false;}return true;}if(want.length&&empty.style.display!=='none'&&list.children.length){empty.style.display='none';return true;}return false;}
function schedule(){if(raf)return;raf=requestAnimationFrame(repair);}
function relevantClick(e){return !!e.target?.closest?.('[data-v584-remove],.nav-btn[data-view="favorites"],[data-view="favorites"]');}
function onClick(e){if(relevantClick(e))setTimeout(schedule,0);}
function observe(){if(observer){observer.disconnect();observer=null;}const list=document.getElementById('favList');if(!list||typeof MutationObserver==='undefined')return false;observer=new MutationObserver(schedule);observer.observe(list,{childList:true,subtree:false});schedule();return true;}
function bind(){if(!bound){document.addEventListener('click',onClick,true);bound=true;}observe();schedule();return true;}
function cleanup(){if(bound){document.removeEventListener('click',onClick,true);bound=false;}if(observer){observer.disconnect();observer=null;}if(raf){cancelAnimationFrame(raf);raf=0;}repairing=false;}
bind();window.addEventListener('pagehide',cleanup,{passive:true});window.addEventListener('pageshow',bind,{passive:true});window.NOREYO_V857=Object.freeze({BUILD,saved,key,savedKeys,fallbackCards,renderedKeys,sameSet,repair,schedule,relevantClick,observe,bind,cleanup,get bound(){return bound;}});
})();