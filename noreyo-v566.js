/* NOREYO V5.66 — Travel DNA state-aware intro */
(()=>{
'use strict';
const PROFILE_KEY='noreyoTravelDNA';
let painting=false;
function readProfile(){try{return JSON.parse(localStorage.getItem(PROFILE_KEY)||'null');}catch(_){return null;}}
function esc(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function future(){return '<div class="noreyo-v566-future"><span>✦</span><b>Demnächst: Travel DNA aus deinen Urlaubsfotos</b></div>';}
function freshMarkup(){return '<div class="noreyo-v560-intro noreyo-v565-intro noreyo-v566-intro fresh">'
 +'<div class="noreyo-v560-orbit noreyo-v566-orbit"><span></span><span></span><span></span><b>DNA</b></div>'
 +'<p class="noreyo-v560-kicker">NOREYO TRAVEL DNA</p>'
 +'<div class="noreyo-v566-title">3 Klicks. Und NOREYO weiß,<br>wie du Urlaub magst.</div>'
 +'<p class="noreyo-v566-copy">Wähle dreimal spontan zwischen zwei Bildern. NOREYO merkt sich deinen <strong>Hotelstil</strong>, deine <strong>Lage</strong> und dein <strong>Urlaubsgefühl</strong> – und nimmt das künftig automatisch in jede Suche mit.</p>'
 +'<div class="noreyo-v566-flow"><span><i>1</i>Hotelstil</span><b>→</b><span><i>2</i>Lage</span><b>→</b><span><i>3</i>Gefühl</span></div>'
 +'<button type="button" class="noreyo-v560-primary noreyo-v566-primary" data-v566-start>Travel DNA starten · 20 Sek. →</button>'
 +'<p class="noreyo-v566-foot">Kein Formular · jederzeit änderbar</p>'+future()+'</div>';}
function activeMarkup(p){const tags=(p?.tags||[]).slice(0,3);return '<div class="noreyo-v560-intro noreyo-v565-intro noreyo-v566-intro active">'
 +'<div class="noreyo-v560-orbit noreyo-v566-orbit active"><span></span><span></span><span></span><b>DNA</b></div>'
 +'<p class="noreyo-v560-kicker">DEINE TRAVEL DNA</p>'
 +'<div class="noreyo-v566-title">NOREYO kennt deinen<br>Reisegeschmack.</div>'
 +'<p class="noreyo-v566-copy active-copy">Dein Profil läuft ab jetzt automatisch bei deiner Suche mit.</p>'
 +'<div class="noreyo-v566-profile"><small>✓ TRAVEL DNA AKTIV</small><strong>'+esc(p.title||'Dein Reiseprofil')+'</strong><div>'+tags.map(t=>'<span>✓ '+esc(t)+'</span>').join('')+'</div></div>'
 +'<p class="noreyo-v566-control">Ziel, Zeitraum, Budget und Verpflegung bestimmst weiterhin du.</p>'
 +'<button type="button" class="noreyo-v560-primary noreyo-v566-primary" data-v566-find>Reisen mit meiner Travel DNA finden →</button>'
 +'<button type="button" class="noreyo-v566-edit" data-v566-edit>Travel DNA ändern</button>'+future()+'</div>';}
function paint(){
 if(painting)return;
 const host=document.getElementById('noreyoDnaBody'),intro=host?.querySelector('.noreyo-v560-intro');
 if(!host||!intro||intro.classList.contains('noreyo-v566-intro'))return;
 painting=true;const p=readProfile();host.innerHTML=p?activeMarkup(p):freshMarkup();try{host.scrollTop=0;}catch(_){ }painting=false;
}
function closeAndSearch(){const shell=document.getElementById('noreyoDna560');shell?.querySelector('.noreyo-v560-close')?.click();setTimeout(()=>document.querySelector('#discover .search-card')?.scrollIntoView({behavior:'smooth',block:'start'}),180);try{if(typeof showToast==='function')showToast('Travel DNA aktiv – deine Suche startet mit deinem Geschmack');}catch(_){}}
document.addEventListener('click',e=>{
 const root=e.target.closest?.('#noreyoDna560');if(!root)return;
 if(e.target.closest?.('[data-v566-start],[data-v566-edit]')){e.preventDefault();e.stopImmediatePropagation();window.NOREYO_V564?.start?.();return;}
 if(e.target.closest?.('[data-v566-find]')){e.preventDefault();e.stopImmediatePropagation();closeAndSearch();return;}
},true);
const mo=new MutationObserver(()=>requestAnimationFrame(paint));mo.observe(document.documentElement,{childList:true,subtree:true});
setTimeout(paint,150);setTimeout(paint,500);setTimeout(paint,1100);
window.NOREYO_V566={paint};
})();
