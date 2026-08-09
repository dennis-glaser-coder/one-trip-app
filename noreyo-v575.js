(function(){
  'use strict';

  function norm(v){
    return String(v||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/ß/g,'ss');
  }

  function hasExplicitAdultIntent(text){
    const t=norm(text);
    if(/\bzu zweit\b/.test(t))return true;
    return /\b(?:[1-9]|ein(?:e|en|em|er)?|zwei|drei|vier|fuenf|funf|sechs|sieben|acht|neun)\s+(?:erwachsen(?:e|er|en)?|personen?|reisende)\b/.test(t);
  }

  function textarea(){return document.getElementById('noreyoAi556Text');}
  function nativeSearchState(){
    try{return typeof searchState!=='undefined'&&searchState?searchState:null;}catch(_){return null;}
  }

  function restoreAdults(expected){
    const state=nativeSearchState();
    if(!state||!Number.isInteger(expected)||expected<1||expected>9)return false;
    const current=Math.round(Number(state.adults));
    if(current===expected)return false;
    state.adults=expected;
    try{if(typeof updateSearchUI==='function')updateSearchUI();}catch(_){ }
    try{if(typeof persistState==='function')persistState();}catch(_){ }
    return true;
  }

  function onApplyCapture(event){
    const button=event.target instanceof Element?event.target.closest('.noreyo-v556-apply'):null;
    if(!button)return;
    const text=textarea()?.value||'';
    if(hasExplicitAdultIntent(text))return;

    const state=nativeSearchState();
    const before=Math.round(Number(state?.adults));
    if(!Number.isInteger(before)||before<1||before>9)return;

    setTimeout(()=>restoreAdults(before),0);
  }

  document.addEventListener('click',onApplyCapture,true);

  window.NOREYO_V575=Object.freeze({
    hasExplicitAdultIntent,
    restoreAdults
  });
})();