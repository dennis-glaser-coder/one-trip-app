/* NOREYO V7.03 — full transactional favorite rollback.
   Extends V7.00 by restoring both migration storage and in-memory favorite
   collections when a remove/toggle throws or rejects. */
(function(){
'use strict';
const BUILD='7.03';
const STORAGE_KEYS=['noreyoLegacyFavoriteTombstones589','noreyoLegacyFavoriteIds584','noreyoLegacyFavoriteIdsSeeded584','noreyoLegacyFavoriteSnapshotsSeeded589','oneTripV52','oneTripV51','oneTripV5'];
function storageSnapshot(){const out={};for(const key of STORAGE_KEYS){try{out[key]=localStorage.getItem(key);}catch(_){out[key]=null;}}return out;}
function memorySnapshot(){const out={saved:null,favs:null};try{if(typeof savedFavorites!=='undefined'&&Array.isArray(savedFavorites))out.saved=savedFavorites.slice();}catch(_){}try{if(typeof favs!=='undefined'){if(favs instanceof Set)out.favs={kind:'set',values:[...favs]};else if(Array.isArray(favs))out.favs={kind:'array',values:favs.slice()};}}catch(_){}return out;}
function restoreStorage(snapshot){if(!snapshot)return false;let changed=false;for(const key of STORAGE_KEYS){try{const want=snapshot[key],have=localStorage.getItem(key);if(want===null||want===undefined){if(have!==null){localStorage.removeItem(key);changed=true;}}else if(have!==want){localStorage.setItem(key,want);changed=true;}}catch(_){}}return changed;}
function restoreMemory(snapshot){if(!snapshot)return false;let changed=false;try{if(Array.isArray(snapshot.saved)&&typeof savedFavorites!=='undefined'&&Array.isArray(savedFavorites)){const same=savedFavorites.length===snapshot.saved.length&&savedFavorites.every((v,i)=>v===snapshot.saved[i]);if(!same){savedFavorites.splice(0,savedFavorites.length,...snapshot.saved);changed=true;}}}catch(_){}try{if(snapshot.favs?.kind==='set'&&typeof favs!=='undefined'&&favs instanceof Set){const before=[...favs],want=snapshot.favs.values;const same=before.length===want.length&&before.every((v,i)=>v===want[i]);if(!same){favs.clear();want.forEach(v=>favs.add(v));changed=true;}}else if(snapshot.favs?.kind==='array'&&typeof favs!=='undefined'&&Array.isArray(favs)){const want=snapshot.favs.values;const same=favs.length===want.length&&favs.every((v,i)=>v===want[i]);if(!same){favs.splice(0,favs.length,...want);changed=true;}}}catch(_){}return changed;}
function refresh(){try{window.NOREYO_V584?.refreshFavorites?.();}catch(_){}try{if(typeof renderFavs==='function')renderFavs();}catch(_){}}
function rollback(snapshot){const a=restoreStorage(snapshot?.storage),b=restoreMemory(snapshot?.memory);if(a||b)setTimeout(refresh,0);return a||b;}
function snapshot(){return{storage:storageSnapshot(),memory:memorySnapshot()};}
function wrap(name,marker){try{const current=eval(name);if(typeof current!=='function'||current[marker])return false;const wrapped=function(){const before=snapshot();let result;try{result=current.apply(this,arguments);}catch(error){rollback(before);throw error;}if(result&&typeof result.then==='function')return result.catch(error=>{rollback(before);throw error;});return result;};wrapped[marker]=true;eval(name+'=wrapped');return true;}catch(_){return false;}}
function install(){const a=wrap('removeFavorite','__noreyoV703Remove'),b=wrap('toggleSnapshotFavorite','__noreyoV703Snapshot'),c=wrap('toggleFav','__noreyoV703Id');return a||b||c;}
install();window.addEventListener('pageshow',install,{passive:true});
window.NOREYO_V703=Object.freeze({BUILD,STORAGE_KEYS:STORAGE_KEYS.slice(),storageSnapshot,memorySnapshot,restoreStorage,restoreMemory,rollback,snapshot,install});
})();
