(function(){
  'use strict';

  function norm(v){
    return String(v||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/ß/g,'ss');
  }

  function explicitNoChildren(text){
    const t=norm(text);
    return /\b(ohne|keine|kein)\s+(?:kinder|kind|baby)\b/.test(t)||/\bnur\s+erwachsene\b/.test(t);
  }

  function parseAdults(text){
    const t=norm(text);
    const map={ein:1,eine:1,einen:1,einem:1,einer:1,zwei:2,drei:3,vier:4,fuenf:5,funf:5,sechs:6};
    const m=t.match(/\b(\d|ein(?:e|en|em|er)?|zwei|drei|vier|fuenf|funf|sechs)\s+erwachsen(?:e|er|en)?\b/);
    if(m)return /^\d+$/.test(m[1])?Number(m[1]):map[m[1]]??null;
    if(/\bzu zweit\b/.test(t))return 2;
    return null;
  }

  function textarea(){return document.getElementById('noreyoAi556Text');}
  function nativeSearchState(){
    try{return typeof searchState!=='undefined'&&searchState?searchState:null;}catch(_){return null;}
  }

  function clearStaleChildrenAfterNative(){
    const text=textarea()?.value||'';
    if(!explicitNoChildren(text))return false;

    const state=nativeSearchState();
    if(!state)return false;

    const adults=parseAdults(text);
    if(adults)state.adults=Math.max(1,Math.min(9,adults));
    state.childAges=[];

    try{if(typeof updateSearchUI==='function')updateSearchUI();}catch(_){ }
    try{if(typeof persistState==='function')persistState();}catch(_){ }
    return true;
  }

  function onApplyCapture(event){
    const button=event.target instanceof Element?event.target.closest('.noreyo-v556-apply'):null;
    if(!button)return;
    if(!explicitNoChildren(textarea()?.value||''))return;
    setTimeout(clearStaleChildrenAfterNative,0);
  }

  document.addEventListener('click',onApplyCapture,true);

  window.NOREYO_V574=Object.freeze({
    explicitNoChildren,
    parseAdults,
    clearStaleChildrenAfterNative
  });
})();