(function(){
  'use strict';

  function currentProductMode(){
    try{
      if(typeof productMode!=='undefined'&&typeof productMode==='string')return productMode;
    }catch{}
    const active=document.querySelector('.product-switch .active,.product-switch-host .active,[data-product-mode].active');
    const explicit=active?.getAttribute?.('data-product-mode');
    if(explicit==='hotel'||explicit==='flight'||explicit==='package')return explicit;
    const label=(active?.textContent||'').trim().toLowerCase();
    if(/hotel/.test(label)&&!/pauschal/.test(label))return 'hotel';
    if(/flug/.test(label)&&!/pauschal/.test(label))return 'flight';
    return 'package';
  }

  function plannerKind(modal){
    const heading=(modal?.querySelector('h1,h2,h3,#plannerTitle')?.textContent||document.getElementById('plannerTitle')?.textContent||'').trim();
    if(/abflug|flughafen/i.test(heading))return 'airports';
    if(/ziel|reiseziel|region/i.test(heading))return 'destination';
    if(/zeitraum|datum|reisezeit/i.test(heading))return 'dates';
    if(/reisende|personen|gäste/i.test(heading))return 'travellers';
    return null;
  }

  function ensureErrorHost(root){
    let host=root.querySelector('.noreyo-v568-error');
    if(host)return host;
    host=document.createElement('div');
    host.className='noreyo-v568-error';
    host.setAttribute('role','alert');
    host.setAttribute('aria-live','assertive');
    host.style.cssText='margin:10px 0 0;padding:10px 12px;border-radius:12px;background:#fff2ed;color:#9a4f3c;font-size:12px;line-height:1.4;font-weight:650;';
    const save=root.querySelector('.planner-save');
    if(save)save.insertAdjacentElement('beforebegin',host);else root.appendChild(host);
    return host;
  }

  function block(event,root,message,focus){
    event.preventDefault();
    event.stopImmediatePropagation();
    const host=ensureErrorHost(root);
    host.textContent=message;
    focus?.focus?.({preventScroll:false});
    try{host.scrollIntoView({block:'nearest',behavior:'smooth'});}catch{}
  }

  function validateAirportPlanner(modal){
    if(currentProductMode()==='hotel')return {ok:true};
    const choices=[...modal.querySelectorAll('.choice')];
    if(!choices.length)return {ok:false,message:'Die Abflughäfen konnten nicht geladen werden. Bitte schließe die Auswahl und öffne sie erneut.'};
    const selected=choices.filter(el=>el.classList.contains('on'));
    if(!selected.length)return {ok:false,message:'Bitte wähle mindestens einen Abflughafen.',focus:choices[0]};
    if(selected.length>6)return {ok:false,message:'Bitte wähle höchstens 6 Abflughäfen.',focus:selected[6]};
    return {ok:true};
  }

  function validateDestinationPlanner(modal){
    const options=[...modal.querySelectorAll('.dest-option')];
    if(!options.length)return {ok:false,message:'Die Reiseziele konnten nicht geladen werden. Bitte schließe die Auswahl und öffne sie erneut.'};
    if(!options.some(el=>el.classList.contains('on')))return {ok:false,message:'Bitte wähle ein Reiseziel.',focus:options[0]};
    return {ok:true};
  }

  function parseAirportSummary(){
    const text=(document.querySelector('.airportValue')?.textContent||'').trim();
    if(!text)return [];
    return text.split(/[\s,;/|]+/).map(v=>v.trim().toUpperCase()).filter(Boolean);
  }

  function validateVisibleAirports(){
    if(currentProductMode()==='hotel')return {ok:true};
    const codes=parseAirportSummary();
    if(!codes.length)return {ok:false,message:'Bitte wähle mindestens einen Abflughafen.'};
    if(codes.length>6)return {ok:false,message:'Bitte wähle höchstens 6 Abflughäfen.'};
    if(codes.some(code=>!/^[A-Z]{3}$/.test(code)))return {ok:false,message:'Mindestens ein Abflughafen ist ungültig. Bitte öffne die Abflugauswahl erneut.'};
    return {ok:true};
  }

  function showToastAndOpen(message,planner){
    try{
      if(typeof toast==='function')toast(message);
      else if(typeof showToast==='function')showToast(message);
      else alert(message);
      if(planner&&typeof openPlanner==='function')setTimeout(()=>openPlanner(planner),0);
    }catch{alert(message);}
  }

  function guard(event){
    const target=event.target instanceof Element?event.target.closest('button'):null;
    if(!target)return;

    if(target.classList.contains('planner-save')){
      const modal=target.closest('.planner-sheet,.sheet,[role="dialog"]');
      if(!modal)return;
      modal.querySelector('.noreyo-v568-error')?.remove();
      const kind=plannerKind(modal);
      const result=kind==='airports'?validateAirportPlanner(modal):kind==='destination'?validateDestinationPlanner(modal):{ok:true};
      if(!result.ok)block(event,modal,result.message,result.focus);
      return;
    }

    if(target.classList.contains('liveSearchButton')||target.classList.contains('noreyo-v541-booking-cta')){
      const airports=validateVisibleAirports();
      if(!airports.ok){
        event.preventDefault();
        event.stopImmediatePropagation();
        showToastAndOpen(airports.message,'airports');
      }
    }
  }

  function cleanupTransientErrors(){
    document.querySelectorAll('.noreyo-v568-error').forEach(el=>el.remove());
  }

  function install(){
    document.addEventListener('click',guard,true);
    window.addEventListener('pagehide',cleanupTransientErrors,{passive:true});
  }

  window.NOREYO_V568=Object.freeze({
    currentProductMode,
    validateAirportPlanner,
    validateDestinationPlanner,
    validateVisibleAirports,
    parseAirportSummary
  });

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});
  else install();
})();
