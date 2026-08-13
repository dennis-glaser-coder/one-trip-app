/* NOREYO V12.00 — strict unsupported hotel-MUST checkout gate.
   Search results may remain explorable when a preference cannot be verified, but
   a hotel PREBOOK must not proceed while an active hotel/location/price MUST lacks
   a trustworthy normalized provider signal. Flight MUST criteria remain owned by
   the separate flight-selection gate. */
(function(){
'use strict';
const BUILD='12.00';
const PREBOOK='/functions/v1/hotel-prebook';
const VERIFIED=new Set(['Zimmer0','Zimmer1','Zimmer2','Hotel0','Hotel4','Hotel5','Hotel6','Hotel7','Preis2']);
const LABELS=Object.freeze({
  Zimmer3:'Separates Schlafzimmer',Zimmer4:'Kingsize- oder Doppelbett',Zimmer5:'Walk-in-Dusche',
  Zimmer6:'Badewanne',Zimmer7:'Zimmergröße ab 24 m²',Zimmer8:'Obere Etage',
  Hotel1:'Adults Only',Hotel2:'Beheizter Pool',Hotel3:'Infinity Pool',
  Lage0:'Sandstrand',Lage1:'Direkt am Strand',Lage2:'Ruhige Lage',Lage3:'Restaurants zu Fuß',
  Lage4:'Kurzer Transfer',Lage5:'Stadtzentrum erreichbar',
  Preis0:'Echter Gesamtpreis',Preis1:'Keine Resortgebühr vor Ort',Preis3:'Zahlung später möglich'
});
let installed=false,priorFetch=null,observer=null,raf=0,bound=false;
function stateEntries(){try{return Object.entries(states||{});}catch(_){return[];}}
function relevantKey(key){return /^(Zimmer|Hotel|Lage|Preis)\d+$/.test(String(key||''));}
function unsupportedMust(){return stateEntries().filter(([key,value])=>value==='must'&&relevantKey(key)&&!VERIFIED.has(key)).map(([key])=>Object.freeze({key,label:LABELS[key]||key}));}
function inputUrl(input){if(typeof input==='string')return input;try{if(typeof Request!=='undefined'&&input instanceof Request)return input.url||'';}catch(_){}return String(input?.url||'');}
function isPrebook(input){return inputUrl(input).includes(PREBOOK);}
function localBlock(rows=unsupportedMust()){
  const names=rows.slice(0,4).map(x=>x.label).join(', '),extra=rows.length>4?` und ${rows.length-4} weitere`:'';
  const message=`Pflichtkriterium noch nicht verifizierbar: ${names}${extra}. NOREYO startet deshalb noch keinen Checkout.`;
  return new Response(JSON.stringify({error:{code:'UNVERIFIED_REQUIRED_PREFERENCES',message}}),{status:422,headers:{'content-type':'application/json','X-Noreyo-Provider-Route':'hotels/prebook'}});
}
async function wrappedFetch(input,init){if(isPrebook(input)){const rows=unsupportedMust();if(rows.length)return localBlock(rows);}return priorFetch(input,init);}
function installFetch(){if(installed||typeof window.fetch!=='function'||window.fetch.__noreyoV1200)return false;priorFetch=window.fetch.bind(window);const f=(input,init)=>wrappedFetch(input,init);f.__noreyoV1200=true;f.__noreyoV1200Prior=priorFetch;window.fetch=f;installed=true;return true;}
function render(){
  raf=0;const box=document.querySelector('.noreyo-v1106-prebook');if(!box)return false;const rows=unsupportedMust(),btn=box.querySelector('.noreyo-v1106-action');let note=box.querySelector('.noreyo-v1200-must-note'),changed=false;
  if(rows.length){
    if(!note){note=document.createElement('div');note.className='backend-note noreyo-v1200-must-note';box.insertBefore(note,btn||null);changed=true;}
    const text=`Checkout gesperrt: Diese Pflichtkriterien sind mit den aktuell verfügbaren Live-Daten nicht sicher bestätigt: ${rows.map(x=>x.label).join(', ')}.`;
    if(note.textContent!==text){note.textContent=text;changed=true;}
    if(btn&&btn.dataset.noreyoV1200Must!=='1'){btn.dataset.noreyoV1200Must='1';btn.disabled=true;btn.setAttribute('aria-disabled','true');btn.dataset.noreyoV1200Label=btn.textContent||'Preis & Verfügbarkeit final prüfen';btn.textContent='Pflichtkriterien noch nicht verifiziert';changed=true;}
  }else{
    if(note){note.remove();changed=true;}
    if(btn?.dataset?.noreyoV1200Must==='1'){delete btn.dataset.noreyoV1200Must;btn.disabled=false;btn.setAttribute('aria-disabled','false');btn.textContent=btn.dataset.noreyoV1200Label||'Preis & Verfügbarkeit final prüfen';delete btn.dataset.noreyoV1200Label;changed=true;}
  }
  return changed;
}
function schedule(){if(!raf)raf=requestAnimationFrame(render);}
function onClick(){setTimeout(schedule,0);}
function installUi(){if(bound)return false;bound=true;if(typeof MutationObserver!=='undefined'&&document.body){observer=new MutationObserver(schedule);observer.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['class','data-state']});}document.addEventListener('click',onClick,true);schedule();return true;}
function cleanupUi(){if(observer){observer.disconnect();observer=null;}if(bound){document.removeEventListener('click',onClick,true);bound=false;}if(raf){cancelAnimationFrame(raf);raf=0;}}
function install(){installFetch();installUi();return true;}
install();window.addEventListener('pagehide',cleanupUi,{passive:true});window.addEventListener('pageshow',installUi,{passive:true});
window.NOREYO_V1200=Object.freeze({BUILD,PREBOOK,VERIFIED:new Set(VERIFIED),LABELS,stateEntries,relevantKey,unsupportedMust,inputUrl,isPrebook,localBlock,wrappedFetch,installFetch,render,schedule,installUi,cleanupUi,install});
})();