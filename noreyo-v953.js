/* NOREYO V9.53 — saved-price freshness truth.
   Favorites/trips persist snapshots. Reopening such a snapshot may refresh hotel
   metadata/rate options, but the displayed primary saved price is not guaranteed
   to have been repriced. Never label that stored amount as an "aktuelle Live-Rate". */
(()=>{
'use strict';
const BUILD='9.53';let observer=null,raf=0;
function savedContext(){try{return detailBackView==='favorites'||detailBackView==='trips'}catch(_){return false}}
function addOnce(text,suffix){const t=String(text||'').trim();return t.includes(suffix)?t:(t?`${t} · ${suffix}`:suffix)}
function baseBoard(text){return String(text||'').split('·')[0].trim()||'Hoteltarif'}
function fixSavedDetail(){
  if(!savedContext())return false;
  const root=document.getElementById('detailContent');if(!root)return false;let changed=false;
  const badge=root.querySelector('.live-badge');if(badge&&badge.textContent!=='VORGEMERKT · TARIF ERNEUT PRÜFEN'){badge.textContent='VORGEMERKT · TARIF ERNEUT PRÜFEN';changed=true}
  const availability=root.querySelector('.availability-card');if(availability){const b=availability.querySelector('b'),p=availability.querySelector('p');if(b&&b.textContent!=='Vorgemerkte Auswahl'){b.textContent='Vorgemerkte Auswahl';changed=true}const copy='Hotelinformationen und Tarifoptionen können aktualisiert sein. Den gespeicherten Preis vor der Tarifwahl erneut live prüfen.';if(p&&p.textContent!==copy){p.textContent=copy;changed=true}}
  const total=root.querySelector('.checkout-total span');if(total){const next=`${baseBoard(total.textContent)} · gespeicherter Preis, nicht neu bestätigt`;if(total.textContent!==next){total.textContent=next;changed=true}}
  const quick=root.querySelector('.detail-quick-note');if(quick){const copy='Änderungen werden live geprüft. Der gespeicherte Ausgangspreis gilt erst nach erneuter Tarifauswahl als aktuell.';if(quick.textContent!==copy){quick.textContent=copy;changed=true}}
  const sticky=root.querySelector('.sticky-copy span');if(sticky){const next=addOnce(sticky.textContent,'gespeicherter Preis');if(sticky.textContent!==next){sticky.textContent=next;changed=true}}
  const tariffHead=[...root.querySelectorAll('.detail-section-head')].find(x=>/Zimmer\s*&\s*Tarife/i.test(x.querySelector('h2')?.textContent||''));if(tariffHead){const small=tariffHead.querySelector('small');const copy='Optionen können live sein · Hauptpreis aus Vormerkung';if(small&&small.textContent!==copy){small.textContent=copy;changed=true}}
  return changed;
}
function fixSavedLists(){let changed=false;document.querySelectorAll('#favList .fav-card .fav-body > span').forEach(el=>{const next=addOnce(el.textContent,'gespeichert, nicht live geprüft');if(el.textContent!==next){el.textContent=next;changed=true}});document.querySelectorAll('#tripList .saved-trip-foot span').forEach(el=>{const copy='Gespeicherter Preis · vor Auswahl erneut live prüfen';if(el.textContent!==copy){el.textContent=copy;changed=true}});return changed}
function run(){raf=0;let changed=false;changed=fixSavedLists()||changed;changed=fixSavedDetail()||changed;return changed}
function schedule(){if(raf)return;raf=requestAnimationFrame(run)}
function observe(){if(observer){observer.disconnect();observer=null}if(typeof MutationObserver==='undefined'||!document.body)return false;observer=new MutationObserver(schedule);observer.observe(document.body,{subtree:true,childList:true,characterData:true});schedule();return true}
function cleanup(){if(observer){observer.disconnect();observer=null}if(raf){cancelAnimationFrame(raf);raf=0}}
observe();window.addEventListener('pagehide',cleanup,{passive:true});window.addEventListener('pageshow',observe,{passive:true});window.NOREYO_V953=Object.freeze({BUILD,savedContext,addOnce,baseBoard,fixSavedDetail,fixSavedLists,run,schedule,observe,cleanup});
})();