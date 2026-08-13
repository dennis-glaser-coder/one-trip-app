/* NOREYO V8.61 — natural "am <date>" AI single dates.
   Extends the proven V8.53 single-date semantics with common German "am 12. Sep"
   wording while preserving the existing valid trip duration. */
(function(){
'use strict';
const BUILD='8.61',MAX_LOOKAHEAD_YEARS=8;
function base(){return window.NOREYO_V853||null;}
function norm(v){return base()?.norm?.(v)||String(v||'').toLowerCase();}
function monthNumber(v){return base()?.monthNumber?.(v)||null;}
function validParts(y,m,d){return !!base()?.validParts?.(y,m,d);}
function iso(y,m,d){return base()?.iso?.(y,m,d)||'';}
function parseAmSingle(text,now=new Date()){const b=base();if(!b)return null;const t=norm(text);const rangeRe=new RegExp('\\b\\d{1,2}[.\\s]+(?:'+b.MONTH_RE+')\\.?\\s*(?:bis|[-–])','i');if(rangeRe.test(t))return null;const re=new RegExp('\\bam\\s+(\\d{1,2})[.\\s]+('+b.MONTH_RE+')\\.?\\s*(20\\d{2})?\\b','i');const m=t.match(re);if(!m||m[3])return null;const day=+m[1],month=monthNumber(m[2]);if(!month)return null;const today=iso(now.getFullYear(),now.getMonth()+1,now.getDate());for(let offset=0;offset<=MAX_LOOKAHEAD_YEARS;offset++){const year=now.getFullYear()+offset;if(!validParts(year,month,day))continue;const candidate=iso(year,month,day);if(candidate<today)continue;return candidate;}return null;}
function repairPlan(text,current,now=new Date()){const b=base(),checkin=parseAmSingle(text,now);if(!b||!checkin)return null;const oldIn=String(current?.checkin||''),oldOut=String(current?.checkout||'');if(oldIn===checkin&&b.validISO?.(oldOut)&&oldOut>oldIn)return null;const duration=b.nights?.(oldIn,oldOut)||b.DEFAULT_NIGHTS||7;return{checkin,checkout:b.addDays?.(checkin,duration)||'',nights:duration};}
function inputText(){return document.getElementById('noreyoAi556Text')?.value||'';}
function apply(text=inputText()){let s=null;try{s=typeof searchState!=='undefined'?searchState:null;}catch(_){}if(!s)return false;const plan=repairPlan(text,s);if(!plan||!plan.checkout)return false;s.checkin=plan.checkin;s.checkout=plan.checkout;try{updateSearchUI?.();}catch(_){}try{updateCounts?.();}catch(_){}try{persistState?.();}catch(_){}return true;}
function repairAnalysis(text){const checkin=parseAmSingle(text);if(!checkin)return false;const root=document.getElementById('noreyoAi556Result');if(!root)return false;const chip=[...root.querySelectorAll('.noreyo-v556-chip')].find(x=>/^Zeitraum\s*·/i.test(String(x.textContent||'').replace(/^✓\s*/,'').trim()));if(!chip)return false;const d=new Date(checkin+'T12:00:00');chip.innerHTML='<i>✓</i>Zeitraum · ab '+d.getDate()+'.'+(d.getMonth()+1)+'.'+(d.getFullYear()!==new Date().getFullYear()?' · '+d.getFullYear():'');return true;}
function onAnalyze(e){if(!e.target?.closest?.('.noreyo-v556-analyze'))return;const text=inputText();setTimeout(()=>repairAnalysis(text),300);}
function onApply(e){if(!e.target?.closest?.('.noreyo-v556-apply'))return;const text=inputText();setTimeout(()=>apply(text),0);}
document.addEventListener('click',onAnalyze,true);document.addEventListener('click',onApply,true);window.NOREYO_V861=Object.freeze({BUILD,MAX_LOOKAHEAD_YEARS,base,norm,monthNumber,validParts,iso,parseAmSingle,repairPlan,apply,repairAnalysis});
})();