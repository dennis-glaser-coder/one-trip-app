/* NOREYO V10.16 — invalid saved-price truth.
   State hygiene converts malformed saved prices to null. Packed renderers use
   Number(null) and can therefore display a misleading 0 €. Treat non-positive or
   non-finite saved prices as unavailable across Favorites, Trips and saved details. */
(function(){
'use strict';
const BUILD='10.16';
let observer=null,raf=0,activeInvalidKey='';
function finitePrice(v){const n=Number(v);return Number.isFinite(n)&&n>0?n:null;}
function snapshot(encoded){try{return typeof snapshotByKey==='function'?snapshotByKey(encoded):null;}catch(_){return null;}}
function keyOf(o){return String(o?.key||'');}
function install(){const prior=window.showSavedDetail;if(typeof prior!=='function'||prior.__noreyoV1016)return false;const wrapped=function(encoded,...args){const o=snapshot(encoded);activeInvalidKey=o&&finitePrice(o.price)===null?keyOf(o):'';const result=prior.call(this,encoded,...args);setTimeout(schedule,0);return result;};wrapped.__noreyoV1016=true;wrapped.__noreyoV1016Prior=prior;window.showSavedDetail=wrapped;return true;}
function badText(text){const t=String(text||'').replace(/\s+/g,' ').trim();return /^(?:0|0[,.]00|NaN|Infinity|∞)\s*€(?:\b|\s|$)/i.test(t)||/(?:^|\s)(?:0|0[,.]00|NaN|Infinity|∞)\s*€\s+Hotelpreis/i.test(t);}
function fixLists(root=document){let changed=false;root.querySelectorAll?.('#favList .fav-card .fav-body > span,#tripList .saved-trip-foot > div > b').forEach(el=>{if(!badText(el.textContent))return;el.textContent='Preis aktuell nicht verfügbar';changed=true;});return changed;}
function fixDetail(){if(!activeInvalidKey)return false;const root=document.getElementById('detailContent');if(!root)return false;let changed=false;const total=root.querySelector('.checkout-total strong');if(total&&total.textContent!=='Preis nicht verfügbar'){total.textContent='Preis nicht verfügbar';changed=true;}root.querySelectorAll?.('.checkout-line').forEach(line=>{const label=line.querySelector('span')?.textContent?.trim();if(label==='Pro Person'||label==='Pro Nacht'){const b=line.querySelector('b');if(b&&b.textContent!=='—'){b.textContent='—';changed=true;}}});const sticky=root.querySelector('.sticky-copy strong');if(sticky&&sticky.textContent!=='Preis nicht verfügbar'){sticky.textContent='Preis nicht verfügbar';changed=true;}root.querySelectorAll?.('.detail-action').forEach(btn=>{if(!/Preis (?:merken|gemerkt|beobachten|wird beobachtet)/i.test(btn.textContent||''))return;if(!btn.disabled){btn.disabled=true;changed=true;}if(btn.getAttribute('aria-disabled')!=='true'){btn.setAttribute('aria-disabled','true');changed=true;}if(btn.getAttribute('title')!=='Kein gültiger gespeicherter Preis vorhanden'){btn.setAttribute('title','Kein gültiger gespeicherter Preis vorhanden');changed=true;}});return changed;}
function sync(){raf=0;let changed=false;changed=fixLists()||changed;changed=fixDetail()||changed;return changed;}
function schedule(){if(!raf)raf=requestAnimationFrame(sync);}
function observe(){if(observer){observer.disconnect();observer=null;}if(typeof MutationObserver==='undefined'||!document.body)return false;observer=new MutationObserver(schedule);observer.observe(document.body,{subtree:true,childList:true,characterData:true});schedule();return true;}
function cleanup(){if(observer){observer.disconnect();observer=null;}if(raf){cancelAnimationFrame(raf);raf=0;}}
function state(){return{activeInvalidKey};}
install();observe();window.addEventListener('pagehide',cleanup,{passive:true});window.addEventListener('pageshow',()=>{install();observe();},{passive:true});window.NOREYO_V1016=Object.freeze({BUILD,finitePrice,snapshot,keyOf,badText,fixLists,fixDetail,sync,schedule,observe,cleanup,state});
})();