/* NOREYO V7.66 — stale travel-date startup repair.
   When a previously persisted trip has slipped into the past, move it forward
   to tomorrow while preserving the original valid duration where possible. */
(function(){
'use strict';
const BUILD='7.66',DEFAULT_NIGHTS=7,MAX_PRESERVED_NIGHTS=60;
let noticeShown=false;
function validISO(v){const s=String(v||'');if(!/^\d{4}-\d{2}-\d{2}$/.test(s))return false;const d=new Date(s+'T12:00:00');return !Number.isNaN(d.getTime())&&d.getFullYear()===+s.slice(0,4)&&d.getMonth()+1===+s.slice(5,7)&&d.getDate()===+s.slice(8,10);}
function isoDate(d){return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');}
function todayISO(){const d=new Date();return isoDate(new Date(d.getFullYear(),d.getMonth(),d.getDate(),12));}
function tomorrowISO(){const now=new Date(),d=new Date(now.getFullYear(),now.getMonth(),now.getDate()+1,12);return isoDate(d);}
function addDays(iso,days){if(!validISO(iso))return'';const d=new Date(iso+'T12:00:00');d.setDate(d.getDate()+Number(days||0));return isoDate(d);}
function nights(checkin,checkout){if(!validISO(checkin)||!validISO(checkout)||String(checkout)<=String(checkin))return null;const a=new Date(checkin+'T12:00:00'),b=new Date(checkout+'T12:00:00'),n=Math.round((b-a)/86400000);return Number.isInteger(n)&&n>=1&&n<=MAX_PRESERVED_NIGHTS?n:null;}
function snapshot(){try{if(typeof searchState==='undefined'||!searchState)return null;return{checkin:String(searchState.checkin||''),checkout:String(searchState.checkout||'')};}catch(_){return null;}}
function repairPlan(s){if(!s)return null;const today=todayISO();if(validISO(s.checkin)&&s.checkin>=today&&validISO(s.checkout)&&s.checkout>s.checkin)return null;const oldNights=nights(s.checkin,s.checkout);let checkin=s.checkin,checkout=s.checkout;if(!validISO(checkin)||checkin<today)checkin=tomorrowISO();if(!validISO(checkout)||checkout<=checkin||String(s.checkin||'')<today)checkout=addDays(checkin,oldNights||DEFAULT_NIGHTS);if(!validISO(checkout)||checkout<=checkin)checkout=addDays(checkin,DEFAULT_NIGHTS);return{checkin,checkout,nights:oldNights||DEFAULT_NIGHTS,preserved:oldNights!==null};}
function notify(){if(noticeShown)return;noticeShown=true;setTimeout(()=>{try{if(typeof showToast==='function')showToast('Reisezeitraum auf aktuelle Daten verschoben.');}catch(_){}},0);}
function repair(){const before=snapshot(),plan=repairPlan(before);if(!plan)return false;try{if(typeof searchState==='undefined'||!searchState)return false;searchState.checkin=plan.checkin;searchState.checkout=plan.checkout;try{updateSearchUI?.();}catch(_){}try{updateCounts?.();}catch(_){}try{persistState?.();}catch(_){}notify();return true;}catch(_){return false;}}
repair();window.addEventListener('pageshow',repair,{passive:true});
window.NOREYO_V766=Object.freeze({BUILD,DEFAULT_NIGHTS,MAX_PRESERVED_NIGHTS,validISO,isoDate,todayISO,tomorrowISO,addDays,nights,snapshot,repairPlan,repair});
})();