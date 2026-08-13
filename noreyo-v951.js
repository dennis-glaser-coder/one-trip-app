/* NOREYO V9.51 — persistent truthful result sorting.
   New searches rebuild the provider-ranked offer array but the toolbar can still
   show Price/Rating as active. Reapply the visible sort mode before every render. */
(()=>{
'use strict';
const BUILD='9.51';
let installed=false,priorSort=null,priorRender=null,currentMode='recommended',rendering=false;
function number(v){const n=Number(v);return Number.isFinite(n)?n:null}
function rating(v){return number(String(v??'').replace(',','.'))}
function stableSort(list,compare){return list.map((x,i)=>({x,i})).sort((a,b)=>compare(a.x,b.x)||a.i-b.i).map(x=>x.x)}
function recommendedIndex(id){try{const i=recommendedOrder.indexOf(id);return i<0?Number.MAX_SAFE_INTEGER:i}catch(_){return Number.MAX_SAFE_INTEGER}}
function sorted(list,mode=currentMode){const rows=Array.isArray(list)?list:[];if(mode==='price')return stableSort(rows,(a,b)=>{const x=number(a?.price),y=number(b?.price);if(x===null&&y===null)return 0;if(x===null)return 1;if(y===null)return-1;return x-y});if(mode==='rating')return stableSort(rows,(a,b)=>{const x=rating(a?.rating),y=rating(b?.rating);if(x===null&&y===null)return 0;if(x===null)return 1;if(y===null)return-1;return y-x});return stableSort(rows,(a,b)=>recommendedIndex(a?.id)-recommendedIndex(b?.id))}
function apply(mode=currentMode){try{if(!Array.isArray(offers))return false;const next=sorted(offers,mode);offers.splice(0,offers.length,...next);return true}catch(_){return false}}
function syncToolbar(mode=currentMode){try{document.querySelectorAll('.toolbar [data-sort]').forEach(b=>{b.classList.toggle('active-sort',b.dataset.sort===mode);b.setAttribute('aria-pressed',b.dataset.sort===mode?'true':'false')});return true}catch(_){return false}}
function install(){if(installed)return false;try{if(typeof sortOffers!=='function'||typeof renderOffers!=='function')return false;const active=document.querySelector('.toolbar [data-sort].active-sort')?.dataset?.sort;if(['recommended','price','rating'].includes(active))currentMode=active;priorSort=sortOffers;priorRender=renderOffers;sortOffers=function(mode,btn){if(['recommended','price','rating'].includes(mode))currentMode=mode;apply(currentMode);syncToolbar(currentMode);return priorRender()};renderOffers=function(){if(rendering)return priorRender();rendering=true;try{apply(currentMode);syncToolbar(currentMode);return priorRender()}finally{rendering=false}};installed=true;syncToolbar(currentMode);return true}catch(_){return false}}
function restore(){if(!installed)return false;try{if(priorSort)sortOffers=priorSort;if(priorRender)renderOffers=priorRender}catch(_){}installed=false;return true}
install();window.NOREYO_V951=Object.freeze({BUILD,number,rating,stableSort,recommendedIndex,sorted,apply,syncToolbar,install,restore,get mode(){return currentMode}});
})();