/* NOREYO V9.90 — final flight preflight + selection lifecycle.
   V9.88 replaces searchFlights after the older V9.20 date guard has installed,
   which bypasses that guard in the active V9.89 stack. Re-wrap the final flight
   search, validate dates again, and clear any stale selected offer before a new
   search attempt. */
(function(){
'use strict';
const BUILD='9.90';
let installed=false,prior=null;

function state(){
  try{return typeof searchState!=='undefined'&&searchState?searchState:{};}catch(_){return{};}
}
function problem(s=state()){
  try{
    const p=window.NOREYO_V920?.problem?.(s);
    if(typeof p==='string')return p;
  }catch(_){}
  const iso=v=>/^\d{4}-\d{2}-\d{2}$/.test(String(v||''))?String(v):'';
  const ci=iso(s?.checkin),co=iso(s?.checkout);
  if(!ci||!co)return'Bitte einen vollständigen Flugzeitraum auswählen.';
  const d=new Date(),today=d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
  if(ci<=today)return'Der Hinflug muss in der Zukunft liegen.';
  if(co<=ci)return'Der Rückflug muss nach dem Hinflug liegen.';
  return'';
}
function clearSelection(){
  const had=!!window.NOREYO_SELECTED_FLIGHT;
  try{delete window.NOREYO_SELECTED_FLIGHT;}catch(_){window.NOREYO_SELECTED_FLIGHT=undefined;}
  return had;
}
function notify(message){
  try{if(typeof showToast==='function')showToast(message);else window.toast?.(message);}catch(_){}
  try{if(typeof openPlanner==='function')openPlanner('dates');}catch(_){}
}
function install(){
  if(installed||typeof window.searchFlights!=='function'||window.searchFlights.__noreyoV990)return false;
  prior=window.searchFlights;
  const wrapped=function(...args){
    clearSelection();
    const p=problem();
    if(p){notify(p);return Promise.resolve(false);}
    return prior.apply(this,args);
  };
  wrapped.__noreyoV990=true;
  wrapped.__noreyoV990Prior=prior;
  window.searchFlights=wrapped;
  installed=true;
  return true;
}
function restore(){
  if(!installed)return false;
  if(prior)window.searchFlights=prior;
  installed=false;
  return true;
}
install();
window.addEventListener('pagehide',restore,{passive:true});
window.addEventListener('pageshow',install,{passive:true});
window.NOREYO_V990=Object.freeze({BUILD,state,problem,clearSelection,notify,install,restore});
})();