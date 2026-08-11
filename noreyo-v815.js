/* NOREYO V8.15 — observer-backed self-cleaning priority truth notes.
   Keeps hotel-detail verification notes current for both clicks and programmatic
   AI/filter state updates. */
(function(){
'use strict';
const BUILD='8.15';
const NOTE_PREFIX='Aktiv, aber aktuell nicht sicher durch Live-Daten verifizierbar:';
const NOTE_SUFFIX='NOREYO markiert diese Kriterien deshalb nicht als bestätigt.';
const OLD_NOTE_RE=/\s*Aktiv, aber aktuell nicht sicher durch Live-Daten verifizierbar:[\s\S]*?NOREYO markiert diese Kriterien deshalb nicht als bestätigt\.\s*/g;
let observer=null,raf=0;
function baseText(existing=''){return String(existing||'').replace(OLD_NOTE_RE,' ').replace(/\s+/g,' ').trim();}
function pendingLabels(){try{return window.NOREYO_V810?.pendingLabels?.(99)||[];}catch(_){return[];}}
function note(labels=pendingLabels()){return labels.length?`${NOTE_PREFIX} ${labels.join(', ')}. ${NOTE_SUFFIX}`:'';}
function nextDetailText(existing='',labels=pendingLabels()){const base=baseText(existing),n=note(labels);if(!n)return base;if(!base||/aktiviere wünsche|aktiviere wunsche/i.test(base))return n;return `${base} ${n}`.trim();}
function fixDetail(){const root=document.getElementById('detailContent');const p=root?.querySelector('.noreyo-detail-match .noreyo-detail-why p');if(!p)return false;const next=nextDetailText(p.textContent);if(next===String(p.textContent||''))return false;p.textContent=next;return true;}
function fixResultsAndDetail(){let changed=false;try{changed=window.NOREYO_V810?.fixResults?.()||changed;}catch(_){}try{changed=fixDetail()||changed;}catch(_){}return changed;}
function run(){raf=0;fixResultsAndDetail();}
function schedule(){if(raf)return;raf=requestAnimationFrame(run);}
function relevantNode(n){if(!n||n.nodeType!==1)return false;return n.id==='detailContent'||n.id==='noreyoAi556Result'||n.id==='noreyoFilter557'||!!n.closest?.('#detailContent,#noreyoAi556Result,#noreyoFilter557')||!!n.querySelector?.('#detailContent,#noreyoAi556Result,#noreyoFilter557');}
function observe(){if(observer){observer.disconnect();observer=null;}if(typeof MutationObserver==='undefined'||!document.body)return false;observer=new MutationObserver(records=>{for(const r of records){if(relevantNode(r.target)){schedule();return;}for(const n of r.addedNodes||[])if(relevantNode(n)){schedule();return;}}});observer.observe(document.body,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['data-state','class']});schedule();return true;}
function onPreferenceChange(e){const target=e.target instanceof Element?e.target.closest('[data-key][data-state],.noreyo-v559-pref,.filter-chip,.pref-chip,.noreyo-v556-apply'):null;if(target)setTimeout(schedule,0);}
function cleanup(){if(observer){observer.disconnect();observer=null;}if(raf){cancelAnimationFrame(raf);raf=0;}}
document.addEventListener('click',onPreferenceChange,true);observe();window.addEventListener('pagehide',cleanup,{passive:true});window.addEventListener('pageshow',observe,{passive:true});
window.NOREYO_V815=Object.freeze({BUILD,NOTE_PREFIX,NOTE_SUFFIX,baseText,pendingLabels,note,nextDetailText,fixDetail,fixResultsAndDetail,relevantNode,observe,schedule,cleanup});
})();