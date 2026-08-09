/* NOREYO V5.70 — plain-language personal search */
(()=>{
'use strict';
const KEY='noreyoTravelDNA';
let painting=false;
function readProfile(){try{return JSON.parse(localStorage.getItem(KEY)||'null');}catch(_){return null;}}
function esc(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
const prefs={
 hotel:{boutique:'Persönliche Hotels',resort:'Resorts mit viel Auswahl'},
 location:{beach:'Direkt am Meer',central:'Zentrale Lage'},
 pace:{quiet:'Ruhige Umgebung',lively:'Lebendige Umgebung'}
};
function pref(p,key){return prefs[key]?.[p?.answers?.[key]]||'Passende Reisen';}
function shortStyle(p){return [pref(p,'hotel'),pref(p,'location'),pref(p,'pace')].join(' · ');}
function launcherMarkup(p){
 const active=!!p;
 return '<span class="noreyo-v570-launch-icon">'+(active?'✓':'✦')+'</span>'+
 '<span class="noreyo-v570-launch-copy">'+
  '<small>'+(active?'DEIN REISESTIL IST AKTIV':'PERSÖNLICHE SUCHE')+'</small>'+
  '<b>'+(active?'Passende Reisen zuerst':'3 Fragen für bessere Treffer')+'</b>'+
  '<em>'+(active?esc((p.title||'Dein Reisestil')+' · '+shortStyle(p)):'NOREYO merkt sich, was dir im Urlaub gefällt')+'</em>'+
 '</span><span class="noreyo-v570-launch-go">→</span>';
}
function introMarkup(){return '<div class="noreyo-v570-intro">'
 +'<div class="noreyo-v570-intro-icon">✦</div>'
 +'<small>PERSÖNLICHE SUCHE</small>'
 +'<h3>3 Fragen. Danach zeigt NOREYO dir passendere Reisen zuerst.</h3>'
 +'<p>Du entscheidest nur spontan zwischen zwei Bildern. NOREYO merkt sich deinen Reisestil für deine nächsten Suchen.</p>'
 +'<div class="noreyo-v570-intro-steps"><span><b>1</b>Hotel</span><span><b>2</b>Lage</span><span><b>3</b>Urlaubsgefühl</span></div>'
 +'<button type="button" class="noreyo-v560-primary noreyo-v570-start" data-v570-start>Reisestil in 20 Sek. festlegen →</button>'
 +'<p class="noreyo-v570-mini">Kein Formular · jederzeit änderbar</p>'
 +'</div>';}
function resultMarkup(p){
 const title=esc(p?.title||'Dein Reisestil');
 return '<div class="noreyo-v570-result">'
  +'<section class="noreyo-v570-profile"><small>DEIN REISESTIL</small><h3>'+title+'</h3><p>'+esc(shortStyle(p))+'</p></section>'
  +'<section class="noreyo-v570-message"><small>WAS BRINGT DIR DAS?</small><h4>NOREYO zeigt dir passende Reisen zuerst.</h4><p>Du suchst ganz normal nach Ziel, Datum und Preis. Wenn mehrere Angebote passen, stehen die Reisen weiter oben, die besser zu deinem Reisestil passen.</p></section>'
  +'<section class="noreyo-v570-liked"><small>NOREYO HAT SICH GEMERKT:</small>'
   +'<div><span>✓</span><b>'+esc(pref(p,'hotel'))+'</b></div>'
   +'<div><span>✓</span><b>'+esc(pref(p,'location'))+'</b></div>'
   +'<div><span>✓</span><b>'+esc(pref(p,'pace'))+'</b></div>'
  +'</section>'
  +'<div class="noreyo-v570-example"><b>Ganz einfach:</b><span>Du gibst Ziel, Datum und Preis ein. NOREYO kümmert sich darum, dass die für dich passenderen Treffer oben stehen.</span></div>'
  +'<button type="button" class="noreyo-v560-primary noreyo-v570-find" data-v570-find>Jetzt passende Reisen anzeigen →</button>'
  +'<button type="button" class="noreyo-v570-edit" data-v570-edit>Reisestil ändern</button>'
 +'</div>';}
function paintLauncher(){
 document.querySelectorAll('#discover .noreyo-v560-launch').forEach(btn=>{
  if(btn.dataset.v570==='1')return;
  const p=readProfile();
  btn.dataset.v570='1';btn.classList.add('noreyo-v570-launch');btn.setAttribute('aria-label',p?'Dein Reisestil ist aktiv. Öffnen':'Persönliche Suche einrichten');btn.innerHTML=launcherMarkup(p);
 });
}
function paintSheet(){
 const host=document.getElementById('noreyoDnaBody'),shell=document.getElementById('noreyoDna560');
 if(!host||!shell)return;
 const head=shell.querySelector('.noreyo-v560-head');
 if(head){const s=head.querySelector('small'),h=head.querySelector('h2');if(s)s.textContent='NOREYO · PERSÖNLICHE SUCHE';if(h)h.textContent='Dein Reisestil';}
 if(host.querySelector('.noreyo-v560-test'))return;
 const p=readProfile();
 if(p){if(!host.querySelector('.noreyo-v570-result')){host.innerHTML=resultMarkup(p);try{host.scrollTop=0;}catch(_){}}}
 else if(!host.querySelector('.noreyo-v570-intro')){host.innerHTML=introMarkup();try{host.scrollTop=0;}catch(_){}}
}
function paint(){if(painting)return;painting=true;try{paintLauncher();paintSheet();}finally{painting=false;}}
function closeAndSearch(){const shell=document.getElementById('noreyoDna560');shell?.querySelector('.noreyo-v560-close')?.click();setTimeout(()=>document.querySelector('#discover .search-card')?.scrollIntoView({behavior:'smooth',block:'start'}),180);try{if(typeof showToast==='function')showToast('Dein Reisestil ist aktiv – passende Reisen stehen zuerst');}catch(_){}}
document.addEventListener('click',e=>{
 const root=e.target.closest?.('#noreyoDna560');if(!root)return;
 if(e.target.closest?.('[data-v570-start],[data-v570-edit]')){e.preventDefault();e.stopImmediatePropagation();window.NOREYO_V564?.start?.();return;}
 if(e.target.closest?.('[data-v570-find]')){e.preventDefault();e.stopImmediatePropagation();closeAndSearch();return;}
},true);
const mo=new MutationObserver(()=>requestAnimationFrame(paint));mo.observe(document.documentElement,{childList:true,subtree:true});
setTimeout(paint,80);setTimeout(paint,260);setTimeout(paint,700);setTimeout(paint,1400);
window.NOREYO_V570={paint};
})();
