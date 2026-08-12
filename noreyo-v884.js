/* NOREYO V8.84 — safe price-alert planner rendering. */
(function(){
'use strict';
const BUILD='8.84';
function esc(value){return String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[ch]);}
function key(value){return encodeURIComponent(String(value??'')).replace(/'/g,'%27');}
function money(value){const n=Number(value);return Number.isFinite(n)?n.toLocaleString('de-DE')+' €':'Preis nicht verfügbar';}
function date(value){try{if(typeof fmtDateShort==='function')return fmtDateShort(value);}catch(_){}return String(value??'');}
function alerts(){try{return Array.isArray(priceAlerts)?priceAlerts:[];}catch(_){return[];}}
function markup(items=alerts()){
  if(!items.length)return '<div class="empty" style="margin:0;padding:22px"><b>Noch keine Preisbeobachtung</b><p>Öffne ein Hotel und tippe auf „Preis beobachten“.</p></div>';
  return `<p class="planner-note">Diese Vormerkungen sind aktuell nur lokal gespeichert. Automatische Benachrichtigungen folgen mit der serverseitigen Preisalarm-Funktion.</p>${items.map(a=>{const offer=a?.offer||{};return `<div class="alert-card"><b>${esc(offer.hotel||'Hotel')}</b><small>${esc(offer.destination||offer.region||'')} · ${esc(date(offer.checkin))}–${esc(date(offer.checkout))}</small><div class="alert-foot"><span class="alert-price">${esc(money(a?.target))}</span><button class="mini-danger" onclick="removeAlert('${key(a?.key)}')">Entfernen</button></div></div>`;}).join('')}`;
}
function render(){let mode='';try{mode=String(plannerMode||'');}catch(_){return false;}if(mode!=='alerts')return false;const title=document.getElementById('plannerTitle'),body=document.getElementById('plannerBody');if(!body)return false;if(title)title.textContent='Preisbeobachtung';body.innerHTML=markup();return true;}
function install(){const prior=window.renderPlanner;if(typeof prior!=='function'||prior.__noreyoV884)return false;const wrapped=function(...args){let mode='';try{mode=String(plannerMode||'');}catch(_){}if(mode==='alerts'&&render())return;return prior.apply(this,args);};wrapped.__noreyoV884=true;window.renderPlanner=wrapped;return true;}
install();window.addEventListener('pageshow',install,{passive:true});window.NOREYO_V884=Object.freeze({BUILD,esc,key,money,date,alerts,markup,render,install});
})();