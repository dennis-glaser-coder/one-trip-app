/* NOREYO V5.68 — Travel DNA simple impact */
(()=>{
'use strict';
const KEY='noreyoTravelDNA';
let painting=false;
function readProfile(){try{return JSON.parse(localStorage.getItem(KEY)||'null');}catch(_){return null;}}
function esc(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
const effects={
  hotel:{
    boutique:['Persönliche Hotels zuerst','Große Resorts stehen weiter hinten.'],
    resort:['Resorts mit viel Komfort zuerst','Kleine Boutique-Hotels stehen weiter hinten.']
  },
  location:{
    beach:['Hotels direkt am Meer zuerst','Hotels weit vom Wasser stehen weiter hinten.'],
    central:['Zentrale Hotels zuerst','Abgelegene Hotels stehen weiter hinten.']
  },
  pace:{
    quiet:['Ruhige Hotels zuerst','Sehr lebhafte Lagen stehen weiter hinten.'],
    lively:['Lebendige Umgebung zuerst','Sehr ruhige Lagen stehen weiter hinten.']
  }
};
function effect(p,key){return effects[key]?.[p?.answers?.[key]]||['Passende Reisen zuerst','Weniger passende Treffer stehen weiter hinten.'];}
function row(n,p,key,label){const e=effect(p,key);return '<div class="noreyo-v568-row"><span>'+n+'</span><div><small>'+label+'</small><b>'+esc(e[0])+'</b><p>'+esc(e[1])+'</p></div></div>';}
function markup(p){const title=esc(p?.title||'Dein Reiseprofil');return '<div class="noreyo-v568-reveal">'
 +'<section class="noreyo-v568-hero"><div class="noreyo-v568-mark"><i></i><i></i><i></i><b>DNA</b></div><div><small>DEINE TRAVEL DNA</small><h3>'+title+'</h3><p>✓ Aktiv</p></div></section>'
 +'<div class="noreyo-v568-explain"><small>WAS MACHT NOREYO JETZT?</small><h4>NOREYO sortiert deine Treffer automatisch anders.</h4><p>Das bedeutet ganz konkret:</p></div>'
 +'<section class="noreyo-v568-rows">'+row('1',p,'hotel','HOTELS')+row('2',p,'location','LAGE')+row('3',p,'pace','ATMOSPHÄRE')+'</section>'
 +'<div class="noreyo-v568-note"><b>Du musst diese Vorlieben nicht jedes Mal neu einstellen.</b><span>Ziel, Datum, Budget und Verpflegung bestimmst weiterhin du. Deine Travel DNA schließt nichts aus – sie sortiert nur passender.</span></div>'
 +'<button type="button" class="noreyo-v560-primary noreyo-v568-find" data-v568-find>Mit '+title+' suchen →</button>'
 +'<button type="button" class="noreyo-v568-edit" data-v568-edit>Travel DNA ändern</button>'
 +'</div>';}
function shouldReplace(host){if(!host||host.querySelector('.noreyo-v568-reveal'))return false;return !!host.querySelector('.noreyo-v567-reveal,.noreyo-v566-intro.active,.noreyo-v564-result,.noreyo-v560-result');}
function paint(){if(painting)return;const host=document.getElementById('noreyoDnaBody'),p=readProfile();if(!p||!shouldReplace(host))return;painting=true;host.innerHTML=markup(p);try{host.scrollTop=0;}catch(_){ }painting=false;}
function closeAndSearch(){const shell=document.getElementById('noreyoDna560');shell?.querySelector('.noreyo-v560-close')?.click();setTimeout(()=>document.querySelector('#discover .search-card')?.scrollIntoView({behavior:'smooth',block:'start'}),180);try{if(typeof showToast==='function')showToast('Travel DNA aktiv – passende Treffer werden zuerst gezeigt');}catch(_){}}
document.addEventListener('click',e=>{const root=e.target.closest?.('#noreyoDna560');if(!root)return;if(e.target.closest?.('[data-v568-find]')){e.preventDefault();e.stopImmediatePropagation();closeAndSearch();return;}if(e.target.closest?.('[data-v568-edit]')){e.preventDefault();e.stopImmediatePropagation();window.NOREYO_V564?.start?.();return;}},true);
const mo=new MutationObserver(()=>requestAnimationFrame(paint));mo.observe(document.documentElement,{childList:true,subtree:true});
setTimeout(paint,100);setTimeout(paint,350);setTimeout(paint,900);
window.NOREYO_V568={paint};
})();
