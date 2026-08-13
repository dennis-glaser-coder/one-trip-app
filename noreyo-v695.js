/* NOREYO V6.95 — soft-preference negation semantics.
   "Kein Muss / muss nicht" + positive soft intent stays a WISH instead of ANY. */
(function(){
'use strict';
const BUILD='6.95';
const defs={
  Zimmer0:['balkon'],Zimmer1:['meerblick','sea view'],Zimmer2:['terrasse'],
  Hotel0:['4 sterne','vier sterne'],Hotel1:['adults only','erwachsenenhotel'],
  Hotel4:['spa','wellness'],Hotel5:['fitness','gym'],
  Lage0:['sandstrand'],Lage1:['direkt am strand','strandlage'],
  Lage2:['ruhige lage','ruhig'],Lage3:['restaurants zu fuss','restaurants fusslaufig'],
  Lage4:['kurzer transfer','transfer'],Preis2:['stornierbar'],
  Flug0:['direktflug','nonstop'],Flug1:['aufgabegepack','koffer']
};
const softPositive=/(waere(?:\s+\w+){0,2}\s+schoen|ware(?:\s+\w+){0,2}\s+schoen|wuerde ich gern|wurde ich gern|\bgern\b|\bgerne\b|bevorzugt|am liebsten|wenn moeglich|wenn moglich|nice to have|\bwunsch\b)/;
const hardNegative=/(nicht wichtig|unwichtig|brauche ich nicht|nicht noetig|nicht notig|nicht notwendig|will ich nicht|moechte ich nicht|mochte ich nicht|auf keinen fall|bitte ohne)/;
const notMust=/(kein muss|muss nicht(?: sein)?|nicht zwingend|keine pflicht|nicht pflicht)/;
function norm(v){return String(v||'').toLowerCase().replace(/ä/g,'ae').replace(/ö/g,'oe').replace(/ü/g,'ue').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/ß/g,'ss').replace(/\s+/g,' ').trim();}
function contextFor(text,key){const t=norm(text),terms=defs[key]||[];for(const term of terms){const i=t.indexOf(term);if(i<0)continue;return t.slice(Math.max(0,i-52),Math.min(t.length,i+term.length+68));}return'';}
function desiredState(text,key,current){if(current!=='any')return current;const around=contextFor(text,key);if(!around)return current;if(hardNegative.test(around))return'any';if(notMust.test(around)&&softPositive.test(around))return'wish';return current;}
function repair(root=document.getElementById('noreyoAi556Result'),text=document.getElementById('noreyoAi556Text')?.value||''){if(!root)return false;let changed=false;root.querySelectorAll('.noreyo-v559-pref[data-key][data-state]').forEach(btn=>{const next=desiredState(text,String(btn.dataset.key||''),String(btn.dataset.state||''));if(next===btn.dataset.state)return;btn.dataset.state=next;const em=btn.querySelector('em');if(em)em.textContent=next==='must'?'Muss sein':next==='wish'?'Wichtig':'Egal';changed=true;});return changed;}
function onAnalyze(e){if(!e.target?.closest?.('.noreyo-v556-analyze'))return;setTimeout(repair,0);setTimeout(repair,60);}
document.addEventListener('click',onAnalyze,true);window.addEventListener('pageshow',()=>setTimeout(repair,0),{passive:true});
window.NOREYO_V695=Object.freeze({BUILD,norm,contextFor,desiredState,repair});
})();
