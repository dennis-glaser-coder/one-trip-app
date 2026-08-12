/* NOREYO V9.98 — truthful six-airport selection limit.
   The active multi-origin flight path intentionally caps searches at six origins
   (V9.43 MAX_ORIGINS=6). The expanded picker must not allow a seventh selected
   airport that would then be silently ignored by the search. */
(function(){
'use strict';
const BUILD='9.98',MAX_AIRPORTS=6;
let installed=false,priorToggle=null,observer=null,raf=0;

function selected(){
  try{return Array.isArray(searchState?.airports)?searchState.airports.map(x=>String(x||'').trim().toUpperCase()).filter(x=>/^[A-Z]{3}$/.test(x)):[];}
  catch(_){return[];}
}
function isSelected(code){return selected().includes(String(code||'').trim().toUpperCase());}
function limitReached(){return selected().length>=MAX_AIRPORTS;}
function notify(){
  const message=`Du kannst maximal ${MAX_AIRPORTS} Abflughäfen gleichzeitig prüfen.`;
  try{if(typeof showToast==='function')showToast(message);else window.toast?.(message);}catch(_){}
  return message;
}
function install(){
  if(installed||typeof window.toggleAirport!=='function'||window.toggleAirport.__noreyoV998)return false;
  priorToggle=window.toggleAirport;
  const wrapped=function(code,...args){
    const normalized=String(code||'').trim().toUpperCase();
    if(!/^[A-Z]{3}$/.test(normalized))return false;
    if(!isSelected(normalized)&&limitReached()){notify();sync();return false;}
    return priorToggle.call(this,normalized,...args);
  };
  wrapped.__noreyoV998=true;
  wrapped.__noreyoV998Prior=priorToggle;
  window.toggleAirport=wrapped;
  installed=true;
  return true;
}
function sync(){
  raf=0;
  let mode='';try{mode=typeof plannerMode!=='undefined'?plannerMode:'';}catch(_){}
  if(mode!=='airports')return false;
  const body=document.getElementById('plannerBody');if(!body)return false;
  const chosen=new Set(selected()),atLimit=chosen.size>=MAX_AIRPORTS;
  let changed=false;
  body.querySelectorAll?.('.choice').forEach(btn=>{
    const code=(btn.dataset?.noreyoV996Airport||btn.querySelector?.('b')?.textContent||'').trim().toUpperCase();
    if(!/^[A-Z]{3}$/.test(code))return;
    const disabled=atLimit&&!chosen.has(code);
    if(btn.disabled!==disabled){btn.disabled=disabled;changed=true;}
    const aria=disabled?'true':'false';
    if(btn.getAttribute('aria-disabled')!==aria){btn.setAttribute('aria-disabled',aria);changed=true;}
  });
  let note=body.querySelector('.noreyo-v998-limit');
  if(!note){
    note=document.createElement('p');note.className='planner-note noreyo-v998-limit';
    const save=body.querySelector('.planner-save');
    if(save)body.insertBefore(note,save);else body.appendChild(note);
    changed=true;
  }
  const text=`${chosen.size} von maximal ${MAX_AIRPORTS} Abflughäfen ausgewählt.`;
  if(note.textContent!==text){note.textContent=text;changed=true;}
  return changed;
}
function schedule(){if(!raf)raf=requestAnimationFrame(sync);}
function observe(){
  if(observer){observer.disconnect();observer=null;}
  const body=document.getElementById('plannerBody');
  if(typeof MutationObserver==='undefined'||!body)return false;
  observer=new MutationObserver(schedule);
  observer.observe(body,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});
  schedule();return true;
}
function cleanup(){
  if(observer){observer.disconnect();observer=null;}
  if(raf){cancelAnimationFrame(raf);raf=0;}
}
install();observe();
window.addEventListener('pagehide',cleanup,{passive:true});
window.addEventListener('pageshow',()=>{install();observe();},{passive:true});
window.NOREYO_V998=Object.freeze({BUILD,MAX_AIRPORTS,selected,isSelected,limitReached,notify,install,sync,schedule,observe,cleanup});
})();