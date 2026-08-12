/* NOREYO V9.47 — truthful local price-marker language.
   Current price alerts are only persisted locally; no background price monitor
   exists. Remove wording that implies active server-side monitoring. */
(()=>{
'use strict';
const BUILD='9.47';
let observer=null,raf=0,toastInstalled=false,priorToast=null;
const REPLACEMENTS=Object.freeze([
  ['Preis wird beobachtet','Preis vorgemerkt'],
  ['Preis beobachten','Preis merken'],
  ['Preisbeobachtung beendet','Preis-Merker entfernt'],
  ['Preisbeobachtung','Preis-Merkliste'],
  ['Keine aktive Beobachtung','Keine gemerkten Preise'],
  ['aktive Beobachtung','gemerkter Preis'],
  ['aktive Beobachtungen','gemerkte Preise']
]);
function replaceText(v){let out=String(v??'');for(const [from,to] of REPLACEMENTS)out=out.split(from).join(to);return out}
function fixText(root=document){if(!root)return false;let changed=false;const start=root.body||root;if(!start)return false;const walker=document.createTreeWalker(start,NodeFilter.SHOW_TEXT);const nodes=[];while(walker.nextNode())nodes.push(walker.currentNode);for(const node of nodes){const old=node.nodeValue||'',next=replaceText(old);if(next!==old){node.nodeValue=next;changed=true}}return changed}
function installToast(){if(toastInstalled)return false;try{if(typeof showToast!=='function')return false;priorToast=showToast;showToast=function(message,...rest){return priorToast(replaceText(message),...rest)};toastInstalled=true;return true}catch(_){return false}}
function run(){raf=0;installToast();fixText()}
function schedule(){if(raf)return;raf=requestAnimationFrame(run)}
function observe(){if(observer){observer.disconnect();observer=null}if(typeof MutationObserver==='undefined'||!document.body)return false;observer=new MutationObserver(schedule);observer.observe(document.body,{subtree:true,childList:true,characterData:true});schedule();return true}
function cleanup(){if(observer){observer.disconnect();observer=null}if(raf){cancelAnimationFrame(raf);raf=0}}
observe();window.addEventListener('pagehide',cleanup,{passive:true});window.addEventListener('pageshow',observe,{passive:true});
window.NOREYO_V947=Object.freeze({BUILD,REPLACEMENTS,replaceText,fixText,installToast,run,schedule,observe,cleanup});
})();