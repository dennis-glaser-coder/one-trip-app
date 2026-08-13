/* NOREYO V9.60 — truthful local saved-price wording.
   The packed core stores price snapshots locally; it does not yet monitor prices
   or send notifications. Remove "observation" claims until a server-side watcher exists. */
(function(){
'use strict';
const BUILD='9.60';
let observer=null,raf=0;
const REPLACEMENTS=Object.freeze([
  ['Preisbeobachtung beendet','Preisvormerkung entfernt'],
  ['Preis wird beobachtet','Preis gemerkt'],
  ['Preis beobachten','Preis merken'],
  ['Noch keine Preisbeobachtung','Noch kein Preis gemerkt'],
  ['Keine aktive Beobachtung','Kein gemerkter Preis'],
  ['Preisbeobachtung','Gemerkte Preise']
]);
function replaceText(value){let out=String(value??'');for(const [from,to] of REPLACEMENTS)out=out.split(from).join(to);out=out.replace(/(\d+)\s+aktive Beobachtung(?:en)?\s*·\s*lokal/g,(_,n)=>`${n} ${Number(n)===1?'gemerkter Preis':'gemerkte Preise'} · lokal`);return out;}
function fix(root=document.body){if(!root)return false;let changed=false;const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT),nodes=[];while(walker.nextNode())nodes.push(walker.currentNode);for(const node of nodes){const old=node.nodeValue||'',next=replaceText(old);if(next!==old){node.nodeValue=next;changed=true;}}return changed;}
function run(){raf=0;return fix();}
function schedule(){if(!raf)raf=requestAnimationFrame(run);}
function observe(){if(observer){observer.disconnect();observer=null;}if(typeof MutationObserver==='undefined'||!document.body)return false;observer=new MutationObserver(schedule);observer.observe(document.body,{subtree:true,childList:true,characterData:true});schedule();return true;}
function cleanup(){if(observer){observer.disconnect();observer=null;}if(raf){cancelAnimationFrame(raf);raf=0;}}
observe();window.addEventListener('pagehide',cleanup,{passive:true});window.addEventListener('pageshow',observe,{passive:true});window.NOREYO_V960=Object.freeze({BUILD,REPLACEMENTS,replaceText,fix,run,schedule,observe,cleanup});
})();