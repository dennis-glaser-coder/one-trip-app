/* NOREYO V8.26 — final non-flight search completeness guard.
   Rejects incomplete hotel/package requests locally before they reach
   Supabase/LiteAPI: at least one occupancy and a complete future date range
   are mandatory. Flight actions remain untouched. */
(function(){
'use strict';
const BUILD='8.26';

function inputUrl(input){
  if(typeof input==='string')return input;
  try{if(typeof Request!=='undefined'&&input instanceof Request)return input.url||'';}catch(_){}
  return String(input?.url||'');
}
function isSearchTravel(input){return inputUrl(input).includes('/functions/v1/search-travel');}
function parse(text){
  if(typeof text!=='string'||!text.trim())return null;
  try{return JSON.parse(text);}catch(_){return null;}
}
async function body(input,init){
  if(typeof init?.body==='string')return parse(init.body);
  try{
    if(typeof Request!=='undefined'&&input instanceof Request&&!input.bodyUsed)
      return parse(await input.clone().text());
  }catch(_){}
  return null;
}
function flight(raw){return String(raw?.action||'').trim().toLowerCase()==='flight';}
function validISO(v){
  const s=String(v||'');
  if(!/^\d{4}-\d{2}-\d{2}$/.test(s))return false;
  const d=new Date(s+'T12:00:00');
  return !Number.isNaN(d.getTime()) &&
    d.getFullYear()===+s.slice(0,4) &&
    d.getMonth()+1===+s.slice(5,7) &&
    d.getDate()===+s.slice(8,10);
}
function todayISO(){
  const d=new Date();
  return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
}
function problem(raw){
  if(!raw||typeof raw!=='object'||flight(raw))return null;
  if(!Array.isArray(raw.occupancies)||raw.occupancies.length<1)
    return{message:'Bitte Reisende auswählen, bevor du suchst.',planner:'travellers'};
  if(!validISO(raw.checkin)||!validISO(raw.checkout))
    return{message:'Bitte einen vollständigen Reisezeitraum auswählen.',planner:'dates'};
  if(String(raw.checkin)<todayISO())
    return{message:'Das Abreisedatum liegt in der Vergangenheit. Bitte den Zeitraum aktualisieren.',planner:'dates'};
  if(String(raw.checkout)<=String(raw.checkin))
    return{message:'Das Rückreisedatum muss nach dem Abreisedatum liegen.',planner:'dates'};
  return null;
}
function local422(message){
  return new Response(JSON.stringify({error:{code:'INVALID_SEARCH_REQUEST',message}}),{
    status:422,headers:{'content-type':'application/json'}
  });
}
function release(){
  try{window.NOREYO_V607?.releaseGuard?.('request-completeness');}catch(_){}
  try{window.NOREYO_V585?.releaseBusy?.();}catch(_){}
}
function notify(p){
  release();
  try{
    if(typeof showToast==='function')showToast(p.message);
    else window.toast?.(p.message);
  }catch(_){}
  setTimeout(()=>{try{if(typeof openPlanner==='function')openPlanner(p.planner);}catch(_){}},0);
}
function block(p){notify(p);return local422(p.message);}
function install(){
  try{
    if(typeof window.fetch!=='function'||window.fetch.__noreyoV826)return false;
    const prior=window.fetch.bind(window);
    const wrapped=async function(input,init){
      if(!isSearchTravel(input))return prior(input,init);
      const raw=await body(input,init);
      if(!raw)return prior(input,init);
      const p=problem(raw);
      return p?block(p):prior(input,init);
    };
    wrapped.__noreyoV826=true;
    window.fetch=wrapped;
    return true;
  }catch(_){return false;}
}
install();
window.addEventListener('pageshow',install,{passive:true});
window.NOREYO_V826=Object.freeze({BUILD,inputUrl,isSearchTravel,parse,body,flight,validISO,todayISO,problem,local422,install});
})();