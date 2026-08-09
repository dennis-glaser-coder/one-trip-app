(function(){
  'use strict';

  function pendingFamily(){
    try{return window.NOREYO_V571?.pendingFamily||null;}catch(_){return null;}
  }

  function isCruise(){
    try{return window.NOREYO_V552?.isCruise?.()===true;}catch(_){return false;}
  }

  function showFamilyError(family){
    const count=Number(family?.childCount)||0;
    const message=count
      ?`Bitte ergänze das Alter ${count===1?'des Kindes':'aller '+count+' Kinder'}, bevor die Live-Suche startet.`
      :'Bitte prüfe die Reisenden und Kinderalter vor der Live-Suche.';

    try{
      if(typeof showToast==='function')showToast(message);
      else if(typeof toast==='function')toast(message);
      else alert(message);
    }catch(_){alert(message);}

    try{
      if(typeof openPlanner==='function')setTimeout(()=>openPlanner('travellers'),0);
    }catch(_){ }
  }

  function guardPendingFamily(event){
    if(isCruise())return;
    const button=event.target instanceof Element?event.target.closest('button'):null;
    if(!button)return;
    if(!button.classList.contains('liveSearchButton')&&!button.classList.contains('noreyo-v541-booking-cta'))return;

    try{window.NOREYO_V571?.reconcilePendingFamily?.();}catch(_){ }
    const family=pendingFamily();
    if(!family)return;

    event.preventDefault();
    event.stopImmediatePropagation();
    showFamilyError(family);
  }

  document.addEventListener('click',guardPendingFamily,true);
  window.NOREYO_V572=Object.freeze({pendingFamily,guardPendingFamily});
})();