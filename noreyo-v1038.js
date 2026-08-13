/* NOREYO V10.38 — current flight-filter capability copy.
   Older truth sweeps correctly warned when no flight preferences were enforced.
   V10.x now enforces confirmed baggage and conservatively blocks unverified MUST/
   hard constraints, so the filter copy must describe that current behavior. */
(function(){
'use strict';
const BUILD='10.38';let observer=null,raf=0;
const REPLACEMENTS=Object.freeze([
  ['Diese Flugwünsche werden gespeichert. Die separate Flugsuche wendet sie aktuell noch nicht als harte Filter an.','Flugpräferenzen werden in der separaten Flugsuche berücksichtigt. Sicher bestätigbare Kriterien werden geprüft; nicht verifizierbare Pflichtkriterien sperren die Angebotsauswahl konservativ.'],
  ['Wird gespeichert; aktuell noch nicht automatisch auf die separaten Flugangebote angewendet.','Wird als harte Grenze berücksichtigt. Solange die aktuelle Flight-Normalisierung sie nicht sicher bestätigt, bleibt die Angebotsauswahl konservativ gesperrt.'],
  ['Wird gespeichert. Die separate Flugsuche zeigt aktuell nur Providerangebote; eine harte automatische Flugzeit-Grenze wird noch nicht als bestätigt ausgegeben.','Wird als harte Grenze berücksichtigt. Solange die aktuelle Flight-Normalisierung sie nicht sicher bestätigt, bleibt die Angebotsauswahl konservativ gesperrt.']
]);
function replaceText(value){let out=String(value??'');for(const [from,to] of REPLACEMENTS)out=out.split(from).join(to);return out;}
function fix(root=document.body){if(!root)return false;let changed=false;const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT),nodes=[];while(walker.nextNode())nodes.push(walker.currentNode);for(const n of nodes){const old=n.nodeValue||'',next=replaceText(old);if(next!==old){n.nodeValue=next;changed=true;}}return changed;}
function run(){raf=0;fix();}
function schedule(){if(!raf)raf=requestAnimationFrame(run);}
function observe(){if(observer){observer.disconnect();observer=null;}if(typeof MutationObserver==='undefined'||!document.body)return false;observer=new MutationObserver(schedule);observer.observe(document.body,{subtree:true,childList:true,characterData:true});schedule();return true;}
function cleanup(){if(observer){observer.disconnect();observer=null;}if(raf){cancelAnimationFrame(raf);raf=0;}}
observe();window.addEventListener('pagehide',cleanup,{passive:true});window.addEventListener('pageshow',observe,{passive:true});
window.NOREYO_V1038=Object.freeze({BUILD,REPLACEMENTS,replaceText,fix,run,schedule,observe,cleanup});
})();