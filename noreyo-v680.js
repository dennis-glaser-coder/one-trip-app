/* NOREYO V6.80 — yearless numeric date-range reconciliation.
   Repairs common DD.MM.–DD.MM. input across New Year and rolls only fully
   expired yearless ranges forward, while leaving partly-past ranges visible
   to normal validation instead of guessing silently. */
(function(){
'use strict';
const BUILD='6.80';

function iso(d){return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');}
function valid(y,m,d){const x=new Date(y,m,d,12);return x.getFullYear()===y&&x.getMonth()===m&&x.getDate()===d;}
function year(v){if(!v)return null;let n=Number(v);if(n<100)n+=2000;return n>=2000&&n<=2100?n:null;}
function today(now=new Date()){return new Date(now.getFullYear(),now.getMonth(),now.getDate(),12);}
function numericRange(text,now=new Date()){
  const raw=String(text||'');
  const m=raw.match(/\b(\d{1,2})[.\/]\s*(\d{1,2})(?:[.\/]\s*(\d{2,4}))?\.?\s*(?:bis|-|–|—)\s*(\d{1,2})[.\/]\s*(\d{1,2})(?:[.\/]\s*(\d{2,4}))?/);
  if(!m)return null;
  const d1=Number(m[1]),mo1=Number(m[2])-1,d2=Number(m[4]),mo2=Number(m[5])-1;
  const y1e=year(m[3]),y2e=year(m[6]);
  let y1=y1e??(y2e??now.getFullYear()),y2=y2e??(y1e??y1);
  if(!valid(y1,mo1,d1)||!valid(y2,mo2,d2))return null;
  let a=new Date(y1,mo1,d1,12),b=new Date(y2,mo2,d2,12);
  if(y2e&&!y1e&&a>=b){y1=y2-1;if(!valid(y1,mo1,d1))return null;a=new Date(y1,mo1,d1,12);}
  else if(!y2e&&b<=a){y2=y1+1;if(!valid(y2,mo2,d2))return null;b=new Date(y2,mo2,d2,12);}
  if(b<=a)return null;
  const noYears=!y1e&&!y2e,t=today(now);
  if(noYears&&b<t){const ny1=y1+1,ny2=y2+1;if(!valid(ny1,mo1,d1)||!valid(ny2,mo2,d2))return null;a=new Date(ny1,mo1,d1,12);b=new Date(ny2,mo2,d2,12);}
  return {checkin:iso(a),checkout:iso(b),explicitStart:!!y1e,explicitEnd:!!y2e};
}
function inputText(){return document.getElementById('noreyoAi556Text')?.value||'';}
function refresh(){try{updateSearchUI?.();}catch(_){ }try{updateCounts?.();}catch(_){ }try{persistState?.();}catch(_){ }}
function applyRange(text){
  const range=numericRange(text);if(!range)return false;
  try{if(typeof searchState==='undefined'||!searchState)return false;if(searchState.checkin===range.checkin&&searchState.checkout===range.checkout)return false;searchState.checkin=range.checkin;searchState.checkout=range.checkout;refresh();return true;}catch(_){return false;}
}
function onApply(e){if(!e.target?.closest?.('.noreyo-v556-apply'))return;const text=inputText();setTimeout(()=>applyRange(text),0);}
document.addEventListener('click',onApply,true);
window.NOREYO_V680=Object.freeze({BUILD,year,numericRange,applyRange});
})();