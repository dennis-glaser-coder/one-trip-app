/* NOREYO V7.28 — clause-aware soft preference semantics.
   Prevents soft-positive language for a neighboring preference from upgrading
   "kein Muss" on the current preference, while preserving continuation clauses
   such as "Balkon kein Muss, wäre aber schön". */
(function(){
'use strict';
const BUILD='7.28';
const defs={Zimmer0:['balkon'],Zimmer1:['meerblick','sea view'],Zimmer2:['terrasse'],Hotel0:['4 sterne','vier sterne'],Hotel1:['adults only','erwachsenenhotel'],Hotel4:['spa','wellness'],Hotel5:['fitness','gym'],Lage0:['sandstrand'],Lage1:['direkt am strand','strandlage'],Lage2:['ruhige lage','ruhig'],Lage3:['restaurants zu fuss','restaurants fusslaufig'],Lage4:['kurzer transfer','transfer'],Preis2:['stornierbar'],Flug0:['direktflug','nonstop'],Flug1:['aufgabegepack','koffer']};
const softPositive=/(waere(?:\s+\w+){0,2}\s+schoen|ware(?:\s+\w+){0,2}\s+schoen|wuerde ich gern|wurde ich gern|\bgern\b|\bgerne\b|bevorzugt|am liebsten|wenn moeglich|wenn moglich|nice to have|\bwunsch\b)/;
const hardNegative=/(nicht wichtig|unwichtig|brauche ich nicht|nicht noetig|nicht notig|nicht notwendig|will ich nicht|moechte ich nicht|mochte ich nicht|auf keinen fall|bitte ohne)/;
const notMust=/(kein muss|muss nicht(?: sein)?|nicht zwingend|keine pflicht|nicht pflicht)/;
function norm(v){return String(v||'').toLowerCase().replace(/ä/g,'ae').replace(/ö/g,'oe').replace(/ü/g,'ue').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/ß/g,'ss').replace(/\s+/g,' ').trim();}
function allTerms(){return [...new Set(Object.values(defs).flat())].sort((a,b)=>b.length-a.length);}
function containsOtherPreference(segment,key){const own=new Set(defs[key]||[]);return allTerms().some(term=>!own.has(term)&&segment.includes(term));}
function clauses(text){const t=norm(text),out=[];let start=0;const re=/[,;.!?]+/g;let m;while((m=re.exec(t))){const value=t.slice(start,m.index).trim();if(value)out.push({start,end:m.index,value});start=re.lastIndex;}const value=t.slice(start).trim();if(value)out.push({start,end:t.length,value});return{text:t,out};}
function contextFor(text,key){const data=clauses(text),terms=defs[key]||[];let hit=-1;for(const candidate of terms){const i=data.text.indexOf(candidate);if(i>=0&&(hit<0||i<hit))hit=i;}if(hit<0)return'';const index=data.out.findIndex(c=>hit>=c.start&&hit<=c.end);if(index<0)return'';const parts=[data.out[index].value],next=data.out[index+1]?.value||'',prev=data.out[index-1]?.value||'';if(next&&!containsOtherPreference(next,key))parts.push(next);if(prev&&!containsOtherPreference(prev,key)&&!containsOtherPreference(data.out[index].value,key))parts.unshift(prev);return parts.join(', ');}
function inferredState(text,key,current){if(current!=='any'&&current!=='wish')return current;const around=contextFor(text,key);if(!around)return current;if(hardNegative.test(around))return'any';if(notMust.test(around))return softPositive.test(around)?'wish':'any';return current;}
function repair(root=document.getElementById('noreyoAi556Result'),text=document.getElementById('noreyoAi556Text')?.value||''){if(!root)return false;let changed=false;root.querySelectorAll('.noreyo-v559-pref[data-key][data-state]').forEach(btn=>{const current=String(btn.dataset.state||''),next=inferredState(text,String(btn.dataset.key||''),current);if(next===current)return;btn.dataset.state=next;const em=btn.querySelector('em');if(em)em.textContent=next==='must'?'Muss sein':next==='wish'?'Wichtig':'Egal';changed=true;});return changed;}
function onAnalyze(e){if(!e.target?.closest?.('.noreyo-v556-analyze'))return;setTimeout(repair,90);}
document.addEventListener('click',onAnalyze,true);
window.NOREYO_V728=Object.freeze({BUILD,norm,allTerms,containsOtherPreference,clauses,contextFor,inferredState,repair});
})();