/* NOREYO V10.60 — clear stale hotel offers after failed/empty live searches.
   Packed searchTrips replaces the visible #offers UI on errors/no-results but leaves
   the previous global offers array intact. Detail refresh code can then reopen an old
   offer as if the new search had succeeded. After every non-flight search completion,
   make the global result state match the rendered result cards. */
(function(){
'use strict';
const BUILD='10.60';
let installed=false,prior=null;
function flightMode(){try{return String(typeof productMode!=='undefined'?productMode:'')==='flight';}catch(_){return false;}}
function hasRenderedOffers(){return !!document.getElementById('offers')?.querySelector?.('.offer');}
function clearStale(){let changed=false;try{if(typeof offers!=='undefined'&&Array.isArray(offers)&&offers.length){offers=[];changed=true;}}catch(_){}try{if(typeof recommendedOrder!=='undefined'&&Array.isArray(recommendedOrder)&&recommendedOrder.length){recommendedOrder=[];changed=true;}}catch(_){}try{if(typeof lastSearchContext!=='undefined'&&lastSearchContext!==null){lastSearchContext=null;changed=true;}}catch(_){}try{if(typeof providerHotelCount!=='undefined'&&providerHotelCount!==0){providerHotelCount=0;changed=true;}if(typeof filteredHotelCount!=='undefined'&&filteredHotelCount!==0){filteredHotelCount=0;changed=true;}}catch(_){}return changed;}
function reconcile(){if(flightMode()||hasRenderedOffers())return false;return clearStale();}
function install(){if(installed||typeof window.searchTrips!=='function'||window.searchTrips.__noreyoV1060)return false;prior=window.searchTrips;const wrapped=function(...args){const modeWasFlight=flightMode();let result;try{result=prior.apply(this,args);}catch(error){if(!modeWasFlight)reconcile();throw error;}return Promise.resolve(result).then(value=>{if(!modeWasFlight)reconcile();return value;},error=>{if(!modeWasFlight)reconcile();throw error;});};wrapped.__noreyoV1060=true;wrapped.__noreyoV1060Prior=prior;window.searchTrips=wrapped;installed=true;return true;}
function restore(){if(!installed)return false;if(window.searchTrips?.__noreyoV1060&&prior)window.searchTrips=prior;installed=false;prior=null;return true;}
install();window.addEventListener('pagehide',restore,{passive:true});window.addEventListener('pageshow',install,{passive:true});
window.NOREYO_V1060=Object.freeze({BUILD,flightMode,hasRenderedOffers,clearStale,reconcile,install,restore});
})();