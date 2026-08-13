/* NOREYO V9.25 — reconcile stale flight-provider copy with current separate live-flight capability. */
(()=>{'use strict';const BUILD='9.25';let obs=null,raf=0;
const REPL=[
 ['Live-Hotelpreise heute; Flug und Paketpreis werden erst nach Anschluss der Flug-API ergänzt.','Live-Hotelpreise und separate Flugsuche sind verfügbar. Ein gemeinsamer Paketpreis wird erst nach der Tarifkombination ausgewiesen.'],
 ['Flug später kombinieren','Flug separat suchen'],
 ['Live-Flugpreise werden erst nach Anschluss des Flugproviders ergänzt.','Flugpreise werden separat live gesucht und sind im angezeigten Hotelpreis noch nicht enthalten.'],
 ['Wir versuchen die vorbereitete Sandbox-Suche.','Wir prüfen jetzt verfügbare Flüge für deine Reisedaten.'],
 ['Die detaillierte Flugkarten-Darstellung folgt als nächster Ausbauschritt. Sandbox-Daten können unvollständig sein.','Die Schnittstelle hat geantwortet. Flugdetails werden separat vom Hotelpreis dargestellt.'],
 ['Flugsuche ist in ONE TRIP jetzt separat vorbereitet.','Flugsuche konnte gerade nicht geladen werden.'],
 ['Für Live-Ergebnisse muss die bestehende Supabase-Funktion einmal auf den LiteAPI-Flug-Endpunkt routen. Das machen wir anschließend gemeinsam.','Deine Angaben bleiben erhalten. Bitte versuche die Flugsuche erneut.']
];
function fix(root=document.body){if(!root)return false;let changed=false;const w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);const nodes=[];while(w.nextNode())nodes.push(w.currentNode);for(const n of nodes){let v=n.nodeValue||'',x=v;for(const [a,b] of REPL)x=x.split(a).join(b);x=x.replace(/ONE TRIP/g,'NOREYO');if(x!==v){n.nodeValue=x;changed=true}}return changed}
function run(){raf=0;fix()}function schedule(){if(!raf)raf=requestAnimationFrame(run)}function bind(){if(obs)obs.disconnect();if(typeof MutationObserver==='undefined'||!document.body)return false;obs=new MutationObserver(schedule);obs.observe(document.body,{subtree:true,childList:true,characterData:true});schedule();return true}function cleanup(){obs?.disconnect();obs=null;if(raf)cancelAnimationFrame(raf);raf=0}bind();window.addEventListener('pagehide',cleanup,{passive:true});window.addEventListener('pageshow',bind,{passive:true});window.NOREYO_V925=Object.freeze({BUILD,REPL,fix,bind,cleanup});})();