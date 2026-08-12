/* NOREYO V11.06 — server-side hotel PREBOOK availability/final-price check.
   Adds the first real hotel checkout-session step after tariff selection. The browser
   sends only offerId to Supabase; LiteAPI credentials stay server-side. No payment or
   guest PII is collected here. */
(function(){
'use strict';
const BUILD='11.06';
const ENDPOINT='https://fcvffslhnaqlwitaeers.supabase.co/functions/v1/hotel-prebook';
const TIMEOUT_MS=25000;
let current=null,inflight=null,observer=null,raf=0;
const priorRender=window.renderDetail;

function key(){
  try{
    if(typeof providerAnon!=='undefined'&&providerAnon)return String(providerAnon);
    if(typeof anonKey!=='undefined'&&anonKey)return String(anonKey);
  }catch(_){}
  return'';
}
function offerId(o=current){return String(o?.selectedOfferId||o?.offerId||'').trim();}
function context(o=current){
  let s={};try{s=typeof searchState!=='undefined'&&searchState?searchState:{};}catch(_){}
  return{
    checkin:String(o?.checkin||s.checkin||''),
    checkout:String(o?.checkout||s.checkout||''),
    adults:Number(o?.adults??s.adults)||1,
    childAges:Array.isArray(o?.childAges)?o.childAges.map(Number):Array.isArray(s.childAges)?s.childAges.map(Number):[]
  };
}
function sameContext(a,b){return !!a&&!!b&&a.checkin===b.checkin&&a.checkout===b.checkout&&a.adults===b.adults&&JSON.stringify(a.childAges||[])===JSON.stringify(b.childAges||[]);}
function snapshot(){return window.NOREYO_HOTEL_PREBOOK||null;}
function clear(){
  if(!snapshot())return false;
  try{delete window.NOREYO_HOTEL_PREBOOK;}catch(_){window.NOREYO_HOTEL_PREBOOK=undefined;}
  return true;
}
function sameOffer(){const s=snapshot(),id=offerId();return !!s&&!!id&&s.offerId===id&&sameContext(s.context,context());}
function finite(v){const n=Number(v);return Number.isFinite(n)&&n>=0?n:null;}
function firstFinite(...values){for(const v of values){const n=finite(v);if(n!==null)return n;}return null;}
function prebookId(payload){
  return String(payload?.prebookId||payload?.data?.prebookId||payload?.prebook?.prebookId||payload?.data?.prebook?.prebookId||'').trim();
}
function price(payload){
  return firstFinite(
    payload?.price,
    payload?.total,
    payload?.data?.price,
    payload?.data?.total,
    payload?.pricing?.total,
    payload?.pricing?.display?.total,
    payload?.data?.pricing?.total,
    payload?.data?.pricing?.display?.total
  );
}
function currency(payload){
  return String(
    payload?.currency||
    payload?.data?.currency||
    payload?.pricing?.currency||
    payload?.pricing?.display?.currency||
    payload?.data?.pricing?.currency||
    current?.currency||'EUR'
  ).trim().toUpperCase().slice(0,3)||'EUR';
}
function money(value,cur='EUR'){
  if(value===null)return'Finalpreis vom Anbieter bestätigt';
  try{return new Intl.NumberFormat('de-DE',{style:'currency',currency:/^[A-Z]{3}$/.test(cur)?cur:'EUR',maximumFractionDigits:2}).format(value);}
  catch(_){return `${value} ${cur}`;}
}
function message(payload,status){
  return String(payload?.error?.message||payload?.message||
    (status===409?'Dieser Tarif ist nicht mehr aktuell. Bitte wähle einen neuen Live-Tarif.':
     `Tarifprüfung konnte nicht abgeschlossen werden (HTTP ${status}).`));
}
async function prebook(){
  const id=offerId();
  if(!id)throw new Error('Bitte zuerst einen aktuellen Hoteltarif auswählen.');
  const token=key();
  if(!token)throw new Error('NOREYO konnte die sichere Tarifprüfung nicht initialisieren.');
  if(inflight?.offerId===id)return inflight.promise;
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),TIMEOUT_MS);
  const promise=(async()=>{
    try{
      const res=await fetch(ENDPOINT,{
        method:'POST',
        headers:{'Content-Type':'application/json','apikey':token,'Authorization':`Bearer ${token}`},
        body:JSON.stringify({offerId:id}),
        signal:controller.signal
      });
      let payload={};try{payload=await res.json();}catch(_){}
      if(!res.ok)throw Object.assign(new Error(message(payload,res.status)),{status:res.status,payload});
      const route=String(res.headers?.get?.('X-Noreyo-Provider-Route')||'').trim();
      if(route&&route!=='hotels/prebook')throw Object.assign(new Error('Die Tarifprüfung kam aus einer unerwarteten Providerroute.'),{status:502,code:'PROVIDER_ROUTE_MISMATCH'});
      if(offerId()!==id)throw Object.assign(new Error('Der ausgewählte Hoteltarif hat sich während der Prüfung geändert.'),{code:'STALE_TARIFF'});
      const pid=prebookId(payload);
      if(!pid)throw new Error('Der Anbieter hat keine gültige Checkout-Session zurückgegeben.');
      const snap=Object.freeze({offerId:id,context:Object.freeze(context()),prebookId:pid,checkedAt:new Date().toISOString(),price:price(payload),currency:currency(payload)});
      window.NOREYO_HOTEL_PREBOOK=snap;
      return snap;
    }finally{
      clearTimeout(timer);
      if(inflight?.offerId===id)inflight=null;
    }
  })();
  inflight={offerId:id,promise,controller};
  return promise;
}
function text(el,value){if(el)el.textContent=value;}
function stateBox(){
  const host=document.querySelector('#detailContent .detail-body');
  if(!host)return null;
  let box=host.querySelector('.noreyo-v1106-prebook');
  if(!box){
    box=document.createElement('section');
    box.className='detail-section noreyo-v1106-prebook';
    box.innerHTML='<div class="detail-section-head"><h2>Tarif final prüfen</h2><small>vor Buchung</small></div><div class="backend-note noreyo-v1106-status"><b>Live-Tarif ausgewählt</b><p>Prüfe Preis und Verfügbarkeit direkt beim Anbieter. Dabei wird noch nichts bezahlt.</p></div><button type="button" class="dark-btn noreyo-v1106-action">Preis & Verfügbarkeit final prüfen</button>';
    host.appendChild(box);
  }
  return box;
}
function render(){
  raf=0;
  if(!current||current.live!==true||!offerId())return false;
  const box=stateBox();if(!box)return false;
  const btn=box.querySelector('.noreyo-v1106-action'),status=box.querySelector('.noreyo-v1106-status');
  if(sameOffer()){
    const snap=snapshot();
    if(status){status.innerHTML='';const b=document.createElement('b'),p=document.createElement('p');text(b,'Tarif live bestätigt');text(p,`${money(snap.price,snap.currency)} · Checkout-Session sicher erstellt. Es wurde noch nichts bezahlt.`);status.append(b,p);}
    if(btn){btn.disabled=false;text(btn,'Tarif erneut prüfen');}
  }
  return true;
}
function schedule(){if(!raf)raf=requestAnimationFrame(render);}
async function onClick(e){
  const btn=e.target?.closest?.('.noreyo-v1106-action');if(!btn)return;
  e.preventDefault();e.stopPropagation();
  const box=stateBox(),status=box?.querySelector('.noreyo-v1106-status');
  btn.disabled=true;text(btn,'Tarif wird live geprüft …');
  if(status){status.innerHTML='';const b=document.createElement('b'),p=document.createElement('p');text(b,'Live-Prüfung läuft');text(p,'NOREYO bestätigt den ausgewählten Tarif direkt beim Anbieter.');status.append(b,p);}
  try{
    const snap=await prebook();
    if(status){status.innerHTML='';const b=document.createElement('b'),p=document.createElement('p');text(b,'Tarif live bestätigt');text(p,`${money(snap.price,snap.currency)} · Checkout-Session sicher erstellt. Es wurde noch nichts bezahlt.`);status.append(b,p);}
    text(btn,'Tarif erneut prüfen');
  }catch(error){
    if(error?.status===409)clear();
    if(status){status.innerHTML='';const b=document.createElement('b'),p=document.createElement('p');text(b,'Tarifprüfung nicht abgeschlossen');text(p,String(error?.message||error));status.append(b,p);}
    text(btn,'Erneut prüfen');
  }finally{btn.disabled=false;}
}
if(typeof priorRender==='function'){
  window.renderDetail=function(o,...args){
    const nextId=String(o?.selectedOfferId||o?.offerId||'').trim();
    if(snapshot()&&(snapshot().offerId!==nextId||!sameContext(snapshot().context,context(o))))clear();
    current=o||null;
    const result=priorRender.call(this,o,...args);
    schedule();
    return result;
  };
}
function observe(){
  if(observer){observer.disconnect();observer=null;}
  if(typeof MutationObserver==='undefined'||!document.body)return false;
  observer=new MutationObserver(schedule);observer.observe(document.body,{subtree:true,childList:true});
  document.addEventListener('click',onClick,true);schedule();return true;
}
function cleanup(){
  if(observer){observer.disconnect();observer=null;}
  document.removeEventListener('click',onClick,true);
  if(raf){cancelAnimationFrame(raf);raf=0;}
  try{inflight?.controller?.abort?.();}catch(_){}
  inflight=null;
}
observe();
window.addEventListener('pagehide',cleanup,{passive:true});
window.addEventListener('pageshow',observe,{passive:true});
window.NOREYO_V1106=Object.freeze({BUILD,ENDPOINT,TIMEOUT_MS,key,offerId,context,sameContext,snapshot,clear,sameOffer,finite,firstFinite,prebookId,price,currency,money,message,prebook,stateBox,render,schedule,observe,cleanup});
})();