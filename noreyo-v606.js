/* NOREYO V6.06 — favorite toggle lifecycle bridge for legacy migration/tombstones. */
(function(){
'use strict';
const BUILD='6.06';
const LEGACY_FAV_KEY='noreyoLegacyFavoriteIds584';
const TOMBSTONE_KEY='noreyoLegacyFavoriteTombstones589';

function readSet(key){const out=new Set();try{JSON.parse(localStorage.getItem(key)||'[]').forEach(v=>out.add(String(v)));}catch(_){ }return out;}
function writeSet(key,set){try{localStorage.setItem(key,JSON.stringify([...set]));}catch(_){ }}
function offerForId(id){try{return Array.isArray(offers)?offers.find(o=>String(o?.id||'')===String(id||'')):null;}catch(_){return null;}}
function snapshotKeyForId(id){
  try{const o=offerForId(id);if(!o||typeof snapshotOffer!=='function')return'';return String(snapshotOffer(o)?.key||'');}catch(_){return'';}
}
function clearTombstone(key){if(!key)return;const dead=readSet(TOMBSTONE_KEY);if(dead.delete(String(key)))writeSet(TOMBSTONE_KEY,dead);}
function markId(id,active){
  const ids=readSet(LEGACY_FAV_KEY),s=String(id||'');if(!s)return;
  if(active)ids.add(s);else ids.delete(s);writeSet(LEGACY_FAV_KEY,ids);
}
function prepareIdToggle(id,removing){
  const key=snapshotKeyForId(id);
  if(removing){markId(id,false);if(key)window.NOREYO_V584?.scrubLegacySnapshotKey?.(key);}
  else{markId(id,true);clearTombstone(key);}
}
function snapshotActive(key){try{return Array.isArray(savedFavorites)&&savedFavorites.some(o=>String(o?.key||'')===String(key||''));}catch(_){return false;}}
function prepareSnapshotToggle(key,removing){
  key=String(key||'');if(!key)return;
  if(removing)window.NOREYO_V584?.scrubLegacySnapshotKey?.(key);else clearTombstone(key);
}
function install(){
  try{
    if(typeof toggleFav==='function'&&!toggleFav.__noreyoV606){
      const prior=toggleFav;
      const wrapped=function(id){
        let removing=false;try{removing=!!favs?.has?.(id);}catch(_){ }
        prepareIdToggle(id,removing);
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
window.NOREYO_V606=Object.freeze({BUILD,prepareIdToggle,prepareSnapshotToggle,clearTombstone,markId});
})();