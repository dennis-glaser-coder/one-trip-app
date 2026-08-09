/* NOREYO V5.67 — Travel DNA reveal */
(()=>{
'use strict';
const KEY='noreyoTravelDNA';
let painting=false;
function readProfile(){try{return JSON.parse(localStorage.getItem(KEY)||'null');}catch(_){return null;}}
function esc(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
const labels={
 hotel:{boutique:['Boutique & persönlich','Persönlich'],resort:['Resort & alles vor Ort','Komfort']},
 location:{beach:['Direkt am Meer','Meer'],central:['Mittendrin','Zentral']},
 pace:{quiet:['Ruhig & entspannt','Ruhig'],lively:['Lebendig & viel los','Lebendig']}
};
function axis(p,key,title){const value=p?.answers?.[key],pair=labels[key]?.[value]||['Noch offen',''];return '<div class="noreyo-v567-axis"><small>'+title+'</small><b>'+esc(pair[0])+'</b><span>'+esc(pair[1])+'</span><i></i></div>';}
function revealMarkup(p){
 const tags=(p?.tags||[]).slice(0,3);
 const short=[labels.hotel?.[p?.answers?.hotel]?.[1],labels.location?.[p?.answers?.location]?.[1],labels.pace?.[p?.answers?.pace]?.[1]].filter(Boolean).join(' · ');
 return '<div class="noreyo-v567-reveal">'
  +'<section class="noreyo-v567-hero">'
   +'<div class="noreyo-v567-mark"><i></i><i></i><i></i><b>DNA</b></div>'
   +'<div class="noreyo-v567-hero-copy"><small>DEINE TRAVEL DNA</small><h3>'+esc(p?.title||'Dein Reiseprofil')+'</h3><p>'+esc(short||'Dein persönlicher Reisegeschmack')+'</p></div>'
   +'<span class="noreyo-v567-live">✓ AKTIV</span>'
  +'</section>'
  +'<p class="noreyo-v567-lead">Ab jetzt startet NOREYO jede Suche mit deinem Geschmack – nicht mit einer leeren Filterliste.</p>'
  +'<div class="noreyo-v567-axis-grid">'
   +axis(p,'hotel','HOTELSTIL')+axis(p,'location','LAGE')+axis(p,'pace','URLAUBSGEFÜHL')
  +'</div>'
  +'<section class="noreyo-v567-impact"><small>SO VERÄNDERT DAS DEINE SUCHE</small><b>NOREYO priorisiert jetzt Reisen, die zu diesen Signalen passen.</b>'
   +'<div class="noreyo-v567-tags">'+tags.map(t=>'<span>✓ '+esc(t)+'</span>').join('')+'</div>'
   +'<p>Ziel, Zeitraum, Budget und Verpflegung bestimmst weiterhin du.</p>'
  +'</section>'
  +'<button type="button" class="noreyo-v560-primary noreyo-v567-find" data-v567-find>Zeig mir Reisen, die zu mir passen →</button>'
  +'<button type="button" class="noreyo-v567-edit" data-v567-edit>Travel DNA ändern</button>'
  +'<div class="noreyo-v567-future">✦ Demnächst: Travel DNA aus deinen Urlaubsfotos</div>'
 +'</div>';
}
function shouldReplace(host){
 if(!host||host.querySelector('.noreyo-v567-reveal'))return false;
 return !!host.querySelector('.noreyo-v566-intro.active,.noreyo-v564-result,.noreyo-v560-result');
}
function paint(){
 if(painting)return;
 const host=document.getElementById('noreyoDnaBody'),p=readProfile();
 if(!p||!shouldReplace(host))return;
 painting=true;host.innerHTML=revealMarkup(p);try{host.scrollTop=0;}catch(_){ }painting=false;
}
function closeAndSearch(){const shell=document.getElementById('noreyoDna560');shell?.querySelector('.noreyo-v560-close')?.click();setTimeout(()=>document.querySelector('#discover .search-card')?.scrollIntoView({behavior:'smooth',block:'start'}),180);try{if(typeof showToast==='function')showToast('Travel DNA aktiv – NOREYO sucht jetzt mit deinem Geschmack');}catch(_){}}
document.addEventListener('click',e=>{
 const root=e.target.closest?.('#noreyoDna560');if(!root)return;
 if(e.target.closest?.('[data-v567-find]')){e.preventDefault();e.stopImmediatePropagation();closeAndSearch();return;}
 if(e.target.closest?.('[data-v567-edit]')){e.preventDefault();e.stopImmediatePropagation();window.NOREYO_V564?.start?.();return;}
},true);
const mo=new MutationObserver(()=>requestAnimationFrame(paint));mo.observe(document.documentElement,{childList:true,subtree:true});
setTimeout(paint,120);setTimeout(paint,420);setTimeout(paint,1000);
window.NOREYO_V567={paint};
})();
