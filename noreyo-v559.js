(function(){
'use strict';
const BUILD='6.74';
const labelKey={
 'Balkon':'Zimmer0','Meerblick':'Zimmer1','Terrasse':'Zimmer2','Mind. 4 Sterne':'Hotel0','Adults Only':'Hotel1','Spa / Wellness':'Hotel4','Fitness':'Hotel5','Sandstrand':'Lage0','Direkt am Strand':'Lage1','Ruhige Lage':'Lage2','Restaurants zu Fuß':'Lage3','Kurzer Transfer':'Lage4','Kostenlos stornierbar':'Preis2','Direktflug':'Flug0','Aufgabegepäck':'Flug1'
};
let overrides={},raf=0,observer=null;

function norm(v){return String(v||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/ß/g,'ss');}
function esc(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function installStyle(){
  if(document.getElementById('noreyoV559Style'))return;
  const s=document.createElement('style');s.id='noreyoV559Style';s.textContent=`
#noreyoAi556Result .noreyo-v556-confidence{font-size:0!important;min-width:auto!important;padding:6px 9px!important}
#noreyoAi556Result .noreyo-v556-confidence:after{content:'Geprüft';font-size:9px;font-weight:850;letter-spacing:.35px}
.noreyo-v559-editor{margin:10px 0 0}.noreyo-v559-editor>p{margin:0 0 7px;font-size:8px;font-weight:850;letter-spacing:1.05px;text-transform:uppercase;color:#987346}
.noreyo-v559-editor small.noreyo-v559-help{display:block;margin:-2px 0 8px;font-size:9px;line-height:1.35;color:#6f7d83}
.noreyo-v559-prefs{display:flex;flex-wrap:wrap;gap:6px}.noreyo-v559-pref{appearance:none;-webkit-appearance:none;border:1px solid rgba(7,61,81,.10);border-radius:999px;background:#f6f8f8;color:#163744;padding:7px 9px;display:inline-flex;align-items:center;gap:6px;font:760 9.5px/1.1 -apple-system,BlinkMacSystemFont,"SF Pro Display","Segoe UI",sans-serif}
.noreyo-v559-pref i{width:7px;height:7px;border-radius:50%;background:#9aa9ad;display:block}.noreyo-v559-pref em{font-style:normal;font-size:8px;font-weight:850;color:#718087}.noreyo-v559-pref[data-state="wish"]{background:#eef9f8;border-color:rgba(7,154,154,.18)}.noreyo-v559-pref[data-state="wish"] i{background:#079a9a}.noreyo-v559-pref[data-state="wish"] em{color:#087d7f}.noreyo-v559-pref[data-state="must"]{background:#fff5e8;border-color:rgba(173,125,61,.22)}.noreyo-v559-pref[data-state="must"] i{background:#ad7d3d}.noreyo-v559-pref[data-state="must"] em{color:#9b6c31}.noreyo-v559-pref[data-state="any"]{opacity:.76;background:#f5f5f3}.noreyo-v559-neutral-note{margin:8px 0 0;font-size:9px;line-height:1.35;color:#748187}
`;document.head.appendChild(s);
}
function stateLabel(v){return v==='must'?'Muss sein':v==='wish'?'Wichtig':'Egal';}
function nextState(v){return v==='wish'?'must':v==='must'?'any':'wish';}
function neutralInText(label,text){
  const t=norm(text),keys={
   'Balkon':['balkon'],'Meerblick':['meerblick','sea view'],'Terrasse':['terrasse'],'Mind. 4 Sterne':['4 sterne','vier sterne'],'Adults Only':['adults only','erwachsenenhotel'],'Spa / Wellness':['spa','wellness'],'Fitness':['fitness','gym'],'Sandstrand':['sandstrand'],'Direkt am Strand':['direkt am strand','strandlage'],'Ruhige Lage':['ruhig','ruhige lage'],'Restaurants zu Fuß':['restaurants zu fuss','restaurants fusslaufig'],'Kurzer Transfer':['transfer'],'Kostenlos stornierbar':['stornierbar'],'Direktflug':['direktflug','nonstop'],'Aufgabegepäck':['aufgabegepack','koffer']
  },terms=keys[label]||[];
  return terms.some(term=>{
    const i=t.indexOf(term);if(i<0)return false;
    const around=t.slice(Math.max(0,i-26),Math.min(t.length,i+term.length+32));
    return /(egal|nicht wichtig|nicht noetig|nicht notwendig|brauche ich nicht|muss nicht|kein muss|unwichtig)/.test(around)||new RegExp('(kein|ohne)\\s+'+term.replace(/\s+/g,'\\s+')).test(around);
  });
}
function refreshState(){
  try{if(typeof refreshQuickStates==='function')refreshQuickStates();}catch(_){ }
  try{if(typeof updateCounts==='function')updateCounts();}catch(_){ }
  try{if(typeof updateSearchUI==='function')updateSearchUI();}catch(_){ }
  try{if(typeof persistState==='function')persistState();}catch(_){ }
}
function applyOverrides(snapshot){
  try{
    if(typeof states==='undefined'||!states)return;
    Object.entries(snapshot).forEach(([k,v])=>{if(k in states)states[k]=v;});
    refreshState();
  }catch(e){console.warn('NOREYO '+BUILD+' override',e);}
}
function decorate(){
  installStyle();
  const r=document.getElementById('noreyoAi556Result');
  if(!r||!r.querySelector('.noreyo-v556-result')||r.dataset.noreyoV559==='1')return;
  r.dataset.noreyoV559='1';overrides={};
  const input=document.getElementById('noreyoAi556Text')?.value||'',groups=[...r.querySelectorAll('.noreyo-v556-group')],prefs=[];
  groups.forEach(g=>{
    const head=(g.querySelector('.noreyo-v556-grouplabel')?.textContent||'').toLowerCase(),initial=head.includes('pflicht')?'must':head.includes('wünsche')?'wish':null;
    if(!initial)return;
    g.querySelectorAll('.noreyo-v556-chip').forEach(ch=>{
      const label=(ch.textContent||'').replace(/^[●✓]\s*/,'').trim(),key=labelKey[label];if(!key)return;
      const state=neutralInText(label,input)?'any':initial;overrides[key]=state;prefs.push({label,key,state});
    });
    g.remove();
  });
  if(prefs.length){
    const editor=document.createElement('div');editor.className='noreyo-v559-editor';
    editor.innerHTML='<p>Wichtig oder Muss?</p><small class="noreyo-v559-help">Tippe ein Kriterium an, wenn NOREYO deine Priorität anders verstanden hat.</small><div class="noreyo-v559-prefs">'+prefs.map(p=>'<button type="button" class="noreyo-v559-pref" data-key="'+esc(p.key)+'" data-state="'+esc(p.state)+'"><i></i><span>'+esc(p.label)+'</span><em>'+stateLabel(p.state)+'</em></button>').join('')+'</div>';
    const anchor=r.querySelector('.noreyo-v556-open,.noreyo-v556-safe');anchor?.insertAdjacentElement('beforebegin',editor);
    editor.addEventListener('click',e=>{
      const b=e.target.closest('.noreyo-v559-pref');if(!b)return;
      const next=nextState(b.dataset.state||'wish');b.dataset.state=next;b.querySelector('em').textContent=stateLabel(next);overrides[b.dataset.key]=next;
    });
  }
  const conf=r.querySelector('.noreyo-v556-confidence');if(conf)conf.setAttribute('aria-label','Angaben geprüft');
  r.addEventListener('click',e=>{
    if(!e.target.closest('.noreyo-v556-apply'))return;
    const snapshot={...overrides};setTimeout(()=>applyOverrides(snapshot),0);
  },{capture:true,once:true});
}
function resetMarker(){const r=document.getElementById('noreyoAi556Result');if(r)delete r.dataset.noreyoV559;}
function schedule(){if(raf)return;raf=requestAnimationFrame(()=>{raf=0;decorate();});}
function relevant(muts){
  for(const m of muts){
    if(m.target?.id==='noreyoAi556Result'||m.target?.closest?.('#noreyoAi556Result'))return true;
    for(const n of m.addedNodes||[])if(n.nodeType===1&&(n.id==='noreyoAi556Result'||n.querySelector?.('#noreyoAi556Result')))return true;
  }
  return false;
}
function installObserver(){
  if(observer||!document.body||typeof MutationObserver==='undefined')return;
  observer=new MutationObserver(muts=>{if(relevant(muts)){resetMarker();schedule();}});
  observer.observe(document.body,{childList:true,subtree:true});
}
function cleanup(){
  if(observer){observer.disconnect();observer=null;}
  if(raf){cancelAnimationFrame(raf);raf=0;}
}
function restore(){installStyle();resetMarker();decorate();installObserver();}

document.addEventListener('click',e=>{
  if(e.target.closest('.noreyo-v556-analyze'))setTimeout(()=>{resetMarker();decorate();},0);
},true);
restore();
window.addEventListener('pagehide',cleanup,{passive:true});
window.addEventListener('pageshow',restore,{passive:true});
window.NOREYO_V559=Object.freeze({BUILD,decorate,relevant,cleanup,installObserver,get observing(){return !!observer;}});
})();