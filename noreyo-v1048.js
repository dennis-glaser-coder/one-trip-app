/* NOREYO V10.48 — refresh results after committed date/traveller edits.
   Packed main planners commit dates/travellers but, unlike meal-plan edits, do not
   refresh an already-visible hotel result set. This can leave prices for the old
   occupancy/date beside new summary values. Re-run hotel search after a committed
   main edit on results, while leaving detail-edit flows to their own refresh path. */
(function(){
'use strict';
const BUILD='10.48';let refreshTimer=0;
function viewId(){try{if(typeof currentViewId==='function')return currentViewId();}catch(_){}return document.querySelector('.view.active')?.id||'';}
function inDetailEdit(){try{return !!detailEditContext;}catch(_){return false;}}
function hotelMode(){try{return typeof productMode!=='undefined'?productMode!=='flight':true;}catch(_){return true;}}
function scheduleRefresh(reason){if(refreshTimer){clearTimeout(refreshTimer);refreshTimer=0;}refreshTimer=setTimeout(()=>{refreshTimer=0;try{if(viewId()!=='results'||!hotelMode())return;if(typeof showToast==='function')showToast(`${reason}: Ergebnisse werden neu geprüft`);const result=searchTrips?.();if(result?.catch)result.catch(()=>{});}catch(_){}},90);return true;}
const priorSaveDates=window.saveDates,priorApplyTravellers=window.applyTravellers;
if(typeof priorSaveDates==='function')window.saveDates=function(...args){const origin=viewId(),detail=inDetailEdit();const before=(()=>{try{return [searchState?.checkin,searchState?.checkout].join('|');}catch(_){return'';}})();const result=priorSaveDates.apply(this,args);const after=(()=>{try{return [searchState?.checkin,searchState?.checkout].join('|');}catch(_){return'';}})();if(origin==='results'&&!detail&&before!==after&&hotelMode())scheduleRefresh('Zeitraum geändert');return result;};
if(typeof priorApplyTravellers==='function')window.applyTravellers=function(...args){const origin=viewId(),detail=inDetailEdit();const result=priorApplyTravellers.apply(this,args);if(origin==='results'&&!detail&&hotelMode())scheduleRefresh('Reisende geändert');return result;};
function cleanup(){if(refreshTimer){clearTimeout(refreshTimer);refreshTimer=0;}}
window.addEventListener('pagehide',cleanup,{passive:true});
window.NOREYO_V1048=Object.freeze({BUILD,viewId,inDetailEdit,hotelMode,scheduleRefresh,cleanup});
})();