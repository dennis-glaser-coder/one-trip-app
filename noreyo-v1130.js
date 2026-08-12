/* NOREYO V11.30 — checkout-readiness control UX.
   Give the final non-refundable acknowledgement the existing primary-button visual
   language, a phone-safe touch target and focus-visible affordance. */
(function(){
'use strict';
const BUILD='11.30',STYLE_ID='noreyo-v1130-checkout-controls';
let observer=null,raf=0;
const CSS=`
.noreyo-v1128-cancel-ack{width:100%;min-height:48px;margin-top:10px}
.noreyo-v1128-cancel-ack:focus-visible{outline:3px solid #1fa2a4;outline-offset:3px}
.noreyo-v1128-ready[data-checkout-ready="true"] p{font-weight:800}
`;
function style(){if(document.getElementById(STYLE_ID))return false;const s=document.createElement('style');s.id=STYLE_ID;s.textContent=CSS;document.head.appendChild(s);return true;}
function enhance(){
  raf=0;const btn=document.querySelector('.noreyo-v1128-cancel-ack');if(!btn)return false;let changed=false;
  if(!btn.classList.contains('dark-btn')){btn.classList.add('dark-btn');changed=true;}
  if(btn.getAttribute('aria-describedby')!=='noreyo-v1128-ready-copy'){
    const box=btn.closest('.noreyo-v1128-ready'),p=box?.querySelector('p');
    if(p){if(!p.id)p.id='noreyo-v1128-ready-copy';btn.setAttribute('aria-describedby',p.id);changed=true;}
  }
  return changed;
}
function schedule(){if(!raf)raf=requestAnimationFrame(enhance);}
function install(){style();if(observer||typeof MutationObserver==='undefined'||!document.body)return false;observer=new MutationObserver(schedule);observer.observe(document.body,{subtree:true,childList:true});schedule();return true;}
function cleanup(){if(observer){observer.disconnect();observer=null;}if(raf){cancelAnimationFrame(raf);raf=0;}}
install();window.addEventListener('pagehide',cleanup,{passive:true});window.addEventListener('pageshow',install,{passive:true});
window.NOREYO_V1130=Object.freeze({BUILD,STYLE_ID,CSS,style,enhance,schedule,install,cleanup});
})();