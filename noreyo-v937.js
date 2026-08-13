/* NOREYO V9.37 — truthful package-mode UX.
   The packed core does not yet create a single bookable package price. Keep the
   package workflow useful while making the current hotel+separate-flight state explicit. */
(()=>{
'use strict';
const BUILD='9.37';let obs=null,raf=0;
const REPLACEMENTS=Object.freeze([
  ['Für die Pauschalreise werden beide Ergebnisse später zusammengeführt.','Hotel und Flug werden getrennt gesucht. Ein gemeinsamer Gesamtpreis wird erst nach einer echten Tarifkombination ausgewiesen.'],
  ['Pauschalreise individuell finden','Hotel + Flug passend planen'],
  ['Zeitraum, Verpflegung, Reisende und Wünsche werden in die Live-Suche übernommen.','Hotelpreise werden live gesucht. Flüge werden separat geprüft; ein gemeinsamer Gesamtpreis wird erst nach Tarifkombination ausgewiesen.'],
  ['Pauschalreise','Hotel + Flug'],
  ['Urlaub finden','Hotels für die Reise finden']
]);
function replaceText(text){let x=String(text||'');for(const [from,to] of REPLACEMENTS)x=x.split(from).join(to);return x}
function fixText(root=document.body){if(!root)return false;let changed=false;const w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT),nodes=[];while(w.nextNode())nodes.push(w.currentNode);for(const n of nodes){const old=n.nodeValue||'',next=replaceText(old);if(next!==old){n.nodeValue=next;changed=true}}return changed}
function fixControls(){let changed=false;document.querySelectorAll('.product-mode').forEach(btn=>{const text=String(btn.textContent||'').trim();if(/Hotel\s*\+\s*Flug/i.test(text)&&btn.getAttribute('aria-label')!=='Hotel und Flug planen'){btn.setAttribute('aria-label','Hotel und Flug planen');changed=true}});document.querySelectorAll('.liveSearchButton').forEach(btn=>{const t=String(btn.textContent||'');if(/Hotels für die Reise finden/i.test(t)&&btn.getAttribute('aria-label')!=='Live-Hotels für deine Reise finden'){btn.setAttribute('aria-label','Live-Hotels für deine Reise finden');changed=true}});return changed}
function run(){raf=0;fixText();fixControls()}
function schedule(){if(!raf)raf=requestAnimationFrame(run)}
function bind(){obs?.disconnect();if(typeof MutationObserver==='undefined'||!document.body)return false;obs=new MutationObserver(schedule);obs.observe(document.body,{subtree:true,childList:true,characterData:true});schedule();return true}
function cleanup(){obs?.disconnect();obs=null;if(raf)cancelAnimationFrame(raf);raf=0}
bind();window.addEventListener('pagehide',cleanup,{passive:true});window.addEventListener('pageshow',bind,{passive:true});window.NOREYO_V937=Object.freeze({BUILD,REPLACEMENTS,replaceText,fixText,fixControls,bind,cleanup});
})();