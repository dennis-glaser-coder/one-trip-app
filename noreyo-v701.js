/* NOREYO V7.01 — Request-object integrity boundary + past-date safety.
   Validates fetch(Request) search-travel payloads without consuming caller bodies,
   and rejects invalid/past hotel-package dates at the final network boundary. */
(function(){
'use strict';
const BUILD='7.01',MAX_ADULTS=6,MAX_CHILDREN=4,MAX_TRAVELLERS=9;
function isSearchTravel(input){const url=typeof input==='string'?input:String(input?.url||'');return url.includes('/functions/v1/search-travel');}
function parseText(text){if(typeof text!=='string'||!text.trim())return null;try{return JSON.parse(text);}catch(_){return null;}}
async function parseRequest(input,init){if(typeof init?.body==='string')return parseText(init.body);try{if(typeof Request!=='undefined'&&input instanceof Request){if(input.bodyUsed)return null;return parseText(await input.clone().text());}}catch(_){ }return null;}
function validISO(v){const s=String(v||'');if(!/^\d{4}-\d{2}-\d{2}$/.test(s))return false;const d=new Date(s+'T12:00:00');return !Number.isNaN(d.getTime())&&d.getFullYear()===+s.slice(0,4)&&d.getMonth()+1===+s.slice(5,7)&&d.getDate()===+s.slice(8,10);}
function todayISO(){const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');}
function issue(raw){
  if(!raw||raw.action)return null;
  if(Array.isArray(raw.occupancies)&&raw.occupancies.length){
    const occ=raw.occupancies[0]||{},adults=Number(occ.adults),children=Array.isArray(occ.children)?occ.children.map(Number):[];
    if(!Number.isInteger(adults)||adults<1||adults>MAX_ADULTS)return {message:`Bitte 1–${MAX_ADULTS} Erwachsene auswählen.`,planner:'travellers'};
    if(children.length>MAX_CHILDREN)return {message:`Aktuell sind maximal ${MAX_CHILDREN} Kinder pro Suche möglich.`,planner:'travellers'};
    if(adults+children.length>MAX_TRAVELLERS)return {message:`Aktuell sind maximal ${MAX_TRAVELLERS} Reisende pro Suche möglich.`,planner:'travellers'};
    if(children.some(v=>!Number.isInteger(v)||v<0||v>17))return {message:'Bitte für jedes Kind ein gültiges Alter von 0 bis 17 Jahren angeben.',planner:'travellers'};
    if(children.filter(v=>v<=1).length>adults)return {message:'Pro Erwachsenen kann maximal ein Kleinkind unter 2 Jahren berücksichtigt werden.',planner:'travellers'};
  }
  if(raw.checkin!==undefined||raw.checkout!==undefined){
    if(!validISO(raw.checkin)||!validISO(raw.checkout))return {message:'Bitte einen gültigen Reisezeitraum auswählen.',planner:'dates'};
    if(String(raw.checkin)<todayISO())return {message:'Das Abreisedatum liegt in der Vergangenheit. Bitte den Zeitraum aktualisieren.',planner:'dates'};
    if(String(raw.checkout)<=String(raw.checkin))return {message:'Das Rückreisedatum muss nach dem Abreisedatum liegen.',planner:'dates'};
  }
  return null;
}
function release(){try{window.NOREYO_V607?.releaseGuard?.('request-validation');}catch(_){}try{window.NOREYO_V585?.releaseBusy?.();}catch(_){} }
function notify(message){try{if(typeof showToast==='function')showToast(message);else window.toast?.(message);}catch(_){} }
function openPlannerLater(kind){setTimeout(()=>{try{if(typeof openPlanner==='function')openPlanner(kind);}catch(_){}},0);}
function local422(message){const payload=JSON.stringify({error:{code:'INVALID_SEARCH_REQUEST',message}});try{return new Response(payload,{status:422,headers:{'content-type':'application/json'}});}catch(_){throw new Error(message);}}
function install(){try{if(typeof window.fetch!=='function'||window.fetch.__noreyoV701)return false;const prior=window.fetch.bind(window);const wrapped=function(input,init){if(!isSearchTravel(input))return prior(input,init);if(typeof init?.body==='string'){const problem=issue(parseText(init.body));if(!problem)return prior(input,init);release();notify(problem.message);openPlannerLater(problem.planner);return Promise.resolve(local422(problem.message));}if(typeof Request!=='undefined'&&input instanceof Request){return parseRequest(input,init).then(raw=>{const problem=issue(raw);if(!problem)return prior(input,init);release();notify(problem.message);openPlannerLater(problem.planner);return local422(problem.message);},()=>prior(input,init));}return prior(input,init);};wrapped.__noreyoV701=true;window.fetch=wrapped;return true;}catch(_){return false;}}
install();window.addEventListener('pageshow',install,{passive:true});
window.NOREYO_V701=Object.freeze({BUILD,isSearchTravel,parseText,parseRequest,validISO,todayISO,issue,install});
})();
