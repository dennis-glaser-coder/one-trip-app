/* NOREYO V9.20 — flight date preflight guard. */
(function(){
'use strict';
const BUILD='9.20';let installed=false;
function iso(v){const s=String(v||'');if(!/^\d{4}-\d{2}-\d{2}$/.test(s))return'';const d=new Date(s+'T12:00:00');if(Number.isNaN(d.getTime()))return'';return d.getFullYear()===+s.slice(0,4)&&d.getMonth()+1===+s.slice(5,7)&&d.getDate()===+s.slice(8,10)?s:'';}
function today(){const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');}
function problem(s){const ci=iso(s?.checkin),co=iso(s?.checkout);if(!ci||!co)return'Bitte einen vollständigen Flugzeitraum auswählen.';if(ci<=today())return'Der Hinflug muss in der Zukunft liegen.';if(co<=ci)return'Der Rückflug muss nach dem Hinflug liegen.';return'';}
function notify(message){try{if(typeof showToast==='function')showToast(message);else window.toast?.(message);}catch(_){}try{if(typeof openPlanner==='function')openPlanner('dates');}catch(_){}}
function install(){if(installed||typeof window.searchFlights!=='function'||window.searchFlights.__noreyoV920)return false;const prior=window.searchFlights;const wrapped=function(...args){let s={};try{s=typeof searchState!=='undefined'?searchState:{};}catch(_){}const p=problem(s);if(p){notify(p);return Promise.resolve(false);}return prior.apply(this,args);};wrapped.__noreyoV920=true;wrapped.__noreyoV920Prior=prior;window.searchFlights=wrapped;installed=true;return true;}
install();window.addEventListener('pageshow',install,{passive:true});window.NOREYO_V920=Object.freeze({BUILD,iso,today,problem,install});
})();