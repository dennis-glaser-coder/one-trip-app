/* NOREYO V9.55 — capability-truth sweep for flight preferences and hotel rates. */
(()=>{
'use strict';
const BUILD='9.55';let observer=null,raf=0;
const REPLACEMENTS=Object.freeze([
 ['Lege fest, was dir bei später passenden Flügen wichtig ist.','Diese Flugwünsche werden gespeichert. Die separate Flugsuche wendet sie aktuell noch nicht als harte Filter an.'],
 ['Wird gespeichert und mit dem Flugprovider angewendet, sobald dieser verbunden ist.','Wird gespeichert; aktuell noch nicht automatisch auf die separaten Flugangebote angewendet.'],
 ['Verpflegungen buchbar','Verpflegungen aktuell verfügbar'],
 ['Aktuell eine Verpflegung buchbar','Aktuell eine Verpflegung verfügbar']
]);
function replaceText(v){let out=String(v??'');for(const [from,to] of REPLACEMENTS)out=out.split(from).join(to);return out}
function fix(root=document.body){if(!root)return false;let changed=false;const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT),nodes=[];while(walker.nextNode())nodes.push(walker.currentNode);for(const n of nodes){const old=n.nodeValue||'',next=replaceText(old);if(next!==old){n.nodeValue=next;changed=true}}return changed}
function run(){raf=0;return fix()}
function schedule(){if(raf)return;raf=requestAnimationFrame(run)}
function observe(){if(observer){observer.disconnect();observer=null}if(typeof MutationObserver==='undefined'||!document.body)return false;observer=new MutationObserver(schedule);observer.observe(document.body,{subtree:true,childList:true,characterData:true});schedule();return true}
function cleanup(){if(observer){observer.disconnect();observer=null}if(raf){cancelAnimationFrame(raf);raf=0}}
observe();window.addEventListener('pagehide',cleanup,{passive:true});window.addEventListener('pageshow',observe,{passive:true});window.NOREYO_V955=Object.freeze({BUILD,REPLACEMENTS,replaceText,fix,run,schedule,observe,cleanup});
})();