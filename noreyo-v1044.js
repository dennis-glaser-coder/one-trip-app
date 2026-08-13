/* NOREYO V10.44 — transactional explicit max-flight marker.
   V10.40 marks maxFlightMinutes explicit immediately on range change. V9.76
   correctly rolls filter values back on X/backdrop, but the localStorage marker
   would survive that cancel and could make the restored legacy 270-minute default
   become a hard constraint. Snapshot/restore the marker with the filter transaction. */
(function(){
'use strict';
const BUILD='10.44',MARKER='noreyoFlightMaxExplicitV1040';
let tx=null,committing=false;
function markerValue(){try{return localStorage.getItem(MARKER);}catch(_){return null;}}
function restoreMarker(value){try{if(value===null||value===undefined)localStorage.removeItem(MARKER);else localStorage.setItem(MARKER,String(value));window.NOREYO_V1040?.schedule?.();return true;}catch(_){return false;}}
function begin(){if(tx)return false;tx={marker:markerValue()};return true;}
function cancel(){if(!tx)return false;const snap=tx;tx=null;return restoreMarker(snap.marker);}
function commit(){if(!tx)return false;tx=null;return true;}
function active(){return !!tx;}
const priorOpen=window.openFilter,priorClose=window.closeFilter,priorApply=window.applyPrefs;
if(typeof priorOpen==='function')window.openFilter=function(...args){begin();try{return priorOpen.apply(this,args);}catch(error){cancel();throw error;}};
if(typeof priorClose==='function')window.closeFilter=function(...args){if(tx&&!committing)cancel();return priorClose.apply(this,args);};
if(typeof priorApply==='function')window.applyPrefs=function(...args){committing=true;commit();try{return priorApply.apply(this,args);}finally{committing=false;}};
window.NOREYO_V1044=Object.freeze({BUILD,MARKER,markerValue,restoreMarker,begin,cancel,commit,active});
})();