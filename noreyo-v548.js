(function(){
  'use strict';
  const BUILD='6.18';

  function requestedMealCode(){
    try{return typeof mealPlanFilter==='string'?mealPlanFilter:'ANY';}catch{return 'ANY';}
  }
  function codeFromBoard(board){
    try{if(typeof mealPlanCodeFromBoard==='function')return String(mealPlanCodeFromBoard(board)||'ANY').toUpperCase();}catch{}
    const b=String(board||'').toLowerCase();
    if(/all\s*[- ]?inclusive|\bai\d*\b|\bti\b/.test(b))return 'AI';
    if(/vollpension|full\s*board|\bfb\d*\b/.test(b))return 'FB';
    if(/halbpension|half\s*board|\bhb\d*\b|\bbd\b/.test(b))return 'HB';
    if(/frühstück|fruhstuck|breakfast|\bbb\d*\b|\bbi\b/.test(b))return 'BB';
    if(/nur\s*übernachtung|nur\s*ubernachtung|room\s*only|\bro\d*\b/.test(b))return 'RO';
    return 'ANY';
  }
  function selectRequestedRate(o){
    const wanted=requestedMealCode();if(!o||wanted==='ANY')return o;
    const options=Array.isArray(o.rateOptions)?o.rateOptions:[];
    const matching=options.filter(x=>codeFromBoard(x?.board)===wanted).sort((a,b)=>(Number(a?.price)||Infinity)-(Number(b?.price)||Infinity));
    const x=matching[0];
    if(!x){if(codeFromBoard(o.board)===wanted)return o;return null;}
    const copy={...o,board:x.board||o.board,room:x.room||o.room,roomRaw:x.roomRaw||o.roomRaw,price:Number(x.price)||Number(o.price)||0,refundable:typeof x.refundable==='boolean'?x.refundable:o.refundable,offerId:x.offerId||o.offerId,mappedRoomId:x.mappedRoomId||o.mappedRoomId,selectedOfferId:x.offerId||o.selectedOfferId||o.offerId,selectedMappedRoomId:x.mappedRoomId||o.selectedMappedRoomId||o.mappedRoomId};
    try{if(typeof confirmedRoomFacts==='function')copy.confirmed={...(copy.confirmed||{}),...confirmedRoomFacts(copy.roomRaw||'')};}catch{}
    copy.features=[copy.board,copy.refundable?'Stornierbar':'Tarifbedingungen verfügbar',...(Array.isArray(copy.features)?copy.features.slice(2):[])].slice(0,4);
    return copy;
  }
  if(typeof filterAndRankOffers==='function'&&!filterAndRankOffers.__noreyoMealRateFirst){
    const prior=filterAndRankOffers;
    const wrapped=function(input){const wanted=requestedMealCode();const prepared=wanted==='ANY'?input:(Array.isArray(input)?input.map(selectRequestedRate).filter(Boolean):input);return prior(prepared);};
    wrapped.__noreyoMealRateFirst=true;filterAndRankOffers=wrapped;
  }
  function mustCount(){try{return Object.values(states||{}).filter(v=>v==='must').length;}catch{return 0;}}
  function mealLabel(){try{return typeof mealPlanLabel==='function'?String(mealPlanLabel()||'Verpflegung'):'Verpflegung';}catch{return 'Verpflegung';}}
  function setText(el,text){if(el&&el.textContent!==text){el.textContent=text;return true;}return false;}
  function setAttr(el,name,value){if(!el||el.getAttribute(name)===value)return false;el.setAttribute(name,value);return true;}
  function fixEmptyState(){
    const offersEl=document.getElementById('offers'),match=document.querySelector('#results .match');if(!offersEl||!match)return false;
    const emptyText=String(offersEl.textContent||'');
    const noAvailability=/Keine Verfügbarkeit gefunden/i.test(emptyText);
    const noFullMatch=/Keine vollständige Übereinstimmung/i.test(emptyText);
    if(!noAvailability&&!noFullMatch)return false;
    const must=mustCount();if(must>0)return false;
    const wanted=requestedMealCode(),title=match.querySelector('b'),sub=match.querySelector('small'),cardTitle=offersEl.querySelector('b'),cardCopy=offersEl.querySelector('p'),primary=offersEl.querySelector('button.planner-save');
    let changed=false;
    if(wanted!=='ANY'){
      const label=mealLabel();
      changed=setText(title,`Aktuell keine bestätigte ${label}-Rate`)||changed;
      changed=setText(sub,'Die aktuelle Datenquelle hat für deine Reisedaten keinen bestätigten Tarif mit dieser Verpflegung zurückgegeben.')||changed;
      changed=setText(cardTitle,`${label} in den aktuellen Daten nicht bestätigt`)||changed;
      changed=setText(cardCopy,`Das bedeutet nicht, dass es am Reiseziel generell keine ${label}-Hotels gibt. Für genau deine Reisedaten wurde in der aktuell angebundenen Tarifquelle nur kein bestätigter ${label}-Tarif geliefert.`)||changed;
      changed=setText(primary,'Verpflegung ändern')||changed;
      changed=setAttr(primary,'onclick',"openPlanner('board')")||changed;
      return changed;
    }
    if(noAvailability){
      changed=setText(title,'Keine Verfügbarkeit für diesen Zeitraum')||changed;
      changed=setText(sub,'Ändere Zeitraum oder Reiseziel und suche erneut.')||changed;
      changed=setText(cardTitle,'Für diese Reisedaten aktuell kein bestätigtes Angebot')||changed;
      changed=setText(cardCopy,'Die aktuelle Datenquelle liefert für genau diese Reisedaten momentan kein verfügbares Hotelangebot. Das kann sich mit einem anderen Zeitraum oder Reiseziel ändern.')||changed;
      changed=setText(primary,'Zeitraum ändern')||changed;
      changed=setAttr(primary,'onclick',"openPlanner('dates')")||changed;
      return changed;
    }
    changed=setText(title,'Aktive Filter ohne Treffer')||changed;
    changed=setText(sub,'Passe einen Filter an oder ändere den Zeitraum.')||changed;
    changed=setText(cardTitle,'Aktuelle Auswahl ohne vollständigen Treffer')||changed;
    changed=setText(cardCopy,'Für deine aktuelle Kombination aus Filtern und Reisedaten wurde kein vollständiger Treffer bestätigt. Passe einen Filter oder den Zeitraum an.')||changed;
    changed=setText(primary,'Filter prüfen')||changed;
    changed=setAttr(primary,'onclick',"openFilter('Zimmer')")||changed;
    return changed;
  }
  let raf=0,observer=null;
  function schedule(){if(raf)return;raf=requestAnimationFrame(()=>{raf=0;fixEmptyState();});}
  function installObserver(){
    const results=document.getElementById('results');if(!results||observer||typeof MutationObserver==='undefined')return;
    observer=new MutationObserver(schedule);observer.observe(results,{childList:true,subtree:true,characterData:true});
  }
  function cleanup(){if(observer){observer.disconnect();observer=null;}raf=0;}
  fixEmptyState();installObserver();
  window.addEventListener('pagehide',cleanup,{passive:true});
  window.addEventListener('pageshow',()=>{fixEmptyState();installObserver();},{passive:true});
  window.NOREYO_V548=Object.freeze({BUILD,requestedMealCode,codeFromBoard,selectRequestedRate,mustCount,fixEmptyState});
})();