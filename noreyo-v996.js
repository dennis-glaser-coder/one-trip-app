/* NOREYO V9.96 — expanded departure-airport picker.
   The packed planner exposes only six airports although the final flight search
   supports arbitrary valid IATA origins. Add common German departure airports,
   keep the existing regional defaults, and mirror selected state into ARIA. */
(function(){
'use strict';
const BUILD='9.96';
const EXTRA=Object.freeze([
  ['BER','Berlin Brandenburg'],['HAM','Hamburg'],['MUC','München'],['STR','Stuttgart'],
  ['NUE','Nürnberg'],['LEJ','Leipzig/Halle'],['BRE','Bremen'],['DTM','Dortmund'],
  ['FKB','Karlsruhe/Baden-Baden'],['SCN','Saarbrücken'],['FDH','Friedrichshafen'],['HHN','Frankfurt-Hahn']
]);
let observer=null,raf=0;
function selected(code){try{return Array.isArray(searchState?.airports)&&searchState.airports.includes(code);}catch(_){return false;}}
function esc(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function markup(){return `<div class="noreyo-v996-extra"><p class="planner-note" style="margin-top:16px"><b>Weitere Flughäfen</b><br>Du kannst mehrere Abflughäfen kombinieren. NOREYO prüft jeden ausgewählten Flughafen separat.</p><div class="choice-list">${EXTRA.map(([code,name])=>`<button type="button" class="choice ${selected(code)?'on':''}" data-noreyo-v996-airport="${code}" aria-pressed="${selected(code)?'true':'false'}"><div><b>${code}</b><small>${esc(name)}</small></div><span class="choice-mark">${selected(code)?'✓':''}</span></button>`).join('')}</div></div>`;}
function syncExisting(root){let changed=false;root.querySelectorAll?.('.choice-list .choice').forEach(btn=>{const code=btn.querySelector?.('b')?.textContent?.trim()?.toUpperCase();if(!/^[A-Z]{3}$/.test(code||''))return;const value=selected(code)?'true':'false';if(btn.getAttribute('aria-pressed')!==value){btn.setAttribute('aria-pressed',value);changed=true;}if(!btn.getAttribute('type')){btn.setAttribute('type','button');changed=true;}});return changed;}
function enhance(){raf=0;let mode='';try{mode=typeof plannerMode!=='undefined'?plannerMode:'';}catch(_){}if(mode!=='airports')return false;const body=document.getElementById('plannerBody');if(!body)return false;let changed=syncExisting(body);if(body.querySelector('.noreyo-v996-extra'))return changed;const save=body.querySelector('.planner-save');if(!save)return changed;const wrap=document.createElement('div');wrap.innerHTML=markup();const extra=wrap.firstElementChild;if(!extra)return changed;body.insertBefore(extra,save);extra.addEventListener('click',e=>{const btn=e.target?.closest?.('[data-noreyo-v996-airport]');if(!btn)return;const code=btn.dataset.noreyoV996Airport;try{toggleAirport?.(code);}catch(_){}});return true;}
function schedule(){if(!raf)raf=requestAnimationFrame(enhance);}
function observe(){if(observer){observer.disconnect();observer=null;}const body=document.getElementById('plannerBody');if(typeof MutationObserver==='undefined'||!body)return false;observer=new MutationObserver(schedule);observer.observe(body,{childList:true,subtree:true});schedule();return true;}
function cleanup(){if(observer){observer.disconnect();observer=null;}if(raf){cancelAnimationFrame(raf);raf=0;}}
observe();window.addEventListener('pagehide',cleanup,{passive:true});window.addEventListener('pageshow',observe,{passive:true});window.NOREYO_V996=Object.freeze({BUILD,EXTRA,selected,esc,markup,syncExisting,enhance,schedule,observe,cleanup});
})();