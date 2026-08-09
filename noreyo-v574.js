/* NOREYO V5.74.1 — first-screen USP before classic search, hardened */
(()=>{
'use strict';
let painting=false,paintQueued=false;
let photoUrls=[];
const PROFILE_KEY='noreyoTravelDNA';
function norm(v){return String(v||'').toLowerCase();}
function mode(){const a=document.querySelector('#discover .product-mode.on');const t=norm(a?.textContent||'');if(t.includes('kreuzfahrt'))return'cruise';if(t.includes('hotel'))return'hotel';if(t.includes('flug'))return'flight';return'package';}
function hasProfile(){try{return !!JSON.parse(localStorage.getItem(PROFILE_KEY)||'null');}catch(_){return false;}}
const examples={
 package:'z. B. Kreta im September, 7 Tage, ab Düsseldorf, All Inclusive, kleine Bucht, max. 2.500 € für zwei.',
 hotel:'z. B. Mallorca, kleines modernes Hotel am Meer, Restaurants zu Fuß, 7 Nächte, max. 1.200 €.',
 flight:'z. B. Mallorca im September, ab Düsseldorf oder Köln, Direktflug, max. 700 € für zwei.',
 cruise:'z. B. Mittelmeer im September, 7–9 Nächte, Balkonkabine, modernes Schiff, max. 2.500 €.'
};
function heroMarkup(){return '<div class="noreyo-v574-hero-layer"><div class="noreyo-v574-hero-badge">NOREYO</div><div class="noreyo-v574-hero-copy"><small>DIE REISESUCHE, DIE DICH VERSTEHT</small><h1>Du kennst das Gefühl.<br><b>NOREYO findet die Reise dazu.</b></h1><p>Beschreib deinen Wunsch, zeig Bilder, die dir gefallen – oder such ganz klassisch.</p></div><div class="noreyo-v574-hero-paths"><span>✦ Beschreiben</span><span>▧ Bilder zeigen</span><span>⌕ Klassisch</span></div></div>';}
function uspMarkup(){const p=hasProfile();return '<section class="noreyo-v574-usp" data-v574-usp><div class="noreyo-v574-usp-head"><div><small>DEIN WUNSCH. DEINE BILDER. EINE SUCHE.</small><h2>Zeig NOREYO, wie dein Urlaub aussehen soll.</h2></div>'+(p?'<em>Vorlieben aktiv</em>':'')+'</div><p>Du musst keinen Filternamen kennen. Schreib, was dir wichtig ist, und ergänze 3–8 Fotos oder Screenshots, die zeigen, was dir gefällt.</p><div class="noreyo-v574-compose"><textarea data-v574-text maxlength="500" rows="2" aria-label="Urlaub beschreiben"></textarea><div class="noreyo-v574-actions"><label class="noreyo-v574-images"><input type="file" accept="image/*" multiple data-v574-photos><span>▧</span><b>3–8 Bilder zeigen</b><small>Fotos oder Screenshots</small><i>+</i></label><button type="button" data-v574-go>Diesen Urlaub finden <span>→</span></button></div><div class="noreyo-v574-preview" data-v574-preview></div></div><div class="noreyo-v574-formula"><small>NOREYO VERBINDET</small><div><span>deinen Wunsch</span><b>+</b><span>deine Bilder</span>'+(p?'<b>+</b><span>deine Vorlieben</span>':'')+'<i>→</i><strong>deine Reisesuche</strong></div></div></section>';}
function ensureHero(){const hero=document.querySelector('#discover .hero');if(!hero)return;hero.classList.add('noreyo-v574-hero');if(!hero.querySelector('.noreyo-v574-hero-layer'))hero.insertAdjacentHTML('beforeend',heroMarkup());}
function ensureUsp(){const hero=document.querySelector('#discover .hero');if(!hero)return;let usp=document.querySelector('#discover [data-v574-usp]');if(!usp){hero.insertAdjacentHTML('afterend',uspMarkup());usp=document.querySelector('#discover [data-v574-usp]');}const ta=usp?.querySelector('[data-v574-text]');if(ta&&!ta.value)ta.placeholder=examples[mode()]||examples.package;}
function ensureClassicIntro(){const discover=document.getElementById('discover');if(!discover)return;const host=discover.querySelector('.product-switch-host');if(host&&!discover.querySelector('.noreyo-v574-mode-intro'))host.insertAdjacentHTML('beforebegin','<div class="noreyo-v574-mode-intro"><small>ODER GANZ KLASSISCH</small><b>Reiseart wählen und wie gewohnt suchen.</b></div>');const card=discover.querySelector('.search-card');if(card&&!card.querySelector('.noreyo-v574-classic-title')){const grid=card.querySelector('.booking-command-grid,.noreyo-v552-cruise-grid');if(grid)grid.insertAdjacentHTML('beforebegin','<div class="noreyo-v574-classic-title"><small>KLASSISCHE SUCHE</small><b>Ziel, Zeitraum, Reisende & Wünsche</b></div>');}}
function clearPhotos(){photoUrls.forEach(u=>{try{URL.revokeObjectURL(u);}catch(_){}});photoUrls=[];}
function showPhotos(files){
 clearPhotos();
 const arr=[...(files||[])].filter(f=>String(f?.type||'').startsWith('image/')).slice(0,8);
 photoUrls=arr.map(f=>URL.createObjectURL(f));
 const host=document.querySelector('#discover [data-v574-preview]');if(!host)return;
 if(!arr.length){host.innerHTML='';return;}
 host.innerHTML='<div class="noreyo-v574-thumbs">'+photoUrls.slice(0,5).map((u,i)=>'<img src="'+u+'" alt="Ausgewähltes Urlaubsbild '+(i+1)+'">').join('')+(arr.length>5?'<span>+'+(arr.length-5)+'</span>':'')+'</div><div><b>'+arr.length+' Bild'+(arr.length===1?'':'er')+' gewählt</b><small>'+(arr.length<3?'Mehrere Bilder zeigen deinen gewünschten Stil besser.':'Mehrere Eindrücke ergeben ein klareres Bild deines Urlaubs.')+'</small><em>Bildanalyse noch nicht aktiv</em></div>';
}
function submit(){const source=document.querySelector('#discover [data-v574-text]');const text=String(source?.value||'').trim();if(text.length>=8){const hidden=document.querySelector('#discover .search-card [data-v571-text]');if(hidden){hidden.value=text;hidden.dispatchEvent(new Event('input',{bubbles:true}));}window.NOREYO_V571?.submit?.();return;}if(photoUrls.length){source?.focus();try{if(typeof showToast==='function')showToast('Bilder sind ausgewählt. Ergänze aktuell noch kurz deinen Wunsch – die Bildanalyse wird als Nächstes angebunden.');}catch(_){ }return;}source?.focus();try{if(typeof showToast==='function')showToast('Beschreib kurz deinen Urlaub oder ergänze mehrere Bilder.');}catch(_){ }}
function updateMode(){const ta=document.querySelector('#discover [data-v574-text]');if(ta&&!ta.value)ta.placeholder=examples[mode()]||examples.package;const title=document.querySelector('#discover .noreyo-v574-classic-title b');if(title)title.textContent=mode()==='flight'?'Ziel, Zeitraum, Reisende & Flugwünsche':mode()==='cruise'?'Route, Zeitraum, Reisende & Kabine':'Ziel, Zeitraum, Reisende & Wünsche';}
function paint(){if(painting)return;painting=true;try{ensureHero();ensureUsp();ensureClassicIntro();updateMode();}finally{painting=false;}}
function schedulePaint(){if(paintQueued)return;paintQueued=true;requestAnimationFrame(()=>{paintQueued=false;paint();});}
function relevant(records){for(const r of records){for(const n of r.addedNodes||[]){if(n.nodeType!==1)continue;if(n.matches?.('#discover,.hero,.search-card,.product-switch-host,[data-v574-usp]')||n.querySelector?.('#discover,.hero,.search-card,.product-switch-host,[data-v574-usp]'))return true;}}return false;}
document.addEventListener('click',e=>{if(e.target.closest?.('[data-v574-go]')){e.preventDefault();submit();return;}if(e.target.closest?.('#discover .product-mode'))setTimeout(()=>{paint();updateMode();},180);});
document.addEventListener('change',e=>{const input=e.target.closest?.('[data-v574-photos]');if(input)showPhotos(input.files);});
const mo=new MutationObserver(records=>{if(relevant(records))schedulePaint();});mo.observe(document.documentElement,{childList:true,subtree:true});
setTimeout(paint,80);setTimeout(paint,260);setTimeout(paint,700);setTimeout(paint,1400);
window.addEventListener('pagehide',clearPhotos,{passive:true});
window.NOREYO_V574={paint,clearPhotos,relevant};
})();
