(function(){
'use strict';
const BUILD='6.63';
let lock=false,raf=0,observer=null;
const warmupTimers=new Set();

function setText(el,text){if(el&&el.textContent!==text)el.textContent=text;}
function trustMarkup(){return '<div class="noreyo-v541-trust" aria-label="NOREYO Vorteile"><span><i>✓</i>Live-Preisprüfung</span><span><i>✓</i>Pflichtfilter</span><span><i>✓</i>Match erklärt</span></div>';}
function cleanHero(hero){
  hero.classList.remove('noreyo-interactive-hero','noreyo-v539-hero','noreyo-v540-hero');hero.classList.add('noreyo-v541-hero');
  hero.querySelectorAll('.noreyo-priority-live,.noreyo-usp-strip,.noreyo-firstscreen-logic,.noreyo-firstscreen-note,.noreyo-v539-action,.noreyo-v540-action').forEach(el=>el.remove());
  let trust=hero.querySelector('.noreyo-v541-trust');if(!trust){hero.insertAdjacentHTML('beforeend',trustMarkup());trust=hero.querySelector('.noreyo-v541-trust');}return trust;
}
function findNativeSearchButton(card){
  const buttons=[...card.querySelectorAll('button')].filter(b=>!b.dataset.noreyoSynthetic);
  const byText=buttons.find(b=>/urlaub\s*finden|reise[n]?\s*(finden|suchen)|angebote?\s*(finden|suchen)|jetzt\s*suchen|^suchen$/i.test((b.textContent||'').replace(/\s+/g,' ').trim()));
  return byText||buttons.find(b=>b.classList.contains('dark-btn')||b.classList.contains('primary-btn')||b.classList.contains('search-btn'))||null;
}
function markGridItems(grid){[...grid.children].filter(el=>el?.classList&&(el.classList.contains('command-cell')||!!el.querySelector('.command-cell'))).forEach((item,index)=>{item.classList.toggle('noreyo-v541-main-cell',index<4);item.classList.toggle('noreyo-v541-extra-cell',index>=4);});}
function adoptNativeBookingCTA(card){
  if(!card)return;card.querySelectorAll('.noreyo-v541-search-note').forEach(el=>el.remove());card.querySelectorAll('.noreyo-v541-booking-cta[data-noreyo-synthetic="1"]').forEach(el=>el.remove());
  let btn=card.querySelector('.noreyo-v541-booking-cta[data-noreyo-native="1"]');
  if(!btn){btn=findNativeSearchButton(card);if(!btn)return;btn.dataset.noreyoNative='1';btn.classList.add('noreyo-v541-booking-cta');}
  if((btn.textContent||'').replace(/\s+/g,' ').trim()!=='Passende Reisen finden →')btn.innerHTML='<span>Passende Reisen finden</span><span aria-hidden="true">→</span>';
  const grid=card.querySelector('.booking-command-grid');if(!grid)return;markGridItems(grid);if(btn.parentElement!==grid)grid.appendChild(btn);btn.classList.add('noreyo-v541-cta-grid-item');
}
function preferenceScore(o){
  if(typeof states==='undefined')return 0;
  const checks=[['Zimmer0',x=>x.confirmed?.balcony===true],['Zimmer1',x=>x.confirmed?.seaView===true],['Zimmer2',x=>x.confirmed?.terrace===true],['Hotel0',x=>Number(x.stars||0)>=4],['Hotel4',x=>x.confirmed?.spa===true],['Hotel5',x=>x.confirmed?.fitness===true],['Hotel6',x=>x.confirmed?.breakfast===true],['Hotel7',x=>x.confirmed?.allInclusive===true],['Preis2',x=>x.refundable===true]];
  let score=0;for(const [key,test] of checks){const state=states[key]||'any';if(state!=='any'&&test(o))score+=state==='must'?6:2;}return score;
}
function installSoftWishRanking(){
  if(typeof filterAndRankOffers!=='function'||filterAndRankOffers.__noreyoSoftWish)return;
  const prior=filterAndRankOffers;
  const wrapped=function(input){
    if(typeof states==='undefined')return prior.apply(this,arguments);
    const wishKeys=Object.keys(states).filter(k=>states[k]==='wish');if(!wishKeys.length)return prior.apply(this,arguments);
    const saved=wishKeys.map(k=>[k,states[k]]);let out;
    try{wishKeys.forEach(k=>{states[k]='any';});out=prior.apply(this,arguments);}finally{saved.forEach(([k,v])=>{states[k]=v;});}
    if(Array.isArray(out))out.sort((a,b)=>{const sd=preferenceScore(b)-preferenceScore(a);if(sd)return sd;const rb=Number(String(b?.rating||0).replace(',','.'))||0,ra=Number(String(a?.rating||0).replace(',','.'))||0;if(rb!==ra)return rb-ra;return (Number(a?.price)||Infinity)-(Number(b?.price)||Infinity);});
    return out;
  };
  wrapped.__noreyoSoftWish=true;filterAndRankOffers=wrapped;
}
function validISODate(value){const s=String(value||'');if(!/^\d{4}-\d{2}-\d{2}$/.test(s))return false;const d=new Date(s+'T12:00:00');return !Number.isNaN(d.getTime())&&d.getFullYear()===Number(s.slice(0,4))&&d.getMonth()+1===Number(s.slice(5,7))&&d.getDate()===Number(s.slice(8,10));}
function normalizeChildren(value){return (Array.isArray(value)?value:[]).map(v=>Number(v)).filter(Number.isFinite).map(v=>Math.max(0,Math.min(17,Math.round(v)))).slice(0,4);}
function sanitizeClientSearchState(){
  if(typeof searchState==='undefined'||!searchState)return;
  const adults=Math.round(Number(searchState.adults));searchState.adults=Number.isFinite(adults)?Math.max(1,Math.min(6,adults)):2;
  searchState.childAges=normalizeChildren(searchState.childAges);
  searchState.airports=(Array.isArray(searchState.airports)?searchState.airports:[]).map(x=>String(x||'').trim().toUpperCase()).filter((x,i,a)=>/^[A-Z]{3}$/.test(x)&&a.indexOf(x)===i);
  if(!validISODate(searchState.checkin)&&typeof tomorrowISO==='function')searchState.checkin=tomorrowISO();
  if(!validISODate(searchState.checkout)||String(searchState.checkout)<=String(searchState.checkin)){if(typeof nextDayISO==='function')searchState.checkout=nextDayISO(searchState.checkin);}
  try{persistState?.();}catch(_){ }
}
function destinationFallbackIata(){try{const key=typeof normalizeLookup==='function'?normalizeLookup(dest):String(dest||'').trim().toLowerCase();return String(destinationIata?.[key]||destinationIata?.[String(dest||'').toLowerCase()]||'').toUpperCase();}catch(_){return'';}}
function sanitizeHotelBody(raw){
  const body={...(raw||{})},occ=Array.isArray(body.occupancies)&&body.occupancies.length?body.occupancies[0]:{};
  const adults=Math.max(1,Math.min(6,Math.round(Number(occ?.adults ?? (typeof searchState!=='undefined'?searchState.adults:2))||2)));
  const children=normalizeChildren(Array.isArray(occ?.children)?occ.children:(typeof searchState!=='undefined'?searchState.childAges:[]));
  body.occupancies=[{adults,children}];body.currency='EUR';body.guestNationality='DE';
  if(!validISODate(body.checkin)&&typeof searchState!=='undefined'&&validISODate(searchState.checkin))body.checkin=searchState.checkin;
  if(!validISODate(body.checkout)&&typeof searchState!=='undefined'&&validISODate(searchState.checkout))body.checkout=searchState.checkout;
  if(Array.isArray(body.hotelIds)){body.hotelIds=body.hotelIds.map(x=>String(x||'').trim()).filter(Boolean).slice(0,20);if(!body.hotelIds.length)delete body.hotelIds;}
  if(!body.hotelIds?.length){let iata=String(body.iataCode||'').trim().toUpperCase();if(!/^[A-Z]{3}$/.test(iata))iata=destinationFallbackIata();if(/^[A-Z]{3}$/.test(iata))body.iataCode=iata;}
  return body;
}
function minimalHotelBody(body){
  const clean=sanitizeHotelBody(body);if(!validISODate(clean.checkin)||!validISODate(clean.checkout)||String(clean.checkout)<=String(clean.checkin))return null;
  const minimal={occupancies:clean.occupancies,currency:'EUR',guestNationality:'DE',checkin:clean.checkin,checkout:clean.checkout,includeHotelData:true,roomMapping:true,maxRatesPerHotel:Math.max(1,Math.min(10,Math.round(Number(clean.maxRatesPerHotel)||3))),limit:Math.max(1,Math.min(100,Math.round(Number(clean.limit)||40)))};
  if(clean.hotelIds?.length)minimal.hotelIds=clean.hotelIds;else if(/^[A-Z]{3}$/.test(String(clean.iataCode||'')))minimal.iataCode=clean.iataCode;else return null;return minimal;
}
function installHotelRequestGuard(){
  if(window.fetch?.__noreyoHotelGuard)return;const nativeFetch=window.fetch.bind(window);
  const guarded=async function(input,init){
    const url=typeof input==='string'?input:String(input?.url||'');if(!url.includes('/functions/v1/search-travel')||typeof init?.body!=='string')return nativeFetch(input,init);
    let raw;try{raw=JSON.parse(init.body);}catch(_){return nativeFetch(input,init);}if(raw?.action)return nativeFetch(input,init);
    const clean=sanitizeHotelBody(raw);let response=await nativeFetch(input,{...init,body:JSON.stringify(clean)});if(response.ok)return response;
    let message='';try{const payload=await response.clone().json();message=String(payload?.error?.message||payload?.message||'');}catch(_){ }
    if(!/required request field|wrong input|missing/i.test(message))return response;
    const retry=minimalHotelBody(clean);if(!retry)return response;console.warn('NOREYO V6.63: retrying hotel search with sanitized request');return nativeFetch(input,{...init,body:JSON.stringify(retry)});
  };
  guarded.__noreyoHotelGuard=true;window.fetch=guarded;
}
function enforce(){
  if(lock)return;lock=true;
  try{
    const discover=document.getElementById('discover');if(!discover)return;const hero=discover.querySelector('.hero');if(!hero)return;
    const isFlight=typeof productMode!=='undefined'&&productMode==='flight';if(isFlight){hero.classList.remove('noreyo-v541-hero');hero.querySelector('.noreyo-v541-trust')?.remove();return;}
    cleanHero(hero);const signet=hero.querySelector('.hero-signet');if(signet&&signet.textContent.trim()!=='NOREYO MATCH')signet.innerHTML='<span></span>NOREYO MATCH';
    const copy=hero.querySelector('.hero-copy');if(copy){setText(copy.querySelector('.hero-kicker'),'TRAVEL MADE FOR YOU');setText(copy.querySelector('h1'),'Dein Urlaub. Nach deinen Regeln.');setText(copy.querySelector('p'),'Sag uns, was wirklich zählt. NOREYO zeigt dir zuerst die Reisen, die wirklich zu dir passen.');}
    discover.querySelectorAll('.search-console-head').forEach(head=>{setText(head.querySelector('span'),'DEINE REISE');setText(head.querySelector('b'),'Ziel, Zeitraum & Reisende festlegen');});adoptNativeBookingCTA(discover.querySelector('.search-card'));
  }finally{lock=false;}
}
function schedule(){if(raf)return;raf=requestAnimationFrame(()=>{raf=0;enforce();});}
function mutationRelevant(records){for(const r of records)for(const n of r.addedNodes||[]){if(n.nodeType!==1)continue;if(n.matches?.('.hero,.search-card,.booking-command-grid,.product-switch-host')||n.querySelector?.('.hero,.search-card,.booking-command-grid,.product-switch-host'))return true;}return false;}
function scheduleWarmup(delay){const id=setTimeout(()=>{warmupTimers.delete(id);enforce();},delay);warmupTimers.add(id);return id;}
function clearWarmups(){warmupTimers.forEach(clearTimeout);warmupTimers.clear();}
function installObserver(){const discover=document.getElementById('discover');if(!discover||observer||typeof MutationObserver==='undefined')return;observer=new MutationObserver(records=>{if(!lock&&mutationRelevant(records))schedule();});observer.observe(discover,{childList:true,subtree:true});}
function installCoreHooks(){
  try{
    if(typeof renderProductControls==='function'&&!renderProductControls.__noreyoV663){const base=renderProductControls,wrapped=function(){const r=base.apply(this,arguments);schedule();return r;};wrapped.__noreyoV663=true;renderProductControls=wrapped;}
    if(typeof updateCounts==='function'&&!updateCounts.__noreyoV663){const base=updateCounts,wrapped=function(){const r=base.apply(this,arguments);schedule();return r;};wrapped.__noreyoV663=true;updateCounts=wrapped;}
    if(typeof go==='function'&&!go.__noreyoV663){const base=go,wrapped=function(id){const r=base.apply(this,arguments);if(id==='discover')schedule();return r;};wrapped.__noreyoV663=true;go=wrapped;}
  }catch(e){console.warn('NOREYO V6.63 hooks',e);}
}
function warmup(){clearWarmups();scheduleWarmup(80);scheduleWarmup(220);scheduleWarmup(500);}
function cleanup(){if(observer){observer.disconnect();observer=null;}if(raf){cancelAnimationFrame(raf);raf=0;}clearWarmups();}

sanitizeClientSearchState();installHotelRequestGuard();installSoftWishRanking();installCoreHooks();enforce();warmup();installObserver();
window.addEventListener('pagehide',cleanup,{passive:true});
window.addEventListener('pageshow',()=>{sanitizeClientSearchState();installCoreHooks();schedule();warmup();installObserver();},{passive:true});
window.NOREYO_V541=Object.freeze({BUILD,validISODate,normalizeChildren,sanitizeClientSearchState,sanitizeHotelBody,minimalHotelBody,mutationRelevant,cleanup,get warmupCount(){return warmupTimers.size;},get observing(){return !!observer;}});
})();