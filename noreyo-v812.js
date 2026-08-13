/* NOREYO V8.12 — self-cleaning priority truth notes.
   Prevents stale or duplicated "not verifiable" text when preferences change
   while the hotel detail is already open. */
(function(){
'use strict';
const BUILD='8.12';
const NOTE_PREFIX='Aktiv, aber aktuell nicht sicher durch Live-Daten verifizierbar:';
const NOTE_SUFFIX='NOREYO markiert diese Kriterien deshalb nicht als bestätigt.';
const OLD_NOTE_RE=/\s*Aktiv, aber aktuell nicht sicher durch Live-Daten verifizierbar:[\s\S]*?NOREYO markiert diese Kriterien deshalb nicht als bestätigt\.\s*/g;
function baseText(existing=''){return String(existing||'').replace(OLD_NOTE_RE,' ').replace(/\s+/g,' ').trim();}
function pendingLabels(){try{return window.NOREYO_V810?.pendingLabels?.(99)||[];}catch(_){return[];}}
function note(labels=pendingLabels()){return labels.length?`${NOTE_PREFIX} ${labels.join(', ')}. ${NOTE_SUFFIX}`:'';}
function nextDetailText(existing='',labels=pendingLabels()){const base=baseText(existing),n=note(labels);if(!n)return base;if(!base||/aktiviere wünsche|aktiviere wunsche/i.test(base))return n;return `${base} ${n}`.trim();}
function fixDetail(){const root=document.getElementById('detailContent');const p=root?.querySelector('.noreyo-detail-match .noreyo-detail-why p');if(!p)return false;const next=nextDetailText(p.textContent);if(next===String(p.textContent||''))return false;p.textContent=next;return true;}
function fixResultsAndDetail(){let changed=false;try{changed=window.NOREYO_V810?.fixResults?.()||changed;}catch(_){}try{changed=fixDetail()||changed;}catch(_){}return changed;}
function onPreferenceChange(e){const target=e.target instanceof Element?e.target.closest('[data-key][data-state],.noreyo-v559-pref,.filter-chip,.pref-chip'):null;if(!target)return;setTimeout(fixResultsAndDetail,0);}
document.addEventListener('click',onPreferenceChange,true);
window.addEventListener('pageshow',()=>setTimeout(fixResultsAndDetail,0),{passive:true});
setTimeout(fixResultsAndDetail,0);
window.NOREYO_V812=Object.freeze({BUILD,NOTE_PREFIX,NOTE_SUFFIX,baseText,pendingLabels,note,nextDetailText,fixDetail,fixResultsAndDetail});
})();