/* NOREYO V6.26 — favorite toggle ID normalization.
   Keeps legacy favorite/tombstone lifecycle correct when IDs switch between
   numeric and string representations across old storage and live offers. */
(function(){
'use strict';
const BUILD='6.26';
const LEGACY_FAV_KEY='noreyoLegacyFavoriteIds584';
const TOMBSTONE_KEY='noreyoLegacyFavoriteTombstones589';

function sid(v){return String(v??'').trim();}
function readSet(key){const out=new Set();try{JSON.parse(localStorage.getItem(key)||'[]').forEach(v=>{const s=sid(v);if(s)out.add(s);});}catch(_){ }return out;}
function writeSet(key,set){try{localStorage.setItem(key,JSON.stringify([...set]));}catch(_){ }}
function offerForId(id){const s=sid(id);try{return Array.isArray(offers)?offers.find(o=>sid(o?.id)===s):null;}catch(_){return null;}}
function snapshotKeyForId(id){
  try{const o=offerForId(id);if(!o||typeof snapshotOffer!=='function')return'';return sid(snapshotOffer(o)?.key);}catch(_){return'';}
}
function clearTombstone(key){key=sid(key);if(!key)return;const dead=readSet(TOMBSTONE_KEY);if(dead.delete(key))writeSet(TOMBSTONE_KEY,dead);}
function markId(id,active){
  const ids=readSet(LEGACY_FAV_KEY),s=sid(id);if(!s)return;
  if(active)ids.add(s);else ids.delete(s);writeSet(LEGACY_FAV_KEY,ids);
}
function favoriteIdActive(id){
  const s=sid(id);if(!s)return false;
  try{
    if(favs&&typeof favs.has==='function'){
      if(favs.has(id)||favs.has(s))return true;
      for(const value of favs)if(sid(value)===s)return true;
    }
  }catch(_){ }
  return false;
}
function prepareIdToggle(id,removing){
  const key=snapshotKeyForId(id);
  if(removing){markId(id,false);if(key)window.NOREYO_V584?.scrubLegacySnapshotKey?.(key);}
  else{markId(id,true);clearTombstone(key);}
}
function snapshotActive(key){const s=sid(key);try{return Array.isArray(savedFavorites)&&savedFavorites.some(o=>sid(o?.key)===s);}catch(_){return false;}}
function prepareSnapshotToggle(key,removing){
  key=sid(key);if(!key)return;
  if(removing)window.NOREYO_V584?.scrubLegacySnapshotKey?.(key);else clearTombstone(key);
}
function install(){
  try{
    if(typeof toggleFav==='function'&&!toggleFav.__noreyoV606){
      const prior=toggleFav;
      const wrapped=function(id){
        prepareIdToggle(id,favoriteIdActive(id));
        return prior.apply(this,arguments);
      };
      wrapped.__noreyoV606=true;toggleFav=wrapped;
    }
  }catch(_){ }
  try{
    if(typeof toggleSnapshotFavorite==='function'&&!toggleSnapshotFavorite.__noreyoV606){
      const prior=toggleSnapshotFavorite;
      const wrapped=function(key){prepareSnapshotToggle(key,snapshotActive(key));return prior.apply(this,arguments);};
      wrapped.__noreyoV606=true;toggleSnapshotFavorite=wrapped;
    }
  }catch(_){ }
}
install();
window.addEventListener('pageshow',install,{passive:true});
window.NOREYO_V606=Object.freeze({BUILD,sid,favoriteIdActive,prepareIdToggle,prepareSnapshotToggle,clearTombstone,markId});
})();