/* NOREYO V9.04 — truthful flight preference semantics.
   Until provider offer details/flight filters are wired end-to-end, Flight preferences may be
   saved as wishes but must not be presented as strict MUST filters. */
(function(){
'use strict';
const BUILD='9.04',NOTE_ID='noreyo-v904-flight-note';
let observer=null,raf=0;
function flightKeys(){try{return Object.keys(states||{}).filter(k=>/^Flug\d+$/.test(k));}catch(_){return[];}}
function migrateMustToWish(){let changed=false;try{for(const k of flightKeys())if(states[k]==='must'){states[k]='wish';changed=true;}if(changed){persistState?.();updateCounts?.();}}catch(_){}return changed;}
function activeFlight(){try{return typeof activeTab!=='undefined'&&activeTab==='Flug';}catch(_){return false;}}
function addNote(root=document.getElementById('sheetScroll')){
  if(!root||!activeFlight())return false;
  let note=root.querySelector('#'+NOTE_ID);if(note)return false;
  note=document.createElement('div');note.id=NOTE_ID;note.className='filter-hint';note.setAttribute('role','note');
  note.textContent='Flugpräferenzen werden gespeichert. Harte Pflichtfilter werden erst freigeschaltet, wenn die Live-Angebotsdaten sie zuverlässig verifizieren können.';
  const intro=root.querySelector('.sheet-intro');(intro?.parentNode||root).insertBefore(note,intro?.nextSibling||root.firstChild);return true;
}
function disableMust(root=document.getElementById('sheetScroll')){
  if(!root||!activeFlight())return false;let changed=false;
  root.querySelectorAll('.pref .seg button.must').forEach(btn=>{if(!btn.disabled){btn.disabled=true;btn.setAttribute('aria-disabled','true');btn.title='Noch nicht als harter Flugfilter verfügbar';changed=true;}});
  const range=[...root.querySelectorAll('.range')].find(x=>/Maximale Flugzeit/i.test(x.textContent||''));
  if(range){const input=range.querySelector('input[type="range"]');if(input&&!input.disabled){input.disabled=true;input.setAttribute('aria-disabled','true');changed=true;}const hint=range.querySelector('.filter-hint');if(hint)hint.textContent='Gespeichert als Präferenz; noch nicht als harter Providerfilter aktiv.';}
  return changed;
}
function fixApplyCopy(){if(!activeFlight())return false;const label=document.getElementById('applyLabel');if(label&&label.textContent!=='Flugpräferenzen speichern'){label.textContent='Flugpräferenzen speichern';return true;}return false;}
function run(){raf=0;migrateMustToWish();addNote();disableMust();fixApplyCopy();}
function schedule(){if(raf)return;raf=requestAnimationFrame(run);}
function observe(){if(observer){observer.disconnect();observer=null;}if(typeof MutationObserver==='undefined'||!document.body)return false;observer=new MutationObserver(schedule);observer.observe(document.body,{subtree:true,childList:true,characterData:true});schedule();return true;}
function cleanup(){if(observer){observer.disconnect();observer=null;}if(raf){cancelAnimationFrame(raf);raf=0;}}
observe();window.addEventListener('pagehide',cleanup,{passive:true});window.addEventListener('pageshow',observe,{passive:true});
window.NOREYO_V904=Object.freeze({BUILD,NOTE_ID,flightKeys,migrateMustToWish,activeFlight,addNote,disableMust,fixApplyCopy,run,schedule,observe,cleanup});
})();
