(function(){
  'use strict';
  let raf=0;
  const months={januar:0,februar:1,maerz:2,marz:2,märz:2,april:3,mai:4,juni:5,juli:6,august:7,september:8,oktober:9,november:10,dezember:11};
  const airportMap={duesseldorf:'DUS',düsseldorf:'DUS',dus:'DUS',koeln:'CGN',köln:'CGN','koeln/bonn':'CGN','köln/bonn':'CGN',cgn:'CGN',paderborn:'PAD',pad:'PAD',muenster:'FMO',münster:'FMO',fmo:'FMO',frankfurt:'FRA',fra:'FRA',hannover:'HAJ',haj:'HAJ'};
  const prefDefs=[
    {key:'Zimmer0',label:'Balkon',re:/\b(balkon|privater balkon)\b/i},
    {key:'Zimmer1',label:'Meerblick',re:/\b(meerblick|sea view)\b/i},
    {key:'Zimmer2',label:'Terrasse',re:/\bterrasse\b/i},
    {key:'Hotel0',label:'Mind. 4 Sterne',re:/\b(4\s*sterne|vier\s*sterne|4\s*\+|mindestens\s*4\s*sterne)\b/i},
    {key:'Hotel1',label:'Adults Only',re:/\b(adults?\s*only|erwachsenenhotel|nur erwachsene)\b/i},
    {key:'Hotel4',label:'Spa / Wellness',re:/\b(spa|wellness)\b/i},
    {key:'Hotel5',label:'Fitness',re:/\b(fitness|fitnessraum|gym)\b/i},
    {key:'Lage0',label:'Sandstrand',re:/\bsandstrand\b/i},
    {key:'Lage1',label:'Direkt am Strand',re:/\b(direkt am strand|strandlage|am strand)\b/i},
    {key:'Lage2',label:'Ruhige Lage',re:/\b(ruhig|ruhige lage|keine partyzone)\b/i},
    {key:'Lage3',label:'Restaurants zu Fuß',re:/\b(restaurants? zu fuß|restaurants? zu fuss|restaurants? fußläufig|restaurants? fussläufig)\b/i},
    {key:'Lage4',label:'Kurzer Transfer',re:/\b(kurzer transfer|transfer.{0,8}(max|unter).{0,5}45)\b/i},
    {key:'Preis2',label:'Kostenlos stornierbar',re:/\b(kostenlos stornierbar|kostenfrei stornierbar|flexibel stornierbar)\b/i},
    {key:'Flug0',label:'Direktflug',re:/\b(direktflug|nonstop|ohne zwischenlandung)\b/i},
    {key:'Flug1',label:'Aufgabegepäck',re:/\b(aufgabegepäck|koffer inklusive|gepäck inklusive)\b/i}
  ];

  function norm(v){return String(v||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/ß/g,'ss');}
  function esc(v){return String(v??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));}
  function mode(){
    const active=document.querySelector('#discover .product-mode.on');
    const t=norm(active?.textContent||'');
    if(t.includes('kreuzfahrt'))return 'cruise';
    if(t.includes('hotel'))return 'hotel';
    if(t.includes('flug'))return 'flight';
    try{if(typeof productMode==='string')return productMode;}catch(_){ }
    return 'package';
  }
  function modeLabel(m){return m==='hotel'?'Hotel':m==='flight'?'Flug':m==='cruise'?'Kreuzfahrt':'Pauschalreise';}

  function installLauncher(){
    const card=document.querySelector('#discover .search-card');
    if(!card||card.querySelector('.noreyo-v555-ai-launch'))return;
    const head=card.querySelector('.search-console-head,.noreyo-v552-search-head');
    if(!head)return;
    const b=document.createElement('button');
    b.type='button';
    b.className='noreyo-v555-ai-launch';
    b.innerHTML='<span class="noreyo-v555-ai-mark">✦</span><span><small>NOREYO AI</small><b>Beschreib einfach deinen Wunsch</b></span><span class="noreyo-v555-ai-go">→</span>';
    b.addEventListener('click',openAI);
    head.insertAdjacentElement('afterend',b);
  }

  function shell(){
    let wrap=document.getElementById('noreyoAi555');
    if(wrap)return wrap;
    wrap=document.createElement('div');
    wrap.id='noreyoAi555';
    wrap.className='noreyo-v555-backdrop';
    wrap.innerHTML='<section class="noreyo-v555-sheet" role="dialog" aria-modal="true" aria-labelledby="noreyoAiTitle"><div class="noreyo-v555-handle"></div><header><div><small>NOREYO AI · BETA</small><h2 id="noreyoAiTitle">Was soll dein Urlaub können?</h2></div><button type="button" class="noreyo-v555-close" aria-label="Schließen">×</button></header><div class="noreyo-v555-body"><p class="noreyo-v555-intro">Schreib so, wie du es einem Menschen sagen würdest. NOREYO übersetzt deine Angaben in die vorhandene Suche.</p><textarea id="noreyoAiText" maxlength="500" placeholder="z. B. Mallorca im September, 7 Tage, All Inclusive, direkt am Strand. Balkon wäre schön. Maximal 2.500 € für zwei Personen."></textarea><div class="noreyo-v555-examples"><button type="button">Mallorca · All Inclusive · Strand · Balkon</button><button type="button">Dubai · Frühstück · 4 Sterne · Spa</button></div><button class="noreyo-v555-understand" type="button"><span>✦</span> Wunsch verstehen</button><div id="noreyoAiResult"></div></div></section>';
    wrap.addEventListener('click',e=>{if(e.target===wrap)closeAI();});
    wrap.querySelector('.noreyo-v555-close').addEventListener('click',closeAI);
    wrap.querySelector('.noreyo-v555-understand').addEventListener('click',analyzeInput);
    wrap.querySelectorAll('.noreyo-v555-examples button').forEach(b=>b.addEventListener('click',()=>{wrap.querySelector('#noreyoAiText').value=b.textContent||'';analyzeInput();}));
    document.body.appendChild(wrap);
    return wrap;
  }
  function openAI(){
    const w=shell();
    w.classList.add('show');
    w.dataset.mode=mode();
    w.querySelector('#noreyoAiResult').innerHTML='';
    setTimeout(()=>w.querySelector('#noreyoAiText')?.focus(),180);
  }
  function closeAI(){document.getElementById('noreyoAi555')?.classList.remove('show');}

  function knownDestination(text){
    const t=norm(text);
    let choices=[];
    try{if(typeof destinationChoices!=='undefined'&&Array.isArray(destinationChoices))choices=destinationChoices.map(x=>x[0]);}catch(_){ }
    if(!choices.length)choices=['Mallorca','Kreta','Santorini','Rhodos','Kos','Antalya','Teneriffa','Gran Canaria','Fuerteventura','Lanzarote','Sardinien','Algarve','Ibiza','Menorca','Hurghada','Dubai','Malediven'];
    return choices.sort((a,b)=>b.length-a.length).find(n=>{const q=norm(n).replace(/[.*+?^${}()|[\]\\]/g,'\\$&');return new RegExp('(^|[^a-z0-9])'+q+'([^a-z0-9]|$)','i').test(t);})||'';
  }

  function parseBudget(text){
    const t=norm(text);
    const patterns=[/(?:max(?:imal)?|bis|budget(?: von)?|höchstens|hoechstens|hochstens)\s*(?:ca\.?\s*)?([0-9][0-9\.\s]{2,})\s*(?:€|euro)/i,/([0-9][0-9\.\s]{2,})\s*(?:€|euro)\s*(?:max(?:imal)?|budget|insgesamt)?/i];
    for(const re of patterns){const m=t.match(re);if(m){const n=Number(m[1].replace(/[\.\s]/g,''));if(Number.isFinite(n)&&n>=200&&n<=50000)return n;}}
    return null;
  }
  function parseAdults(text){
    const t=norm(text);
    let m=t.match(/\b([1-6])\s*(?:erwachsene|personen|person)\b/);if(m)return Number(m[1]);
    const words={einer:1,eine:1,einem:1,zwei:2,drei:3,vier:4,fuenf:5,funf:5,sechs:6};
    m=t.match(/\b(einer|eine|einem|zwei|drei|vier|fuenf|funf|sechs)\s*(?:erwachsene|personen|person)\b/);return m?words[m[1]]:null;
  }
  function parseAirports(text){
    const t=norm(text),out=[];
    Object.entries(airportMap).forEach(([name,code])=>{if(t.includes(norm(name))&&!out.includes(code))out.push(code);});
    return out;
  }
  function parseMeal(text){
    const t=norm(text);
    if(/\ball\s*inclusive\b|\ball-inclusive\b/.test(t))return {code:'AI',label:'All Inclusive'};
    if(/\bvollpension\b/.test(t))return {code:'FB',label:'Vollpension'};
    if(/\bhalbpension\b/.test(t))return {code:'HB',label:'Halbpension'};
    if(/\bfruehstueck\b|\bfruhstuck\b/.test(t))return {code:'BB',label:'Frühstück'};
    if(/\bnur uebernachtung\b|\bohne verpflegung\b/.test(t))return {code:'RO',label:'Nur Übernachtung'};
    return null;
  }
  function parseDuration(text){
    const t=norm(text);let m=t.match(/\b([3-9]|1[0-9]|2[0-1])\s*(?:tage|naechte|nachte)\b/);if(m)return Number(m[1]);
    m=t.match(/\b([3-9]|1[0-9])\s*[-–]\s*([3-9]|1[0-9]|2[0-1])\s*(?:tage|naechte|nachte)\b/);if(m)return Math.round((Number(m[1])+Number(m[2]))/2);
    m=t.match(/\b(eine|zwei)\s*wochen?\b/);if(m)return m[1]==='zwei'?14:7;
    return null;
  }
  function parseDate(text,duration){
    const raw=String(text||'');
    let m=raw.match(/\b(\d{1,2})[.\/]\s*(\d{1,2})(?:[.\/]\s*(\d{2,4}))?\.?\s*(?:bis|-|–)\s*(\d{1,2})[.\/]\s*(\d{1,2})(?:[.\/]\s*(\d{2,4}))?/i);
    const now=new Date();
    const yearOf=y=>{if(!y)return now.getFullYear();const n=Number(y);return n<100?2000+n:n;};
    const iso=d=>{const y=d.getFullYear(),mo=String(d.getMonth()+1).padStart(2,'0'),da=String(d.getDate()).padStart(2,'0');return `${y}-${mo}-${da}`;};
    if(m){const a=new Date(yearOf(m[3]),Number(m[2])-1,Number(m[1]),12),b=new Date(yearOf(m[6]||m[3]),Number(m[5])-1,Number(m[4]),12);if(b>a)return {checkin:iso(a),checkout:iso(b),label:`${m[1]}.${m[2]}.–${m[4]}.${m[5]}.`};}
    m=norm(raw).match(/\bab\s*(\d{1,2})[.\s]+(januar|februar|maerz|marz|april|mai|juni|juli|august|september|oktober|november|dezember)(?:\s*(20\d{2}))?/i);
    if(m){const mo=months[m[2]]??months[m[2].replace('marz','maerz')];let y=Number(m[3]||now.getFullYear());let a=new Date(y,mo,Number(m[1]),12);if(a<now&&!m[3])a=new Date(y+1,mo,Number(m[1]),12);const b=new Date(a);b.setDate(b.getDate()+(duration||7));return {checkin:iso(a),checkout:iso(b),label:`ab ${m[1]}. ${m[2]}`};}
    const t=norm(raw);
    for(const [name,mo] of Object.entries(months)){
      if(!t.includes(name))continue;
      let y=(t.match(new RegExp(name+'\\s*(20\\d{2})'))||[])[1];y=Number(y||now.getFullYear());if(!y)return null;
      const start=new Date(y,mo,1,12);if(start<now&&now.getMonth()>mo&&!t.match(/20\d{2}/))y++;
      return {month:name,year:y,label:`${name[0].toUpperCase()+name.slice(1)} ${y}`,flex:true};
    }
    return null;
  }
  function hardNear(text,re){
    const t=norm(text),m=t.match(re);if(!m)return false;const idx=m.index||0,end=idx+m[0].length;
    const before=t.slice(Math.max(0,idx-26),idx),after=t.slice(end,Math.min(t.length,end+24));
    return /(muss|unbedingt|pflicht|auf jeden fall|nur|zwingend)\s*(?:sein|ist|:)?\s*$/.test(before)||/^\s*(?:muss|unbedingt|pflicht|zwingend|auf jeden fall)/.test(after);
  }
  function parsePrefs(text){
    const out=[];for(const d of prefDefs){if(!d.re.test(text))continue;const explicitMin=d.key==='Hotel0'&&/mindestens\s*4\s*sterne/.test(norm(text));out.push({...d,state:(explicitMin||hardNear(text,d.re))?'must':'wish'});}return out;
  }
  function parseCruise(text){
    const t=norm(text),out={};
    const areas=[['Mittelmeer','mittelmeer'],['Nordeuropa','nordeuropa'],['Karibik','karibik'],['Kanaren','kanaren'],['Orient','orient']];for(const [label,k] of areas)if(t.includes(k))out.area=label;
    if(/flusskreuzfahrt|fluss/.test(t))out.type='Flusskreuzfahrt';else if(/hochseekreuzfahrt|hochsee/.test(t))out.type='Hochseekreuzfahrt';
    if(/balkonkabine|balkon kabine/.test(t))out.cabin='Balkonkabine';else if(/suite/.test(t))out.cabin='Suite';else if(/aussenkabine|außenkabine/.test(t))out.cabin='Außenkabine';else if(/innenkabine/.test(t))out.cabin='Innenkabine';
    const d=parseDuration(t);if(d){out.duration=d<=6?'3–6 Nächte':d<=9?'7–9 Nächte':d<=14?'10–14 Nächte':'15+ Nächte';}
    return out;
  }

  function analyze(text,m){
    const duration=parseDuration(text),date=parseDate(text,duration),meal=parseMeal(text),prefs=parsePrefs(text),destination=knownDestination(text),budget=parseBudget(text),adults=parseAdults(text),airports=parseAirports(text);
    return {mode:m,destination,budget,adults,airports,meal,prefs,duration,date,cruise:m==='cruise'?parseCruise(text):null,raw:text};
  }
  function chip(label,value,cls=''){return '<span class="noreyo-v555-chip '+cls+'"><small>'+esc(label)+'</small><b>'+esc(value)+'</b></span>';}
  function renderUnderstanding(data){
    const found=[];
    if(data.destination)found.push(chip('Ziel',data.destination));
    if(data.date)found.push(chip('Zeitraum',data.date.label+(data.date.flex?' · flexibel':'')));
    if(data.duration)found.push(chip('Dauer',data.duration+' Tage'));
    if(data.adults)found.push(chip('Reisende',data.adults+' '+(data.adults===1?'Person':'Personen')));
    if(data.airports.length)found.push(chip('Abflug',data.airports.join(', ')));
    if(data.meal&&data.mode!=='flight'&&data.mode!=='cruise')found.push(chip('Verpflegung',data.meal.label));
    if(data.budget&&data.mode!=='flight'&&data.mode!=='cruise')found.push(chip('Budget','bis '+data.budget.toLocaleString('de-DE')+' €'));
    data.prefs.forEach(p=>found.push(chip(p.state==='must'?'Pflicht':'Wunsch',p.label,p.state)));
    if(data.cruise){Object.entries(data.cruise).forEach(([k,v])=>found.push(chip(({area:'Reisegebiet',type:'Reiseart',cabin:'Kabine',duration:'Reisedauer'})[k]||k,v)));}
    const unresolved=[];
    if(!data.destination&&data.mode!=='cruise')unresolved.push('Reiseziel');
    if(!data.date)unresolved.push('Zeitraum');
    else if(data.date.flex)unresolved.push('genauen Termin im '+data.date.label);
    const html='<div class="noreyo-v555-result-card"><div class="noreyo-v555-result-head"><span>✓</span><div><small>DAS HABE ICH VERSTANDEN</small><b>'+esc(modeLabel(data.mode))+'</b></div></div><div class="noreyo-v555-chips">'+(found.length?found.join(''):'<p>Ich habe noch keine eindeutigen Angaben erkannt.</p>')+'</div>'+(unresolved.length?'<p class="noreyo-v555-missing">Noch offen: '+esc(unresolved.join(' · '))+'</p>':'')+'<div class="noreyo-v555-result-actions"><button type="button" class="noreyo-v555-edit">Text ändern</button><button type="button" class="noreyo-v555-apply">In Suche übernehmen →</button></div></div>';
    const result=document.getElementById('noreyoAiResult');result.innerHTML=html;
    result.querySelector('.noreyo-v555-edit').addEventListener('click',()=>document.getElementById('noreyoAiText')?.focus());
    result.querySelector('.noreyo-v555-apply').addEventListener('click',()=>applyData(data));
  }
  function analyzeInput(){
    const ta=document.getElementById('noreyoAiText'),text=String(ta?.value||'').trim();if(text.length<4){ta?.focus();return;}
    renderUnderstanding(analyze(text,mode()));
  }

  function applyCore(data){
    try{
      if(data.destination&&typeof syncDest==='function')syncDest(data.destination);
      if(data.destination&&data.mode==='hotel'&&typeof setHotelQuery==='function')setHotelQuery(data.destination);
      if(data.adults&&typeof searchState!=='undefined')searchState.adults=Math.max(1,Math.min(6,data.adults));
      if(data.airports.length&&typeof searchState!=='undefined')searchState.airports=data.airports.slice(0,5);
      if(data.date&&!data.date.flex&&typeof searchState!=='undefined'){searchState.checkin=data.date.checkin;searchState.checkout=data.date.checkout;}
      if(data.meal&&typeof mealPlanFilter!=='undefined'&&data.mode!=='flight')mealPlanFilter=data.meal.code;
      if(data.budget&&typeof limits!=='undefined')limits.maxHotelPrice=data.budget;
      if(typeof states!=='undefined')data.prefs.forEach(p=>{if(p.key in states)states[p.key]=p.state;});
      if(typeof updateSearchUI==='function')updateSearchUI();
      if(typeof refreshQuickStates==='function')refreshQuickStates();
      if(typeof updateCounts==='function')updateCounts();
      if(typeof persistState==='function')persistState();
    }catch(e){console.warn('NOREYO AI apply',e);}
  }
  function selectCruise(kind,value){
    return new Promise(resolve=>{
      const btn=document.querySelector('#discover [data-cruise-picker="'+kind+'"]');if(!btn){resolve();return;}btn.click();
      setTimeout(()=>{const option=[...document.querySelectorAll('.noreyo-v552-sheet-options [data-cruise-value]')].find(b=>(b.getAttribute('data-cruise-value')||'')===value);if(option)option.click();else document.querySelector('[data-close-cruise-sheet]')?.click();resolve();},35);
    });
  }
  async function applyData(data){
    applyCore(data);
    if(data.mode==='cruise'&&data.cruise){for(const [kind,value] of Object.entries(data.cruise))await selectCruise(kind,value);}
    closeAI();
    try{if(typeof showToast==='function')showToast('NOREYO hat deine Angaben übernommen');}catch(_){ }
    if(data.date?.flex){setTimeout(()=>{try{if(typeof openPlanner==='function')openPlanner('dates');}catch(_){ }},260);return;}
    if((data.mode==='package'||data.mode==='hotel')&&data.destination&&data.date&&!data.date.flex){setTimeout(()=>{try{if(typeof searchTrips==='function')searchTrips();}catch(_){ }},260);}
  }

  function schedule(){if(raf)return;raf=requestAnimationFrame(()=>{raf=0;installLauncher();});}
  installLauncher();setTimeout(installLauncher,100);setTimeout(installLauncher,350);
  const discover=document.getElementById('discover');if(discover&&typeof MutationObserver!=='undefined')new MutationObserver(schedule).observe(discover,{childList:true,subtree:true});
  window.NOREYO_AI_V555=Object.freeze({open:openAI,analyze});
})();
