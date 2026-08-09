/* NOREYO V5.65 — Travel DNA clarity */
(()=>{
'use strict';
const PROFILE_KEY='noreyoTravelDNA';
let painting=false;
function readProfile(){try{return JSON.parse(localStorage.getItem(PROFILE_KEY)||'null');}catch(_){return null;}}
function esc(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function introMarkup(p){
 const tags=(p?.tags||[]).slice(0,3);
 return '<div class="noreyo-v560-intro noreyo-v565-intro">'
  +'<div class="noreyo-v560-orbit noreyo-v565-orbit"><span></span><span></span><span></span><b>DNA</b></div>'
  +'<p class="noreyo-v560-kicker">NOREYO TRAVEL DNA</p>'
  +'<h3>Sag NOREYO in 3 Klicks,<br>wie du am liebsten Urlaub machst.</h3>'
  +'<p class="noreyo-v565-copy">Du wählst spontan zwischen zwei Bildern. NOREYO merkt sich deinen <strong>Hotelstil</strong>, deine <strong>Lieblingslage</strong> und dein <strong>Urlaubsgefühl</strong> – und nutzt das automatisch bei jeder Suche.</p>'
  +'<div class="noreyo-v565-steps">'
    +'<span><i>1</i><b>Hotelstil</b><small>Boutique oder Resort</small></span>'
    +'<span><i>2</i><b>Lage</b><small>Meer oder mittendrin</small></span>'
    +'<span><i>3</i><b>Gefühl</b><small>Ruhig oder lebendig</small></span>'
  +'</div>'
  +(p?'<div class="noreyo-v565-active"><small>✓ DEINE TRAVEL DNA IST AKTIV</small><b>'+esc(p.title||'Dein Reiseprofil')+'</b><p>'+tags.map(esc).join(' · ')+'</p></div>':'')
  +(p?'<button type="button" class="noreyo-v560-primary" data-dna-view-profile>Mein Profil ansehen →</button><button type="button" class="noreyo-v560-secondary" data-dna-start>Neu testen</button>':'<button type="button" class="noreyo-v560-primary" data-dna-start>3 Fragen starten →</button>')
  +'<div class="noreyo-v565-future"><span>✦</span><div><small>DEMNÄCHST</small><b>Reisegeschmack aus Urlaubsfotos lernen</b><p>Du wählst einzelne Fotos aus. NOREYO soll daraus später deinen visuellen Reisestil erkennen.</p></div></div>'
  +'</div>';
}
function paint(){
 if(painting)return;
 const host=document.getElementById('noreyoDnaBody');
 const intro=host?.querySelector('.noreyo-v560-intro');
 if(!host||!intro||intro.classList.contains('noreyo-v565-intro'))return;
 painting=true;
 host.innerHTML=introMarkup(readProfile());
 try{host.scrollTop=0;}catch(_){ }
 painting=false;
}
const mo=new MutationObserver(()=>requestAnimationFrame(paint));
mo.observe(document.documentElement,{childList:true,subtree:true});
setTimeout(paint,120);setTimeout(paint,450);setTimeout(paint,1000);
window.NOREYO_V565={paint};
})();
