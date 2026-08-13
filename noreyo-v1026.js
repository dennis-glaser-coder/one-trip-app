/* NOREYO V10.26 — no invisible selected flight after planner close.
   A chosen flight is only visible inside the flight planner. Closing that planner
   must not leave a hidden offer in global session state that a future Verify/Prebook
   action could accidentally consume. */
(function(){
'use strict';
const BUILD='10.26';
let installed=false,priorClose=null;
function isFlightPlanner(){const sheet=document.getElementById('plannerSheet');const title=document.getElementById('plannerTitle');return !!sheet?.classList?.contains('show')&&String(title?.textContent||'').trim()==='Flüge';}
function clear(){if(!window.NOREYO_SELECTED_FLIGHT)return false;try{delete window.NOREYO_SELECTED_FLIGHT;}catch(_){window.NOREYO_SELECTED_FLIGHT=undefined;}return true;}
function install(){if(installed)return false;priorClose=window.closePlanner;if(typeof priorClose==='function'&&!priorClose.__noreyoV1026){const wrapped=function(...args){const flight=isFlightPlanner();if(flight)clear();return priorClose.apply(this,args);};wrapped.__noreyoV1026=true;wrapped.__noreyoV1026Prior=priorClose;window.closePlanner=wrapped;}installed=true;return true;}
function restore(){if(!installed)return false;if(window.closePlanner?.__noreyoV1026&&priorClose)window.closePlanner=priorClose;installed=false;priorClose=null;return true;}
install();window.addEventListener('pagehide',restore,{passive:true});window.addEventListener('pageshow',install,{passive:true});window.NOREYO_V1026=Object.freeze({BUILD,isFlightPlanner,clear,install,restore});
})();