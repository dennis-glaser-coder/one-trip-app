/* NOREYO V5.72 — compact natural search + visible filters/photos */
(()=>{
'use strict';
let painting=false;
let photoUrls=[];
function norm(v){return String(v||'').toLowerCase();}
function mode(){const a=document.querySelector('#discover .product-mode.on');const t=norm(a?.textContent||'');if(t.includes('kreuzfahrt'))return'cruise';if(t.includes('hotel'))return'hotel';if(t.includes('flug'))return'flight';return'package';}
const examples={
 package:'z. B. Mallorca, September, 7 Tage, All Inclusive, Strand, Balkon, max. 2.500 € für zwei.',
 hotel:'z. B. Mallorca, 7 Nächte, am Meer, ruhig, Balkon, max. 1.200 € für zwei.',
 flight:'z. B. Mallorca im September, ab Düsseldorf oder Köln, Direktflug, max. 700 € für zwei.',
 cruise:'z. B. Mittelmeer, September, 7–9 Nächte, Balkonkabine, max. 2.500 € für zwei.'
};
function profileActive(){try{return !!JSON.parse(localStorage.getItem('noreyoTravelDNA')||'null');}catch(_){return false;}}
function compactMarkup(){return ''+
 '<div class="noreyo-v572-head"><span>✦</span><div><small>EINFACH SUCHEN</small><h3>Beschreib deinen Urlaub. NOREYO macht den Rest.</h3></div>'+(profileActive()?'<em>Reisestil aktiv</em>':'')+'</div>'+
 '<div class="noreyo-v572-input"><textarea data-v571-text maxlength="500" rows="2" placeholder="'+examples[mode()]+'" aria-label="Urlaub beschreiben"></textarea><button type="button" data-v571-go>Suche erstellen <span>→</span></button></div>'+
 '<div class="noreyo-v572-recognizes">Erkennt automatisch: <b>Ziel</b> · <b>Zeitraum</b> · <b>Budget</b> · <b>Wünsche</b></div>'+
 '<div class="noreyo-v572-tools">'+
   '<button type="button" class="noreyo-v572-tool" data-v572-filter><span class="noreyo-v572-tool-icon">≡</span><span><b>Wünsche & Pflicht</b><small>Genau festlegen</small></span><i>›</i></button>'+
   '<label class="noreyo-v572-tool noreyo-v572-photo"><span class="noreyo-v572-tool-icon">▧</span><span><b>Urlaubsfotos</b><small>Reisestil ergänzen</small></span><i>+</i><input type="file" accept="image/*" multiple data-v572-photos></label>'+
 '</div>'+
 '<div class="noreyo-v572-photo-preview" data-v572-photo-preview></div>'+
 '<div class="noreyo-v572-classic"><span>ODER KLASSISCH MIT FELDERN SUCHEN</span></div>';
}
function install(){
 const panel=document.querySelector('#discover [data-v571-smart]');if(!panel)return;
 if(panel.dataset.v572==='1')return;
 panel.dataset.v572='1';panel.classList.add('noreyo-v572-smart');panel.innerHTML=compactMarkup();
 const head=document.querySelector('#discover .search-card .search-console-head b,#discover .search-card .noreyo-v552-search-head b');if(head)head.textContent='Beschreiben oder klassisch einstellen';
}
function nativeFilter(){
 const card=document.querySelector('#discover .search-card');if(!card)return null;
 return [...card.querySelectorAll('.booking-command-grid .command-cell,.noreyo-v552-cruise-grid .command-cell')].find(el=>/wünsche\s*&\s*pflicht|filter|flugwünsche|kabine\s*&\s*wünsche/i.test(el.textContent||''))||null;
}
function openFilterShortcut(){
 const f=nativeFilter();if(f){f.click();return;}
 try{const fn=window.openFilter;if(typeof fn==='function')fn(mode()==='flight'?'Flug':'Hotel');}catch(_){ }
}
function clearPhotos(){photoUrls.forEach(u=>{try{URL.revokeObjectURL(u);}catch(_){}});photoUrls=[];}
function showPhotos(files){
 clearPhotos();const arr=[...(files||[])].slice(0,5);photoUrls=arr.map(f=>URL.createObjectURL(f));const host=document.querySelector('#discover [data-v572-photo-preview]');if(!host)return;
 if(!photoUrls.length){host.innerHTML='';return;}
 host.innerHTML='<div>'+photoUrls.slice(0,4).map((u,i)=>'<img src="'+u+'" alt="Ausgewähltes Urlaubsfoto '+(i+1)+'">').join('')+'</div><span><b>'+photoUrls.length+' Foto'+(photoUrls.length===1?'':'s')+' ausgewählt</b><small>Nur lokale Vorschau · Bildanalyse noch nicht aktiv</small></span>';
}
function paint(){if(painting)return;painting=true;try{install();}finally{painting=false;}}
document.addEventListener('click',e=>{
 if(e.target.closest?.('[data-v572-filter]')){e.preventDefault();openFilterShortcut();return;}
 if(e.target.closest?.('#discover .product-mode'))setTimeout(()=>{const p=document.querySelector('#discover [data-v571-smart]');if(p)p.dataset.v572='';paint();},100);
});
document.addEventListener('change',e=>{const i=e.target.closest?.('[data-v572-photos]');if(i)showPhotos(i.files);});
const mo=new MutationObserver(()=>requestAnimationFrame(paint));mo.observe(document.documentElement,{childList:true,subtree:true});
setTimeout(paint,80);setTimeout(paint,260);setTimeout(paint,700);setTimeout(paint,1400);
window.NOREYO_V572={paint};
})();
