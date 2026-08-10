/* NOREYO V5.85 — unified search safety on current V5.84 mainline */
(function(){
'use strict';
const BUILD='5.85';
const MAX_ADULTS=6,MAX_CHILDREN=4,MAX_TRAVELLERS=9;
let pendingFamily=null,adultSnapshot=null,lastNaturalText='';
let busy=false,busyButton=null,busyTimer=0,resultObserver=null,rootObserver=null,observedRoot=null,baseline='';

function norm(v){return String(v||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/ß/g,'ss');}
function num(v){const m={ein:1,eine:1,einen:1,einem:1,einer:1,zwei:2,drei:3,vier:4,fuenf:5,funf:5,sechs:6,sieben:7,acht:8,neun:9};const s=norm(v).trim();return /^\d+$/.test(s)?Number(s):(m[s]??null);}
function state(){try{return typeof searchState!=='undefined'&&searchState?searchState:null;}catch(_){return null;}}
function refresh(){try{if(typeof updateSearchUI==='function')updateSearchUI();}catch(_){}try{if(typeof persistState==='function')persistState();}catch(_){}}
function naturalText(){return document.querySelector('#discover [data-v574-text]')?.value||document.querySelector('#discover [data-v571-text]')?.value||document.getElementById('noreyoAi556Text')?.value||'';}
function explicitAdults(text){const t=norm(text);return /\bzu zweit\b/.test(t)||/\b(?:[1-9]|ein(?:e|en|em|er)?|zwei|drei|vier|fuenf|funf|sechs|sieben|acht|neun)\s+(?:erwachsen(?:e|er|en)?|personen?|reisende)\b/.test(t);}
function parseAdults(text){const t=norm(text);let m=t.match(/\b([1-9]|ein(?:e|en|em|er)?|zwei|drei|vier|fuenf|funf|sechs|sieben|acht|neun)\s+(?:erwachsen(?:e|er|en)?|personen?|reisende)\b/);if(m)return num(m[1]);if(/\bzu zweit\b/.test(t))return 2;return null;}
function noChildren(text){const t=norm(text);return /\b(?:ohne|keine|kein)\s+(?:kinder|kind|babys?|sohn|tochter)\b/.test(t)||/\bnur\s+erwachsene\b/.test(t);}
function parseCount(text){const t=norm(text);if(noChildren(t))return 0;let m=t.match(/\b([1-8]|ein(?:e|en|em|er)?|zwei|drei|vier|fuenf|funf|sechs|sieben|acht)\s+(?:kinder|kindern|kind|babys?)\b/);if(m)return num(m[1]);if(/\b(?:mit\s+)?(?:einem\s+)?baby\b/.test(t))return 1;return null;}
function addAge(out,v){const n=Number(v);if(Number.isInteger(n)&&n>=0&&n<=17)out.push(n);}
function parseAges(text){
 const t=norm(text),out=[];let m;
 for(const re of [/(?:kinder|kindern|kinderalter|alter der kinder)[^.!?;]{0,55}?(\d{1,2}(?:\s*(?:,|und|&|\/)\s*\d{1,2})+)(?:\s*jahre?)?/g,/(?:mit|und)\s+(\d{1,2}(?:\s*(?:,|und|&|\/)\s*\d{1,2})+)\s*jahre?(?:\s+alt)?/g]){
   while((m=re.exec(t)))for(const n of(m[1].match(/\d{1,2}/g)||[]))addAge(out,n);
 }
 if(out.length)return out;
 const seg=(t.match(/\b(?:kinder|kindern|kind|babys?)\b[^.!?;]{0,80}/)||[''])[0];
 if(seg){
   const years=[...seg.matchAll(/(\d{1,2})\s*(?:jahre?|jahr|j\.)\b/g)].map(x=>Number(x[1]));
   if(years.length){years.forEach(n=>addAge(out,n));return out;}
   const months=seg.match(/(\d{1,2}(?:\s*(?:,|und|&|\/)\s*\d{1,2})+)\s*(?:monate?|monat)\b/);
   if(months){for(const _ of(months[1].match(/\d{1,2}/g)||[]))addAge(out,0);return out;}
 }
 const baby=t.match(/\bbaby[^.!?;]{0,24}?(\d{1,2})\s*(?:monate?|monat)\b/);if(baby){addAge(out,0);return out;}
 const one=t.match(/\b(?:kinder|kindern|kind|baby)\b[^.!?;]{0,24}?(\d{1,2})\s*(?:jahre?|jahr|j\.)\b/);if(one)addAge(out,one[1]);
 return out;
}
function parseFamily(text){
 const t=norm(text),adults=parseAdults(t),count=parseCount(t),ages=parseAges(t);
 const intent=count!==null||ages.length>0||/\b(?:kinder|kindern|kind|babys?|familie)\b/.test(t);
 if(!intent)return null;
 if(count===0)return{adults,count:0,ages:[],complete:true,errors:[]};
 const c=count===null?ages.length:count,errors=[];
 if(!c)errors.push('Kinderanzahl fehlt');
 if(c>MAX_CHILDREN)errors.push(`Aktuell sind maximal ${MAX_CHILDREN} Kinder pro Suche möglich.`);
 if(ages.length!==c)errors.push(`Bitte Alter für ${c||'alle'} Kinder angeben`);
 if(adults&&adults>MAX_ADULTS)errors.push(`Aktuell sind maximal ${MAX_ADULTS} Erwachsene pro Suche möglich.`);
 if(adults&&adults+c>MAX_TRAVELLERS)errors.push(`Aktuell sind maximal ${MAX_TRAVELLERS} Reisende pro Suche möglich.`);
 if(adults&&ages.filter(v=>v<=1).length>adults)errors.push('Pro Erwachsenen kann maximal ein Kleinkind unter 2 Jahren berücksichtigt werden.');
 return{adults,count:c,ages,complete:c>0&&ages.length===c&&!errors.length,errors};
}
function familySatisfiedByState(f){
 const s=state();if(!f||!s||f.complete)return false;
 const a=Math.round(Number(s.adults)),ages=Array.isArray(s.childAges)?s.childAges.map(Number):[];
 if(!Number.isInteger(a)||a<1||a>MAX_ADULTS)return false;
 if(f.adults&&a!==f.adults)return false;
 if(!f.count||ages.length!==f.count)return false;
 return ages.length<=MAX_CHILDREN&&a+ages.length<=MAX_TRAVELLERS&&ages.every(v=>Number.isInteger(v)&&v>=0&&v<=17)&&ages.filter(v=>v<=1).length<=a;
}
function applyFamily(text=naturalText()){
 const f=parseFamily(text),s=state();
 if(!f){pendingFamily=null;return f;}
 if(f.complete&&s){
   if(f.adults)s.adults=f.adults;
   s.childAges=f.ages.slice();
   pendingFamily=null;refresh();return f;
 }
 if(familySatisfiedByState(f)){pendingFamily=null;return f;}
 pendingFamily={...f,createdAt:Date.now()};return f;
}
function occupancyError(){
 const s=state();if(!s)return'';
 const adults=Math.round(Number(s.adults)),ages=Array.isArray(s.childAges)?s.childAges.map(Number):[];
 if(!Number.isInteger(adults)||adults<1)return'Bitte mindestens einen Erwachsenen auswählen.';
 if(adults>MAX_ADULTS)return`Aktuell sind maximal ${MAX_ADULTS} Erwachsene pro Suche möglich.`;
 if(ages.length>MAX_CHILDREN)return`Aktuell sind maximal ${MAX_CHILDREN} Kinder pro Suche möglich.`;
 if(adults+ages.length>MAX_TRAVELLERS)return`Aktuell sind maximal ${MAX_TRAVELLERS} Reisende pro Suche möglich.`;
 if(ages.some(v=>!Number.isInteger(v)||v<0||v>17))return'Bitte alle Kinderalter zwischen 0 und 17 Jahren prüfen.';
 if(ages.filter(v=>v<=1).length>adults)return'Pro Erwachsenen kann maximal ein Kleinkind unter 2 Jahren berücksichtigt werden.';
 return'';
}
function validateFamily(){
 const oe=occupancyError();if(oe)return oe;
 if(pendingFamily&&!familySatisfiedByState(pendingFamily))return pendingFamily.errors[0]||'Bitte die Kinderalter ergänzen.';
 if(pendingFamily&&familySatisfiedByState(pendingFamily))pendingFamily=null;
 return'';
}

function mode(){
 const active=document.querySelector('.view.active .product-mode.on')||document.querySelector('#discover .product-mode.on');
 const t=norm(active?.textContent||'');
 if(t.includes('kreuzfahrt'))return'cruise';
 if(t.includes('hotel'))return'hotel';
 if(t.includes('flug'))return'flight';
 try{if(typeof productMode==='string'&&productMode)return productMode;}catch(_){}
 return'package';
}
function validISO(value){
 const s=String(value||'');if(!/^\d{4}-\d{2}-\d{2}$/.test(s))return false;
 const d=new Date(s+'T12:00:00');
 return !Number.isNaN(d.getTime())&&d.getFullYear()===Number(s.slice(0,4))&&d.getMonth()+1===Number(s.slice(5,7))&&d.getDate()===Number(s.slice(8,10));
}
function todayISO(){const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');}
function destinationPresent(){try{return typeof dest!=='undefined'&&String(dest||'').trim().length>=2;}catch(_){return false;}}
function airportsValid(){
 const s=state(),arr=Array.isArray(s?.airports)?s.airports:[];
 return arr.length>=1&&arr.length<=5&&arr.every(x=>/^[A-Z]{3}$/.test(String(x||'').trim().toUpperCase()));
}
function coreSearchError(){
 const m=mode(),s=state();if(m==='cruise')return'';
 if(!destinationPresent())return'Bitte zuerst ein Reiseziel auswählen.';
 const checkin=String(s?.checkin||''),checkout=String(s?.checkout||'');
 if(!validISO(checkin)||!validISO(checkout))return'Bitte einen gültigen Reisezeitraum auswählen.';
 if(checkin<todayISO())return'Das Abreisedatum liegt in der Vergangenheit. Bitte den Zeitraum aktualisieren.';
 if(checkout<=checkin)return'Das Rückreisedatum muss nach dem Abreisedatum liegen.';
 if((m==='package'||m==='flight')&&!airportsValid())return'Bitte mindestens einen gültigen Abflughafen auswählen.';
 return'';
}
function plannerKind(error){
 const t=norm(error);
 if(t.includes('reiseziel'))return'destination';
 if(t.includes('abflughafen'))return'airports';
 if(t.includes('zeitraum')||t.includes('abreise')||t.includes('rueckreise'))return'dates';
 return'travellers';
}
function openPlannerFor(kind){
 try{if(typeof openPlanner==='function'){openPlanner(kind);return;}}catch(_){}
 const map={
  destination:['.destInput','.destinationInput','[data-field="destination"]'],
  dates:['.dateInput','[data-field="dates"]'],
  airports:['.airportInput','[data-field="airports"]'],
  travellers:['.travellerInput','.travelerInput','[data-field="travellers"]']
 };
 for(const q of map[kind]||[]){const el=document.querySelector(q);if(el){el.click();return;}}
}
function notify(msg){try{if(typeof showToast==='function')showToast(msg);else if(typeof window.toast==='function')window.toast(msg);}catch(_){} }

function searchButton(target){
 if(!(target instanceof Element))return null;
 return target.closest('.noreyo-v541-booking-cta,.liveSearchButton,#searchView .search-card .primary');
}
function resultRoot(){return document.getElementById('results');}
function signature(){const offers=[...document.querySelectorAll('#offers .offer')];return offers.length+':'+offers.slice(0,3).map(x=>String(x.textContent||'').replace(/\s+/g,' ').slice(0,180)).join('|');}
function terminal(){const t=norm(resultRoot()?.textContent||'');return /keine (?:angebote|hotels|fluege|reisen|ergebnisse)|nichts gefunden|suche fehlgeschlagen|fehler bei der suche|erneut versuchen/.test(t);}
function releaseBusy(){
 if(!busy)return;
 busy=false;clearTimeout(busyTimer);busyTimer=0;
 if(busyButton){busyButton.disabled=false;busyButton.removeAttribute('aria-disabled');}
 busyButton=null;resultRoot()?.setAttribute('aria-busy','false');
}
function beginBusy(btn){
 busy=true;baseline=signature();busyButton=btn||null;
 resultRoot()?.setAttribute('aria-busy','true');
 setTimeout(()=>{if(busy&&busyButton===btn&&btn){btn.disabled=true;btn.setAttribute('aria-disabled','true');}},0);
 clearTimeout(busyTimer);busyTimer=setTimeout(releaseBusy,15000);
}
function bindResults(){
 const r=resultRoot();if(!r||r===observedRoot)return;
 if(resultObserver)resultObserver.disconnect();
 observedRoot=r;r.setAttribute('aria-live','polite');r.setAttribute('aria-busy',busy?'true':'false');
 resultObserver=new MutationObserver(()=>{if(busy&&(signature()!==baseline||terminal()))releaseBusy();});
 resultObserver.observe(r,{childList:true,subtree:true,characterData:true});
}
function onSearchCapture(e){
 const btn=searchButton(e.target);if(!btn)return;
 const text=naturalText(),signatureText=norm(text).trim();
 if(signatureText&&signatureText!==lastNaturalText){applyFamily(text);lastNaturalText=signatureText;}
 const error=validateFamily()||coreSearchError();
 if(error){
   e.preventDefault();e.stopImmediatePropagation();notify(error);
   setTimeout(()=>openPlannerFor(plannerKind(error)),0);
   return;
 }
 if(busy){e.preventDefault();e.stopImmediatePropagation();return;}
 beginBusy(btn);
}
function onAiApplyCapture(e){
 const btn=e.target instanceof Element?e.target.closest('.noreyo-v556-apply'):null;if(!btn)return;
 const text=naturalText(),s=state();
 adultSnapshot=!explicitAdults(text)&&Number.isInteger(Math.round(Number(s?.adults)))?Math.round(Number(s.adults)):null;
 setTimeout(()=>{
   applyFamily(text);lastNaturalText=norm(text).trim();
   if(adultSnapshot&&s&&Math.round(Number(s.adults))!==adultSnapshot){s.adults=adultSnapshot;refresh();}
   adultSnapshot=null;
 },0);
}
function attachRootObserver(){
 if(rootObserver||typeof MutationObserver==='undefined'||!document.body)return;
 rootObserver=new MutationObserver(()=>{
   const r=resultRoot();
   if(r!==observedRoot){observedRoot=null;bindResults();}
 });
 rootObserver.observe(document.body,{childList:true,subtree:true});
}
function cleanup(){
 releaseBusy();adultSnapshot=null;
 if(resultObserver){resultObserver.disconnect();resultObserver=null;}
 if(rootObserver){rootObserver.disconnect();rootObserver=null;}
 observedRoot=null;
}
function restore(){releaseBusy();bindResults();attachRootObserver();}
function install(){
 bindResults();attachRootObserver();
 window.addEventListener('click',onSearchCapture,true);
 document.addEventListener('click',onAiApplyCapture,true);
 window.addEventListener('pagehide',cleanup,{passive:true});
 window.addEventListener('pageshow',restore,{passive:true});
}
window.NOREYO_V585=Object.freeze({
 BUILD,MAX_ADULTS,MAX_CHILDREN,MAX_TRAVELLERS,parseFamily,applyFamily,occupancyError,validateFamily,
 coreSearchError,validISO,airportsValid,releaseBusy,get busy(){return busy;},get pendingFamily(){return pendingFamily;}
});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();