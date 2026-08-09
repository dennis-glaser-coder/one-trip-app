/* NOREYO V5.69 — Travel DNA plain-language result */
(()=>{
'use strict';
const KEY='noreyoTravelDNA';
let painting=false;
function readProfile(){try{return JSON.parse(localStorage.getItem(KEY)||'null');}catch(_){return null;}}
function esc(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
const plain={
 hotel:{boutique:'Persönliche Hotels zuerst',resort:'Resorts mit viel Auswahl zuerst'},
 location:{beach:'Hotels direkt am Meer zuerst',central:'Zentral gelegene Hotels zuerst'},
 pace:{quiet:'Ruhige Umgebung zuerst',lively:'Lebendige Umgebung zuerst'}
};
function pick(p,key){return plain[key]?.[p?.answers?.[key]]||'Passende Reisen zuerst';}
function markup(p){
 const title=esc(p?.title||'Dein Reisestil');
 return '<div class="noreyo-v569-reveal">'
  +'<section class="noreyo-v569-hero">'
   +'<div class="noreyo-v569-mark"><i></i><i></i><i></i><b>DNA</b></div>'
   +'<div><small>DEIN REISESTIL</small><h3>'+title+'</h3><p>NOREYO merkt sich, was dir im Urlaub gefällt.</p></div>'
  +'</section>'
  +'<section class="noreyo-v569-main">'
   +'<small>WAS PASSIERT JETZT BEI DEINER SUCHE?</small>'
   +'<h4>Passende Reisen stehen bei dir weiter oben.</h4>'
   +'<div class="noreyo-v569-points">'
    +'<div><span>✓</span><b>'+esc(pick(p,'hotel'))+'</b></div>'
    +'<div><span>✓</span><b>'+esc(pick(p,'location'))+'</b></div>'
    +'<div><span>✓</span><b>'+esc(pick(p,'pace'))+'</b></div>'
   +'</div>'
  +'</section>'
  +'<div class="noreyo-v569-simple"><b>Du suchst ganz normal weiter.</b><p>Ziel, Datum, Preis und Verpflegung gibst du wie gewohnt an. NOREYO sortiert die Treffer automatisch nach deinem Reisestil.</p></div>'
  +'<button type="button" class="noreyo-v560-primary noreyo-v569-find" data-v569-find>Passende Reisen anzeigen →</button>'
  +'<button type="button" class="noreyo-v569-edit" data-v569-edit>Meinen Reisestil ändern</button>'
 +'</div>';
}
function shouldReplace(host){if(!host||host.querySelector('.noreyo-v569-reveal'))return false;return !!host.querySelector('.noreyo-v568-reveal,.noreyo-v567-reveal,.noreyo-v566-intro.active,.noreyo-v564-result,.noreyo-v560-result');}
function paint(){if(painting)return;const host=document.getElementById('noreyoDnaBody'),p=readProfile();if(!p||!shouldReplace(host))return;painting=true;host.innerHTML=markup(p);try{host.scrollTop=0;}catch(_){ }painting=false;}
function closeAndSearch(){const shell=document.getElementById('noreyoDna560');shell?.querySelector('.noreyo-v560-close')?.click();setTimeout(()=>document.querySelector('#discover .search-card')?.scrollIntoView({behavior:'smooth',block:'start'}),180);try{if(typeof showToast==='function')showToast('Dein Reisestil ist aktiv – passende Treffer stehen weiter oben');}catch(_){}}
document.addEventListener('click',e=>{const root=e.target.closest?.('#noreyoDna560');if(!root)return;if(e.target.closest?.('[data-v569-find]')){e.preventDefault();e.stopImmediatePropagation();closeAndSearch();return;}if(e.target.closest?.('[data-v569-edit]')){e.preventDefault();e.stopImmediatePropagation();window.NOREYO_V564?.start?.();return;}},true);
const mo=new MutationObserver(()=>requestAnimationFrame(paint));mo.observe(document.documentElement,{childList:true,subtree:true});
setTimeout(paint,90);setTimeout(paint,300);setTimeout(paint,800);
window.NOREYO_V569={paint};
})();
