/* NOREYO V10.78 — current flight-filter capability truth.
   V9.55 still rewrites the packed flight intro to say flight wishes are not used
   as hard filters. V10.x now enforces confirmed baggage and conservatively blocks
   unverifiable MUST criteria. Keep the visible explanation aligned with reality. */
(function(){
'use strict';
const BUILD='10.78';
let observer=null,raf=0;
const REPLACEMENTS=Object.freeze([
  ['Diese Flugwünsche werden gespeichert. Die separate Flugsuche wendet sie aktuell noch nicht als harte Filter an.','Flugkriterien wirken auf die separate Live-Flugsuche. Kann NOREYO ein Pflichtmerkmal in den aktuellen Providerdaten nicht sicher bestätigen, bleibt das Angebot sichtbar, aber nicht auswählbar.'],
  ['Wird gespeichert; aktuell noch nicht automatisch auf die separaten Flugangebote angewendet.','Wird für die separate Live-Flugsuche berücksichtigt. Nicht sicher verifizierbare Pflichtgrenzen sperren die Auswahl konservativ.']
]);
function replaceText(value){let out=String(value??'');for(const [from,to] of REPLACEMENTS)out=out.split(from).join(to);return out;}
function fix(root=document.getElementById('sheet')){if(!root)return false;let changed=false;const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT),nodes=[];while(walker.nextNode())nodes.push(walker.currentNode);for(const node of nodes){const old=node.nodeValue||'',next=replaceText(old);if(next!==old){node.nodeValue=next;changed=true;}}return changed;}
function run(){raf=0;return fix();}
function schedule(){if(!raf)raf=requestAnimationFrame(run);}
function observe(){if(observer){observer.disconnect();observer=null;}const root=document.getElementById('sheet');if(typeof MutationObserver==='undefined'||!root)return false;observer=new MutationObserver(schedule);observer.observe(root,{subtree:true,childList:true,characterData:true});schedule();return true;}
function cleanup(){if(observer){observer.disconnect();observer=null;}if(raf){cancelAnimationFrame(raf);raf=0;}}
observe();window.addEventListener('pagehide',cleanup,{passive:true});window.addEventListener('pageshow',observe,{passive:true});window.NOREYO_V1078=Object.freeze({BUILD,REPLACEMENTS,replaceText,fix,run,schedule,observe,cleanup});
})();