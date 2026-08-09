/* NOREYO V5.71 — natural-language search becomes the primary entry */
(()=>{
'use strict';
let painting=false;
const profileKey='noreyoTravelDNA';
function norm(v){return String(v||'').toLowerCase();}
function mode(){
 const active=document.querySelector('#discover .product-mode.on');
 const t=norm(active?.textContent||'');
 if(t.includes('kreuzfahrt'))return'cruise';
 if(t.includes('hotel'))return'hotel';
 if(t.includes('flug'))return'flight';
 return'package';
}
const copy={
 package:{placeholder:'z. B. Mallorca im September, 7 Tage, ab Düsseldorf, All Inclusive, direkt am Strand, Balkon, max. 2.500 € für zwei.'},
 hotel:{placeholder:'z. B. Mallorca im September, 7 Nächte, direkt am Meer, eher ruhig, Balkon, max. 1.200 € für zwei.'},
 flight:{placeholder:'z. B. Im September nach Mallorca, 7 Tage, ab Düsseldorf oder Köln, Direktflug, max. 700 € für zwei.'},
 cruise:{placeholder:'z. B. Mittelmeer im September, 7–9 Nächte, Balkonkabine, max. 2.500 € für zwei.'}
};
function profile(){try{return JSON.parse(localStorage.getItem(profileKey)||'null');}catch(_){return null;}}
function panelMarkup(){
 const p=profile();
 return '<section class="noreyo-v571-smart" data-v571-smart>'+
  '<div class="noreyo-v571-topline"><span>✦</span><b>SO EINFACH GEHT REISESUCHE</b></div>'+
  '<h3>Beschreib deinen Urlaub.<br>NOREYO macht daraus deine Suche.</h3>'+
  '<p class="noreyo-v571-sub">Schreib einfach so, wie du es einem Menschen sagen würdest. Ein Satz reicht.</p>'+
  '<div class="noreyo-v571-inputbox">'+
   '<textarea data-v571-text maxlength="500" rows="4" aria-label="Urlaub beschreiben"></textarea>'+
   '<button type="button" data-v571-go>Suche daraus erstellen <span>→</span></button>'+
  '</div>'+
  '<div class="noreyo-v571-understand"><span>✓ Ziel</span><span>✓ Datum</span><span>✓ Budget</span><span>✓ Wünsche</span></div>'+
  '<p class="noreyo-v571-safe">Du prüfst alles kurz, bevor NOREYO deine Angaben übernimmt.</p>'+
  (p?'<div class="noreyo-v571-profile">✓ Deine gespeicherten Vorlieben werden zusätzlich berücksichtigt.</div>':'')+
  '<div class="noreyo-v571-classic"><span>ODER WIE GEWOHNT MIT FELDERN SUCHEN</span></div>'+
 '</section>';
}
function updatePlaceholder(){
 const ta=document.querySelector('#discover [data-v571-text]');
 if(ta)ta.placeholder=(copy[mode()]||copy.package).placeholder;
}
function install(){
 const card=document.querySelector('#discover .search-card');
 if(!card)return;
 const head=card.querySelector('.search-console-head,.noreyo-v552-search-head');
 if(!head)return;
 let panel=card.querySelector('[data-v571-smart]');
 if(!panel){head.insertAdjacentHTML('afterend',panelMarkup());panel=card.querySelector('[data-v571-smart]');}
 const headText=head.querySelector('b');
 if(headText)headText.textContent='Einfach beschreiben oder klassisch einstellen';
 updatePlaceholder();
}
function hideLegacyLaunchers(){
 document.querySelectorAll('#discover .noreyo-v555-ai-launch,#discover .noreyo-v560-launch').forEach(el=>{el.setAttribute('aria-hidden','true');el.tabIndex=-1;});
}
function patchAiSheet(){
 const w=document.getElementById('noreyoAi556');
 if(w){
  const eye=w.querySelector('.noreyo-v556-eyebrow');if(eye)eye.innerHTML='<i></i>DEIN URLAUB IN EINEM SATZ';
  const h=w.querySelector('#noreyoAi556Title');if(h)h.textContent='Prüfe kurz, was NOREYO verstanden hat.';
  const intro=w.querySelector('.noreyo-v556-intro');if(intro)intro.textContent='NOREYO hat deinen Satz in die vorhandene Suche übersetzt. Du kannst die erkannten Angaben vor dem Übernehmen noch ändern.';
 }
 const old=document.getElementById('noreyoAi555');
 if(old){
  const s=old.querySelector('header small');if(s)s.textContent='DEIN URLAUB IN EINEM SATZ';
  const h=old.querySelector('#noreyoAiTitle');if(h)h.textContent='Prüfe kurz, was NOREYO verstanden hat.';
 }
}
function launchExisting(text){
 const launcher=document.querySelector('#discover .noreyo-v555-ai-launch');
 if(!launcher){try{if(typeof showToast==='function')showToast('Die Wunschsuche wird noch geladen. Bitte gleich erneut tippen.');}catch(_){ }return;}
 launcher.click();
 let tries=0;
 const fill=()=>{
  tries++;
  const ta=document.querySelector('#noreyoAi556Text,#noreyoAiText');
  if(!ta){if(tries<12)setTimeout(fill,70);return;}
  ta.value=text;ta.dispatchEvent(new Event('input',{bubbles:true}));patchAiSheet();
  const analyze=document.querySelector('#noreyoAi556 .noreyo-v556-analyze,#noreyoAi555 .noreyo-v555-understand');
  if(analyze)setTimeout(()=>analyze.click(),60);
 };
 setTimeout(fill,40);
}
function submit(){
 const ta=document.querySelector('#discover [data-v571-text]');
 const text=String(ta?.value||'').trim();
 if(text.length<8){
  ta?.focus();
  try{if(typeof showToast==='function')showToast('Beschreib deinen Urlaub kurz in einem Satz.');}catch(_){ }
  return;
 }
 launchExisting(text);
}
function paint(){if(painting)return;painting=true;try{install();hideLegacyLaunchers();patchAiSheet();}finally{painting=false;}}
document.addEventListener('click',e=>{
 if(e.target.closest?.('[data-v571-go]')){e.preventDefault();submit();return;}
 if(e.target.closest?.('#discover .product-mode'))setTimeout(()=>{install();updatePlaceholder();},80);
});
document.addEventListener('keydown',e=>{
 const ta=e.target.closest?.('[data-v571-text]');
 if(ta&&(e.metaKey||e.ctrlKey)&&e.key==='Enter'){e.preventDefault();submit();}
});
const mo=new MutationObserver(()=>requestAnimationFrame(paint));
mo.observe(document.documentElement,{childList:true,subtree:true});
setTimeout(paint,60);setTimeout(paint,220);setTimeout(paint,600);setTimeout(paint,1300);
window.NOREYO_V571={paint,submit};
})();
