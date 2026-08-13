/* NOREYO V7.81 — robust future-aware numeric AI date ranges.
   Fixes leap-day resolution and blocks accidental year-long ranges caused by
   equal/earlier dates inside the same month. */
(function(){
'use strict';
const BUILD='7.81',MAX_LOOKAHEAD_YEARS=8,MAX_RANGE_NIGHTS=60;
function validParts(y,m,d){const x=new Date(y,m-1,d,12);return x.getFullYear()===y&&x.getMonth()===m-1&&x.getDate()===d;}
function iso(y,m,d){return String(y).padStart(4,'0')+'-'+String(m).padStart(2,'0')+'-'+String(d).padStart(2,'0');}
function daysBetween(a,b){const x=new Date(a+'T12:00:00'),y=new Date(b+'T12:00:00');return Math.round((y-x)/86400000);}
function candidate(d1,mo1,d2,mo2,y1){if(!validParts(y1,mo1,d1))return null;if(mo2===mo1&&d2<=d1)return null;const y2=y1+(mo2<mo1?1:0);if(!validParts(y2,mo2,d2))return null;const checkin=iso(y1,mo1,d1),checkout=iso(y2,mo2,d2),nights=daysBetween(checkin,checkout);if(nights<1||nights>MAX_RANGE_NIGHTS)return null;return{checkin,checkout,nights,y1,y2};}
function parseNoYearRange(text,now=new Date()){const raw=String(text||'');const re=/\b(\d{1,2})[.\/]\s*(\d{1,2})\.?\s*(?:bis|[-–])\s*(\d{1,2})[.\/]\s*(\d{1,2})\.?(?!\s*\d)/i;const m=raw.match(re);if(!m)return null;const d1=+m[1],mo1=+m[2],d2=+m[3],mo2=+m[4];if(mo1<1||mo1>12||mo2<1||mo2>12)return null;const today=iso(now.getFullYear(),now.getMonth()+1,now.getDate());for(let offset=0;offset<=MAX_LOOKAHEAD_YEARS;offset++){const c=candidate(d1,mo1,d2,mo2,now.getFullYear()+offset);if(!c||c.checkin<today)continue;return{checkin:c.checkin,checkout:c.checkout,label:`${d1}.${mo1}. – ${d2}.${mo2}.`,rolled:c.y1>now.getFullYear(),nights:c.nights};}return null;}
function inputText(){return document.getElementById('noreyoAi556Text')?.value||'';}
function applyRange(range){if(!range)return false;try{if(typeof searchState==='undefined'||!searchState)return false;if(searchState.checkin===range.checkin&&searchState.checkout===range.checkout)return false;searchState.checkin=range.checkin;searchState.checkout=range.checkout;try{updateSearchUI?.();}catch(_){}try{updateCounts?.();}catch(_){}try{persistState?.();}catch(_){}return true;}catch(_){return false;}}
function repairAnalysis(text){const range=parseNoYearRange(text);if(!range)return false;const root=document.getElementById('noreyoAi556Result');if(!root)return false;const chip=[...root.querySelectorAll('.noreyo-v556-chip')].find(x=>/^Zeitraum\s*·/i.test(String(x.textContent||'').replace(/^✓\s*/,'').trim()));if(!chip)return false;const suffix=range.rolled?` · ${range.checkin.slice(0,4)}`:'';chip.innerHTML='<i>✓</i>Zeitraum · '+range.label+suffix;return true;}
function onAnalyze(e){if(!e.target?.closest?.('.noreyo-v556-analyze'))return;const text=inputText();setTimeout(()=>repairAnalysis(text),180);}
function onApply(e){if(!e.target?.closest?.('.noreyo-v556-apply'))return;const range=parseNoYearRange(inputText());if(!range)return;setTimeout(()=>setTimeout(()=>applyRange(range),0),0);}
document.addEventListener('click',onAnalyze,true);document.addEventListener('click',onApply,true);
window.NOREYO_V781=Object.freeze({BUILD,MAX_LOOKAHEAD_YEARS,MAX_RANGE_NIGHTS,validParts,iso,daysBetween,candidate,parseNoYearRange,inputText,applyRange,repairAnalysis});
})();