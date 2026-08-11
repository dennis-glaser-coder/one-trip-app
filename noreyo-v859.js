/* NOREYO V8.59 — German elided-month AI date ranges.
   Adds natural forms like "12. bis 19. September" and "12.–19. Sep".
   The omitted start month is safely inherited from the explicit end month. */
(function(){
'use strict';
const BUILD='8.59',MAX_LOOKAHEAD_YEARS=8,MAX_RANGE_NIGHTS=60;
const MONTHS={jan:1,januar:1,feb:2,februar:2,maer:3,maerz:3,mar:3,marz:3,mrz:3,apr:4,april:4,mai:5,jun:6,juni:6,jul:7,juli:7,aug:8,august:8,sep:9,sept:9,september:9,okt:10,oktober:10,nov:11,november:11,dez:12,dezember:12};
const MONTH_RE='jan(?:uar)?|feb(?:ruar)?|maer(?:z)?|mar(?:z)?|mrz|apr(?:il)?|mai|jun(?:i)?|jul(?:i)?|aug(?:ust)?|sep(?:t|tember)?|okt(?:ober)?|nov(?:ember)?|dez(?:ember)?';
function norm(v){return String(v||'').toLowerCase().replace(/ä/g,'ae').replace(/ö/g,'oe').replace(/ü/g,'ue').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/ß/g,'ss');}
function monthNumber(token){return MONTHS[norm(token).replace(/\./g,'')]||null;}
function validParts(y,m,d){const x=new Date(y,m-1,d,12);return x.getFullYear()===y&&x.getMonth()===m-1&&x.getDate()===d;}
function iso(y,m,d){return String(y).padStart(4,'0')+'-'+String(m).padStart(2,'0')+'-'+String(d).padStart(2,'0');}
function daysBetween(a,b){return Math.round((new Date(b+'T12:00:00')-new Date(a+'T12:00:00'))/86400000);}
function parseElidedRange(text,now=new Date()){const t=norm(text);const fullRange=new RegExp('\\b\\d{1,2}[.\\s]+(?:'+MONTH_RE+')\\.?\\s*(?:bis|[-–])\\s*\\d{1,2}[.\\s]+(?:'+MONTH_RE+')','i');if(fullRange.test(t))return null;const re=new RegExp('\\b(\\d{1,2})\\.?\\s*(?:bis|[-–])\\s*(\\d{1,2})[.\\s]+('+MONTH_RE+')\\.?\\s*(20\\d{2})?\\b','i');const m=t.match(re);if(!m||m[4])return null;const d1=+m[1],d2=+m[2],month=monthNumber(m[3]);if(!month||d2<=d1)return null;const today=iso(now.getFullYear(),now.getMonth()+1,now.getDate());for(let offset=0;offset<=MAX_LOOKAHEAD_YEARS;offset++){const year=now.getFullYear()+offset;if(!validParts(year,month,d1)||!validParts(year,month,d2))continue;const checkin=iso(year,month,d1),checkout=iso(year,month,d2),nights=daysBetween(checkin,checkout);if(checkin<today||nights<1||nights>MAX_RANGE_NIGHTS)continue;return{checkin,checkout,nights,label:`${d1}.${month}. – ${d2}.${month}.`,rolled:year>now.getFullYear()};}return null;}
function inputText(){return document.getElementById('noreyoAi556Text')?.value||'';}
function applyRange(range){if(!range)return false;try{if(typeof searchState==='undefined'||!searchState)return false;if(searchState.checkin===range.checkin&&searchState.checkout===range.checkout)return false;searchState.checkin=range.checkin;searchState.checkout=range.checkout;try{updateSearchUI?.();}catch(_){}try{updateCounts?.();}catch(_){}try{persistState?.();}catch(_){}return true;}catch(_){return false;}}
function repairAnalysis(text){const range=parseElidedRange(text);if(!range)return false;const root=document.getElementById('noreyoAi556Result');if(!root)return false;const chip=[...root.querySelectorAll('.noreyo-v556-chip')].find(x=>/^Zeitraum\s*·/i.test(String(x.textContent||'').replace(/^✓\s*/,'').trim()));if(!chip)return false;const suffix=range.rolled?` · ${range.checkin.slice(0,4)}`:'';chip.innerHTML='<i>✓</i>Zeitraum · '+range.label+suffix;return true;}
function onAnalyze(e){if(!e.target?.closest?.('.noreyo-v556-analyze'))return;const text=inputText();setTimeout(()=>repairAnalysis(text),280);}
function onApply(e){if(!e.target?.closest?.('.noreyo-v556-apply'))return;const range=parseElidedRange(inputText());if(!range)return;setTimeout(()=>setTimeout(()=>applyRange(range),0),0);}
document.addEventListener('click',onAnalyze,true);document.addEventListener('click',onApply,true);window.NOREYO_V859=Object.freeze({BUILD,MAX_LOOKAHEAD_YEARS,MAX_RANGE_NIGHTS,MONTHS:{...MONTHS},MONTH_RE,norm,monthNumber,validParts,iso,daysBetween,parseElidedRange,applyRange,repairAnalysis});
})();