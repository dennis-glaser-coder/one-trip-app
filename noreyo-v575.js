/* NOREYO V5.75.1 — one first-screen experience, idempotent paint */
(()=>{
'use strict';
let painting=false,paintQueued=false;
const PROFILE_KEY='noreyoTravelDNA';
function norm(v){return String(v||'').toLowerCase();}
function mode(){const a=document.querySelector('#discover .product-mode.on');const t=norm(a?.textContent||'');if(t.includes('kreuzfahrt'))return'cruise';if(t.includes('hotel'))return'hotel';if(t.includes('flug'))return'flight';return'package';}
function hasProfile(){try{return !!JSON.parse(localStorage.getItem(PROFILE_KEY)||'null');}catch(_){return false;}}
const examples={
 package:'z. B. Kreta im September, 7 Tage, All Inclusive, kleine Bucht, max. 2.500 €.',
 hotel:'z. B. kleines modernes Hotel am Meer, Restaurants zu Fuß, max. 1.200 €.',
 flight:'z. B. Mallorca im September, ab Düsseldorf, Direktflug, max. 700 €.',
 cruise:'z. B. Mittelmeer, 7–9 Nächte, Balkonkabine, max. 2.500 €.'
};
function heroMarkup(){return '<div class="noreyo-v574-hero-badge">NOREYO</div><div class="noreyo-v574-hero-copy"><small>REISEN, DIE ZU DIR PASSEN</small><h1>Du kennst das Gefühl.<br><b>NOREYO findet die Reise dazu.</b></h1><p>Beschreib es. Zeig Bilder. Oder such klassisch.</p></div>';}
function quickMarkup(){const p=hasProfile();return '<div class="noreyo-v575-quick"><div class="noreyo-v575-quick-head"><div><small>WIE SOLL DEIN URLAUB SEIN?</small><b>Einfach sagen oder zeigen.</b></div>'+(p?'<em>Vorlieben aktiv</em>':'')+'</div><div class="noreyo-v575-compose"><textarea data-v574-text maxlength="500" rows="2" aria-label="Urlaub beschreiben" placeholder="'+(examples[mode()]||examples.package)+'"></textarea><div class="noreyo-v575-actions"><label class="noreyo-v575-images"><input type="file" accept="image/*" multiple data-v574-photos><span>▧</span><b>Bilder hinzufügen</b><i>+</i></label><button type="button" data-v574-go>Urlaub finden <span>→</span></button></div><div class="noreyo-v574-preview" data-v574-preview></div></div><div class="noreyo-v575-proof"><span>✦ Wunsch verstehen</span><span>▧ Bilder ergänzen</span>'+(p?'<span>♡ Vorlieben mitdenken</span>':'')+'</div></div>';}
function tuneHero(){const layer=document.querySelector('#discover .noreyo-v574-hero-layer');if(!layer||layer.dataset.v575==='1')return;layer.dataset.v575='1';layer.innerHTML=heroMarkup();}
function tuneUsp(){const usp=document.querySelector('#discover [data-v574-usp]');if(!usp||usp.dataset.v575==='1')return;usp.dataset.v575='1';usp.classList.add('noreyo-v575-usp');usp.innerHTML=quickMarkup();}
function tuneClassic(){const intro=document.querySelector('#discover .noreyo-v574-mode-intro');if(intro&&intro.innerHTML!=='<small>ODER KLASSISCH SUCHEN</small>')intro.innerHTML='<small>ODER KLASSISCH SUCHEN</small>';}
function updatePlaceholder(){const ta=document.querySelector('#discover [data-v574-text]');if(ta&&!ta.value)ta.placeholder=examples[mode()]||examples.package;}
function paint(){if(painting)return;painting=true;try{tuneHero();tuneUsp();tuneClassic();updatePlaceholder();}finally{painting=false;}}
function schedulePaint(){if(paintQueued)return;paintQueued=true;requestAnimationFrame(()=>{paintQueued=false;paint();});}
function relevant(records){for(const r of records){for(const n of r.addedNodes||[]){if(n.nodeType!==1)continue;if(n.matches?.('#discover,.noreyo-v574-hero-layer,[data-v574-usp],.noreyo-v574-mode-intro')||n.querySelector?.('#discover,.noreyo-v574-hero-layer,[data-v574-usp],.noreyo-v574-mode-intro'))return true;}}return false;}
document.addEventListener('click',e=>{if(e.target.closest?.('#discover .product-mode'))setTimeout(()=>{updatePlaceholder();tuneClassic();},220);});
const mo=new MutationObserver(records=>{if(relevant(records))schedulePaint();});mo.observe(document.documentElement,{childList:true,subtree:true});
setTimeout(paint,80);setTimeout(paint,260);setTimeout(paint,720);setTimeout(paint,1450);
window.NOREYO_V575={paint,relevant};
})();
