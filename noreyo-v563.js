(function(){
  'use strict';

  let modalLocked=false;
  let lockedScrollY=0;
  let previousBodyStyle=null;
  let bodyObserver=null;
  let searchBusy=false;
  let searchBusyTimer=0;

  function snapshotBodyStyle(){
    const s=document.body.style;
    return {position:s.position,top:s.top,left:s.left,right:s.right,width:s.width,overflow:s.overflow};
  }

  function restoreBodyStyle(snapshot){
    if(!snapshot)return;
    const s=document.body.style;
    s.position=snapshot.position;s.top=snapshot.top;s.left=snapshot.left;s.right=snapshot.right;s.width=snapshot.width;s.overflow=snapshot.overflow;
  }

  function restoreScroll(y,synchronous=false){
    const apply=()=>{try{window.scrollTo({top:y,left:0,behavior:'auto'});}catch{window.scrollTo(0,y);}};
    if(synchronous)apply();else requestAnimationFrame(apply);
  }

  function lockScroll(){
    if(modalLocked||!document.body)return;
    modalLocked=true;lockedScrollY=Math.max(0,window.scrollY||window.pageYOffset||0);previousBodyStyle=snapshotBodyStyle();
    const s=document.body.style;s.position='fixed';s.top=`-${lockedScrollY}px`;s.left='0';s.right='0';s.width='100%';s.overflow='hidden';
    document.documentElement.style.setProperty('--noreyo-modal-scroll-y',`${lockedScrollY}px`);
  }

  function unlockScroll({synchronous=false}={}){
    if(!modalLocked||!document.body)return;
    modalLocked=false;const y=lockedScrollY;restoreBodyStyle(previousBodyStyle);previousBodyStyle=null;lockedScrollY=0;restoreScroll(y,synchronous);
  }

  function syncScrollLock(){
    if(!document.body)return;
    if(document.body.classList.contains('noreyo-modal-open'))lockScroll();else unlockScroll();
  }

  function installScrollLock(){
    if(!document.body||typeof MutationObserver==='undefined')return;
    bodyObserver=new MutationObserver(syncScrollLock);bodyObserver.observe(document.body,{attributes:true,attributeFilter:['class']});syncScrollLock();
  }

  function recoverAfterPageShow(){
    const modal=document.querySelector('.planner-sheet.show,.sheet.show,[role="dialog"].show');
    if(!modal&&document.body?.classList.contains('noreyo-modal-open'))document.body.classList.remove('noreyo-modal-open');
    syncScrollLock();
  }

  function cleanupBeforePageHide(){
    if(modalLocked)unlockScroll({synchronous:true});
    releaseSearchBusy();
  }

  function currentProductMode(){
    try{return typeof productMode!=='undefined'?productMode:'package';}catch{return 'package';}
  }

  function isoDate(value){
    if(typeof value!=='string'||!/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(value))return null;
    const d=new Date(value+'T00:00:00Z');
    return Number.isFinite(d.getTime())&&d.toISOString().slice(0,10)===value?value:null;
  }

  function validateDates(root){
    const inputs=[...root.querySelectorAll('input[type="date"]')];
    if(inputs.length<2)return {ok:true};
    const start=isoDate(inputs[0].value),end=isoDate(inputs[1].value);
    if(!start)return {ok:false,message:'Bitte wähle ein gültiges Anreisedatum.',focus:inputs[0]};
    if(!end)return {ok:false,message:'Bitte wähle ein gültiges Rückreisedatum.',focus:inputs[1]};
    if(end<=start)return {ok:false,message:'Die Rückreise muss nach der Anreise liegen.',focus:inputs[1]};
    const today=new Date();
    const todayIso=`${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
    if(start<todayIso)return {ok:false,message:'Die Anreise liegt in der Vergangenheit.',focus:inputs[0]};
    return {ok:true};
  }

  function rowCount(root,labelPattern){
    for(const row of root.querySelectorAll('.counter-row')){
      const label=(row.querySelector('.counter-copy b,b')?.textContent||'').trim();
      if(labelPattern.test(label)){
        const n=Number((row.querySelector('.counter strong,strong')?.textContent||'').trim());
        return Number.isInteger(n)?n:null;
      }
    }
    return null;
  }

  function validateTravellers(root){
    const adults=rowCount(root,/erwachsene?/i);
    const children=rowCount(root,/kinder?/i);
    if(adults!==null&&(adults<1||adults>9))return {ok:false,message:'Mindestens ein Erwachsener ist erforderlich.'};
    if(children!==null&&(children<0||children>8))return {ok:false,message:'Die Kinderanzahl ist ungültig.'};
    if(adults!==null&&children!==null&&adults+children>9)return {ok:false,message:'Maximal 9 Reisende pro Suche.'};
    const selects=[...root.querySelectorAll('.child-age select,.child-ages select')];
    if(children!==null&&selects.length!==children)return {ok:false,message:'Bitte gib für jedes Kind das Alter an.',focus:selects[0]||null};
    for(const select of selects){
      const age=Number(select.value);
      if(!Number.isInteger(age)||age<0||age>17)return {ok:false,message:'Bitte gib für jedes Kind ein gültiges Alter an.',focus:select};
    }
    if(adults!==null&&selects.filter(s=>Number(s.value)<=1).length>adults)return {ok:false,message:'Pro Erwachsenem kann höchstens ein Kleinkind unter 2 Jahren mitreisen.'};
    return {ok:true};
  }

  function validateAirports(root){
    if(currentProductMode()==='hotel')return {ok:true};
    const choices=[...root.querySelectorAll('.choice')];
    if(!choices.length)return {ok:true};
    if(!choices.some(el=>el.classList.contains('on')))return {ok:false,message:'Bitte wähle mindestens einen Abflughafen.',focus:choices[0]};
    return {ok:true};
  }

  function plannerValidation(modal){
    if(modal.querySelector('input[type="date"]'))return validateDates(modal);
    if(modal.querySelector('.counter-row,.child-ages'))return validateTravellers(modal);
    const heading=(modal.querySelector('h1,h2,h3')?.textContent||'').trim();
    if(/abflug|flughafen/i.test(heading))return validateAirports(modal);
    return {ok:true};
  }

  function ensureErrorHost(root){
    let host=root.querySelector('.noreyo-v566-error');
    if(host)return host;
    host=document.createElement('div');host.className='noreyo-v566-error';host.setAttribute('role','alert');host.setAttribute('aria-live','assertive');
    host.style.cssText='margin:10px 0 0;padding:10px 12px;border-radius:12px;background:#fff2ed;color:#9a4f3c;font-size:12px;line-height:1.4;font-weight:650;';
    const save=root.querySelector('.planner-save');
    if(save)save.insertAdjacentElement('beforebegin',host);else root.appendChild(host);
    return host;
  }

  function showValidationError(root,result){
    const host=ensureErrorHost(root);host.textContent=result.message||'Bitte prüfe deine Reisedaten.';
    result.focus?.focus?.({preventScroll:false});
    try{host.scrollIntoView({block:'nearest',behavior:'smooth'});}catch{}
  }

  function clearValidationError(root){root.querySelector('.noreyo-v566-error')?.remove();}

  function visibleSearchSnapshot(){
    const destination=(document.querySelector('.destinationInput')?.value||'').trim();
    const airport=(document.querySelector('.airportValue')?.textContent||'').trim();
    const dates=(document.querySelector('.dateValue')?.textContent||'').trim();
    const travellers=(document.querySelector('.travellerValue')?.textContent||'').trim();
    return {destination,airport,dates,travellers,mode:currentProductMode()};
  }

  function validateVisibleSearch(){
    const s=visibleSearchSnapshot();
    if(s.destination.length<2)return {ok:false,message:'Bitte wähle zuerst ein Reiseziel.',planner:'destination'};
    if(s.mode!=='hotel'&&(!s.airport||/wählen|auswählen|abflug/i.test(s.airport)))return {ok:false,message:'Bitte wähle mindestens einen Abflughafen.',planner:'airports'};
    if(!s.dates||/wählen|zeitraum/i.test(s.dates))return {ok:false,message:'Bitte wähle deinen Reisezeitraum.',planner:'dates'};
    if(!s.travellers||/wählen|reisende/i.test(s.travellers))return {ok:false,message:'Bitte prüfe die Reisenden.',planner:'travellers'};
    return {ok:true};
  }

  function showSearchError(result){
    try{
      if(typeof toast==='function')toast(result.message);
      else alert(result.message);
      if(result.planner&&typeof openPlanner==='function')setTimeout(()=>openPlanner(result.planner),0);
    }catch{alert(result.message);}
  }

  function setBusyUi(busy){
    document.querySelectorAll('.liveSearchButton,.noreyo-v541-booking-cta').forEach(btn=>{
      btn.setAttribute('aria-busy',busy?'true':'false');
      if(btn.classList.contains('liveSearchButton'))btn.disabled=busy;
      else btn.setAttribute('aria-disabled',busy?'true':'false');
    });
  }

  function releaseSearchBusy(){
    if(!searchBusy)return;
    searchBusy=false;if(searchBusyTimer){clearTimeout(searchBusyTimer);searchBusyTimer=0;}setBusyUi(false);
  }

  function beginSearchBusy(){
    if(searchBusy)return false;
    searchBusy=true;
    queueMicrotask(()=>{if(searchBusy)setBusyUi(true);});
    searchBusyTimer=setTimeout(releaseSearchBusy,15000);
    return true;
  }

  function searchClickGuard(event){
    const target=event.target instanceof Element?event.target.closest('button'):null;
    if(!target)return;

    if(target.classList.contains('planner-save')){
      const modal=target.closest('.planner-sheet,.sheet,[role="dialog"]');
      if(!modal)return;
      clearValidationError(modal);
      const result=plannerValidation(modal);
      if(!result.ok){event.preventDefault();event.stopImmediatePropagation();showValidationError(modal,result);}
      return;
    }

    const custom=target.classList.contains('noreyo-v541-booking-cta');
    const native=target.classList.contains('liveSearchButton');
    if(!custom&&!native)return;

    const validation=validateVisibleSearch();
    if(!validation.ok){event.preventDefault();event.stopImmediatePropagation();showSearchError(validation);return;}

    if(native){
      if(searchBusy){event.preventDefault();event.stopImmediatePropagation();return;}
      beginSearchBusy();
    }
  }

  function installSearchSafety(){
    document.addEventListener('click',searchClickGuard,true);
    if(typeof MutationObserver!=='undefined'){
      new MutationObserver(()=>{
        if(!searchBusy)return;
        const active=document.querySelector('.view.active');
        if(active&&active.id&&active.id!=='discover')releaseSearchBusy();
      }).observe(document.body,{subtree:true,attributes:true,attributeFilter:['class']});
    }
  }

  function install(){
    installScrollLock();installSearchSafety();
    window.addEventListener('pageshow',recoverAfterPageShow,{passive:true});
    window.addEventListener('pagehide',cleanupBeforePageHide,{passive:true});
  }

  window.NOREYO_V566=Object.freeze({validateDates,validateTravellers,validateAirports,validateVisibleSearch});

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});
  else install();
})();
