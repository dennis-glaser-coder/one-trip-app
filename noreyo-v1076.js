/* NOREYO V10.76 — complete filter tab/range semantics for VoiceOver.
   Packed filter tabs are visual-only buttons and range controls lack accessible
   names/value text. Mirror active states into ARIA and add keyboard tab navigation
   without changing the existing visual filter behavior. */
(function(){
'use strict';
const BUILD='10.76';
let observer=null,raf=0;
function setAttr(el,key,value){if(!el||el.getAttribute(key)===String(value))return false;el.setAttribute(key,String(value));return true;}
function bindTab(button){if(!button||button.dataset.noreyoV1076==='1')return false;button.dataset.noreyoV1076='1';button.addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;const tabs=[...button.parentElement.querySelectorAll('button.tab')];const i=tabs.indexOf(button);if(i<0||!tabs.length)return;e.preventDefault();const next=e.key==='Home'?0:e.key==='End'?tabs.length-1:(i+(e.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length;tabs[next]?.focus({preventScroll:true});tabs[next]?.click();});return true;}
function syncTabs(){const root=document.getElementById('tabs');if(!root)return false;let changed=false;changed=setAttr(root,'role','tablist')||changed;changed=setAttr(root,'aria-label','Filterbereiche')||changed;root.querySelectorAll('button.tab').forEach(btn=>{const active=btn.classList.contains('active');changed=setAttr(btn,'role','tab')||changed;changed=setAttr(btn,'aria-selected',active?'true':'false')||changed;changed=setAttr(btn,'tabindex',active?'0':'-1')||changed;changed=bindTab(btn)||changed;});return changed;}
function rangeLabel(range){return range?.closest?.('.range')?.querySelector?.('.range-top b')?.textContent?.trim()||'Filterwert';}
function rangeValue(range){return range?.closest?.('.range')?.querySelector?.('.range-value')?.textContent?.trim()||String(range?.value||'');}
function bindRange(range){if(!range||range.dataset.noreyoV1076==='1')return false;range.dataset.noreyoV1076='1';range.addEventListener('input',()=>syncRange(range));range.addEventListener('change',()=>syncRange(range));return true;}
function syncRange(range){if(!range)return false;let changed=false;changed=setAttr(range,'aria-label',rangeLabel(range))||changed;changed=setAttr(range,'aria-valuetext',rangeValue(range))||changed;changed=bindRange(range)||changed;return changed;}
function syncChoices(){const root=document.getElementById('sheetScroll');if(!root)return false;let changed=false;root.querySelectorAll('.seg button,.exclude button').forEach(btn=>{changed=setAttr(btn,'aria-pressed',btn.classList.contains('on')?'true':'false')||changed;});root.querySelectorAll('input.real-range').forEach(range=>{changed=syncRange(range)||changed;});return changed;}
function sync(){raf=0;let changed=false;changed=syncTabs()||changed;changed=syncChoices()||changed;return changed;}
function schedule(){if(!raf)raf=requestAnimationFrame(sync);}
function observe(){if(observer){observer.disconnect();observer=null;}const sheet=document.getElementById('sheet');if(typeof MutationObserver==='undefined'||!sheet)return false;observer=new MutationObserver(schedule);observer.observe(sheet,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['class']});schedule();return true;}
function cleanup(){if(observer){observer.disconnect();observer=null;}if(raf){cancelAnimationFrame(raf);raf=0;}}
observe();window.addEventListener('pagehide',cleanup,{passive:true});window.addEventListener('pageshow',observe,{passive:true});window.NOREYO_V1076=Object.freeze({BUILD,setAttr,bindTab,syncTabs,rangeLabel,rangeValue,bindRange,syncRange,syncChoices,sync,schedule,observe,cleanup});
})();