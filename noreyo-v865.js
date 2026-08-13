/* NOREYO V8.65 — duplicate-safe favorites reconciliation.
   Prevents duplicate saved favorite keys or duplicate fallback cards from
   causing endless stale-state refresh cycles on Safari/BFCache restore. */
(function(){
'use strict';
const BUILD='8.65';
let observer=null,raf=0,bound=false,repairing=false;
function key(v){try{return decodeURIComponent(String(v||''));}catch(_){return String(v||'');}}
function saved(){try{return typeof savedFavorites!=='undefined'&&Array.isArray(savedFavorites)?savedFavorites:null;}catch(_){return null;}}
function uniqueKeys(list=saved()){if(!Array.isArray(list))return null;const out=[],seen=new Set();for(const item of list){const k=String(item?.key||'');if(!k||seen.has(k))continue;seen.add(k);out.push(k);}return out;}
function fallbackCards(listEl=document.getElementById('favList')){if(!listEl)return[];return [...listEl.children].filter(x=>x?.hasAttribute?.('data-v584-open'));}
function cardKey(card){return key(card?.getAttribute?.('data-v584-open'));}
function dedupeCards(listEl=document.getElementById('favList')){const cards=fallbackCards(listEl),seen=new Set();let changed=false;for(const card of cards){const k=cardKey(card);if(!k||seen.has(k)){try{card.remove();changed=true;}catch(_){}continue;}seen.add(k);}return changed;}
function renderedUniqueKeys(listEl=document.getElementById('favList')){const out=[],seen=new Set();for(const card of fallbackCards(listEl)){const k=cardKey(card);if(!k||seen.has(k))continue;seen.add(k);out.push(k);}return out;}
function sameSet(a,b){if(!Array.isArray(a)||!Array.isArray(b)||a.length!==b.length)return false;const x=[...a].sort(),y=[...b].sort();return x.every((v,i)=>v===y[i]);}
function repair(){raf=0;if(repairing)return false;const data=saved(),list=document.getElementById('favList'),empty=document.getElementById('favEmpty');if(!data||!list||!empty)return false;repairing=true;try{const removedDupes=dedupeCards(list);const cards=fallbackCards(list),allFallback=cards.length>0&&cards.length===list.children.length;const want=uniqueKeys(data),have=renderedUniqueKeys(list);if(!want.length&&allFallback){list.replaceChildren();empty.style.display='';return true;}if(want.length&&!list.children.length){window.NOREYO_V584?.refreshFavorites?.();return true;}if(allFallback&&!sameSet(want,have)){list.replaceChildren();window.NOREYO_V584?.refreshFavorites?.();return true;}if(want.length&&empty.style.display!=='none'&&list.children.length){empty.style.display='none';return true;}return removedDupes;}finally{repairing=false;}}
function schedule(){if(raf)return;raf=requestAnimationFrame(repair);}
function relevantClick(e){return !!e.target?.closest?.('[data-v584-remove],.nav-btn[data-view="favorites"],[data-view="favorites"]');}
function onClick(e){if(relevantClick(e))setTimeout(schedule,0);}
function observe(){if(observer){observer.disconnect();observer=null;}const list=document.getElementById('favList');if(!list||typeof MutationObserver==='undefined')return false;observer=new MutationObserver(schedule);observer.observe(list,{childList:true,subtree:false});schedule();return true;}
function bind(){if(!bound){document.addEventListener('click',onClick,true);bound=true;}observe();schedule();return true;}
function cleanup(){if(bound){document.removeEventListener('click',onClick,true);bound=false;}if(observer){observer.disconnect();observer=null;}if(raf){cancelAnimationFrame(raf);raf=0;}repairing=false;}
bind();window.addEventListener('pagehide',cleanup,{passive:true});window.addEventListener('pageshow',bind,{passive:true});window.NOREYO_V865=Object.freeze({BUILD,key,saved,uniqueKeys,fallbackCards,cardKey,dedupeCards,renderedUniqueKeys,sameSet,repair,schedule,relevantClick,observe,bind,cleanup,get bound(){return bound;}});
})();