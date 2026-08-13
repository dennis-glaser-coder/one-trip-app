/* NOREYO V8.10 — truthful priority/detail verifiability.
   Keeps active preferences visible even when the current provider payload cannot
   safely verify them, and never describes unverified criteria as confirmed. */
(function(){
'use strict';
const BUILD='8.10';
const VERIFIED=new Set(['Zimmer0','Zimmer1','Zimmer2','Hotel0','Hotel4','Hotel5','Hotel6','Hotel7','Preis2']);
const LABELS={Zimmer0:'Balkon',Zimmer1:'Meerblick',Zimmer2:'Terrasse',Hotel0:'Mind. 4 Sterne',Hotel1:'Adults Only',Hotel4:'Spa / Wellness',Hotel5:'Fitness',Lage0:'Sandstrand',Lage1:'Direkt am Strand',Lage2:'Ruhige Lage',Lage3:'Restaurants zu Fuß',Lage4:'Kurzer Transfer',Preis2:'Kostenlos stornierbar',Flug0:'Direktflug',Flug1:'Aufgabegepäck'};
let observer=null,raf=0;
function stateEntries(){try{return Object.entries(states||{}).filter(([,v])=>v==='must'||v==='wish');}catch(_){return[];}}
function split(){const verifiedMust=[],verifiedWish=[],unverifiedMust=[],unverifiedWish=[];for(const [key,state] of stateEntries()){const row={key,label:LABELS[key]||key,state};if(VERIFIED.has(key)){(state==='must'?verifiedMust:verifiedWish).push(row);}else{(state==='must'?unverifiedMust:unverifiedWish).push(row);}}return{verifiedMust,verifiedWish,unverifiedMust,unverifiedWish};}
function mealActive(){try{return !!mealPlanFilter&&String(mealPlanFilter).toUpperCase()!=='ANY';}catch(_){return false;}}
function resultCopy(){const s=split();const hard=s.verifiedMust.length+(mealActive()?1:0);const soft=s.verifiedWish.length;const pending=s.unverifiedMust.length+s.unverifiedWish.length;if(!hard&&!soft&&!pending)return'Noch keine Prioritäten gesetzt. Setze Wünsche oder Pflichtkriterien für dein persönliches Ranking.';const parts=[];if(hard)parts.push(`${hard} ${hard===1?'Pflichtkriterium wird':'Pflichtkriterien werden'} mit bestätigten Hotel-/Tarifdaten strikt geprüft.`);if(soft)parts.push(`${soft} ${soft===1?'bestätigter Wunsch verbessert':'bestätigte Wünsche verbessern'} dein Ranking.`);if(pending)parts.push(`${pending} ${pending===1?'weiteres Kriterium ist':'weitere Kriterien sind'} aktiv, aber mit den aktuell verfügbaren Live-Daten nicht sicher verifizierbar und wird deshalb nicht als bestätigt ausgegeben.`);return parts.join(' ');}
function pendingLabels(limit=3){const s=split(),rows=[...s.unverifiedMust,...s.unverifiedWish];return rows.slice(0,limit).map(x=>x.label);}
function detailCopy(existing=''){const pending=pendingLabels();if(!pending.length)return existing;const names=pending.join(', ');const note=`Aktiv, aber aktuell nicht sicher durch Live-Daten verifizierbar: ${names}. NOREYO markiert diese Kriterien deshalb nicht als bestätigt.`;const text=String(existing||'').trim();if(!text||/aktiviere wünsche|aktiviere wunsche/i.test(text))return note;if(text.includes(note))return text;return text+' '+note;}
function fixResults(){const box=document.querySelector('#results .noreyo-results-principle');const p=box?.querySelector('p');if(!p)return false;const text=resultCopy();if(p.textContent===text)return false;p.textContent=text;return true;}
function fixDetail(){const root=document.getElementById('detailContent');const p=root?.querySelector('.noreyo-detail-match .noreyo-detail-why p');if(!p)return false;const next=detailCopy(p.textContent);if(next===p.textContent)return false;p.textContent=next;return true;}
function fix(){raf=0;return fixResults()||fixDetail();}
function schedule(){if(raf)return;raf=requestAnimationFrame(fix);}
function bind(){if(observer){observer.disconnect();observer=null;}if(typeof MutationObserver==='undefined'||!document.body)return false;observer=new MutationObserver(schedule);observer.observe(document.body,{subtree:true,childList:true,characterData:true});schedule();return true;}
function cleanup(){if(observer){observer.disconnect();observer=null;}if(raf){cancelAnimationFrame(raf);raf=0;}}
bind();window.addEventListener('pagehide',cleanup,{passive:true});window.addEventListener('pageshow',bind,{passive:true});
window.NOREYO_V810=Object.freeze({BUILD,VERIFIED:new Set(VERIFIED),LABELS:{...LABELS},stateEntries,split,mealActive,resultCopy,pendingLabels,detailCopy,fixResults,fixDetail,fix,schedule,bind,cleanup});
})();