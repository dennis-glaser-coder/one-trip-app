/* NOREYO V6.96 — truthful neutral result-sort copy.
   When no MUST/WISH priority is active, do not claim "beste Treffer zuerst";
   the base/user-selected ordering is intentionally preserved by V6.89. */
(function(){
'use strict';
const BUILD='6.96';
let observer=null,root=null,raf=0;
function counts(){try{const vals=Object.values(states||{});return {must:vals.filter(v=>v==='must').length,wish:vals.filter(v=>v==='wish').length};}catch(_){return {must:0,wish:0};}}
function fix(){const c=counts();if(c.must||c.wish)return false;const small=document.querySelector('#results .match small');if(!small)return false;const old=String(small.textContent||'').trim();if(!/beste\s+(?:treffer|uebereinstimmungen|übereinstimmungen)\s+zuerst/i.test(old))return false;small.textContent='Preis & Verfügbarkeit geprüft · aktuelle Sortierung';return true;}
function schedule(){if(raf)return;raf=requestAnimationFrame(()=>{raf=0;fix();});}
function bind(){const next=document.getElementById('results');if(next===root&&observer)return;if(observer){observer.disconnect();observer=null;}root=next;if(!root||typeof MutationObserver==='undefined')return;observer=new MutationObserver(schedule);observer.observe(root,{childList:true,subtree:true,characterData:true});schedule();}
function cleanup(){if(observer){observer.disconnect();observer=null;}root=null;if(raf){cancelAnimationFrame(raf);raf=0;}}
bind();fix();window.addEventListener('pagehide',cleanup,{passive:true});window.addEventListener('pageshow',bind,{passive:true});
window.NOREYO_V696=Object.freeze({BUILD,counts,fix,bind,cleanup});
})();
