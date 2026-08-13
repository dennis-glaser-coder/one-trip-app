/* NOREYO V6.98 — final live-search date + infant integrity.
   Adds network-boundary validation for two invariants that must never reach
   search-travel even if an earlier UI layer is bypassed. */
(function(){
'use strict';
const BUILD='6.98';
function isSearchTravel(input){const url=typeof input==='string'?input:String(input?.url||'');return url.includes('/functions/v1/search-travel');}
function parse(init){if(typeof init?.body!=='string')return null;try{return JSON.parse(init.body);}catch(_){return null;}}
function validISO(v){const s=String(v||'');if(!/^\d{4}-\d{2}-\d{2}$/.test(s))return false;const d=new Date(s+'T12:00:00');return !Number.isNaN(d.getTime())&&d.getFullYear()===+s.slice(0,4)&&d.getMonth()+1===+s.slice(5,7)&&d.getDate()===+s.slice(8,10);}
function issue(raw){if(!raw||raw.action)return null;const occ=Array.isArray(raw.occupancies)&&raw.occupancies.length?raw.occupancies[0]:null;if(occ){const adults=Number(occ.adults),children=Array.isArray(occ.children)?occ.children.map(Number):[];if(Number.isInteger(adults)&&adults>=1&&children.filter(v=>Number.isFinite(v)&&v<=1).length>adults)return {message:'Pro Erwachsenen kann maximal ein Kleinkind unter 2 Jahren berücksichtigt werden.',planner:'travellers'};}if(raw.checkin!==undefined||raw.checkout!==undefined){if(!validISO(raw.checkin)||!validISO(raw.checkout))return {message:'Bitte einen gültigen Reisezeitraum auswählen.',planner:'dates'};if(String(raw.checkout)<=String(raw.checkin))return {message:'Das Rückreisedatum muss nach dem Abreisedatum liegen.',planner:'dates'};}return null;}
function release(){try{window.NOREYO_V607?.releaseGuard?.('request-validation');}catch(_){}try{window.NOREYO_V585?.releaseBusy?.();}catch(_){} }
function notify(message){try{if(typeof showToast==='function')showToast(message);else window.toast?.(message);}catch(_){} }
function open(kind){setTimeout(()=>{try{openPlanner?.(kind);}catch(_){}},0);}
function local422(message){const body=JSON.stringify({error:{code:'INVALID_SEARCH_REQUEST',message}});try{return Promise.resolve(new Response(body,{status:422,headers:{'content-type':'application/json'}}));}catch(_){return Promise.reject(new Error(message));}}
function install(){try{if(typeof window.fetch!=='function'||window.fetch.__noreyoV698)return false;const prior=window.fetch.bind(window);const wrapped=function(input,init){if(!isSearchTravel(input))return prior(input,init);const problem=issue(parse(init));if(!problem)return prior(input,init);release();notify(problem.message);open(problem.planner);return local422(problem.message);};wrapped.__noreyoV698=true;window.fetch=wrapped;return true;}catch(_){return false;}}
install();window.addEventListener('pageshow',install,{passive:true});
window.NOREYO_V698=Object.freeze({BUILD,isSearchTravel,parse,validISO,issue,install});
})();
