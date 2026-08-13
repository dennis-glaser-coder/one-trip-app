/* NOREYO V10.24 — selected-flight lifecycle completion.
   The active flight-results back/retry path calls V9.88 searchSafe directly, bypassing
   V9.90's global searchFlights selection reset. Clear stale selection before any new
   flight search/retry and when leaving flight product mode. */
(function(){
'use strict';
const BUILD='10.24';
let installed=false,priorSearch=null;

function selected(){return window.NOREYO_SELECTED_FLIGHT||null;}
function clear(){
  if(!selected())return false;
  try{delete window.NOREYO_SELECTED_FLIGHT;}catch(_){window.NOREYO_SELECTED_FLIGHT=undefined;}
  return true;
}
function install(){
  if(installed)return false;
  priorSearch=window.searchFlights;
  if(typeof priorSearch==='function'&&!priorSearch.__noreyoV1024){
    const wrapped=function(...args){
      clear();
      return priorSearch.apply(this,args);
    };
    wrapped.__noreyoV1024=true;
    wrapped.__noreyoV1024Prior=priorSearch;
    window.searchFlights=wrapped;
  }
  document.addEventListener('click',onClick,true);
  installed=true;
  return true;
}
function restore(){
  if(!installed)return false;
  document.removeEventListener('click',onClick,true);
  if(window.searchFlights?.__noreyoV1024&&priorSearch)window.searchFlights=priorSearch;
  installed=false;priorSearch=null;
  return true;
}
function productTarget(target){
  const btn=target?.closest?.('.product-mode');
  if(!btn)return'';
  const onclick=String(btn.getAttribute?.('onclick')||'');
  const m=onclick.match(/setProductMode\(['"]([^'"]+)['"]\)/);
  return m?.[1]||'';
}
function onClick(e){
  const target=e.target;
  if(target?.closest?.('.noreyo-v943-back,.noreyo-v943-retry')){
    clear();
    return;
  }
  const mode=productTarget(target);
  if(mode&&mode!=='flight')clear();
}
install();
window.addEventListener('pagehide',restore,{passive:true});
window.addEventListener('pageshow',install,{passive:true});
window.NOREYO_V1024=Object.freeze({BUILD,selected,clear,install,restore,productTarget,onClick});
})();