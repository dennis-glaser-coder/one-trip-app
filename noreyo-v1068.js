/* NOREYO V10.68 — refresh results only after real traveller changes.
   V10.48 refreshes visible hotel results after every applyTravellers call, even
   when adults/child ages are unchanged. Avoid needless provider searches and UI
   loading flicker by comparing the committed occupancy before scheduling refresh. */
(function(){
'use strict';
const BUILD='10.68';
let installed=false,prior=null,refreshTimer=0;

function viewId(){
  try{if(typeof currentViewId==='function')return currentViewId();}catch(_){}
  return document.querySelector('.view.active')?.id||'';
}
function inDetailEdit(){try{return !!detailEditContext;}catch(_){return false;}}
function hotelMode(){try{return typeof productMode!=='undefined'?productMode!=='flight':true;}catch(_){return true;}}
function occupancy(){
  try{
    const s=typeof searchState!=='undefined'?searchState:null;
    return JSON.stringify({
      adults:Number(s?.adults)||1,
      childAges:Array.isArray(s?.childAges)?s.childAges.map(Number):[]
    });
  }catch(_){return'';}
}
function schedule(reason){
  if(refreshTimer){clearTimeout(refreshTimer);refreshTimer=0;}
  refreshTimer=setTimeout(()=>{
    refreshTimer=0;
    try{
      if(viewId()!=='results'||!hotelMode())return;
      if(typeof showToast==='function')showToast(`${reason}: Ergebnisse werden neu geprüft`);
      const result=window.searchTrips?.();
      if(result?.catch)result.catch(()=>{});
    }catch(_){}
  },90);
  return true;
}
function install(){
  if(installed||typeof window.applyTravellers!=='function'||window.applyTravellers.__noreyoV1068)return false;
  prior=window.applyTravellers;
  const wrapped=function(...args){
    const origin=viewId(),detail=inDetailEdit(),before=occupancy();
    const result=prior.apply(this,args);
    const after=occupancy();
    if(origin==='results'&&!detail&&hotelMode()&&before!==after)schedule('Reisende geändert');
    return result;
  };
  wrapped.__noreyoV1068=true;
  wrapped.__noreyoV1068Prior=prior;
  window.applyTravellers=wrapped;
  installed=true;
  return true;
}
function restore(){
  if(refreshTimer){clearTimeout(refreshTimer);refreshTimer=0;}
  if(installed&&window.applyTravellers?.__noreyoV1068&&prior)window.applyTravellers=prior;
  installed=false;prior=null;
}
install();
window.addEventListener('pagehide',restore,{passive:true});
window.addEventListener('pageshow',install,{passive:true});
window.NOREYO_V1068=Object.freeze({BUILD,viewId,inDetailEdit,hotelMode,occupancy,schedule,install,restore});
})();