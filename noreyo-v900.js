/* NOREYO V9.00 — truthful live-flight search copy.
   The packed core already sends server-side action:flightSearch requests. Keep UI copy aligned
   with that reality without presenting unverified search offers as bookable. */
(function(){
'use strict';
const BUILD='9.00';
let observer=null,raf=0;
const REPLACEMENTS=Object.freeze([
  ['Separate Flugsuche; Live-Flugtarife folgen nach Provider-Anbindung.','Separate Live-Flugsuche über den serverseitigen Provider-Pfad. Verfügbarkeit und Preise werden bei jeder Suche neu geladen.'],
  ['ONE TRIP sucht Flüge unabhängig vom Hotel. Für die Pauschalreise werden beide Ergebnisse später zusammengeführt.','NOREYO sucht Flüge separat vom Hotel. Eine kombinierte Paketbuchung ist in diesem Stand noch nicht freigegeben.'],
  ['Flug-Schnittstelle wird geprüft','Live-Flugangebote werden geladen'],
  ['Wir versuchen die vorbereitete Sandbox-Suche.','Verfügbarkeit und Preise werden serverseitig beim Flugprovider abgefragt.'],
  ['Die detaillierte Flugkarten-Darstellung folgt als nächster Ausbauschritt. Sandbox-Daten können unvollständig sein.','Live-Angebote wurden empfangen. Eine Auswahl wird erst nach Angebots-Verifizierung als buchbar dargestellt.'],
  ['Flugsuche ist in ONE TRIP jetzt separat vorbereitet.','Live-Flugsuche derzeit nicht verfügbar.'],
  ['Für Live-Ergebnisse muss die bestehende Supabase-Funktion einmal auf den LiteAPI-Flug-Endpunkt routen. Das machen wir anschließend gemeinsam.','Bitte versuche die Flugsuche erneut. Deine Suchangaben bleiben erhalten.']
]);
function rewriteText(text){let out=String(text||'');for(const [from,to] of REPLACEMENTS)out=out.split(from).join(to);return out;}
function relevant(root=document){return root?.querySelectorAll?.('.mode-helper,.flight-status,.loading-panel')||[];}
function rewrite(root=document){let changed=false;for(const el of relevant(root)){const old=String(el.textContent||''),next=rewriteText(old);if(next!==old){if(el.children.length===0)el.textContent=next;else{const walker=document.createTreeWalker(el,NodeFilter.SHOW_TEXT);const nodes=[];while(walker.nextNode())nodes.push(walker.currentNode);for(const n of nodes){const before=n.nodeValue||'',after=rewriteText(before);if(after!==before){n.nodeValue=after;changed=true;}}}changed=true;}}return changed;}
function run(){raf=0;rewrite();}
function schedule(){if(raf)return;raf=requestAnimationFrame(run);}
function observe(){if(observer){observer.disconnect();observer=null;}if(typeof MutationObserver==='undefined'||!document.body)return false;observer=new MutationObserver(schedule);observer.observe(document.body,{subtree:true,childList:true,characterData:true});schedule();return true;}
function cleanup(){if(observer){observer.disconnect();observer=null;}if(raf){cancelAnimationFrame(raf);raf=0;}}
observe();window.addEventListener('pagehide',cleanup,{passive:true});window.addEventListener('pageshow',observe,{passive:true});
window.NOREYO_V900=Object.freeze({BUILD,REPLACEMENTS,rewriteText,relevant,rewrite,run,schedule,observe,cleanup});
})();
