/* NOREYO V9.66 — filter/sort selection semantics.
   Visual selected states already exist, but assistive technology cannot reliably
   determine the current sort/product/filter state. Mirror those states into ARIA. */
(function(){
'use strict';
const BUILD='9.66';
let observer=null,raf=0;
function setAttr(el,key,value){if(!el||el.getAttribute(key)===value)return false;el.setAttribute(key,value);return true;}
function syncSort(root=document){let changed=false;root.querySelectorAll?.('.toolbar [data-sort]').forEach(btn=>{const active=btn.classList.contains('active-sort');changed=setAttr(btn,'aria-pressed',active?'true':'false')||changed;const label=String(btn.textContent||'Sortierung').trim();changed=setAttr(btn,'aria-label',`${label}${active?' – ausgewählt':''}`)||changed;});return changed;}
function syncProduct(root=document){let changed=false;root.querySelectorAll?.('.product-mode').forEach(btn=>{const active=btn.classList.contains('on');changed=setAttr(btn,'aria-pressed',active?'true':'false')||changed;});return changed;}
function syncQuick(root=document){let changed=false;root.querySelectorAll?.('[data-pref-key]').forEach(btn=>{const name=btn.querySelector('.qname')?.textContent?.trim()||'Präferenz';const state=btn.querySelector('.qstate')?.textContent?.trim()||'Egal';changed=setAttr(btn,'aria-label',`${name}: ${state}`)||changed;});root.querySelectorAll?.('.premium-filter-row .premium-chip,.premium-search-chips .premium-chip').forEach(btn=>{const active=btn.classList.contains('on')||btn.classList.contains('must');changed=setAttr(btn,'aria-pressed',active?'true':'false')||changed;});return changed;}
function sync(){raf=0;let changed=false;changed=syncSort()||changed;changed=syncProduct()||changed;changed=syncQuick()||changed;return changed;}
function schedule(){if(!raf)raf=requestAnimationFrame(sync);}
function observe(){if(observer){observer.disconnect();observer=null;}if(typeof MutationObserver==='undefined'||!document.body)return false;observer=new MutationObserver(records=>{for(const r of records){const el=r.target?.nodeType===1?r.target:r.target?.parentElement;if(el?.closest?.('.toolbar,.product-switch,.quick,.premium-filter-row,.premium-search-chips')){schedule();return;}for(const n of r.addedNodes||[]){if(n?.nodeType===1&&(n.matches?.('.toolbar,.product-switch,.quick,.premium-filter-row,.premium-search-chips')||n.querySelector?.('.toolbar,.product-switch,.quick,.premium-filter-row,.premium-search-chips'))){schedule();return;}}}});observer.observe(document.body,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['class']});schedule();return true;}
function cleanup(){if(observer){observer.disconnect();observer=null;}if(raf){cancelAnimationFrame(raf);raf=0;}}
observe();window.addEventListener('pagehide',cleanup,{passive:true});window.addEventListener('pageshow',observe,{passive:true});window.NOREYO_V966=Object.freeze({BUILD,setAttr,syncSort,syncProduct,syncQuick,sync,schedule,observe,cleanup});
})();