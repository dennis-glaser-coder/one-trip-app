/* NOREYO V7.00 — transactional favorite-removal safety.
   If a legacy/core favorite removal throws or rejects, restore the migration
   storage touched before the removal so a failed operation cannot tombstone a
   still-existing favorite permanently. */
(function(){
'use strict';
const BUILD='7.00';
const KEYS=['noreyoLegacyFavoriteTombstones589','noreyoLegacyFavoriteIds584','oneTripV52','oneTripV51','oneTripV5'];
function storageSnapshot(){const out={};for(const key of KEYS){try{out[key]=localStorage.getItem(key);}catch(_){out[key]=null;}}return out;}
function restoreStorage(snapshot){if(!snapshot)return false;let changed=false;for(const key of KEYS){try{const value=snapshot[key];if(value===null||value===undefined){if(localStorage.getItem(key)!==null){localStorage.removeItem(key);changed=true;}}else if(localStorage.getItem(key)!==value){localStorage.setItem(key,value);changed=true;}}catch(_){}}return changed;}
function refresh(){try{window.NOREYO_V584?.refreshFavorites?.();}catch(_){}try{if(typeof renderFavs==='function')renderFavs();}catch(_){}}
function rollback(snapshot){const changed=restoreStorage(snapshot);if(changed)setTimeout(refresh,0);return changed;}
function wrap(name,marker){try{const current=eval(name);if(typeof current!=='function'||current[marker])return false;const wrapped=function(){const snapshot=storageSnapshot();let result;try{result=current.apply(this,arguments);}catch(error){rollback(snapshot);throw error;}if(result&&typeof result.then==='function')return result.catch(error=>{rollback(snapshot);throw error;});return result;};wrapped[marker]=true;eval(name+'=wrapped');return true;}catch(_){return false;}}
function install(){const a=wrap('removeFavorite','__noreyoV700Remove');const b=wrap('toggleSnapshotFavorite','__noreyoV700Snapshot');const c=wrap('toggleFav','__noreyoV700Id');return a||b||c;}
install();window.addEventListener('pageshow',install,{passive:true});
window.NOREYO_V700=Object.freeze({BUILD,KEYS:KEYS.slice(),storageSnapshot,restoreStorage,rollback,install});
})();
