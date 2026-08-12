/* NOREYO V11.98 — Safari BFCache-safe fetch-wrapper lifecycle.
   Multiple historical checkout layers wrap window.fetch and each pagehide cleanup
   conditionally restores itself while unconditionally nulling its priorFetch pointer.
   With nested wrappers, Safari BFCache can therefore restore a wrapper whose prior
   link was already nulled by an earlier cleanup. Retire those legacy pagehide fetch
   teardowns and perform state-only checkout cleanup while keeping the live fetch
   chain intact for BFCache resume. */
(function(){
'use strict';
const BUILD='11.98';
const LEGACY=Object.freeze([
  'NOREYO_V1118','NOREYO_V1124','NOREYO_V1142','NOREYO_V1178',
  'NOREYO_V1180','NOREYO_V1182','NOREYO_V1186','NOREYO_V1196'
]);
let installed=false,lastFetch=null;

function api(name){try{return window[name]||null;}catch(_){return null;}}
function detachLegacy(){
  let count=0;
  for(const name of LEGACY){
    const cleanup=api(name)?.cleanup;
    if(typeof cleanup!=='function')continue;
    try{window.removeEventListener('pagehide',cleanup,false);count++;}catch(_){}
  }
  return count;
}
function retireSensitive(){
  let changed=false;
  try{changed=!!api('NOREYO_V1180')?.retire?.('PAGEHIDE')||changed;}catch(_){}
  try{changed=!!api('NOREYO_V1124')?.clearCheckoutState?.()||changed;}catch(_){}
  try{changed=!!api('NOREYO_V1142')?.clearDetailState?.()||changed;}catch(_){}
  try{changed=!!api('NOREYO_V1178')?.clearOwnership?.()||changed;}catch(_){}
  return changed;
}
function onPageHide(){
  lastFetch=window.fetch;
  retireSensitive();
}
function onPageShow(){
  detachLegacy();
  const preserved=!lastFetch||window.fetch===lastFetch;
  lastFetch=null;
  try{api('NOREYO_V1196')?.sync?.();}catch(_){}
  return preserved;
}
function install(){
  detachLegacy();
  if(installed)return false;
  window.addEventListener('pagehide',onPageHide,{passive:true});
  window.addEventListener('pageshow',onPageShow,{passive:true});
  installed=true;
  return true;
}
function cleanup(){
  if(!installed)return false;
  window.removeEventListener('pagehide',onPageHide,false);
  window.removeEventListener('pageshow',onPageShow,false);
  installed=false;lastFetch=null;
  return true;
}
install();
window.NOREYO_V1198=Object.freeze({BUILD,LEGACY,api,detachLegacy,retireSensitive,onPageHide,onPageShow,install,cleanup,get installed(){return installed;},get lastFetch(){return lastFetch;}});
})();