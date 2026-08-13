/* NOREYO V6.81 — yearless numeric date-range reconciliation.
   Repairs common DD.MM.–DD.MM. input across New Year and rolls only fully
   expired yearless ranges forward, while leaving partly-past ranges visible
   to normal validation instead of guessing silently. */
(function(){
'use strict';
const BUILD='6.81';
function iso(d){return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');}
function valid(y,m,d){const x=new Date(y,m,d,12);return x.getFullYear()===y&&x.getMonth()===m&&x.getDate()===d;}
function year(v){if(!v)return null;let n=Number(v);if(n<100)n+=2000;return n>=2000&&n<=2100?n:null;}
function today(now=new Date()){return new Date(now.getFullYear(),now.getMonth(),now.getDate(),12);}
function numericRange(text,now=new Date()){
  const raw=String(text||''),m=raw.match(/\b(\d{1,2})[.\/]\s*(\d{1,2})(?:[.\/]\s*(\d{2,4}))?\.?\s*(?:bis|-|–|—)\s*(\d{1,2})[.\/]\s*(\d{1,2})(?:[.\/]\s*(\d{2,4}))?/);if(!m)return null;
  const d1=+m[1],mo1=+m[2]-1,d2=+m[4],mo2=+m[5]-1,y1e=year(m[3]),y2e=year(m[6]);let y1=y1e??(y2e??now.getFullYear()),y2=y2e??(y1e??y1);
  if(!valid(y1,mo1,d1)||!valid(y2,mo2,d2))return null;let a=new Date(y1,mo1,d1,12),b=new Date(y2,mo2,d2,12);
  if(y2e&&!y1e&&a>=b){y1=y2-1;if(!valid(y1,mo1,d1))return null;a=new Date(y1,mo1,d1,12);}else if(!y2e&&b<=a){y2=y1+1;if(!valid(y2,mo2,d2))return null;b=new Date(y2,mo2,d2,12);}if(b<=a)return null;
  if(!y1e&&!y2e&&b<today(now)){const ny1=y1+1,ny2=y2+1;if(!valid(ny1,mo1,d1)||!valid(ny2,mo2,d2))return null;a=new Date(ny1,mo1,d1,12);b=new Date(ny2,mo2,d2,12);}
  return{checkin:iso(a),checkout:iso(b),explicitStart:!!y1e,explicitEnd:!!y2e};
}
function esc(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function formatRange(range){const f=v=>{const [y,m,d]=String(v).split('-');return d+'.'+m+'.'+y;};return f(range.checkin)+' – '+f(range.checkout);}
function repairAnalysis(text){
  const range=numericRange(text),root=document.getElementById('noreyoAi556Result');if(!range||!root?.querySelector('.noreyo-v556-result'))return false;
  const groups=[...root.querySelectorAll('.noreyo-v556-group')];let travel=groups.find(g=>/reise/i.test(g.querySelector('.noreyo-v556-grouplabel')?.textContent||''));
  if(!travel){travel=document.createElement('div');travel.className='noreyo-v556-group';travel.innerHTML='<p class="noreyo-v556-grouplabel">Reise</p><div class="noreyo-v556-chips"></div>';const anchor=root.querySelector('.noreyo-v556-open,.noreyo-v556-safe,.noreyo-v556-actions');anchor?.insertAdjacentElement('beforebegin',travel);}
  const chips=travel?.querySelector('.noreyo-v556-chips');if(!chips)return false;let chip=[...chips.querySelectorAll('.noreyo-v556-chip')].find(x=>/^Zeitraum\s*·/i.test(String(x.textContent||'').replace(/^✓\s*/,''))),label='Zeitraum · '+formatRange(range);
  if(!chip){chip=document.createElement('span');chip.className='noreyo-v556-chip';chip.innerHTML='<i>✓</i>'+esc(label);chips.appendChild(chip);}else chip.innerHTML='<i>✓</i>'+esc(label);
  const open=root.querySelector('.noreyo-v556-open');if(open&&/Zeitraum/i.test(open.textContent||'')){const m=String(open.textContent||'').match(/Noch offen:\s*(.*?)\.\s*Du kannst/i),parts=(m?.[1]||'').split('·').map(x=>x.trim()).filter(x=>x&&!/^Zeitraum$/i.test(x));if(!parts.length)open.remove();else open.innerHTML='<b>Noch offen:</b> '+parts.map(esc).join(' · ')+'. Du kannst das anschließend in der normalen Suche ergänzen.';}
  return true;
}
function inputText(){return document.getElementById('noreyoAi556Text')?.value||'';}
function refresh(){try{updateSearchUI?.();}catch(_){ }try{updateCounts?.();}catch(_){ }try{persistState?.();}catch(_){ }}
function applyRange(text){const range=numericRange(text);if(!range)return false;try{if(typeof searchState==='undefined'||!searchState)return false;if(searchState.checkin===range.checkin&&searchState.checkout===range.checkout)return false;searchState.checkin=range.checkin;searchState.checkout=range.checkout;refresh();return true;}catch(_){return false;}}
function onApply(e){if(!e.target?.closest?.('.noreyo-v556-apply'))return;const text=inputText();setTimeout(()=>applyRange(text),0);}
function onAnalyze(e){if(!e.target?.closest?.('.noreyo-v556-analyze'))return;const text=inputText();setTimeout(()=>repairAnalysis(text),0);}
document.addEventListener('click',onApply,true);document.addEventListener('click',onAnalyze,true);
window.NOREYO_V681=Object.freeze({BUILD,year,numericRange,formatRange,repairAnalysis,applyRange});
})();