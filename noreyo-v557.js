(function(){
'use strict';
const BUILD='5.57';
const baseOpenFilter=typeof openFilter==='function'?openFilter:null;
let draft=null,activeKeys=[],lastMode='';
const defs={
  Zimmer0:{label:'Balkon',hint:'Zimmer mit Balkon',icon:'▱'},
  Zimmer1:{label:'Meerblick',hint:'Meerblick bevorzugen',icon:'≈'},
  Zimmer2:{label:'Terrasse',hint:'Eigene Terrasse',icon:'▭'},
  Hotel0:{label:'Mind. 4 Sterne',hint:'Hotelkategorie',icon:'★'},
  Hotel1:{label:'Adults Only',hint:'Nur für Erwachsene',icon:'18+'},
  Hotel4:{label:'Spa / Wellness',hint:'Wellnessbereich',icon:'✦'},
  Hotel5:{label:'Fitness',hint:'Fitnessraum / Gym',icon:'+'},
  Lage0:{label:'Sandstrand',hint:'Sand statt Fels / Kies',icon:'◌'},
  Lage1:{label:'Direkt am Strand',hint:'Kurzer Weg zum Meer',icon:'≋'},
  Lage2:{label:'Ruhige Lage',hint:'Weniger Trubel',icon:'⌁'},
  Lage3:{label:'Restaurants zu Fuß',hint:'Gastronomie fußläufig',icon:'⌂'},
  Lage4:{label:'Kurzer Transfer',hint:'Kurze Fahrt ab Flughafen',icon:'↗'},
  Preis2:{label:'Kostenlos stornierbar',hint:'Flexibler Tarif',icon:'↺'},
  Flug0:{label:'Direktflug',hint:'Ohne Zwischenstopp',icon:'✈'},
  Flug1:{label:'Aufgabegepäck',hint:'Koffer im Tarif',icon:'▣'}
};
const sets={
  package:{popular:['Zimmer0','Hotel0','Lage1','Lage2','Flug0','Preis2'],extra:['Zimmer1','Zimmer2','Hotel1','Hotel4','Hotel5','Lage0','Lage3','Lage4','Flug1']},
  hotel:{popular:['Zimmer0','Zimmer1','Hotel0','Lage1','Lage2','Preis2'],extra:['Zimmer2','Hotel1','Hotel4','Hotel5','Lage0','Lage3','Lage4']},
  flight:{popular:['Flug0','Flug1'],extra:[]}
};
const knownStateKeys=[...Object.keys(defs),'Hotel6','Hotel7'];
function mode(){
  const active=document.querySelector('#discover .product-mode.on');
  const t=(active?.textContent||'').toLowerCase();
  if(t.includes('flug'))return'flight';
  if(t.includes('hotel'))return'hotel';
  if(t.includes('kreuzfahrt'))return'cruise';
  try{if(typeof productMode==='string'&&['flight','hotel','package'].includes(productMode))return productMode;}catch(_){ }
  return'package';
}
function title(m){return m==='flight'?'Flugfilter':m==='hotel'?'Hotelfilter':'Reisefilter';}
function contextCopy(m){
  if(m==='flight')return '<b>Nur Flug.</b> Hotel-, Zimmer- und Lagefilter sind hier bewusst ausgeblendet.';
  if(m==='hotel')return '<b>Nur Hotel.</b> Keine Abflug- oder Flugfilter – nur Zimmer, Hotel, Lage und Tarif.';
  return '<b>Pauschalreise.</b> Hotel und Flug zusammen – aber nur die wichtigsten Kriterien zuerst.';
}
function introCopy(m){
  if(m==='flight')return 'Hier siehst du nur Filter, die bei einer reinen Flugsuche wirklich Sinn ergeben.';
  if(m==='hotel')return 'Wähle nur das, was für dein Hotel wirklich wichtig ist. Seltenere Kriterien findest du unter „Weitere Filter“.';
  return 'Die häufigsten Reisewünsche stehen oben. Alles Weitere ist bewusst eingeklappt, damit die Suche übersichtlich bleibt.';
}
function stateLabel(v){return v==='must'?'Muss sein':v==='wish'?'Wichtig':'Egal';}
function nextState(v){return v==='any'||!v?'wish':v==='wish'?'must':'any';}
function esc(v){return String(v??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));}
function item(key){
  const d=defs[key],s=draft?.[key]||'any';
  return '<button type="button" class="noreyo-v557-item '+(s==='wish'?'is-wish':s==='must'?'is-must':'')+'" data-v557-key="'+key+'"><span class="noreyo-v557-item-icon">'+esc(d.icon)+'</span><span class="noreyo-v557-item-copy"><b>'+esc(d.label)+'</b><small>'+esc(d.hint)+'</small></span><span class="noreyo-v557-state">'+stateLabel(s)+'</span></button>';
}
function shell(){
  let w=document.getElementById('noreyoFilter557');
  if(w)return w;
  w=document.createElement('div');
  w.id='noreyoFilter557';w.className='noreyo-v557-backdrop';
  w.innerHTML='<section class="noreyo-v557-sheet" role="dialog" aria-modal="true" aria-labelledby="noreyoFilter557Title"><div class="noreyo-v557-handle"></div><header class="noreyo-v557-head"><div><small>NOREYO FILTER</small><h2 id="noreyoFilter557Title"></h2></div><button type="button" class="noreyo-v557-close" aria-label="Schließen">×</button></header><div class="noreyo-v557-body"><p class="noreyo-v557-copy"></p><div class="noreyo-v557-context"></div><section class="noreyo-v557-section"><div class="noreyo-v557-label"><span>Wichtigste Filter</span></div><div class="noreyo-v557-list" data-v557-popular></div></section><section class="noreyo-v557-section" data-v557-extra-section><div class="noreyo-v557-label"><span>Weitere Filter</span><button type="button" class="noreyo-v557-more-toggle">Anzeigen</button></div><div class="noreyo-v557-list noreyo-v557-extra" data-v557-extra hidden></div></section><div class="noreyo-v557-foot"><button type="button" class="noreyo-v557-reset">Zurücksetzen</button><button type="button" class="noreyo-v557-apply">Übernehmen</button></div></div></section>';
  document.body.appendChild(w);
  w.addEventListener('click',e=>{if(e.target===w)close(false);});
  w.querySelector('.noreyo-v557-close').addEventListener('click',()=>close(false));
  w.querySelector('.noreyo-v557-more-toggle').addEventListener('click',()=>{
    const extra=w.querySelector('[data-v557-extra]'),btn=w.querySelector('.noreyo-v557-more-toggle');
    extra.hidden=!extra.hidden;btn.textContent=extra.hidden?'Anzeigen':'Ausblenden';
  });
  w.querySelector('.noreyo-v557-reset').addEventListener('click',()=>{activeKeys.forEach(k=>draft[k]='any');renderRows();});
  w.querySelector('.noreyo-v557-apply').addEventListener('click',()=>close(true));
  return w;
}
function renderRows(){
  const w=shell(),m=w.dataset.mode||mode(),set=sets[m]||sets.package;
  w.querySelector('[data-v557-popular]').innerHTML=set.popular.map(item).join('');
  const extra=w.querySelector('[data-v557-extra]'),sec=w.querySelector('[data-v557-extra-section]');
  extra.innerHTML=set.extra.map(item).join('');sec.hidden=!set.extra.length;
  w.querySelectorAll('[data-v557-key]').forEach(b=>b.addEventListener('click',()=>{const k=b.dataset.v557Key;draft[k]=nextState(draft[k]||'any');renderRows();}));
}
function openSmart(){
  const m=mode();
  if(m==='cruise'){if(baseOpenFilter)return baseOpenFilter('Kreuzfahrt');return;}
  if(typeof states==='undefined'||!states){if(baseOpenFilter)return baseOpenFilter(m==='flight'?'Flug':m==='hotel'?'Hotel':'Zimmer');return;}
  const w=shell(),set=sets[m]||sets.package;
  draft={...states};activeKeys=[...set.popular,...set.extra];
  w.dataset.mode=m;w.querySelector('#noreyoFilter557Title').textContent=title(m);w.querySelector('.noreyo-v557-copy').textContent=introCopy(m);w.querySelector('.noreyo-v557-context').innerHTML=contextCopy(m);
  const extra=w.querySelector('[data-v557-extra]');extra.hidden=true;w.querySelector('.noreyo-v557-more-toggle').textContent='Anzeigen';
  renderRows();w.classList.add('show');
}
function syncAfterApply(){
  try{if(typeof refreshQuickStates==='function')refreshQuickStates();}catch(_){ }
  try{if(typeof updateCounts==='function')updateCounts();}catch(_){ }
  try{if(typeof updateSearchUI==='function')updateSearchUI();}catch(_){ }
  try{if(typeof persistState==='function')persistState();}catch(_){ }
}
function close(apply){
  const w=document.getElementById('noreyoFilter557');if(!w)return;
  if(apply&&draft&&typeof states!=='undefined'&&states){activeKeys.forEach(k=>{if(k in draft)states[k]=draft[k];});syncAfterApply();try{if(typeof showToast==='function')showToast('Filter übernommen');}catch(_){ }}
  w.classList.remove('show');draft=null;activeKeys=[];
}
function clearIrrelevantOnModeChange(m){
  if(m==='cruise'||m===lastMode)return;
  lastMode=m;
  if(typeof states==='undefined'||!states)return;
  const set=sets[m]||sets.package,allowed=new Set([...set.popular,...set.extra]);
  let changed=false;
  knownStateKeys.forEach(k=>{
    if(!allowed.has(k)&&states[k]&&states[k]!=='any'){
      states[k]='any';changed=true;
    }
  });
  if(changed)syncAfterApply();
}
function install(){
  const m=mode();
  clearIrrelevantOnModeChange(m);
  if(typeof openFilter==='function'&&!openFilter.__noreyoV557){
    const wrapped=function(){openSmart();};wrapped.__noreyoV557=true;openFilter=wrapped;
  }
  const card=document.querySelector('#discover .search-card');
  if(card){
    card.querySelectorAll('.command-cell').forEach(el=>{
      const t=(el.textContent||'').replace(/\s+/g,' ').trim();
      if(/wünsche\s*&\s*pflicht|flugwünsche|filter/i.test(t)){
        const b=el.querySelector('.command-copy b');
        if(b)b.textContent=m==='flight'?'Flugfilter':m==='hotel'?'Hotelfilter':'Reisefilter';
      }
    });
  }
}
let raf=0;function schedule(){if(raf)return;raf=requestAnimationFrame(()=>{raf=0;install();});}
install();setTimeout(install,80);setTimeout(install,240);setTimeout(install,600);
const discover=document.getElementById('discover');if(discover&&typeof MutationObserver!=='undefined')new MutationObserver(schedule).observe(discover,{childList:true,subtree:true});
window.addEventListener('pageshow',schedule,{passive:true});
window.NOREYO_V557=Object.freeze({open:openSmart,mode,version:BUILD});
})();
