/* NOREYO V5.85 — AI family traveller handoff */
(function(){
'use strict';
const BUILD='5.85';
let pendingFamily=null,travellerPlannerRequested=false;

function norm(v){
  return String(v||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/ß/g,'ss');
}
function numberWord(v){
  const map={ein:1,eine:1,einen:1,einem:1,einer:1,zwei:2,drei:3,vier:4,fuenf:5,funf:5,sechs:6,sieben:7,acht:8,neun:9};
  const s=norm(v).trim();
  return /^\d+$/.test(s)?Number(s):(map[s]??null);
}
function parseAdults(text){
  const t=norm(text);
  let m=t.match(/\b([1-9]|ein(?:e|en|em|er)?|zwei|drei|vier|fuenf|funf|sechs|sieben|acht|neun)\s+(?:erwachsen(?:e|er|en)?|personen?|reisende)\b/);
  if(m)return numberWord(m[1]);
  if(/\bzu zweit\b/.test(t))return 2;
  return null;
}
function noChildren(text){
  const t=norm(text);
  return /\b(?:ohne|keine|kein)\s+(?:kinder|kind|baby)\b/.test(t)||/\bnur\s+erwachsene\b/.test(t);
}
function childCount(text){
  const t=norm(text);
  if(noChildren(t))return 0;
  let m=t.match(/\b([1-8]|ein(?:e|en|em|er)?|zwei|drei|vier|fuenf|funf|sechs|sieben|acht)\s+(?:kinder|kindern|kind|babys|baby)\b/);
  if(m)return numberWord(m[1]);
  if(/\b(?:mit\s+)?(?:einem\s+)?baby\b/.test(t))return 1;
  return null;
}
function pushAge(out,v){
  const n=Number(v);
  if(Number.isInteger(n)&&n>=0&&n<=17)out.push(n);
}
function parseAges(text){
  const t=norm(text),ages=[];
  let m;

  const lists=[
    /(?:kinder|kindern|kinderalter|alter der kinder)[^.!?;]{0,55}?(\d{1,2}(?:\s*(?:,|und|&|\/)\s*\d{1,2})+)(?:\s*jahre?)?/g,
    /(?:mit|und)\s+(\d{1,2}(?:\s*(?:,|und|&|\/)\s*\d{1,2})+)\s*jahre?(?:\s+alt)?/g
  ];
  for(const re of lists)while((m=re.exec(t)))for(const n of (m[1].match(/\d{1,2}/g)||[]))pushAge(ages,n);
  if(ages.length)return ages;

  const singles=[
    /\b(?:kind|sohn|tochter)\s*(?:ist|mit|,)?\s*(\d{1,2})\s*(?:jahre?|jahr|j\.)\b/g,
    /\b(\d{1,2})\s*(?:jahre?|jahr)\s*(?:altes?|alte|alter)\s*(?:kind|sohn|tochter)\b/g
  ];
  for(const re of singles)while((m=re.exec(t)))pushAge(ages,m[1]);
  if(ages.length)return ages;

  const baby=t.match(/\bbaby[^.!?;]{0,24}?(\d{1,2})\s*(?:monate?|monat)\b/);
  if(baby){pushAge(ages,0);return ages;}

  const oneAfterChildren=t.match(/\b(?:kinder|kindern|kind|babys|baby)\b[^.!?;]{0,24}?(\d{1,2})\s*(?:jahre?|jahr|j\.)\b/);
  if(oneAfterChildren)pushAge(ages,oneAfterChildren[1]);

  return ages;
}
function parseFamily(text){
  const t=norm(text);
  const adults=parseAdults(t);
  const count=childCount(t);
  const ages=parseAges(t);
  const intent=count!==null||ages.length>0||/\b(?:kinder|kindern|kind|baby|sohn|tochter|familie)\b/.test(t);
  if(!intent)return null;
  if(count===0)return{adults,count:0,ages:[],complete:true,errors:[]};

  const effectiveCount=count===null?ages.length:count;
  const errors=[];
  if(!effectiveCount)errors.push('Kinderanzahl fehlt');
  if(ages.length!==effectiveCount)errors.push(`Bitte Alter für ${effectiveCount||'alle'} Kinder angeben`);
  if(adults&&adults+effectiveCount>9)errors.push('Maximal 9 Reisende pro Suche');
  if(adults&&ages.filter(v=>v<=1).length>adults)errors.push('Maximal ein Kleinkind unter 2 pro Erwachsenem');
  return{adults,count:effectiveCount,ages,complete:effectiveCount>0&&ages.length===effectiveCount&&!errors.length,errors};
}
function state(){
  try{return typeof searchState!=='undefined'&&searchState?searchState:null;}catch(_){return null;}
}
function refresh(){
  try{if(typeof updateSearchUI==='function')updateSearchUI();}catch(_){}
  try{if(typeof persistState==='function')persistState();}catch(_){}
}
function inputText(){return document.getElementById('noreyoAi556Text')?.value||'';}
function applyFamily(text=inputText()){
  const family=parseFamily(text),s=state();
  if(!family){pendingFamily=null;return family;}
  if(family.complete&&s){
    if(family.adults)s.adults=Math.max(1,Math.min(9,family.adults));
    s.childAges=family.ages.slice();
    pendingFamily=null;
    refresh();
    return family;
  }
  if(family.count===0&&s){
    if(family.adults)s.adults=Math.max(1,Math.min(9,family.adults));
    s.childAges=[];
    pendingFamily=null;
    refresh();
    return family;
  }
  pendingFamily={...family,sourceText:String(text||''),createdAt:Date.now()};
  return family;
}
function decorate(){
  const root=document.getElementById('noreyoAi556Result');
  const card=root?.querySelector('.noreyo-v556-result');
  if(!card)return;
  card.querySelectorAll('[data-noreyo-v585-family]').forEach(x=>x.remove());
  const family=parseFamily(inputText());
  if(!family)return;
  const block=document.createElement('div');
  block.dataset.noreyoV585Family='1';
  if(family.complete){
    block.className='noreyo-v556-group';
    const adultPart=family.adults?`${family.adults} ${family.adults===1?'Erwachsener':'Erwachsene'} · `:'';
    const childPart=family.count?`${family.count} ${family.count===1?'Kind':'Kinder'} · Alter ${family.ages.join(' / ')}`:'ohne Kinder';
    block.innerHTML='<p class="noreyo-v556-grouplabel">Reisende</p><div class="noreyo-v556-chips"><span class="noreyo-v556-chip"><i>✓</i>'+adultPart+childPart+'</span></div>';
  }else{
    block.className='noreyo-v556-open';
    block.innerHTML='<b>Kinderalter noch offen:</b> '+family.errors.join(' · ')+'. Bitte ergänze die Reisenden vor der Live-Suche.';
  }
  const anchor=card.querySelector('.noreyo-v556-safe,.noreyo-v556-actions');
  anchor?card.insertBefore(block,anchor):card.appendChild(block);
}
function currentTravellersValid(){
  const s=state();
  if(!s)return false;
  const adults=Math.round(Number(s.adults));
  const ages=Array.isArray(s.childAges)?s.childAges.map(Number):[];
  return Number.isInteger(adults)&&adults>=1&&adults<=9&&
    adults+ages.length<=9&&
    ages.every(v=>Number.isInteger(v)&&v>=0&&v<=17)&&
    ages.filter(v=>v<=1).length<=adults;
}
function openTravellers(){
  try{
    if(typeof openPlanner==='function'){travellerPlannerRequested=true;openPlanner('travellers');return true;}
  }catch(_){}
  const candidates=['.travellerInput','.travelerInput','[data-planner="travellers"]','[data-field="travellers"]'];
  for(const q of candidates){
    const el=document.querySelector(q);
    if(el){travellerPlannerRequested=true;el.click();return true;}
  }
  return false;
}
function notify(message){
  try{
    if(typeof showToast==='function')showToast(message);
    else if(typeof toast==='function')toast(message);
    else alert(message);
  }catch(_){}
}
function blockPendingSearch(event){
  if(!pendingFamily)return;
  const target=event.target instanceof Element?event.target.closest('.liveSearchButton,.noreyo-v541-booking-cta'):null;
  if(!target)return;
  event.preventDefault();
  event.stopImmediatePropagation();
  notify(pendingFamily.errors[0]||'Bitte ergänze die Kinderalter.');
  setTimeout(openTravellers,0);
}
function onApply(event){
  const button=event.target instanceof Element?event.target.closest('.noreyo-v556-apply'):null;
  if(!button)return;
  const snapshot=inputText();
  setTimeout(()=>{applyFamily(snapshot);decorate();},0);
}
function onAnalyze(event){
  if(!(event.target instanceof Element)||!event.target.closest('.noreyo-v556-analyze'))return;
  pendingFamily=null;travellerPlannerRequested=false;
  setTimeout(decorate,0);
}
function onPlannerSave(event){
  if(!pendingFamily||!travellerPlannerRequested||!(event.target instanceof Element))return;
  const save=event.target.closest('.planner-save,.planner-apply,[data-planner-apply]');
  if(!save)return;
  setTimeout(()=>{
    if(currentTravellersValid()){
      pendingFamily=null;
      travellerPlannerRequested=false;
    }
  },0);
}
function install(){
  window.addEventListener('click',blockPendingSearch,true);
  document.addEventListener('click',onApply,true);
  document.addEventListener('click',onAnalyze,true);
  document.addEventListener('click',onPlannerSave,true);
  document.addEventListener('keydown',e=>{
    if((e.metaKey||e.ctrlKey)&&e.key==='Enter'&&e.target?.id==='noreyoAi556Text'){
      pendingFamily=null;setTimeout(decorate,0);
    }
  },true);
}
window.NOREYO_V585=Object.freeze({BUILD,parseAdults,noChildren,childCount,parseAges,parseFamily,applyFamily,decorate,currentTravellersValid,
  clearPending(){pendingFamily=null;travellerPlannerRequested=false;},
  get pendingFamily(){return pendingFamily;}
});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();