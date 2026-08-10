/* NOREYO V5.98 — premium discovery + isolated safety loader on current main */
(()=>{
'use strict';
let painting=false,paintQueued=false;
const retries=new Map();
const examples={
 package:'z. B. Kreta im September, 7 Tage, All Inclusive, kleine Bucht, max. 2.500 €.',
 hotel:'z. B. kleines modernes Hotel am Meer, Balkon, Restaurants zu Fuß, max. 1.200 €.',
 flight:'z. B. Mallorca im September, ab Düsseldorf, Direktflug, max. 700 €.',
 cruise:'z. B. Mittelmeer, 7–9 Nächte, Balkonkabine, modernes Schiff, max. 2.500 €.'
};
function norm(v){return String(v||'').toLowerCase();}
function mode(){const a=document.querySelector('#discover .product-mode.on');const t=norm(a?.textContent||'');if(t.includes('kreuzfahrt'))return'cruise';if(t.includes('hotel'))return'hotel';if(t.includes('flug'))return'flight';return'package';}
function hero(){
 const layer=document.querySelector('#discover .noreyo-v574-hero-layer');if(!layer||layer.dataset.v577==='1')return;
 layer.dataset.v577='1';
 layer.innerHTML='<div class="noreyo-v577-badge">NOREYO</div><div class="noreyo-v577-hero-copy"><small>REISEN, DIE ZU DIR PASSEN</small><h1>Finde deinen Urlaub.<br><b>Auf deine Art.</b></h1><p>Klassisch suchen – oder NOREYO einfach sagen, was dir wichtig ist.</p></div>';
}
function smart(){
 const host=document.querySelector('#discover [data-v574-usp]');if(!host||host.dataset.v577==='1')return;
 host.dataset.v577='1';host.classList.add('noreyo-v577-smart');
 const ph=examples[mode()]||examples.package;
 host.innerHTML='<div class="noreyo-v577-dock"><button type="button" data-v577-open="text"><span>✦</span><b>Wunsch beschreiben</b><small>Ein Satz reicht</small></button><button type="button" data-v577-open="photos"><span>▧</span><b>Bilder zeigen</b><small>Inspiration ergänzen</small></button></div><div class="noreyo-v577-panel"><div class="noreyo-v577-panel-head"><div><small>NOREYO SUCHE</small><b>Was ist dir im Urlaub wichtig?</b></div><button type="button" data-v577-close aria-label="Schließen">×</button></div><textarea data-v574-text maxlength="500" rows="2" aria-label="Urlaub beschreiben" placeholder="'+ph+'"></textarea><div class="noreyo-v577-panel-actions"><label><input type="file" accept="image/*" multiple data-v574-photos><span>▧</span><b>Bilder hinzufügen</b></label><button type="button" data-v574-go>Wunsch übernehmen <span>→</span></button></div><div class="noreyo-v574-preview" data-v574-preview></div><p class="noreyo-v577-photo-note">Bilder können bereits ausgewählt werden; die automatische Bildanalyse ist noch nicht aktiv.</p></div>';
}
function cleanup(){
 document.querySelectorAll('#discover .noreyo-v574-mode-intro').forEach(x=>x.style.display='none');
 const card=document.querySelector('#discover .search-card');if(card)card.classList.add('noreyo-v577-search-card');
 const products=document.querySelector('#discover .product-switch.noreyo-v552-products');if(products)products.classList.add('noreyo-v577-products');
}
function updatePlaceholder(){const ta=document.querySelector('#discover [data-v574-text]');if(ta&&!ta.value)ta.placeholder=examples[mode()]||examples.package;}
function openPanel(kind){
 const host=document.querySelector('#discover [data-v574-usp]');if(!host)return;
 host.classList.add('is-open');
 /* iOS requires file-input clicks/focus to stay in the original tap gesture. */
 if(kind==='photos')host.querySelector('[data-v574-photos]')?.click();
 else host.querySelector('[data-v574-text]')?.focus({preventScroll:false});
}
function closePanel(){document.querySelector('#discover [data-v574-usp]')?.classList.remove('is-open');}
function paint(){if(painting)return;painting=true;try{hero();smart();cleanup();updatePlaceholder();}finally{painting=false;}}
function schedulePaint(){if(paintQueued)return;paintQueued=true;requestAnimationFrame(()=>{paintQueued=false;paint();});}
function relevant(records){for(const r of records){for(const n of r.addedNodes||[]){if(n.nodeType!==1)continue;if(n.matches?.('#discover,.noreyo-v574-hero-layer,[data-v574-usp],.search-card,.product-switch-host')||n.querySelector?.('#discover,.noreyo-v574-hero-layer,[data-v574-usp],.search-card,.product-switch-host'))return true;}}return false;}
function retry(key,fn){const n=(retries.get(key)||0)+1;retries.set(key,n);if(n<=3)setTimeout(fn,400*Math.pow(2,n-1));}
function loadCss(){if(document.querySelector('link[data-noreyo-v593]'))return;const l=document.createElement('link');l.rel='stylesheet';l.href='./noreyo-v593.css?build=598';l.dataset.noreyoV593='1';l.onload=()=>retries.delete('593');l.onerror=()=>{l.remove();retry('593',loadCss);};document.head.appendChild(l);}
function loadScript(key,globalName){if(window[globalName]||document.querySelector(`script[data-noreyo-v${key}]`))return;const s=document.createElement('script');s.src=`./noreyo-v${key}.js?build=598`;s.async=false;s.dataset[`noreyoV${key}`]='1';s.onload=()=>retries.delete(key);s.onerror=()=>{s.remove();retry(key,()=>loadScript(key,globalName));};document.head.appendChild(s);}
function loadSafety(){loadCss();loadScript('592','NOREYO_V592');loadScript('594','NOREYO_V594');loadScript('595','NOREYO_V595');loadScript('596','NOREYO_V596');}
document.addEventListener('click',e=>{
 const open=e.target.closest?.('[data-v577-open]');if(open){e.preventDefault();openPanel(open.dataset.v577Open);return;}
 if(e.target.closest?.('[data-v577-close]')){e.preventDefault();closePanel();return;}
 if(e.target.closest?.('#discover .product-mode'))setTimeout(updatePlaceholder,180);
});
const mo=new MutationObserver(records=>{if(relevant(records))schedulePaint();});mo.observe(document.documentElement,{childList:true,subtree:true});
setTimeout(paint,80);setTimeout(paint,280);setTimeout(paint,750);setTimeout(paint,1500);setTimeout(loadSafety,120);
window.addEventListener('pageshow',loadSafety,{passive:true});
window.NOREYO_V577={paint,openPanel,closePanel,loadSafety,relevant};
})();
