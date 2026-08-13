/* NOREYO V8.53 — named-month single-date abbreviations.
   Completes V8.17/V8.46 so "ab 12. Sep" and "vom 29. Feb" resolve to the next
   valid occurrence while preserving an existing valid trip duration. */
(function(){
'use strict';
const BUILD='8.53',MAX_LOOKAHEAD_YEARS=8,DEFAULT_NIGHTS=7,MAX_PRESERVED_NIGHTS=60;
const MONTHS={jan:1,januar:1,feb:2,februar:2,maer:3,maerz:3,mar:3,marz:3,mrz:3,apr:4,april:4,mai:5,jun:6,juni:6,jul:7,juli:7,aug:8,august:8,sep:9,sept:9,september:9,okt:10,oktober:10,nov:11,november:11,dez:12,dezember:12};
const MONTH_RE='jan(?:uar)?|feb(?:ruar)?|maer(?:z)?|mar(?:z)?|mrz|apr(?:il)?|mai|jun(?:i)?|jul(?:i)?|aug(?:ust)?|sep(?:t|tember)?|okt(?:ober)?|nov(?:ember)?|dez(?:ember)?';
function norm(v){return String(v||'').toLowerCase().replace(/ä/g,'ae').replace(/ö/g,'oe').replace(/ü/g,'ue').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/ß/g,'ss');}
function monthNumber(token){return MONTHS[norm(token).replace(/\./g,'')]||null;}
function validParts(y,m,d){const x=new Date(y,m-1,d,12);return x.getFullYear()===y&&x.getMonth()===m-1&&x.getDate()===d;}
function iso(y,m,d){return String(y).padStart(4,'0')+'-'+String(m).padStart(2,'0')+'-'+String(d).padStart(2,'0');}
function validISO(v){const s=String(v||'');if(!/^\d{4}-\d{2}-\d{2}$/.test(s))return false;const d=new Date(s+'T12:00:00');return !Number.isNaN(d.getTime())&&iso(d.getFullYear(),d.getMonth()+1,d.getDate())===s;}
function nights(a,b){if(!validISO(a)||!validISO(b)||b<=a)return null;const n=Math.round((new Date(b+'T12:00:00')-new Date(a+'T12:00:00'))/86400000);return Number.isInteger(n)&&n>=1&&n<=MAX_PRESERVED_NIGHTS?n:null;}
function addDays(s,days){if(!validISO(s))return'';const d=new Date(s+'T12:00:00');d.setDate(d.getDate()+days);return iso(d.getFullYear(),d.getMonth()+1,d.getDate());}
function parseNamedSingle(text,now=new Date()){const t=norm(text),rangeRe=new RegExp('\\b\\d{1,2}[.\\s]+(?:'+MONTH_RE+')\\.?\\s*(?:bis|[-–])\\s*\\d{1,2}[.\\s]+(?:'+MONTH_RE+')','i');if(rangeRe.test(t))return null;const re=new RegExp('\\b(?:ab|vom|von)\\s+(\\d{1,2})[.\\s]+('+MONTH_RE+')\\.?\\s*(20\\d{2})?\\b','i'),m=t.match(re);if(!m||m[3])return null;const day=+m[1],month=monthNumber(m[2]);if(!month)return null;const today=iso(now.getFullYear(),now.getMonth()+1,now.getDate());for(let offset=0;offset<=MAX_LOOKAHEAD_YEARS;offset++){const year=now.getFullYear()+offset;if(!validParts(year,month,day))continue;const candidate=iso(year,month,day);if(candidate<today)continue;return candidate;}return null;}
function repairPlan(text,current,now=new Date()){const checkin=parseNamedSingle(text,now);if(!checkin)return null;const oldIn=String(current?.checkin||''),oldOut=String(current?.checkout||'');if(oldIn===checkin&&validISO(oldOut)&&oldOut>oldIn)return null;const duration=nights(oldIn,oldOut)||DEFAULT_NIGHTS;return{checkin,checkout:addDays(checkin,duration),nights:duration};}
function inputText(){return document.getElementById('noreyoAi556Text')?.value||'';}
function apply(text=inputText()){let s=null;try{s=typeof searchState!=='undefined'?searchState:null;}catch(_){}if(!s)return false;const plan=repairPlan(text,s);if(!plan)return false;s.checkin=plan.checkin;s.checkout=plan.checkout;try{updateSearchUI?.();}catch(_){}try{updateCounts?.();}catch(_){}try{persistState?.();}catch(_){}return true;}
function onApply(e){if(!e.target?.closest?.('.noreyo-v556-apply'))return;const text=inputText();setTimeout(()=>apply(text),0);}
document.addEventListener('click',onApply,true);window.NOREYO_V853=Object.freeze({BUILD,MAX_LOOKAHEAD_YEARS,DEFAULT_NIGHTS,MAX_PRESERVED_NIGHTS,MONTHS:{...MONTHS},MONTH_RE,norm,monthNumber,validParts,iso,validISO,nights,addDays,parseNamedSingle,repairPlan,apply});
})();