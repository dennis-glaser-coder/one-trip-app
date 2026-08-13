/* NOREYO V11.12 — hotel PREBOOK final-price delta truth.
   PREBOOK is the final rate confirmation before booking. Compare its confirmed total
   with the currently displayed selected tariff and surface unchanged/changed price
   explicitly instead of silently replacing the amount. */
(function(){
'use strict';
const BUILD='11.12';
let current=null,observer=null,raf=0;
const priorRender=window.renderDetail;
function finite(v){if(v===null||v===undefined)return null;if(typeof v==='string'&&!v.trim())return null;const n=Number(v);return Number.isFinite(n)&&n>=0?n:null;}
function currentPrice(){return finite(current?.price);}
function snap(){return window.NOREYO_HOTEL_PREBOOK||null;}
function money(v,cur='EUR'){if(v===null)return'–';try{return new Intl.NumberFormat('de-DE',{style:'currency',currency:/^[A-Z]{3}$/.test(cur)?cur:'EUR',maximumFractionDigits:2}).format(v);}catch(_){return `${v} ${cur}`;}}
function model(){const s=snap(),before=currentPrice(),after=finite(s?.price);if(!s||before===null||after===null)return null;const delta=Math.round((after-before)*100)/100;return{before,after,delta,currency:String(s.currency||current?.currency||'EUR').toUpperCase().slice(0,3)||'EUR',changed:Math.abs(delta)>=0.01};}
function render(){raf=0;const status=document.querySelector('.noreyo-v1106-status'),m=model();if(!status)return false;let row=status.querySelector('.noreyo-v1112-price-delta');if(!m){if(row){row.remove();return true;}return false;}if(!row){row=document.createElement('div');row.className='noreyo-v1112-price-delta';row.setAttribute('role','status');row.setAttribute('aria-live','polite');row.setAttribute('aria-atomic','true');status.appendChild(row);}const deltaText=money(Math.abs(m.delta),m.currency);const text=m.changed?`Preisänderung: zuvor ${money(m.before,m.currency)}, jetzt ${money(m.after,m.currency)} (${m.delta>0?'+':'−'}${deltaText}).`:`Preis unverändert: ${money(m.after,m.currency)}.`;if(row.textContent===text)return false;row.textContent=text;row.classList.toggle('changed',m.changed);return true;}
function schedule(){if(!raf)raf=requestAnimationFrame(render);}
if(typeof priorRender==='function')window.renderDetail=function(o,...args){current=o||null;const r=priorRender.call(this,o,...args);schedule();return r;};
function observe(){if(observer){observer.disconnect();observer=null;}if(typeof MutationObserver==='undefined'||!document.body)return false;observer=new MutationObserver(schedule);observer.observe(document.body,{subtree:true,childList:true,characterData:true});schedule();return true;}
function cleanup(){if(observer){observer.disconnect();observer=null;}if(raf){cancelAnimationFrame(raf);raf=0;}}
observe();window.addEventListener('pagehide',cleanup,{passive:true});window.addEventListener('pageshow',observe,{passive:true});
window.NOREYO_V1112=Object.freeze({BUILD,finite,currentPrice,snap,money,model,render,schedule,observe,cleanup});
})();