/* NOREYO V6.97 — final preference post-apply ordering.
   Re-applies the visible MUST/WISH/ANY editor state one task after legacy
   apply timers, so stale V6.76 in-memory snapshots cannot overwrite the UI. */
(function(){
'use strict';
const BUILD='6.97';
const VALID=new Set(['any','wish','must']);
function visible(root=document.getElementById('noreyoAi556Result')){const out={};if(!root)return out;root.querySelectorAll('.noreyo-v559-pref[data-key][data-state]').forEach(btn=>{const key=String(btn.dataset.key||''),state=String(btn.dataset.state||'');if(key&&VALID.has(state))out[key]=state;});return out;}
function apply(snapshot){if(!snapshot||!Object.keys(snapshot).length)return false;try{if(typeof states==='undefined'||!states)return false;let changed=false;for(const [key,state] of Object.entries(snapshot)){if(!(key in states)||!VALID.has(state)||states[key]===state)continue;states[key]=state;changed=true;}if(!changed)return false;try{refreshQuickStates?.();}catch(_){}try{updateCounts?.();}catch(_){}try{updateSearchUI?.();}catch(_){}try{persistState?.();}catch(_){}return true;}catch(_){return false;}}
function deferAfterLegacy(snapshot){setTimeout(()=>setTimeout(()=>apply(snapshot),0),0);}
function onApply(e){if(!e.target?.closest?.('.noreyo-v556-apply'))return;const snapshot=visible();if(Object.keys(snapshot).length)deferAfterLegacy(snapshot);}
document.addEventListener('click',onApply,true);
window.NOREYO_V697=Object.freeze({BUILD,visible,apply,deferAfterLegacy});
})();
