/* NOREYO V11.48 — booking draft bound to exact final provider terms.
   Session-only guest data must not remain prepared after the provider mutates
   final PREBOOK price/currency or cancellation policies inside the same session. */
(function(){
'use strict';
const BUILD='11.48';
let observer=null,raf=0,priorOwned=null;
function draft(){return window.NOREYO_HOTEL_BOOKING_DRAFT||null;}
function priceFingerprint(){try{return window.NOREYO_V1132?.fingerprint?.()||null;}catch(_){return null;}}
function termsFingerprint(){try{return window.NOREYO_V1134?.fingerprint?.()||null;}catch(_){return null;}}
function canonical(v){return v?JSON.stringify(v):'';}
function binding(){const p=priceFingerprint(),t=termsFingerprint();if(!p||!t)return null;return Object.freeze({price:canonical(p),terms:canonical(t)});}
function sameBinding(a,b){return !!a&&!!b&&String(a.price||'')===String(b.price||'')&&String(a.terms||'')===String(b.terms||'');}
function clear(){const d=draft();if(!d)return false;try{delete window.NOREYO_HOTEL_BOOKING_DRAFT;}catch(_){window.NOREYO_HOTEL_BOOKING_DRAFT=undefined;}return true;}
function baseOwned(d){try{return typeof priorOwned==='function'?!!priorOwned(d):false;}catch(_){return false;}}
function upgrade(){const d=draft(),b=binding();if(!d||!b)return false;if(d.finalBinding&&sameBinding(d.finalBinding,b))return false;if(d.finalBinding&&!sameBinding(d.finalBinding,b))return clear();window.NOREYO_HOTEL_BOOKING_DRAFT=Object.freeze({...d,finalBinding:b});return true;}
function owned(d=draft()){const b=binding();return !!d&&!!b&&!!d.finalBinding&&sameBinding(d.finalBinding,b)&&baseOwned(d);}
function sync(){raf=0;const d=draft();if(!d)return false;const b=binding();if(!b)return clear();if(!d.finalBinding){if(!baseOwned(d))return clear();return upgrade();}if(!sameBinding(d.finalBinding,b)||!baseOwned(d))return clear();return false;}
function patch(){const prior=window.NOREYO_V1146;if(!prior||prior.__noreyoV1148)return false;priorOwned=prior.owned;window.NOREYO_V1146=Object.freeze({...prior,__noreyoV1148:true,owned});return true;}
function schedule(){if(!raf)raf=requestAnimationFrame(()=>{raf=0;patch();sync();});}
function install(){patch();if(observer||typeof MutationObserver==='undefined'||!document.body)return false;observer=new MutationObserver(schedule);observer.observe(document.body,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['data-checkout-ready']});schedule();return true;}
function cleanup(){if(observer){observer.disconnect();observer=null;}if(raf){cancelAnimationFrame(raf);raf=0;}clear();}
install();window.addEventListener('pagehide',cleanup,{passive:true});window.addEventListener('pageshow',install,{passive:true});
window.NOREYO_V1148=Object.freeze({BUILD,draft,priceFingerprint,termsFingerprint,canonical,binding,sameBinding,clear,baseOwned,upgrade,owned,sync,patch,schedule,install,cleanup});
})();