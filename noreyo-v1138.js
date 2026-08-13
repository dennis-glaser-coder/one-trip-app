/* NOREYO V11.38 — time-bounded PREBOOK status freshness.
   A successful status check is not indefinitely checkout-ready. Require the exact
   PREBOOK status confirmation to be at most 60 seconds old, then relock readiness
   and prompt a fresh provider check before any future BOOK step. */
(function(){
'use strict';
const BUILD='11.38',MAX_AGE_MS=60000;
let timer=0,observer=null,raf=0;
function status(){return window.NOREYO_HOTEL_PREBOOK_STATUS||null;}
function snap(){return window.NOREYO_HOTEL_PREBOOK||null;}
function age(now=Date.now()){const t=Date.parse(String(status()?.checkedAt||''));return Number.isFinite(t)?Math.max(0,now-t):Infinity;}
function fresh(now=Date.now()){const s=snap(),v=status();return !!s&&!!v&&v.active===true&&String(v.prebookId||'')===String(s.prebookId||'')&&age(now)<=MAX_AGE_MS;}
function scheduleExpiry(){if(timer){clearTimeout(timer);timer=0;}if(!fresh())return false;const left=Math.max(0,MAX_AGE_MS-age()+25);timer=setTimeout(()=>{timer=0;try{window.NOREYO_V1136?.render?.();}catch(_){};schedule();},left);return true;}
function patch(){
  const base=window.NOREYO_V1136;if(!base||base.__noreyoV1138)return false;
  window.NOREYO_V1136=Object.freeze({...base,__noreyoV1138:true,current:fresh,render(){const result=base.render?.();scheduleExpiry();const box=document.querySelector('.noreyo-v1128-ready');if(box)box.setAttribute('data-checkout-ready',window.NOREYO_V1128?.checkoutReady?.()?'true':'false');return result;}});
  const gate=window.NOREYO_V1128;if(gate&&!gate.__noreyoV1138){const priorReady=gate.checkoutReady;window.NOREYO_V1128=Object.freeze({...gate,__noreyoV1138:true,checkoutReady(){return !!priorReady?.()&&fresh();}});}
  scheduleExpiry();return true;
}
function sync(){raf=0;patch();if(status()&&!fresh()){try{window.NOREYO_V1136?.render?.();}catch(_){}}}
function schedule(){if(!raf)raf=requestAnimationFrame(sync);}
function install(){patch();if(observer||typeof MutationObserver==='undefined'||!document.body)return false;observer=new MutationObserver(schedule);observer.observe(document.body,{subtree:true,childList:true,characterData:true});schedule();return true;}
function cleanup(){if(observer){observer.disconnect();observer=null;}if(raf){cancelAnimationFrame(raf);raf=0;}if(timer){clearTimeout(timer);timer=0;}}
install();window.addEventListener('pagehide',cleanup,{passive:true});window.addEventListener('pageshow',install,{passive:true});
window.NOREYO_V1138=Object.freeze({BUILD,MAX_AGE_MS,status,snap,age,fresh,scheduleExpiry,patch,sync,schedule,install,cleanup});
})();