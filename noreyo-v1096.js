/* NOREYO V10.96 — verified flight price-delta clarity.
   LiteAPI recommends surfacing verify changes clearly. When the verified total differs
   from the selected search price, show old and new values plus the absolute delta. */
(function(){
'use strict';
const BUILD='10.96';
let observer=null,raf=0;
function selected(){return window.NOREYO_SELECTED_FLIGHT||null;}
function verified(){return window.NOREYO_VERIFIED_FLIGHT||null;}
function finite(v){const n=Number(v);return Number.isFinite(n)&&n>=0?n:null;}
function delta(){const oldPrice=finite(selected()?.price),newPrice=finite(verified()?.price);if(oldPrice===null||newPrice===null)return null;return{oldPrice,newPrice,difference:Math.round((newPrice-oldPrice)*100)/100,currency:String(verified()?.currency||selected()?.currency||'EUR').toUpperCase()};}
function money(v,currency='EUR'){try{return new Intl.NumberFormat('de-DE',{style:'currency',currency:/^[A-Z]{3}$/.test(currency)?currency:'EUR',maximumFractionDigits:2}).format(v);}catch(_){return `${v} ${currency}`;}}
function root(){const b=document.getElementById('plannerBody');return b?.querySelector('.noreyo-v1084-verify-state')?b:null;}
function sync(){raf=0;const b=root();if(!b)return false;const d=delta(),v=verified();let box=b.querySelector('.noreyo-v1096-price-delta');if(!d||!v?.changed||d.difference===0){if(box){box.remove();return true;}return false;}if(!box){box=document.createElement('div');box.className='noreyo-v1096-price-delta';const state=b.querySelector('.noreyo-v1084-verify-state');state.insertAdjacentElement('afterend',box);}const sign=d.difference>0?'+':'−',abs=Math.abs(d.difference);const html=`<div class="checkout-lines"><div class="checkout-line"><span>Preis aus Suche</span><b><s>${money(d.oldPrice,d.currency)}</s></b></div><div class="checkout-line"><span>Jetzt verifiziert</span><b>${money(d.newPrice,d.currency)}</b></div><div class="checkout-line"><span>Änderung</span><b>${sign}${money(abs,d.currency)}</b></div></div>`;if(box.innerHTML===html)return false;box.innerHTML=html;return true;}
function schedule(){if(!raf)raf=requestAnimationFrame(sync);}
function observe(){if(observer){observer.disconnect();observer=null;}if(typeof MutationObserver==='undefined'||!document.body)return false;observer=new MutationObserver(schedule);observer.observe(document.body,{subtree:true,childList:true,characterData:true});schedule();return true;}
function cleanup(){if(observer){observer.disconnect();observer=null;}if(raf){cancelAnimationFrame(raf);raf=0;}}
observe();window.addEventListener('pagehide',cleanup,{passive:true});window.addEventListener('pageshow',observe,{passive:true});
window.NOREYO_V1096=Object.freeze({BUILD,selected,verified,finite,delta,money,root,sync,schedule,observe,cleanup});
})();