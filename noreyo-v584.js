/* NOREYO V5.84 — targeted platform repairs on the proven V5.82 interaction baseline.
   No MutationObserver, no full-screen UI layer, no pointer-event or z-index manipulation. */
(function(){
'use strict';
const BUILD='5.84';
const LEGACY_FAV_KEY='noreyoLegacyFavoriteIds584';
let syncingCruise=false;

function esc(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function mode(){
  const active=document.querySelector('.view.active .product-mode.on')||document.querySelector('#discover .product-mode.on');
  const t=String(active?.textContent||'').toLowerCase();
  if(t.includes('kreuzfahrt'))return'cruise';
  if(t.includes('hotel'))return'hotel';
  if(t.includes('flug'))return'flight';
  try{if(typeof productMode==='string')return productMode;}catch(_){ }
  return'package';
}

/* ---------- Favorites: recover old snapshots/IDs and always refresh the view ---------- */
function storedObjects(){
  const out=[];
  ['oneTripV52','oneTripV51','oneTripV5'].forEach(k=>{
    try{const x=JSON.parse(localStorage.getItem(k)||'null');if(x&&typeof x==='object')out.push(x);}catch(_){ }
  });
  return out;
}
function rememberLegacyFavoriteIds(){
  const ids=new Set();
  try{JSON.parse(localStorage.getItem(LEGACY_FAV_KEY)||'[]').forEach(x=>ids.add(String(x)));}catch(_){ }
  try{if(typeof favs!=='undefined'&&favs&&typeof favs.forEach==='function')favs.forEach(x=>ids.add(String(x)));}catch(_){ }
  storedObjects().forEach(x=>{if(Array.isArray(x.favs))x.favs.forEach(id=>ids.add(String(id)));});
  try{localStorage.setItem(LEGACY_FAV_KEY,JSON.stringify([...ids]));}catch(_){ }
  return ids;
}
function recoverFavoriteSnapshots(){
  let changed=false;
  try{
    if(typeof savedFavorites==='undefined'||!Array.isArray(savedFavorites))return false;
    const known=new Set(savedFavorites.map(x=>String(x?.key||'')).filter(Boolean));
    storedObjects().forEach(x=>{
      if(!Array.isArray(x.savedFavorites))return;
      x.savedFavorites.forEach(o=>{
        const key=String(o?.key||'');
        if(key&&!known.has(key)){savedFavorites.push(o);known.add(key);changed=true;}
      });
    });
    const legacy=rememberLegacyFavoriteIds();
    if(legacy.size&&typeof offers!=='undefined'&&Array.isArray(offers)&&typeof snapshotOffer==='function'){
      offers.forEach(o=>{
        if(!legacy.has(String(o?.id)))return;
        const snap=snapshotOffer(o),key=String(snap?.key||'');
        if(key&&!known.has(key)){savedFavorites.unshift(snap);known.add(key);changed=true;}
      });
    }
    if(changed&&typeof persistState==='function')persistState();
  }catch(e){console.warn('NOREYO '+BUILD+' favorite recovery',e);}
  return changed;
}
function fallbackFavorites(){
  try{
    const list=document.getElementById('favList'),empty=document.getElementById('favEmpty');
    if(!list||!empty||typeof savedFavorites==='undefined'||!Array.isArray(savedFavorites)||!savedFavorites.length||list.children.length)return;
    empty.style.display='none';
    list.innerHTML=savedFavorites.map((o,i)=>{
      const key=encodeURIComponent(String(o?.key||''));
      let src='';try{src=typeof safeImageUrl==='function'?safeImageUrl(o?.img):String(o?.img||'');}catch(_){src=String(o?.img||'');}
      const hotel=esc(o?.hotel||'Gespeichertes Hotel'),region=esc(String(o?.region||o?.destination||'Reise').toUpperCase());
      const stars=Math.max(0,Number(o?.stars)||0),price=Number(o?.price)||0;
      return '<article class="v584-fav-card" data-v584-open="'+key+'">'+
        (src?'<img src="'+esc(src)+'" alt="'+hotel+'">':'')+
        '<div><small>'+region+(stars?' · '+stars+' STERNE':'')+'</small><b>'+hotel+'</b><span>'+(price?price.toLocaleString('de-DE')+' €':'Gespeichertes Angebot')+'</span></div>'+
        '<button type="button" data-v584-remove="'+key+'" aria-label="Favorit entfernen">×</button></article>';
    }).join('');
    list.querySelectorAll('[data-v584-open]').forEach(card=>card.addEventListener('click',e=>{
      if(e.target.closest('[data-v584-remove]'))return;
      try{if(typeof showSavedDetail==='function')showSavedDetail(card.dataset.v584Open,'favorites');}catch(_){ }
    }));
    list.querySelectorAll('[data-v584-remove]').forEach(btn=>btn.addEventListener('click',e=>{
      e.stopPropagation();try{if(typeof removeFavorite==='function')removeFavorite(btn.dataset.v584Remove);}catch(_){ }
    }));
  }catch(e){console.warn('NOREYO '+BUILD+' favorite fallback',e);}
}
function refreshFavorites(){
  recoverFavoriteSnapshots();
  try{if(typeof renderFavs==='function')renderFavs();}catch(e){console.warn('NOREYO '+BUILD+' render favorites',e);}
  fallbackFavorites();
}
function afterFunction(name,after){
  try{
    const original=eval(name);
    if(typeof original!=='function'||original.__noreyoV584)return;
    const wrapped=function(){const r=original.apply(this,arguments);try{after.apply(this,arguments);}catch(_){ }return r;};
    wrapped.__noreyoV584=true;
    eval(name+'=wrapped');
  }catch(_){ }
}

/* ---------- Cruise: mirror the correct cruise card into the Search tab ---------- */
function enhanceCruiseCard(card){
  if(!card)return;
  const head=card.querySelector('.noreyo-v552-search-head b');if(head)head.textContent='Route, Zeitraum, Reisende & Kabine';
  const cta=card.querySelector('[data-cruise-search]');
  if(cta){const first=cta.querySelector('span');if(first)first.textContent='Kreuzfahrt planen';}
  if(!card.querySelector('.noreyo-v584-cruise-note')){
    const grid=card.querySelector('.noreyo-v552-cruise-grid');
    if(grid)grid.insertAdjacentHTML('afterend','<p class="noreyo-v584-cruise-note">Kreuzfahrt-Suche ist vorbereitet. Live-Angebote werden mit der Kreuzfahrt-Anbieteranbindung aktiviert.</p>');
  }
}
function bindCruiseMirror(card){
  card.querySelectorAll('[data-cruise-picker]').forEach(btn=>{
    if(btn.dataset.v584Bound==='1')return;btn.dataset.v584Bound='1';
    btn.addEventListener('click',()=>{
      const kind=btn.dataset.cruisePicker;
      const source=document.querySelector('#discover [data-cruise-picker="'+kind+'"]');
      if(source&&source!==btn)source.click();
    });
  });
  const cta=card.querySelector('[data-cruise-search]');
  if(cta&&cta.dataset.v584Bound!=='1'){
    cta.dataset.v584Bound='1';
    cta.addEventListener('click',()=>{
      const source=document.querySelector('#discover [data-cruise-search]');
      if(source&&source!==cta)source.click();
    });
  }
}
function syncCruiseSearchView(){
  if(syncingCruise||mode()!=='cruise')return;
  const source=document.querySelector('#discover .search-card.noreyo-v552-cruise-search');
  const target=document.querySelector('#searchView .search-card');
  if(!source||!target)return;
  syncingCruise=true;
  try{
    enhanceCruiseCard(source);
    target.className='search-card noreyo-v552-cruise-search noreyo-v584-cruise-mirror';
    target.innerHTML=source.innerHTML;
    enhanceCruiseCard(target);bindCruiseMirror(target);
  }finally{syncingCruise=false;}
}
function syncCruiseValues(){if(mode()==='cruise')syncCruiseSearchView();}

/* v557 sends cruise to a non-existent core filter tab. Stop that path cleanly. */
try{
  if(typeof openFilter==='function'&&!openFilter.__noreyoV584CruiseGuard){
    const priorOpenFilter=openFilter;
    const guarded=function(){
      if(mode()==='cruise'){
        try{if(typeof showToast==='function')showToast('Kabine und Kreuzfahrt-Wünsche stellst du direkt in der Kreuzfahrt-Suche ein.');}catch(_){ }
        return;
      }
      return priorOpenFilter.apply(this,arguments);
    };
    guarded.__noreyoV584CruiseGuard=true;openFilter=guarded;
  }
}catch(_){ }

/* Keep Search and Discover synchronized after genuine app actions, not DOM mutations. */
try{
  if(typeof setProductMode==='function'&&!setProductMode.__noreyoV584){
    const priorSetProductMode=setProductMode;
    const wrapped=function(next){const r=priorSetProductMode.apply(this,arguments);setTimeout(()=>{if(next==='cruise'||mode()==='cruise')syncCruiseSearchView();},0);return r;};
    wrapped.__noreyoV584=true;setProductMode=wrapped;
  }
}catch(_){ }
try{
  if(typeof updateSearchUI==='function'&&!updateSearchUI.__noreyoV584){
    const priorUpdate=updateSearchUI;
    const wrapped=function(){const r=priorUpdate.apply(this,arguments);setTimeout(syncCruiseValues,0);return r;};
    wrapped.__noreyoV584=true;updateSearchUI=wrapped;
  }
}catch(_){ }

afterFunction('renderOffers',recoverFavoriteSnapshots);
afterFunction('toggleFav',refreshFavorites);
afterFunction('toggleSnapshotFavorite',refreshFavorites);
afterFunction('removeFavorite',refreshFavorites);

/* Wrap navigation once: Favorites always refresh; profile copy gets repaired after rollback. */
try{
  if(typeof go==='function'&&!go.__noreyoV584){
    const priorGo=go;
    const wrapped=function(view){const r=priorGo.apply(this,arguments);if(view==='favorites')refreshFavorites();if(view==='profile')polishProfile();if(view==='searchView'&&mode()==='cruise')setTimeout(syncCruiseSearchView,0);return r;};
    wrapped.__noreyoV584=true;go=wrapped;
  }
}catch(_){ }

function polishProfile(){
  const root=document.getElementById('profile');if(!root)return;
  const kicker=root.querySelector('.simple-intro .kicker');if(kicker)kicker.textContent='DEIN NOREYO';
  const h=root.querySelector('.simple-intro h1');if(h)h.textContent='Was soll NOREYO sich für dich merken?';
  const rows=[...root.querySelectorAll('.menu-row')];
  rows.forEach(row=>{
    const b=row.querySelector('b'),s=row.querySelector('small'),t=(b?.textContent||'').trim();
    if(t==='Standard-Präferenzen'){b.textContent='Meine Urlaubswünsche';if(s)s.textContent='Balkon, Lage, Verpflegung, Hotel & mehr';}
    else if(t==='Preisbeobachtung'){b.textContent='Preisalarm';if(s&&s.textContent==='Keine aktive Beobachtung')s.textContent='Noch kein Preisalarm aktiv';}
    else if(t==='Treueprogramme'){row.hidden=true;}
  });
}

document.addEventListener('click',e=>{
  if(e.target.closest?.('[data-cruise-value],[data-close-cruise-sheet]'))setTimeout(syncCruiseSearchView,0);
  if(e.target.closest?.('.nav-btn[data-view="favorites"]'))setTimeout(refreshFavorites,0);
},false);

rememberLegacyFavoriteIds();recoverFavoriteSnapshots();polishProfile();
if(mode()==='cruise')setTimeout(syncCruiseSearchView,0);
window.NOREYO_V584=Object.freeze({refreshFavorites,syncCruiseSearchView,version:BUILD});
})();
