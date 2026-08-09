(function(){
  'use strict';

  let activeModal=null;
  let returnFocus=null;
  let modalLocked=false;
  let lockedY=0;
  let bodySnapshot=null;
  let searchBusy=false;
  let busyTimer=0;
  let specializedLockReleasedOnHide=false;

  function productModeValue(){
    try{
      if(window.NOREYO_V552?.isCruise?.())return 'cruise';
    }catch(_){ }
    const active=document.querySelector('#discover .product-mode.on,.product-switch .active,.product-switch-host .active,[data-product-mode].active');
    const explicit=active?.getAttribute?.('data-noreyo-product')||active?.getAttribute?.('data-product-mode');
    if(['package','hotel','flight','cruise'].includes(explicit))return explicit;
    const text=(active?.textContent||'').trim().toLowerCase();
    if(/kreuzfahrt/.test(text))return 'cruise';
    if(/hotel/.test(text)&&!/pauschal/.test(text))return 'hotel';
    if(/flug/.test(text)&&!/pauschal/.test(text))return 'flight';
    try{
      if(typeof productMode!=='undefined'&&typeof productMode==='string'&&['package','hotel','flight'].includes(productMode))return productMode;
    }catch(_){ }
    return 'package';
  }

  function ctaLabel(){
    const mode=productModeValue();
    return mode==='hotel'?'Live-Hotels finden':mode==='flight'?'Live-Flüge finden':'Pauschalreise suchen';
  }

  function syncCta(){
    if(productModeValue()==='cruise')return;
    document.querySelectorAll('.noreyo-v541-booking-cta').forEach(btn=>{
      const first=btn.querySelector('span');
      if(first&&first.textContent!==ctaLabel())first.textContent=ctaLabel();
    });
  }

  function visibleModal(){
    return document.querySelector(
      '.planner-sheet.show,.sheet.show,[role="dialog"].show,'+
      '.noreyo-v552-sheet-backdrop .noreyo-v552-sheet,'+
      '.noreyo-v556-backdrop.show .noreyo-v556-sheet'
    );
  }

  function focusable(root){
    return [...root.querySelectorAll('button:not([disabled]),a[href],input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])')]
      .filter(el=>!el.hidden&&el.getClientRects().length!==0);
  }

  function snapshotBody(){
    const s=document.body.style;
    return{position:s.position,top:s.top,left:s.left,right:s.right,width:s.width,overflow:s.overflow};
  }

  function restoreBody(snapshot){
    if(!snapshot||!document.body)return;
    const s=document.body.style;
    s.position=snapshot.position;
    s.top=snapshot.top;
    s.left=snapshot.left;
    s.right=snapshot.right;
    s.width=snapshot.width;
    s.overflow=snapshot.overflow;
  }

  function lockScroll(){
    if(modalLocked||!document.body)return;
    modalLocked=true;
    lockedY=Math.max(0,window.scrollY||window.pageYOffset||0);
    bodySnapshot=snapshotBody();
    const s=document.body.style;
    s.position='fixed';
    s.top=`-${lockedY}px`;
    s.left='0';
    s.right='0';
    s.width='100%';
    s.overflow='hidden';
  }

  function unlockScroll(sync=false){
    if(!modalLocked||!document.body)return;
    const y=lockedY;
    modalLocked=false;
    lockedY=0;
    restoreBody(bodySnapshot);
    bodySnapshot=null;
    const restore=()=>{
      try{window.scrollTo({top:y,left:0,behavior:'auto'});}catch(_){window.scrollTo(0,y);}
    };
    if(sync)restore();else requestAnimationFrame(restore);
  }

  function modalTitle(modal){
    return(modal.querySelector('h1,h2,h3,#plannerTitle,[aria-labelledby]')?.textContent||'Auswahl').trim();
  }

  function destinationPlannerOwnsScrollLock(modal){
    if(!modal||modal.id!=='plannerSheet')return false;
    try{if(typeof plannerMode!=='undefined'&&plannerMode==='destination')return true;}catch(_){ }
    const title=modalTitle(modal).toLowerCase();
    return /ziel|reiseziel|region/.test(title);
  }

  function aiOwnsScrollLock(modal){
    return !!modal?.closest?.('.noreyo-v556-backdrop');
  }

  function specializedModalOwnsScrollLock(modal){
    return destinationPlannerOwnsScrollLock(modal)||aiOwnsScrollLock(modal);
  }

  function syncModal(){
    const modal=visibleModal();
    if(modal===activeModal)return;

    if(activeModal&&!modal){
      document.body?.classList.remove('noreyo-v570-modal-open');
      document.querySelector('.nav')?.classList.remove('noreyo-v570-nav-hidden');
      activeModal=null;
      unlockScroll(false);
      const target=returnFocus;
      returnFocus=null;
      if(target&&document.contains(target))setTimeout(()=>target.focus?.({preventScroll:true}),0);
      return;
    }

    if(modal){
      if(!activeModal)returnFocus=document.activeElement instanceof HTMLElement?document.activeElement:null;
      activeModal=modal;
      document.body?.classList.add('noreyo-v570-modal-open');
      document.querySelector('.nav')?.classList.add('noreyo-v570-nav-hidden');
      modal.setAttribute('role','dialog');
      modal.setAttribute('aria-modal','true');
      if(!modal.getAttribute('aria-label')&&!modal.getAttribute('aria-labelledby'))modal.setAttribute('aria-label',modalTitle(modal));
      if(!specializedModalOwnsScrollLock(modal))lockScroll();
      const items=focusable(modal);
      if(items.length&&!modal.contains(document.activeElement))setTimeout(()=>items[0].focus?.({preventScroll:true}),0);
    }
  }

  function closeControl(modal){
    return modal.querySelector(
      '.planner-close,.close,[data-close],[data-close-cruise-sheet],.noreyo-v556-close,'+
      'button[aria-label*="schließ" i],button[aria-label*="close" i]'
    );
  }

  function onModalKey(event){
    const modal=activeModal||visibleModal();
    if(!modal)return;
    if(event.key==='Escape'){
      const close=closeControl(modal);
      if(close){event.preventDefault();event.stopPropagation();close.click();}
      return;
    }
    if(event.key!=='Tab')return;
    const items=focusable(modal);
    if(!items.length)return;
    const first=items[0],last=items[items.length-1];
    if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}
    else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
  }

  function updateViewport(){
    const vv=window.visualViewport;
    const height=Math.max(320,Math.round(vv?.height||window.innerHeight||800));
    document.documentElement.style.setProperty('--noreyo-v570-vh',`${height}px`);
    const keyboard=!!vv&&(window.innerHeight-vv.height>120);
    document.body?.classList.toggle('noreyo-v570-keyboard',keyboard);
  }

  function validIso(value){
    if(!/^\d{4}-\d{2}-\d{2}$/.test(String(value||'')))return false;
    const d=new Date(String(value)+'T00:00:00Z');
    return Number.isFinite(d.getTime())&&d.toISOString().slice(0,10)===String(value);
  }

  function currentSearchState(){
    try{return typeof searchState!=='undefined'&&searchState?searchState:null;}catch(_){return null;}
  }

  function currentDestination(){
    try{if(typeof dest!=='undefined'&&String(dest||'').trim())return String(dest).trim();}catch(_){ }
    return String(document.querySelector('.destinationInput')?.value||'').trim();
  }

  function searchValidation(){
    const mode=productModeValue();
    if(mode==='cruise')return{ok:true,mode:'cruise'};

    const state=currentSearchState();
    const destination=currentDestination();
    if(destination.length<2)return{ok:false,message:'Bitte wähle ein Reiseziel.',planner:'destination'};

    if(state){
      const airports=(Array.isArray(state.airports)?state.airports:[])
        .map(x=>String(x||'').trim().toUpperCase()).filter(Boolean);

      if(mode!=='hotel'){
        if(!airports.length)return{ok:false,message:'Bitte wähle mindestens einen Abflughafen.',planner:'airports'};
        if(airports.length>6)return{ok:false,message:'Bitte wähle höchstens 6 Abflughäfen.',planner:'airports'};
        if(airports.some(x=>!/^[A-Z]{3}$/.test(x)))return{ok:false,message:'Mindestens ein Abflughafen ist ungültig.',planner:'airports'};
      }

      if(!validIso(state.checkin))return{ok:false,message:'Bitte wähle ein gültiges Anreisedatum.',planner:'dates'};
      if(!validIso(state.checkout)||String(state.checkout)<=String(state.checkin))return{ok:false,message:'Die Rückreise muss nach der Anreise liegen.',planner:'dates'};

      const today=new Date();
      const todayIso=`${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
      if(String(state.checkin)<todayIso)return{ok:false,message:'Die Anreise liegt in der Vergangenheit.',planner:'dates'};

      const adults=Math.round(Number(state.adults));
      const ages=Array.isArray(state.childAges)?state.childAges.map(Number):[];
      if(!Number.isInteger(adults)||adults<1||adults>9)return{ok:false,message:'Mindestens ein Erwachsener ist erforderlich.',planner:'travellers'};
      if(adults+ages.length>9)return{ok:false,message:'Maximal 9 Reisende pro Suche.',planner:'travellers'};
      if(ages.some(age=>!Number.isInteger(age)||age<0||age>17))return{ok:false,message:'Bitte prüfe die Kinderalter.',planner:'travellers'};
      if(ages.filter(age=>age<=1).length>adults)return{ok:false,message:'Pro Erwachsenem kann höchstens ein Kleinkind unter 2 Jahren mitreisen.',planner:'travellers'};
      return{ok:true,mode};
    }

    const airportText=(document.querySelector('.airportValue')?.textContent||'').trim();
    const dateText=(document.querySelector('.dateValue')?.textContent||'').trim();
    const travellerText=(document.querySelector('.travellerValue')?.textContent||'').trim();
    if(mode!=='hotel'&&(!airportText||/wählen|auswählen|abflug/i.test(airportText)))return{ok:false,message:'Bitte wähle mindestens einen Abflughafen.',planner:'airports'};
    if(!dateText||/wählen|zeitraum/i.test(dateText))return{ok:false,message:'Bitte wähle deinen Reisezeitraum.',planner:'dates'};
    if(!travellerText||/wählen|reisende/i.test(travellerText))return{ok:false,message:'Bitte prüfe die Reisenden.',planner:'travellers'};
    return{ok:true,mode};
  }

  function showError(result){
    try{
      if(typeof toast==='function')toast(result.message);
      else if(typeof showToast==='function')showToast(result.message);
      else alert(result.message);
      if(result.planner&&typeof openPlanner==='function')setTimeout(()=>openPlanner(result.planner),0);
    }catch(_){alert(result.message);}
  }

  function setBusy(busy){
    document.querySelectorAll('.liveSearchButton,.noreyo-v541-booking-cta').forEach(btn=>{
      btn.setAttribute('aria-busy',busy?'true':'false');
      if(btn.classList.contains('liveSearchButton'))btn.disabled=busy;
      else btn.setAttribute('aria-disabled',busy?'true':'false');
    });
  }

  function releaseBusy(){
    searchBusy=false;
    if(busyTimer){clearTimeout(busyTimer);busyTimer=0;}
    setBusy(false);
  }

  function guardSearch(event){
    const button=event.target instanceof Element?event.target.closest('button'):null;
    if(!button||(!button.classList.contains('liveSearchButton')&&!button.classList.contains('noreyo-v541-booking-cta')))return;
    if(productModeValue()==='cruise')return;

    const validation=searchValidation();
    if(!validation.ok){
      event.preventDefault();
      event.stopImmediatePropagation();
      showError(validation);
      return;
    }

    if(!button.classList.contains('liveSearchButton'))return;
    if(searchBusy){event.preventDefault();event.stopImmediatePropagation();return;}
    searchBusy=true;
    queueMicrotask(()=>searchBusy&&setBusy(true));
    busyTimer=setTimeout(releaseBusy,15000);
  }

  function releaseSpecializedLocksForPageHide(){
    if(!document.body)return;
    const body=document.body;
    const html=document.documentElement;
    const hadPlanner=body.classList.contains('noreyo-planner-lock')||html.classList.contains('noreyo-planner-lock');
    const hadAi=body.classList.contains('noreyo-v556-lock');
    if(!hadPlanner&&!hadAi)return;

    const top=parseFloat(body.style.top||'0');
    const restoreY=Number.isFinite(top)&&top<0?Math.abs(top):Math.max(0,window.scrollY||0);
    specializedLockReleasedOnHide=true;
    html.classList.remove('noreyo-planner-lock');
    body.classList.remove('noreyo-planner-lock','noreyo-planner-keyboard','noreyo-v556-lock');
    body.style.top='';
    try{window.scrollTo({top:restoreY,left:0,behavior:'auto'});}catch(_){window.scrollTo(0,restoreY);}
  }

  function normalizeSpecializedModalAfterPageShow(){
    if(!specializedLockReleasedOnHide)return;
    specializedLockReleasedOnHide=false;

    const ai=document.querySelector('.noreyo-v556-backdrop.show .noreyo-v556-sheet');
    if(ai){
      const close=closeControl(ai);
      if(close){close.click();return;}
    }

    const planner=document.getElementById('plannerSheet');
    if(planner?.classList.contains('show')&&destinationPlannerOwnsScrollLock(planner)){
      try{if(typeof closePlanner==='function'){closePlanner();return;}}catch(_){ }
      closeControl(planner)?.click?.();
    }
  }

  function recoverPageShow(){
    updateViewport();
    normalizeSpecializedModalAfterPageShow();
    if(!visibleModal()){
      document.body?.classList.remove('noreyo-v570-modal-open');
      document.querySelector('.nav')?.classList.remove('noreyo-v570-nav-hidden');
      unlockScroll(false);
    }
    syncCta();
    syncModal();
  }

  function cleanupPageHide(){
    if(modalLocked)unlockScroll(true);
    releaseSpecializedLocksForPageHide();
    document.body?.classList.remove('noreyo-v570-modal-open','noreyo-v570-keyboard');
    document.querySelector('.nav')?.classList.remove('noreyo-v570-nav-hidden');
    releaseBusy();
  }

  function install(){
    updateViewport();
    syncCta();
    syncModal();
    document.addEventListener('keydown',onModalKey,true);
    document.addEventListener('click',guardSearch,true);
    window.visualViewport?.addEventListener('resize',updateViewport,{passive:true});
    window.visualViewport?.addEventListener('scroll',updateViewport,{passive:true});
    window.addEventListener('orientationchange',()=>setTimeout(updateViewport,60),{passive:true});
    window.addEventListener('pageshow',recoverPageShow,{passive:true});
    window.addEventListener('pagehide',cleanupPageHide,{passive:true});

    if(typeof MutationObserver!=='undefined'){
      new MutationObserver(()=>{
        syncCta();
        syncModal();
        if(searchBusy){
          const active=document.querySelector('.view.active');
          if(active&&active.id&&active.id!=='discover')releaseBusy();
        }
      }).observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['class']});
    }
  }

  window.NOREYO_V570=Object.freeze({
    productModeValue,
    searchValidation,
    validIso,
    destinationPlannerOwnsScrollLock,
    aiOwnsScrollLock,
    specializedModalOwnsScrollLock,
    releaseSpecializedLocksForPageHide
  });

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});
  else install();
})();