/* NOREYO V8.86 — safe, keyboard-accessible saved favorites and trips. */
(function(){
'use strict';
const BUILD='8.86';
function esc(v){return String(v??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[ch]);}
function qkey(v){return encodeURIComponent(String(v??'')).replace(/'/g,'%27');}
function img(v){try{if(typeof safeImageUrl==='function')return esc(safeImageUrl(v));}catch(_){}const s=String(v||'');return /^(?:https?:|assets\/)/i.test(s)?esc(s):'';}
function date(v){try{if(typeof fmtDateShort==='function')return fmtDateShort(v);}catch(_){}return String(v??'');}
function favs(){try{return Array.isArray(savedFavorites)?savedFavorites:[];}catch(_){return[];}}
function trips(){try{return Array.isArray(savedTrips)?savedTrips:[];}catch(_){return[];}}
function favoriteMarkup(items=favs()){
 return items.map(o=>`<div class="fav-card" role="button" tabindex="0" data-noreyo-saved-open="1" onclick="showSavedDetail('${qkey(o?.key)}','favorites')"><img src="${img(o?.img)}" alt="${esc(o?.hotel||'Gespeichertes Hotel')}"><span class="fav-body"><small>${esc(String(o?.region||o?.destination||'').toUpperCase())} · ${esc(o?.stars??'')} STERNE</small><b>${esc(o?.hotel||'Hotel')}</b><span>${esc(Number(o?.price).toLocaleString('de-DE'))} € Hotelpreis · ${esc(date(o?.checkin))}–${esc(date(o?.checkout))}</span></span><button class="favorite-remove" type="button" aria-label="Favorit entfernen" onclick="event.stopPropagation();removeFavorite('${qkey(o?.key)}')">×</button></div>`).join('');
}
function tripMarkup(items=trips()){
 return items.map(o=>`<article class="saved-trip"><div class="saved-trip-cover" role="button" tabindex="0" data-noreyo-saved-open="1" onclick="showSavedDetail('${qkey(o?.key)}','trips')"><img src="${img(o?.img)}" alt="${esc(o?.hotel||'Vorgemerkte Reise')}"><div class="saved-trip-copy"><small>VORGEMERKTE REISE</small><h2>${esc(o?.destination||'Reise')}</h2><p>${esc(date(o?.checkin))}–${esc(date(o?.checkout))} · ${esc(o?.hotel||'Hotel')}</p></div></div><div class="saved-trip-foot"><div><b>${esc(Number(o?.price).toLocaleString('de-DE'))} € Hotelpreis</b><span>Für deine Reisedaten gespeichert</span></div><button class="ghost-btn" type="button" onclick="showSavedDetail('${qkey(o?.key)}','trips')">Öffnen</button><button class="ghost-btn danger" type="button" onclick="removeTrip('${qkey(o?.key)}')">Entfernen</button></div></article>`).join('');
}
function renderFavsSafe(){const list=document.getElementById('favList'),empty=document.getElementById('favEmpty');if(!list||!empty)return false;const items=favs();list.innerHTML=items.length?favoriteMarkup(items):'';empty.style.display=items.length?'none':'block';return true;}
function renderTripsSafe(){const list=document.getElementById('tripList'),empty=document.getElementById('tripEmpty');if(!list||!empty)return false;const items=trips();list.innerHTML=items.length?tripMarkup(items):'';empty.style.display=items.length?'none':'block';return true;}
function wrap(name,replacement,marker){const prior=window[name];if(typeof prior!=='function'||prior[marker])return false;replacement[marker]=true;window[name]=replacement;return true;}
function install(){let changed=false;changed=wrap('renderFavs',renderFavsSafe,'__noreyoV886')||changed;changed=wrap('renderTrips',renderTripsSafe,'__noreyoV886')||changed;return changed;}
function onKey(e){if(e.key!=='Enter'&&e.key!==' ')return;const el=e.target?.closest?.('[data-noreyo-saved-open="1"]');if(!el)return;if(e.target?.closest?.('button'))return;e.preventDefault();el.click();}
document.addEventListener('keydown',onKey,true);install();window.addEventListener('pageshow',install,{passive:true});window.NOREYO_V886=Object.freeze({BUILD,esc,qkey,img,date,favs,trips,favoriteMarkup,tripMarkup,renderFavsSafe,renderTripsSafe,install,onKey});
})();