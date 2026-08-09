/* NOREYO V5.77 — family + live-search safety on V5.76 main */
(function(){
'use strict';
const BUILD='5.77';
let pendingFamily=null,busy=false,busyButton=null,busyTimer=0,observer=null,observedRoot=null;
function norm(v){return String(v||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/ß/g,'ss');}
function num(v){const m={ein:1,eine:1,einen:1,einem:1,einer:1,zwei:2,drei:3,vier:4,fuenf:5,funf:5,sechs:6,sieben:7,acht:8,neun:9};const s=norm(v).trim();return /^\d+$/.test(s)?Number(s):(m[s]??null);}
function explicitAdults(text){const t=norm(text);return /\bzu zweit\b/.test(t)||/\b(?:[1-9]|ein(?:e|en|em|er)?|zwei|drei|vier|fuenf|funf|sechs|sieben|acht|neun)\s+(?:erwachsen(?:e|er|en)?|personen?|reisende)\b/.test(t);}
function parseAdults(text){const t=norm(text);let m=t.match(/\b([1-9]|ein(?:e|en|em|er)?|zwei|drei|vier|fuenf|funf|sechs|sieben|acht|neun)\s+(?:erwachsen(?:e|er|en)?|personen?|reisende)\b/);if(m)return num(m[1]);if(/\bzu zweit\b/.test(t))return 2;return null;}
function noChildren(text){const t=norm(text);return /\b(?:ohne|keine|kein)\s+(?:kinder|kind|babys?|sohn|tochter)\b/.test(t)||/\bnur\s+erwachsene\b/.test(t);}
function parseCount(text){const t=norm(text);if(noChildren(t))return 0;let m=t.match(/\b([1-8]|ein(?:e|en|em|er)?|zwei|drei|vier|fuenf|funf|sechs|sieben|acht)\s+(?:kinder|kindern|kind|babys?)\b/);if(m)return num(m[1]);if(/\b(?:mit\s+)?(?:einem\s+)?baby\b/.test(t))return 1;return null;}
function addAge(out,v){const n=Number(v);if(Number.isInteger(n)&&n>=0&&n<=17)out.push(n);}
function parseAges(text){
 const t=norm(text),out=[];let m;
 for(const re of [/(?:kinder|kindern|kinderalter|alter der kinder)[^.!?;]{0,55}?(\d{1,2}(?:\s*(?:,|und|&|\/)\s*\d{1,2})+)(?:\s*jahre?)?/g,/(?:mit|und)\s+(\d{1,2}(?:\s*(?:,|und|&|\/)\s*\d{1,2})+)\s*jahre?(?:\s+alt)?/g]) while((m=re.exec(t))) for(const n of (m[1].match(/\d{1,2}/g)||[])) addAge(out,n);
 if(out.length)return out;
 const seg=(t.match(/\b(?:kinder|kindern|kind|babys?)\b[^.!?;]{0,80}/)||[''])[0];
 if(seg){const years=[...seg.matchAll(/(\d{1,2})\s*(?:jahre?|jahr|j\.)\b/g)].map(x=>Number(x[1]));if(years.length){years.forEach(n=>addAge(out,n));return out;}const months=seg.match(/(\d{1,2}(?:\s*(?:,|und|&|\/)\s*\d{1,2})+)\s*(?:monate?|monat)\b/);if(months){for(const _ of (months[1].match(/\d{1,2}/g)||[]))addAge(out,0);return out;}}
 const baby=t.match(/\bbaby[^.!?;]{0,24}?(\d{1,2})\s*(?:monate?|monat)\b/);if(baby){addAge(out,0);return out;}
 const one=t.match(/\b(?:kinder|kindern|kind|baby)\b[^.!?;]{0,24}?(\d{1,2})\s*(?:jahre?|jahr|j\.)\b/);if(one)addAge(out,one[1]);return out;
}
function parseFamily(text){const t=norm(text),adults=parseAdults(t),count=parseCount(t),ages=parseAges(t);const intent=count!==null||ages.length>0||/\b(?:kinder|kindern|kind|babys?|familie)\b/.test(t);if(!intent)return null;if(count===0)return{adults,count:0,ages:[],complete:true,errors:[]};const c=count===null?ages.length:count,errors=[];if(!c)errors.push('Kinderanzahl fehlt');if(ages.length!==c)errors.push(`Bitte Alter für ${c||'alle'} Kinder angeben`);if(adults&&adults+c>9)errors.push('Maximal 9 Reisende pro Suche');if(adults&&ages.filter(v=>v<=1).length>adults)errors.push('Maximal ein Kleinkind unter 2 pro Erwachsenem');return{adults,count:c,ages,complete:c>0&&ages.length===c&&!errors.length,errors};}
function state(){try{return typeof searchState!=='undefined'&&searchState?searchState:null;}catch(_){return null;}}
function refresh(){try{if(typeof updateSearchUI==='function')updateSearchUI();}catch(_){}try{if(typeof persistState==='function')persistState();}catch(_){} }
function naturalText(){return document.querySelector('#discover [data-v574-text]')?.value||document.querySelector('#discover [data-v571-text]')?.value||document.getElementById('noreyoAi556Text')?.value||'';}
function applyFamily(text=naturalText()){const f=parseFamily(text),s=state();if(!f){pendingFamily=null;return f;}if(f.complete&&s){if(f.adults)s.adults=Math.max(1,Math.min(9,f.adults));s.childAges=f.ages.slice();pendingFamily=null;refresh();return f;}pendingFamily={...f,createdAt:Date.now()};return f;}
function travellersValid(){const s=state();if(!s)return false;const a=Math.round(Number(s.adults)),ages=Array.isArray(s.childAges)?s.childAges.map(Number):[];return Number.isInteger(a)&&a>=1&&a<=9&&a+ages.length<=9&&ages.every(v=>Number.isInteger(v)&&v>=0&&v<=17)&&ages.filter(v=>v<=1).length<=a;}
function notify(msg){try{if(typeof showToast==='function')showToast(msg);else if(typeof window.toast==='function')window.toast(msg);}catch(_){} }
function openTravellers(){try{if(typeof openPlanner==='function'){openPlanner('travellers');return true;}}catch(_){}for(const q of ['.travellerInput','.travelerInput','[data-planner="travellers"]','[data-field="travellers"]']){const el=document.querySelector(q);if(el){el.click();return true;}}return false;}
function destinationOk(){const s=state();const d=String(s?.destination||s?.destinationName||'').trim();return d.length>=2;}
function datesOk(){const s=state(),a=String(s?.dateFrom||s?.startDate||''),b=String(s?.dateTo||s?.endDate||'');if(!/^\d{4}-\d{2}-\d{2}$/.test(a)||!/^\d{4}-\d{2}-\d{2}$/.test(b))return false;const da=new Date(a+'T00:00:00'),db=new Date(b+'T00:00:00'),today=new Date();today.setHours(0,0,0,0);return !Number.isNaN(+da)&&!Number.isNaN(+db)&&da>=today&&db>da;}
function mode(){const t=norm(document.querySelector('#discover .product-mode.on')?.textContent||'');return t.includes('hotel')?'hotel':t.includes('flug')?'flight':t.includes('kreuzfahrt')?'cruise':'package';}
function airportsOk(){if(mode()==='hotel'||mode()==='cruise')return true;const a=Array.isArray(state()?.airports)?state().airports.filter(Boolean):[];return a.length>=1&&a.length<=6&&a.every(x=>/^[A-Z]{3}$/.test(String(x).trim().toUpperCase()));}
function validateBeforeSearch(){if(!destinationOk())return'Bitte zuerst ein Reiseziel auswählen.';if(!datesOk())return'Bitte einen gültigen zukünftigen Reisezeitraum wählen.';if(!airportsOk())return'Bitte 1–6 gültige Abflughäfen auswählen.';if(!travellersValid())return'Bitte die Reisenden vollständig prüfen.';if(pendingFamily)return pendingFamily.errors[0]||'Bitte die Kinderalter ergänzen.';return'';}
function resultRoot(){return document.getElementById('results');}
function resultSignature(){const r=resultRoot();const offers=[...document.querySelectorAll('#offers .offer')];return offers.length+':'+offers.slice(0,2).map(x=>String(x.textContent||'').replace(/\s+/g,' ').slice(0,150)).join('|')+'#'+String(r?.textContent||'').replace(/\s+/g,' ').slice(0,180);}
let baseline='';
function releaseBusy(){if(!busy)return;busy=false;clearTimeout(busyTimer);busyTimer=0;if(busyButton){busyButton.disabled=false;busyButton.removeAttribute('aria-disabled');}busyButton=null;resultRoot()?.setAttribute('aria-busy','false');}
function beginBusy(btn){busy=true;baseline=resultSignature();busyButton=btn||null;if(btn){btn.disabled=true;btn.setAttribute('aria-disabled','true');}resultRoot()?.setAttribute('aria-busy','true');clearTimeout(busyTimer);busyTimer=setTimeout(releaseBusy,15000);}
function settled(){if(!busy)return;const r=resultRoot(),t=norm(r?.textContent||'');if(resultSignature()!==baseline||/keine (?:angebote|hotels|fluege|reisen|ergebnisse)|nichts gefunden|fehler|erneut versuchen/.test(t))releaseBusy();}
function bindResults(){const r=resultRoot();if(!r||r===observedRoot)return;if(observer)observer.disconnect();observedRoot=r;r.setAttribute('aria-live','polite');r.setAttribute('aria-busy',busy?'true':'false');observer=new MutationObserver(settled);observer.observe(r,{childList:true,subtree:true,characterData:true});}
function onSearch(e){const btn=e.target instanceof Element?e.target.closest('.liveSearchButton'):null;if(!btn)return;applyFamily(naturalText());const error=validateBeforeSearch();if(error){e.preventDefault();e.stopImmediatePropagation();notify(error);if(pendingFamily||!travellersValid())setTimeout(openTravellers,0);return;}if(busy){e.preventDefault();e.stopImmediatePropagation();return;}beginBusy(btn);}
function onPlannerSave(e){if(!pendingFamily||!(e.target instanceof Element)||!e.target.closest('.planner-save,.planner-apply,[data-planner-apply]'))return;setTimeout(()=>{if(travellersValid())pendingFamily=null;},0);}
function cleanup(){pendingFamily=null;releaseBusy();if(observer){observer.disconnect();observer=null;}observedRoot=null;}
function install(){bindResults();document.addEventListener('click',onSearch,true);document.addEventListener('click',onPlannerSave,true);const mo=new MutationObserver(bindResults);mo.observe(document.body,{childList:true,subtree:true});window.addEventListener('pagehide',cleanup,{passive:true});window.addEventListener('pageshow',()=>{releaseBusy();bindResults();},{passive:true});}
window.NOREYO_V577=Object.freeze({BUILD,parseFamily,explicitAdults,applyFamily,validateBeforeSearch,travellersValid,releaseBusy,get pendingFamily(){return pendingFamily;},get busy(){return busy;}});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();
