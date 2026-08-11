/* NOREYO V8.17 — leap-safe named-month AI dates.
   Resolves yearless single dates such as "ab 29. Februar" to the next real
   calendar occurrence instead of failing when the current/next year is invalid. */
(function(){
'use strict';
const BUILD='8.17',MAX_LOOKAHEAD_YEARS=8,DEFAULT_NIGHTS=7,MAX_PRESERVED_NIGHTS=60;
const MONTHS={januar:0,februar:1,maerz:2,marz:2,april:3,mai:4,juni:5,juli:6,august:7,september:8,oktober:9,november:10,dezember:11};
function norm(v){return String(v||'').toLowerCase().replace(/ä/g,'ae').replace(/ö/g,'oe').replace(/ü/g,'ue').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/ß/g,'ss');}
function validParts(y,m,d){const x=new Date(y,m,d,12);return x.getFullYear()===y&&x.getMonth()===m&&x.getDate()===d;}
function isoDate(d){return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');}
function parseNamedDate(text,now=new Date()){const t=norm(text);const m=t.match(/\b(?:ab|vom)?\s*(\d{1,2})[.\s]+(januar|februar|maerz|marz|april|mai|juni|juli|august|september|oktober|november|dezember)(?:\s*(20\d{2}))?/);if(!m||m[3])return null;const day=Number(m[1]),month=MONTHS[m[2]],today=new Date(now.getFullYear(),now.getMonth(),now.getDate(),12);for(let offset=0;offset<=MAX_LOOKAHEAD_YEARS;offset++){const year=now.getFullYear()+offset;if(!validParts(year,month,day))continue;const candidate=new Date(year,month,day,12);if(candidate<today)continue;return isoDate(candidate);}return null;}
function validISO(v){const s=String(v||'');if(!/^\d{4}-\d{2}-\d{2}$/.test(s))return false;const d=new Date(s+'T12:00:00');return !Number.isNaN(d.getTime())&&isoDate(d)===s;}
function nights(a,b){if(!validISO(a)||!validISO(b)||b<=a)return null;const n=Math.round((new Date(b+'T12:00:00')-new Date(a+'T12:00:00'))/86400000);return Number.isInteger(n)&&n>=1&&n<=MAX_PRESERVED_NIGHTS?n:null;}
function addDays(iso,days){if(!validISO(iso))return'';const d=new Date(iso+'T12:00:00');d.setDate(d.getDate()+days);return isoDate(d);}
function repairPlan(text,current){const checkin=parseNamedDate(text);if(!checkin)return null;const oldIn=String(current?.checkin||''),oldOut=String(current?.checkout||'');if(oldIn===checkin&&validISO(oldOut)&&oldOut>oldIn)return null;const duration=nights(oldIn,oldOut)||DEFAULT_NIGHTS;return{checkin,checkout:addDays(checkin,duration),nights:duration};}
function inputText(){return document.getElementById('noreyoAi556Text')?.value||'';}
function apply(text=inputText()){let s=null;try{s=typeof searchState!=='undefined'?searchState:null;}catch(_){}if(!s)return false;const plan=repairPlan(text,s);if(!plan)return false;s.checkin=plan.checkin;s.checkout=plan.checkout;try{updateSearchUI?.();}catch(_){}try{updateCounts?.();}catch(_){}try{persistState?.();}catch(_){}return true;}
function onApply(e){if(!e.target?.closest?.('.noreyo-v556-apply'))return;const text=inputText();setTimeout(()=>apply(text),0);}
document.addEventListener('click',onApply,true);
window.NOREYO_V817=Object.freeze({BUILD,MAX_LOOKAHEAD_YEARS,DEFAULT_NIGHTS,MONTHS:{...MONTHS},norm,validParts,isoDate,parseNamedDate,validISO,nights,addDays,repairPlan,apply});
})();