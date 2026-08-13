(function(){
'use strict';
const BUILD='6.61';
let raf=0,observer=null;
const warmupTimers=new Set();
const labels={package:'DEINE PAUSCHALREISE',hotel:'DEIN HOTEL',flight:'DEIN FLUG',cruise:'DEINE KREUZFAHRT'};
function currentMode(){const active=document.querySelector('#discover .product-mode.on[data-noreyo-product]');if(active?.dataset?.noreyoProduct)return active.dataset.noreyoProduct;try{if(typeof productMode==='string')return productMode;}catch(_){ }return'package';}
function applyHeading(){const label=labels[currentMode()]||labels.package;document.querySelectorAll('#discover .search-console-head span,#discover .noreyo-v552-search-head span').forEach(el=>{if(el.textContent!==label)el.textContent=label;});}
function schedule(){if(raf)return;raf=requestAnimationFrame(()=>{raf=0;applyHeading();});}
function scheduleWarmup(delay){const id=setTimeout(()=>{warmupTimers.delete(id);applyHeading();},delay);warmupTimers.add(id);return id;}
function clearWarmups(){warmupTimers.forEach(clearTimeout);warmupTimers.clear();}
function isHeadingNode(node){const el=node?.nodeType===1?node:node?.parentElement;return !!el?.closest?.('#discover .search-console-head span,#discover .noreyo-v552-search-head span');}
function mutationRelevant(records){for(const r of records){if(r.type==='characterData'&&isHeadingNode(r.target))return true;if(r.type==='attributes'){const t=r.target;if(t instanceof Element&&(t.matches('.product-mode')||t.closest('.product-switch')))return true;continue;}for(const n of r.addedNodes||[]){if(n.nodeType===3&&isHeadingNode(n))return true;if(n.nodeType!==1)continue;if(n.matches?.('.search-console-head,.noreyo-v552-search-head,.product-switch,.product-mode')||n.querySelector?.('.search-console-head,.noreyo-v552-search-head,.product-switch,.product-mode'))return true;}}return false;}
function wrap(name,marker){try{const fn=globalThis[name];if(typeof fn!=='function'||fn[marker])return;const wrapped=function(){const result=fn.apply(this,arguments);schedule();return result;};wrapped[marker]=true;globalThis[name]=wrapped;}catch(_){ }}
function installHooks(){try{if(typeof setProductMode==='function'&&!setProductMode.__noreyoV553){const base=setProductMode,wrapped=function(){const result=base.apply(this,arguments);schedule();scheduleWarmup(40);return result;};wrapped.__noreyoV553=true;setProductMode=wrapped;}}catch(_){ }wrap('renderProductControls','__noreyoV553');wrap('updateCounts','__noreyoV620');}
function installObserver(){const discover=document.getElementById('discover');if(!discover||observer||typeof MutationObserver==='undefined')return;observer=new MutationObserver(records=>{if(mutationRelevant(records))schedule();});observer.observe(discover,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:['class']});}
function cleanup(){if(observer){observer.disconnect();observer=null;}if(raf){cancelAnimationFrame(raf);raf=0;}clearWarmups();}
function warmup(){clearWarmups();scheduleWarmup(80);scheduleWarmup(240);scheduleWarmup(620);}
installHooks();applyHeading();installObserver();warmup();
window.addEventListener('pagehide',cleanup,{passive:true});
window.addEventListener('pageshow',()=>{installHooks();applyHeading();installObserver();warmup();},{passive:true});
window.NOREYO_V553=Object.freeze({BUILD,currentMode,applyHeading,mutationRelevant,clearWarmups,get warmupCount(){return warmupTimers.size;}});
})();