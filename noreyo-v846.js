/* NOREYO V8.46 — future-aware named-month AI date ranges and abbreviations.
   Adds "12. Sep bis 19. Sep", cross-year ranges and leap-safe named ranges
   without interfering with explicit-year input. */
(function(){
'use strict';
const BUILD='8.46',MAX_LOOKAHEAD_YEARS=8,MAX_RANGE_NIGHTS=60;
const MONTHS={jan:1,januar:1,feb:2,februar:2,maer:3,maerz:3,mar:3,marz:3,mrz:3,apr:4,april:4,mai:5,jun:6,juni:6,jul:7,juli:7,aug:8,august:8,sep:9,sept:9,september:9,okt:10,oktober:10,nov:11,november:11,dez:12,dezember:12};
const MONTH_RE='jan(?:uar)?|feb(?:ruar)?|maer(?:z)?|mar(?:z)?|mrz|apr(?:il)?|mai|jun(?:i)?|jul(?:i)?|aug(?:ust)?|sep(?:t|tember)?|okt(?:ober)?|nov(?:ember)?|dez(?:ember)?';
function norm(v){return String(v||'').toLowerCase().replace(/ä/g,'ae').replace(/ö/g,'oe').replace(/ü/g,'ue').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/ß/g,'ss');}
function monthNumber(token){return MONTHS[norm(token).replace(/\./g,'')]||null;}
function validParts(y,m,d){const x=new Date(y,m-1,d,12);return x.getFullYear()===y&&x.getMonth()===m-1&&x.getDate()===d;}
function iso(y,m,d){return String(y).padStart(4,'0')+'-'+String(m).padStart(2,'0')+'-'+String(d).padStart(2,'0');}
function daysBetween(a,b){return Math.round((new Date(b+'T12:00:00')-new Date(a+'T12:00:00'))/86400000);}
function candidate(d1,m1,d2,m2,y1){if(!validParts(y1,m1,d1))return null;if(m2===m1&&d2<=d1)return null;const y2=y1+(m2<m1?1:0);if(!validParts(y2,m2,d2))return null;const checkin=iso(y1,m1,d1),checkout=iso(y2,m2,d2),nights=daysBetween(checkin,checkout);if(nights<1||nights>MAX_RANGE_NIGHTS)return null;return{checkin,checkout,nights,y1,y2};}
function parseNamedRange(text,now=new Date()){const t=norm(text);const re=new RegExp('\\b(\\d{1,2})[.\\s]+('+MONTH_RE+')\\.?\\s*(20\\d{2})?\\s*(?:bis|[-–])\\s*(\\d{1,2})[.\\s]+('+MONTH_RE+')\\.?\\s*(20\\d{2})?\\b','i');const m=t.match(re);if(!m||m[3]||m[6])return null;const d1=+m[1],mo1=monthNumber(m[2]),d2=+m[4],mo2=monthNumber(m[5]);if(!mo1||!mo2)return null;const today=iso(now.getFullYear(),now.getMonth()+1,now.getDate());for(let offset=0;offset<=MAX_LOOKAHEAD_YEARS;offset++){const c=candidate(d1,mo1,d2,mo2,now.getFullYear()+offset);if(!c||c.checkin<today)continue;return{checkin:c.checkin,checkout:c.checkout,nights:c.nights,label:`${d1}.${mo1}. – ${d2}.${mo2}.`,rolled:c.y1>now.getFullYear()};}return null;}
function inputText(){return document.getElementById('noreyoAi556Text')?.value||'';}
function applyRange(range){if(!range)return false;try{if(typeof searchState==='undefined'||!searchState)return false;if(searchState.checkin===range.checkin&&searchState.checkout===range.checkout)return false;searchState.checkin=range.checkin;searchState.checkout=range.checkout;try{updateSearchUI?.();}catch(_){}try{updateCounts?.();}catch(_){}try{persistState?.();}catch(_){}return true;}catch(_){return false;}}
function repairAnalysis(text){const range=parseNamedRange(text);if(!range)return false;const root=document.getElementById('noreyoAi556Result');if(!root)return false;const chip=[...root.querySelectorAll('.noreyo-v556-chip')].find(x=>/^Zeitraum\s*·/i.test(String(x.textContent||'').replace(/^✓\s*/,'').trim()));if(!chip)return false;const suffix=range.rolled?` · ${range.checkin.slice(0,4)}`:'';chip.innerHTML='<i>✓</i>Zeitraum · '+range.label+suffix;return true;}
function onAnalyze(e){if(!e.target?.closest?.('.noreyo-v556-analyze'))return;const text=inputText();setTimeout(()=>repairAnalysis(text),240);}
function onApply(e){if(!e.target?.closest?.('.noreyo-v556-apply'))return;const range=parseNamedRange(inputText());if(!range)return;setTimeout(()=>setTimeout(()=>applyRange(range),0),0);}
document.addEventListener('click',onAnalyze,true);document.addEventListener('click',onApply,true);window.NOREYO_V846=Object.freeze({BUILD,MAX_LOOKAHEAD_YEARS,MAX_RANGE_NIGHTS,MONTHS:{...MONTHS},MONTH_RE,norm,monthNumber,validParts,iso,daysBetween,candidate,parseNamedRange,applyRange,repairAnalysis});
})();