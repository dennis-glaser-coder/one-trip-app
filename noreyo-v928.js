/* NOREYO V9.28 — context-aware no-result filter guidance and truthful flight-filter copy. */
(function(){
'use strict';
const BUILD='9.28';
let observer=null,raf=0;
const TAB_KEYS={Zimmer:'Zimmer',Flug:'Flug',Hotel:'Hotel',Lage:'Lage',Preis:'Preis'};
function stateObj(){try{return typeof states!=='undefined'&&states?states:window.states||{};}catch(_){return window.states||{};}}
function defsObj(){try{return typeof defs!=='undefined'&&defs?defs:window.defs||{};}catch(_){return window.defs||{};}}
function firstMustTab(){
  const s=stateObj(),d=defsObj();
  for(const tab of ['Zimmer','Hotel','Preis','Lage','Flug']){
    const rows=Array.isArray(d?.[tab])?d[tab]:[];
    for(let i=0;i<rows.length;i++)if(s[tab+i]==='must')return tab;
  }
  return 'Zimmer';
}
function repairNoResultButton(root=document){
  const candidates=[...root.querySelectorAll?.('#offers .planner-save')||[]];
  let changed=false;
  for(const btn of candidates){
    const txt=String(btn.textContent||'').trim();
    if(!/Pflichtkriterien prüfen/i.test(txt))continue;
    const tab=firstMustTab();
    const label=tab==='Zimmer'?'Pflichtkriterien prüfen':`${tab}-Pflichtkriterien prüfen`;
    if(btn.textContent!==label){btn.textContent=label;changed=true;}
    const wanted=`openFilter('${tab}')`;
    if(btn.getAttribute('onclick')!==wanted){btn.setAttribute('onclick',wanted);changed=true;}
  }
  return changed;
}
function repairFlightFilterCopy(root=document){
  let changed=false;
  const walker=document.createTreeWalker(root.body||root,NodeFilter.SHOW_TEXT),nodes=[];
  while(walker.nextNode())nodes.push(walker.currentNode);
  const replacements=[
    ['Wird gespeichert und mit dem Flugprovider angewendet, sobald dieser verbunden ist.','Wird gespeichert. Die separate Flugsuche zeigt aktuell nur Providerangebote; eine harte automatische Flugzeit-Grenze wird noch nicht als bestätigt ausgegeben.'],
    ['Live-Flugpreise werden erst nach Anschluss des Flugproviders ergänzt.','Flugpreise werden separat live gesucht und sind im Hotelpreis nicht enthalten.']
  ];
  for(const n of nodes){let x=n.nodeValue||'',y=x;for(const [a,b] of replacements)y=y.split(a).join(b);if(y!==x){n.nodeValue=y;changed=true;}}
  return changed;
}
function run(){raf=0;return repairNoResultButton()||repairFlightFilterCopy();}
function schedule(){if(!raf)raf=requestAnimationFrame(run);}
function observe(){
  if(observer){observer.disconnect();observer=null;}
  if(typeof MutationObserver==='undefined'||!document.body)return false;
  observer=new MutationObserver(schedule);
  observer.observe(document.body,{subtree:true,childList:true,characterData:true});schedule();return true;
}
function cleanup(){if(observer){observer.disconnect();observer=null;}if(raf){cancelAnimationFrame(raf);raf=0;}}
observe();window.addEventListener('pagehide',cleanup,{passive:true});window.addEventListener('pageshow',observe,{passive:true});
window.NOREYO_V928=Object.freeze({BUILD,TAB_KEYS,stateObj,defsObj,firstMustTab,repairNoResultButton,repairFlightFilterCopy,run,schedule,observe,cleanup});
})();