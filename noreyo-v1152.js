/* NOREYO V11.52 — deterministic booking idempotency reference.
   LiteAPI BOOK supports clientReference as a duplicate-booking guard. Prepare a
   deterministic, non-PII reference from the exact PREBOOK + final provider binding.
   No BOOK request is made here and no payment data is created or stored. */
(function(){
'use strict';
const BUILD='11.52';
let observer=null,raf=0;
function draft(){return window.NOREYO_HOTEL_BOOKING_DRAFT||null;}
function hash32(value,seed=0x811c9dc5){let h=seed>>>0;const s=String(value||'');for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,0x01000193)>>>0;}return h>>>0;}
function hex(n){return (n>>>0).toString(16).padStart(8,'0');}
function source(d=draft()){if(!d||!d.sessionKey||!d.finalBinding?.price||!d.finalBinding?.terms)return'';return `${d.sessionKey}|${d.finalBinding.price}|${d.finalBinding.terms}`;}
function reference(d=draft()){const s=source(d);if(!s)return'';const a=hash32(s,0x811c9dc5),b=hash32([...s].reverse().join(''),0x9e3779b9);return `NRY-${hex(a)}${hex(b)}`.toUpperCase();}
function valid(v){return /^NRY-[A-F0-9]{16}$/.test(String(v||''));}
function upgrade(){const d=draft(),ref=reference(d);if(!d||!ref)return false;if(d.clientReference===ref)return false;if(d.clientReference&&d.clientReference!==ref){try{window.NOREYO_V1148?.clear?.();}catch(_){}return false;}window.NOREYO_HOTEL_BOOKING_DRAFT=Object.freeze({...d,clientReference:ref});return true;}
function sync(){raf=0;const d=draft();if(!d)return false;const ref=reference(d);if(!ref){try{return !!window.NOREYO_V1148?.clear?.();}catch(_){return false;}}if(d.clientReference&&d.clientReference!==ref){try{return !!window.NOREYO_V1148?.clear?.();}catch(_){return false;}}return upgrade();}
function schedule(){if(!raf)raf=requestAnimationFrame(sync);}
function install(){if(observer||typeof MutationObserver==='undefined'||!document.body)return false;observer=new MutationObserver(schedule);observer.observe(document.body,{subtree:true,childList:true,characterData:true});schedule();return true;}
function cleanup(){if(observer){observer.disconnect();observer=null;}if(raf){cancelAnimationFrame(raf);raf=0;}}
install();window.addEventListener('pagehide',cleanup,{passive:true});window.addEventListener('pageshow',install,{passive:true});
window.NOREYO_V1152=Object.freeze({BUILD,draft,hash32,hex,source,reference,valid,upgrade,sync,schedule,install,cleanup});
})();