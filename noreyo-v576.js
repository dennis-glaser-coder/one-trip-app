/* NOREYO V5.76.1 — profile that explains itself + idempotent paint */
(()=>{
'use strict';
let painting=false,paintQueued=false;
const PROFILE_KEY='noreyoTravelDNA';
function esc(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function readStyle(){try{return JSON.parse(localStorage.getItem(PROFILE_KEY)||'null');}catch(_){return null;}}
function airportCount(){try{if(typeof searchState!=='undefined'&&Array.isArray(searchState?.airports))return searchState.airports.filter(Boolean).length;}catch(_){ }return 0;}
function alertText(){const old=document.querySelector('#profile #alertCountText');return (old?.textContent||'').trim()||'Noch kein Preisalarm aktiv';}
function icon(id){return '<svg class="icon mini"><use href="#'+id+'"/></svg>';}
function markup(){
 const style=readStyle(),ap=airportCount(),alert=alertText();
 const styleTitle=style?.title?esc(style.title):'Noch nicht festgelegt';
 const styleCopy=style?'Wird bei deiner Suche automatisch mitgedacht.':'3 kurze Fragen – danach kennt NOREYO deinen grundlegenden Reisestil.';
 const saved=[];
 if(ap)saved.push('<span>✓ '+ap+' Abflughäfen gespeichert</span>');
 if(style)saved.push('<span>✓ Reisestil aktiv</span>');
 return '<div class="noreyo-v576-wrap">'
  +'<header class="noreyo-v576-intro"><small>DEIN NOREYO</small><h1>Was soll NOREYO sich für dich merken?</h1><p>Hier legst du fest, was bei deinen nächsten Suchen automatisch berücksichtigt werden soll.</p></header>'
  +'<section class="noreyo-v576-status"><div class="noreyo-v576-status-head"><i>✦</i><div><small>FÜR DEINE SUCHE</small><b>Deine Einstellungen laufen automatisch mit.</b></div></div>'
  +(saved.length?'<div class="noreyo-v576-status-chips">'+saved.join('')+'</div>':'<p>Du kannst deine Wünsche und deinen Reisestil unten einmal festlegen – danach musst du weniger neu einstellen.</p>')+'</section>'
  +'<section class="noreyo-v576-actions"><small class="noreyo-v576-section-label">ANPASSEN</small>'
  +'<button type="button" class="noreyo-v576-row" data-v576-prefs><i>'+icon('sliders')+'</i><span><b>Meine Urlaubswünsche</b><small>Balkon, Lage, Verpflegung, Hotel & mehr</small></span><em>Ändern</em><strong>›</strong></button>'
  +'<button type="button" class="noreyo-v576-row" data-v576-style><i class="noreyo-v576-style-icon">✦</i><span><b>Mein Reisestil</b><small>'+styleTitle+' · '+styleCopy+'</small></span><em>'+(style?'Ändern':'Festlegen')+'</em><strong>›</strong></button>'
  +'<button type="button" class="noreyo-v576-row" data-v576-alert><i>'+icon('bell')+'</i><span><b>Preisalarm</b><small>'+esc(alert==='Keine aktive Beobachtung'?'Sag NOREYO Bescheid, wenn sich ein beobachteter Preis ändert.':alert)+'</small></span><em>Öffnen</em><strong>›</strong></button>'
  +'</section>'
  +'<p class="noreyo-v576-note">Du kannst diese Angaben jederzeit ändern. NOREYO nutzt sie nur, um deine Suche einfacher und persönlicher zu machen.</p>'
  +'<div class="noreyo-v576-build">NOREYO · BUILD 5.77</div>'
  +'</div>';
}
function install(){
 const root=document.getElementById('profile');if(!root)return;
 if(root.dataset.v576==='1'&&root.querySelector('.noreyo-v576-wrap'))return;
 const head=root.querySelector('.app-head');if(!head)return;
 const oldAlert=alertText();
 [...root.children].forEach(el=>{if(el!==head)el.remove();});
 root.insertAdjacentHTML('beforeend',markup().replace('Noch kein Preisalarm aktiv',esc(oldAlert||'Noch kein Preisalarm aktiv')));
 root.dataset.v576='1';
}
function openPrefs(){try{if(typeof openFilter==='function'){openFilter();return;}}catch(_){ }try{if(typeof showToast==='function')showToast('Urlaubswünsche konnten gerade nicht geöffnet werden');}catch(_){ }}
function openPriceAlerts(){try{if(typeof window.openAlerts==='function'){window.openAlerts();return;}}catch(_){ }try{if(typeof showToast==='function')showToast('Preisalarm konnte gerade nicht geöffnet werden');}catch(_){ }}
function openStyle(){try{const launch=document.querySelector('#discover .noreyo-v560-launch');if(launch){launch.click();setTimeout(()=>window.NOREYO_V564?.start?.(),120);return;}}catch(_){ }try{if(typeof showToast==='function')showToast('Reisestil lässt sich gerade nicht öffnen');}catch(_){ }}
function paint(){if(painting)return;painting=true;try{install();}finally{painting=false;}}
function schedulePaint(){if(paintQueued)return;paintQueued=true;requestAnimationFrame(()=>{paintQueued=false;paint();});}
function relevant(records){for(const r of records){for(const n of r.addedNodes||[]){if(n.nodeType!==1)continue;if(n.matches?.('#profile,.profile-view,.app-head')||n.querySelector?.('#profile,.profile-view,.app-head'))return true;}}return false;}
function loadSafety(){
 if(window.NOREYO_V577||document.querySelector('script[data-noreyo-v577]'))return;
 const s=document.createElement('script');s.src='./noreyo-v577.js?build=577';s.dataset.noreyoV577='1';document.head.appendChild(s);
}
document.addEventListener('click',e=>{
 if(e.target.closest?.('[data-v576-prefs]')){e.preventDefault();openPrefs();return;}
 if(e.target.closest?.('[data-v576-style]')){e.preventDefault();openStyle();return;}
 if(e.target.closest?.('[data-v576-alert]')){e.preventDefault();openPriceAlerts();return;}
});
const mo=new MutationObserver(records=>{if(relevant(records))schedulePaint();});mo.observe(document.documentElement,{childList:true,subtree:true});
setTimeout(paint,100);setTimeout(paint,350);setTimeout(paint,900);setTimeout(loadSafety,120);
window.NOREYO_V576={paint,relevant};
})();
