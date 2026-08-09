/* NOREYO V5.64 — Travel DNA: 3-step fast path */
(()=>{
'use strict';
const VERSION='5.64';
const PROFILE_KEY='noreyoTravelDNA';
let step=0,answers={};
const qs=[
  {id:'hotel',title:'Was fühlt sich mehr nach dir an?',sub:'Hotelstil statt Formular.',options:[
    {value:'boutique',title:'Boutique & persönlich',copy:'Kleiner, individueller, besonderer.',theme:'boutique',tags:['Persönliche Hotels']},
    {value:'resort',title:'Resort & alles vor Ort',copy:'Pool, Auswahl und maximal bequem.',theme:'resort',tags:['Resort-Komfort']}
  ]},
  {id:'location',title:'Wo willst du lieber aufwachen?',sub:'Meer oder mittendrin – spontan wählen.',options:[
    {value:'beach',title:'Direkt am Meer',copy:'Kurzer Weg zum Wasser. Am liebsten sofort.',theme:'beach',tags:['Direkt am Meer'],states:['Lage1']},
    {value:'central',title:'Mittendrin',copy:'Restaurants, Orte und Leben zu Fuß.',theme:'central',tags:['Restaurants zu Fuß'],states:['Lage3']}
  ]},
  {id:'pace',title:'Wie soll sich Urlaub anfühlen?',sub:'Dein Tempo entscheidet.',options:[
    {value:'quiet',title:'Ruhig & entspannt',copy:'Weniger Trubel, mehr Abschalten.',theme:'quiet',tags:['Ruhige Lage'],states:['Lage2']},
    {value:'lively',title:'Lebendig & viel los',copy:'Atmosphäre, Menschen und Abwechslung.',theme:'lively',tags:['Lebendige Umgebung']}
  ]}
];
function esc(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function readProfile(){try{return JSON.parse(localStorage.getItem(PROFILE_KEY)||'null');}catch(_){return null;}}
function saveProfile(p){try{localStorage.setItem(PROFILE_KEY,JSON.stringify(p));}catch(_){}}
function body(){return document.getElementById('noreyoDnaBody');}
function scene(theme){
 const icons={
  boutique:'<span class="sun"></span><span class="house h1"></span><span class="house h2"></span><span class="plant"></span>',
  resort:'<span class="sun"></span><span class="tower"></span><span class="pool"></span><span class="palm p1"></span><span class="palm p2"></span>',
  beach:'<span class="sun"></span><span class="sea s1"></span><span class="sea s2"></span><span class="shore"></span>',
  central:'<span class="sun"></span><span class="city c1"></span><span class="city c2"></span><span class="city c3"></span><span class="road"></span>',
  quiet:'<span class="moon"></span><span class="hill h1"></span><span class="hill h2"></span><span class="chair"></span>',
  lively:'<span class="sun"></span><span class="umb u1"></span><span class="umb u2"></span><span class="spark sp1"></span><span class="spark sp2"></span>'
 };
 return '<div class="noreyo-v560-scene" data-theme="'+theme+'">'+(icons[theme]||'')+'</div>';
}
function renderQuestion(){
 const host=body();if(!host)return;
 const q=qs[step],current=step+1,pct=(current/qs.length)*100;
 host.innerHTML='<div class="noreyo-v560-test noreyo-v564-test">'
  +'<div class="noreyo-v560-progress"><span>FRAGE '+current+' VON '+qs.length+'</span><div><i style="width:'+pct+'%"></i></div><div class="noreyo-v563-dots">'+qs.map((_,i)=>'<i class="'+(i<current?'on':'')+'"></i>').join('')+'</div></div>'
  +'<h3>'+esc(q.title)+'</h3><p>'+esc(q.sub)+'</p>'
  +'<div class="noreyo-v563-instruction"><b>Nicht zerdenken.</b><span>Was fühlt sich mehr nach deinem Urlaub an?</span></div>'
  +'<div class="noreyo-v560-choice-grid">'+q.options.map((o,i)=>'<button type="button" class="noreyo-v560-choice" data-v564-choice="'+esc(o.value)+'">'+scene(o.theme)+'<span class="noreyo-v560-choice-copy"><b>'+esc(o.title)+'</b><small>'+esc(o.copy)+'</small></span><i class="noreyo-v560-pick">→</i><span class="noreyo-v563-choice-label">'+(i===0?'A':'B')+'</span></button>').join('')+'</div>'
  +(step>0?'<button type="button" class="noreyo-v560-back" data-v564-back>← Zurück</button>':'')
  +'</div>';
 try{host.scrollTop=0;}catch(_){ }
}
function profileFromAnswers(){
 const chosen=[];qs.forEach(q=>{const o=q.options.find(x=>x.value===answers[q.id]);if(o)chosen.push(o);});
 const vals=new Set(Object.values(answers));
 let title='Dein persönlicher Reisestil',subtitle='Drei Entscheidungen – und NOREYO kennt deinen Ausgangspunkt.';
 if(vals.has('beach')&&vals.has('quiet')){title='Coastal Calm';subtitle='Meer, Ruhe und genau genug Abstand vom Alltag.';}
 else if(vals.has('boutique')&&vals.has('central')){title='Boutique Explorer';subtitle='Persönliche Hotels, gute Lage und Urlaub mit Charakter.';}
 else if(vals.has('central')&&vals.has('lively')){title='Local Energy';subtitle='Mittendrin, spontan und lieber Atmosphäre als Abgeschiedenheit.';}
 else if(vals.has('resort')&&vals.has('quiet')){title='Easy Retreat';subtitle='Komfort, Ruhe und möglichst wenig Organisationsstress.';}
 else if(vals.has('beach')&&vals.has('lively')){title='Beach Energy';subtitle='Meer vor der Tür, aber bitte mit Leben und Abwechslung.';}
 else if(vals.has('boutique')&&vals.has('quiet')){title='Quiet Character';subtitle='Kleine Hotels, Ruhe und Orte mit Persönlichkeit.';}
 const tags=[...new Set(chosen.flatMap(o=>o.tags||[]))];
 const stateKeys=[...new Set(chosen.flatMap(o=>o.states||[]))];
 return {title,subtitle,tags,stateKeys,answers:{...answers},createdAt:new Date().toISOString(),dnaVersion:VERSION,quickProfile:true};
}
function syncAfterApply(){
 try{if(typeof refreshQuickStates==='function')refreshQuickStates();}catch(_){ }
 try{if(typeof updateCounts==='function')updateCounts();}catch(_){ }
 try{if(typeof updateSearchUI==='function')updateSearchUI();}catch(_){ }
 try{if(typeof persistState==='function')persistState();}catch(_){ }
}
function applyAvailableStates(p){
 try{
  if(typeof states!=='undefined'&&states){
    (p.stateKeys||[]).forEach(k=>{if(k in states&&(states[k]==='any'||!states[k]))states[k]='wish';});
    syncAfterApply();
  }
 }catch(e){console.warn('NOREYO Travel DNA '+VERSION,e);}
}
function decorateLauncher(p){
 document.querySelectorAll('#discover .noreyo-v560-launch').forEach(btn=>{
  const small=btn.querySelector('.noreyo-v560-launch-copy small'),b=btn.querySelector('.noreyo-v560-launch-copy b'),em=btn.querySelector('.noreyo-v560-launch-copy em');
  if(p){btn.classList.add('has-profile','noreyo-v563-profile-active');if(small)small.textContent='TRAVEL DNA AKTIV';if(b)b.textContent=p.title;if(em)em.textContent='3 Entscheidungen · dein Profil läuft mit';}
  else{if(em)em.textContent='3 Entscheidungen · ca. 20 Sekunden';}
 });
}
function renderResult(p){
 const host=body();if(!host)return;
 const tags=(p.tags||[]).slice(0,3);
 host.innerHTML='<div class="noreyo-v560-result noreyo-v563-result-wow noreyo-v564-result">'
  +'<div class="noreyo-v564-active-pill"><i>✓</i> TRAVEL DNA AKTIV</div>'
  +'<p class="noreyo-v560-kicker">NOREYO HAT DEINEN REISEGESCHMACK GELERNT</p>'
  +'<h3>'+esc(p.title)+'</h3><p class="noreyo-v560-result-sub">'+esc(p.subtitle)+'</p>'
  +'<p class="noreyo-v563-result-lead">Ab jetzt startet deine Suche nicht mehr bei null.</p>'
  +'<div class="noreyo-v563-profile-card noreyo-v564-profile-card"><div class="noreyo-v563-profile-head"><span>✦</span><div><small>DEIN PERSÖNLICHER STARTPUNKT</small><b>Das nimmt NOREYO ab jetzt mit</b></div></div>'
  +'<div class="noreyo-v563-profile-rows">'+tags.map(t=>'<span><i>✓</i>'+esc(t)+'<em>TRAVEL DNA</em></span>').join('')+'</div>'
  +'<p>Budget, Zeitraum und Verpflegung bestimmst du weiterhin selbst. Passende vorhandene Kriterien übernimmt NOREYO direkt als Wünsche.</p></div>'
  +'<button type="button" class="noreyo-v560-primary noreyo-v564-find" data-v564-finish>Reisen für mich finden →</button>'
  +'<button type="button" class="noreyo-v560-secondary noreyo-v564-restart" data-v564-restart>Travel DNA neu erstellen</button>'
  +'</div>';
 decorateLauncher(p);
 try{host.scrollTop=0;}catch(_){ }
}
function complete(){
 const p=profileFromAnswers();saveProfile(p);applyAvailableStates(p);renderResult(p);
 try{navigator.vibrate?.([12,30,16]);}catch(_){ }
}
function start(){step=0;answers={};renderQuestion();}
function finish(){
 const shell=document.getElementById('noreyoDna560');
 if(shell?.classList.contains('show')){
  const close=shell.querySelector('.noreyo-v560-close');if(close)close.click();
 }
 setTimeout(()=>document.querySelector('#discover .search-card')?.scrollIntoView({behavior:'smooth',block:'start'}),180);
 try{if(typeof showToast==='function')showToast('Travel DNA aktiv – NOREYO sucht jetzt mit deinem Geschmack');}catch(_){ }
}
function polishIntro(){
 const host=body(),intro=host?.querySelector('.noreyo-v560-intro');if(!intro)return;
 const h=intro.querySelector('h3');if(h)h.innerHTML='Dein Reisegeschmack.<br>In 20 Sekunden.';
 const proof=intro.querySelectorAll('.noreyo-v560-proof span');
 if(proof[0])proof[0].innerHTML='<b>3</b> spontane Entscheidungen';
 const note=intro.querySelector('.noreyo-v563-start-note');if(note)note.textContent='Drei Entscheidungen. Kein Formular. NOREYO lernt, was sich für dich nach Urlaub anfühlt.';
 const photo=intro.querySelector('.noreyo-v560-photo small');if(photo)photo.textContent='Optional: Wähle einzelne Bilder aus, die deinen Reisegeschmack besonders gut zeigen.';
 const p=readProfile();decorateLauncher(p);
}
document.addEventListener('click',e=>{
 const root=e.target.closest?.('#noreyoDna560');if(!root)return;
 const startBtn=e.target.closest?.('[data-dna-start]');
 if(startBtn){e.preventDefault();e.stopImmediatePropagation();start();return;}
 const view=e.target.closest?.('[data-dna-view-profile]');
 if(view){e.preventDefault();e.stopImmediatePropagation();const p=readProfile();if(p)renderResult(p);else start();return;}
 const choice=e.target.closest?.('[data-v564-choice]');
 if(choice){e.preventDefault();e.stopImmediatePropagation();const q=qs[step];answers[q.id]=choice.dataset.v564Choice;choice.classList.add('picked');try{navigator.vibrate?.(8);}catch(_){ }setTimeout(()=>{if(step<qs.length-1){step++;renderQuestion();}else complete();},130);return;}
 if(e.target.closest?.('[data-v564-back]')){e.preventDefault();e.stopImmediatePropagation();if(step>0){step--;renderQuestion();}return;}
 if(e.target.closest?.('[data-v564-finish]')){e.preventDefault();e.stopImmediatePropagation();finish();return;}
 if(e.target.closest?.('[data-v564-restart]')){e.preventDefault();e.stopImmediatePropagation();start();return;}
},true);
const mo=new MutationObserver(()=>requestAnimationFrame(polishIntro));
mo.observe(document.documentElement,{subtree:true,childList:true});
setTimeout(polishIntro,250);setTimeout(polishIntro,900);
window.NOREYO_V564={version:VERSION,start};
})();
