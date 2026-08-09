(function(){
  'use strict';

  function requestedMealCode(){
    try{return typeof mealPlanFilter==='string'?mealPlanFilter:'ANY';}catch{return 'ANY';}
  }

  function codeFromBoard(board){
    try{
      if(typeof mealPlanCodeFromBoard==='function')return String(mealPlanCodeFromBoard(board)||'ANY').toUpperCase();
    }catch{}
    const b=String(board||'').toLowerCase();
    if(/all\s*[- ]?inclusive|\bai\d*\b|\bti\b/.test(b))return 'AI';
    if(/vollpension|full\s*board|\bfb\d*\b/.test(b))return 'FB';
    if(/halbpension|half\s*board|\bhb\d*\b|\bbd\b/.test(b))return 'HB';
    if(/frühstück|fruhstuck|breakfast|\bbb\d*\b|\bbi\b/.test(b))return 'BB';
    if(/nur\s*übernachtung|nur\s*ubernachtung|room\s*only|\bro\d*\b/.test(b))return 'RO';
    return 'ANY';
  }

  function selectRequestedRate(o){
    const wanted=requestedMealCode();
    if(!o||wanted==='ANY')return o;
    const options=Array.isArray(o.rateOptions)?o.rateOptions:[];
    const matching=options.filter(x=>codeFromBoard(x?.board)===wanted).sort((a,b)=>(Number(a?.price)||Infinity)-(Number(b?.price)||Infinity));
    const x=matching[0];
    if(!x){
      if(codeFromBoard(o.board)===wanted)return o;
      return null;
    }
    const copy={...o,
      board:x.board||o.board,
      room:x.room||o.room,
      roomRaw:x.roomRaw||o.roomRaw,
      price:Number(x.price)||Number(o.price)||0,
      refundable:typeof x.refundable==='boolean'?x.refundable:o.refundable,
      offerId:x.offerId||o.offerId,
      mappedRoomId:x.mappedRoomId||o.mappedRoomId,
      selectedOfferId:x.offerId||o.selectedOfferId||o.offerId,
      selectedMappedRoomId:x.mappedRoomId||o.selectedMappedRoomId||o.mappedRoomId
    };
    try{if(typeof confirmedRoomFacts==='function')copy.confirmed={...(copy.confirmed||{}),...confirmedRoomFacts(copy.roomRaw||'')};}catch{}
    copy.features=[copy.board,copy.refundable?'Stornierbar':'Tarifbedingungen verfügbar',...(Array.isArray(copy.features)?copy.features.slice(2):[])].slice(0,4);
    return copy;
  }

  if(typeof filterAndRankOffers==='function'&&!filterAndRankOffers.__noreyoMealRateFirst){
    const prior=filterAndRankOffers;
    const wrapped=function(input){
      const wanted=requestedMealCode();
      const prepared=wanted==='ANY'?input:(Array.isArray(input)?input.map(selectRequestedRate).filter(Boolean):input);
      return prior(prepared);
    };
    wrapped.__noreyoMealRateFirst=true;
    filterAndRankOffers=wrapped;
  }

  function mustCount(){
    try{return Object.values(states||{}).filter(v=>v==='must').length;}catch{return 0;}
  }

  function mealLabel(){
    try{return typeof mealPlanLabel==='function'?String(mealPlanLabel()||'Verpflegung'):'Verpflegung';}catch{return 'Verpflegung';}
  }

  function fixEmptyState(){
    const offersEl=document.getElementById('offers');
    const match=document.querySelector('#results .match');
    if(!offersEl||!match)return;
    const empty=/Keine vollständige Übereinstimmung|Keine Verfügbarkeit gefunden/i.test(offersEl.textContent||'');
    if(!empty)return;
    const must=mustCount();
    if(must>0)return;

    const wanted=requestedMealCode();
    const title=match.querySelector('b');
    const sub=match.querySelector('small');
    const cardTitle=offersEl.querySelector('b');
    const cardCopy=offersEl.querySelector('p');
    const primary=offersEl.querySelector('button.planner-save');

    if(wanted!=='ANY'){
      const label=mealLabel();
      if(title)title.textContent=`Keine ${label}-Rate gefunden`;
      if(sub)sub.textContent='Für deine Reisedaten wurde aktuell kein bestätigter Tarif mit dieser Verpflegung zurückgegeben.';
      if(cardTitle)cardTitle.textContent=`Aktuell kein ${label}-Tarif`;
      if(cardCopy)cardCopy.textContent=`Es gibt Live-Hotels für deine Suche, aber in den aktuell geladenen Tarifen wurde ${label} für diesen Zeitraum nicht bestätigt. Ändere die Verpflegung oder den Zeitraum.`;
      if(primary){primary.textContent='Verpflegung ändern';primary.setAttribute('onclick',"openPlanner('board')");}
      return;
    }

    if(title)title.textContent='Aktive Filter ohne Treffer';
    if(sub)sub.textContent='Passe einen Filter an oder ändere den Zeitraum.';
    if(cardCopy)cardCopy.textContent='Es gibt verfügbare Hotels, aber aktuell keinen Treffer mit deinen übrigen Filtern. Wünsche allein schließen Hotels nicht aus.';
    if(primary){primary.textContent='Filter prüfen';primary.setAttribute('onclick',"openFilter('Zimmer')");}
  }

  let raf=0;
  function schedule(){if(raf)return;raf=requestAnimationFrame(()=>{raf=0;fixEmptyState();});}
  fixEmptyState();
  const results=document.getElementById('results');
  if(results&&typeof MutationObserver!=='undefined')new MutationObserver(schedule).observe(results,{childList:true,subtree:true,characterData:true});
  window.addEventListener('pageshow',schedule,{passive:true});

  window.NOREYO_V548=Object.freeze({requestedMealCode,codeFromBoard,selectRequestedRate,mustCount,fixEmptyState});
})();
