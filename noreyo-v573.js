/* NOREYO V5.73 — multimodal vision search: text + 3–8 images + saved taste */
(()=>{
'use strict';
let painting=false;
let photoUrls=[];
const PROFILE_KEY='noreyoTravelDNA';
function norm(v){return String(v||'').toLowerCase();}
function mode(){const a=document.querySelector('#discover .product-mode.on');const t=norm(a?.textContent||'');if(t.includes('kreuzfahrt'))return'cruise';if(t.includes('hotel'))return'hotel';if(t.includes('flug'))return'flight';return'package';}
function profile(){try{return JSON.parse(localStorage.getItem(PROFILE_KEY)||'null');}catch(_){return null;}}
const examples={
 package:'z. B. Kreta im September, 7 Tage, ab Düsseldorf, All Inclusive, kleine Bucht, max. 2.500 € für zwei.',
 hotel:'z. B. Mallorca, 7 Nächte, kleines modernes Hotel, nah am Meer und Restaurants zu Fuß, max. 1.200 €.',
 flight:'z. B. Im September nach Mallorca, 7 Tage, ab Düsseldorf oder Köln, Direktflug, max. 700 € für zwei.',
 cruise:'z. B. Mittelmeer im September, 7–9 Nächte, Balkonkabine, eher modernes Schiff, max. 2.500 €.'
};
function formulaMarkup(p){
 const parts=['<span>deinen Wunsch</span>','<span>3–8 Bilder</span>'];
 if(p)parts.push('<span>deinen Reisestil</span>');
 return '<div class="noreyo-v573-formula"><small>NOREYO VERBINDET</small><div>'+parts.join('<b>+</b>')+'<i>→</i><strong>eine Suche</strong></div></div>';
}
function markup(){
 const p=profile();
 return '<div class="noreyo-v573-head"><span>✦</span><div><small>SO SOLL MEIN URLAUB AUSSEHEN</small><h3>Zeig oder beschreib NOREYO, was du willst.</h3></div>'+(p?'<em>Reisestil aktiv</em>':'')+'</div>'+
 '<p class="noreyo-v573-sub">Schreib einen Satz. Wenn du willst, ergänze mehrere Fotos oder Screenshots, die zeigen, was dir gefällt.</p>'+
 '<div class="noreyo-v573-compose">'+
   '<textarea data-v571-text maxlength="500" rows="2" placeholder="'+examples[mode()]+'" aria-label="Urlaub beschreiben"></textarea>'+
   '<div class="noreyo-v573-addrow">'+
     '<label class="noreyo-v573-images"><input type="file" accept="image/*" multiple data-v573-photos><span>▧</span><b>3–8 Bilder ergänzen</b><small>Fotos oder Screenshots</small><i>+</i></label>'+
     '<button type="button" class="noreyo-v573-go" data-v573-go>Genau danach suchen <span>→</span></button>'+
   '</div>'+
   '<div class="noreyo-v573-preview" data-v573-preview></div>'+
 '</div>'+
 formulaMarkup(p)+
 '<div class="noreyo-v573-classic"><span>ODER KLASSISCH SUCHEN</span></div>';
}
function install(){
 const panel=document.querySelector('#discover [data-v571-smart]');if(!panel)return;
 if(panel.dataset.v573==='1'&&panel.querySelector('.noreyo-v573-head'))return;
 panel.dataset.v573='1';panel.classList.add('noreyo-v573-smart');panel.innerHTML=markup();
 const head=document.querySelector('#discover .search-card .search-console-head b,#discover .search-card .noreyo-v552-search-head b');if(head)head.textContent='So möchtest du deinen Urlaub finden';
}
function clearPhotos(){photoUrls.forEach(u=>{try{URL.revokeObjectURL(u);}catch(_){}});photoUrls=[];}
function showPhotos(files){
 clearPhotos();const arr=[...(files||[])].slice(0,8);photoUrls=arr.map(f=>URL.createObjectURL(f));const host=document.querySelector('#discover [data-v573-preview]');if(!host)return;
 if(!arr.length){host.innerHTML='';return;}
 const shown=photoUrls.slice(0,5);
 host.innerHTML='<div class="noreyo-v573-thumbs">'+shown.map((u,i)=>'<img src="'+u+'" alt="Ausgewähltes Urlaubsbild '+(i+1)+'">').join('')+(arr.length>5?'<span>+'+(arr.length-5)+'</span>':'')+'</div><div class="noreyo-v573-previewcopy"><b>'+arr.length+' Bild'+(arr.length===1?'':'er')+' ausgewählt</b><small>'+(arr.length<3?'3–8 unterschiedliche Bilder geben NOREYO später ein besseres Gesamtbild.':'Perfekt: mehrere Eindrücke zeigen deinen gewünschten Stil besser als ein einzelnes Foto.')+'</small><em>Lokale Vorschau · Bildanalyse noch nicht aktiv</em></div>';
}
function submit(){
 const ta=document.querySelector('#discover [data-v571-text]');const text=String(ta?.value||'').trim();
 if(text.length>=8){window.NOREYO_V571?.submit?.();return;}
 if(photoUrls.length){
   ta?.focus();
   try{if(typeof showToast==='function')showToast('Bilder sind gewählt. Ergänze aktuell noch einen kurzen Wunsch – die Bildanalyse wird als nächstes angebunden.');}catch(_){ }
   return;
 }
 ta?.focus();try{if(typeof showToast==='function')showToast('Schreib kurz, wie dein Urlaub sein soll – oder füge mehrere Bilder hinzu.');}catch(_){ }
}
function paint(){if(painting)return;painting=true;try{install();}finally{painting=false;}}
document.addEventListener('click',e=>{
 if(e.target.closest?.('[data-v573-go]')){e.preventDefault();submit();return;}
 if(e.target.closest?.('#discover .product-mode'))setTimeout(()=>{const p=document.querySelector('#discover [data-v571-smart]');if(p)p.dataset.v573='';paint();},170);
});
document.addEventListener('change',e=>{const input=e.target.closest?.('[data-v573-photos]');if(input)showPhotos(input.files);});
const mo=new MutationObserver(()=>requestAnimationFrame(paint));mo.observe(document.documentElement,{childList:true,subtree:true});
setTimeout(paint,80);setTimeout(paint,260);setTimeout(paint,720);setTimeout(paint,1450);
window.NOREYO_V573={paint};
})();
