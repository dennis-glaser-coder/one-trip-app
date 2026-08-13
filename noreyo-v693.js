/* NOREYO V6.93 — visible AI preference editor state is authoritative on apply.
   Late result mutations may reset V6.76's in-memory override object while the
   editor buttons remain visible. Re-read those visible states at apply time. */
(function(){
'use strict';
const BUILD='6.93';
const VALID_STATES=new Set(['any','wish','must']);

function visibleOverrides(root=document.getElementById('noreyoAi556Result')){
  const out={};if(!root)return out;
  root.querySelectorAll('.noreyo-v559-pref[data-key][data-state]').forEach(btn=>{
    const key=String(btn.dataset.key||''),value=String(btn.dataset.state||'');
    if(key&&VALID_STATES.has(value))out[key]=value;
  });
  return out;
}
function refresh(){
  try{if(typeof refreshQuickStates==='function')refreshQuickStates();}catch(_){ }
  try{if(typeof updateCounts==='function')updateCounts();}catch(_){ }
  try{if(typeof updateSearchUI==='function')updateSearchUI();}catch(_){ }
  try{if(typeof persistState==='function')persistState();}catch(_){ }
}
function applyVisible(snapshot){
  if(!snapshot||!Object.keys(snapshot).length)return false;
  try{
    if(typeof states==='undefined'||!states)return false;
    let changed=false;
    Object.entries(snapshot).forEach(([key,value])=>{
      if(!(key in states)||!VALID_STATES.has(value)||states[key]===value)return;
      states[key]=value;changed=true;
    });
    if(changed)refresh();return changed;
  }catch(_){return false;}
}
function onApply(e){
  if(!e.target?.closest?.('.noreyo-v556-apply'))return;
  const snapshot=visibleOverrides();if(!Object.keys(snapshot).length)return;
  setTimeout(()=>applyVisible(snapshot),0);
}
document.addEventListener('click',onApply,true);
window.NOREYO_V693=Object.freeze({BUILD,visibleOverrides,applyVisible});
})();
