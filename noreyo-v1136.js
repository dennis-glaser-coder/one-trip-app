/* NOREYO V11.36 — live PREBOOK session revalidation gate.
   The provider PREBOOK is temporary. Before NOREYO calls a future BOOK step, require
   a fresh server-side status check for the exact current prebookId. No PII/payment
   is collected and no booking is triggered here. */
(function(){
'use strict';
const BUILD='11.36',ENDPOINT='https://fcvffslhnaqlwitaeers.supabase.co/functions/v1/hotel-prebook-status',TIMEOUT_MS=15000;
let inflight=null,observer=null,raf=0,bound=false;
function snap(){return window.NOREYO_HOTEL_PREBOOK||null;}
function status(){return window.NOREYO_HOTEL_PREBOOK_STATUS||null;}
function key(){try{if(typeof providerAnon!=='undefined'&&providerAnon)return String(providerAnon);if(typeof anonKey!=='undefined'&&anonKey)return String(anonKey);}catch(_){}return'';}
function current(){const s=snap(),v=status();return !!s&&!!v&&v.active===true&&String(v.prebookId||'')===String(s.prebookId||'');}
function clear(){if(!status())return false;try{delete window.NOREYO_HOTEL_PREBOOK_STATUS;}catch(_){window.NOREYO_HOTEL_PREBOOK_STATUS=undefined;}return true;}
function clearCheckout(){clear();try{window.NOREYO_V1120?.clear?.();}catch(_){}try{window.NOREYO_V1122?.clear?.();}catch(_){}try{window.NOREYO_V1128?.clearCancelAccepted?.();}catch(_){}try{window.NOREYO_V1106?.clear?.();}catch(_){} }
async function revalidate(){
  const s=snap(),pid=String(s?.prebookId||'').trim();if(!pid)throw new Error('Keine aktuelle Checkout-Session vorhanden.');
  const token=key();if(!token)throw new Error('NOREYO konnte die sichere Session-Prüfung nicht initialisieren.');
  if(inflight?.prebookId===pid)return inflight.promise;
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),TIMEOUT_MS);
  const promise=(async()=>{try{
    const res=await fetch(ENDPOINT,{method:'POST',headers:{'Content-Type':'application/json','apikey':token,'Authorization':`Bearer ${token}`},body:JSON.stringify({prebookId:pid}),signal:controller.signal});
    let payload={};try{payload=await res.json();}catch(_){}
    if(!res.ok)throw Object.assign(new Error(String(payload?.error?.message||payload?.message||`Session-Prüfung fehlgeschlagen (HTTP ${res.status}).`)),{status:res.status,payload});
    const route=String(res.headers?.get?.('X-Noreyo-Provider-Route')||'').trim();if(route&&route!=='hotels/prebook-status')throw Object.assign(new Error('Die Session-Prüfung kam aus einer unerwarteten Providerroute.'),{status:502,code:'PROVIDER_ROUTE_MISMATCH'});
    if(String(snap()?.prebookId||'')!==pid)throw Object.assign(new Error('Die Checkout-Session hat sich während der Prüfung geändert.'),{code:'STALE_PREBOOK'});
    const next=Object.freeze({prebookId:pid,active:payload?.data?.active===true,status:String(payload?.data?.status||'active'),checkedAt:new Date().toISOString()});
    if(!next.active)throw Object.assign(new Error('Die Checkout-Session ist nicht mehr aktiv.'),{status:409});
    window.NOREYO_HOTEL_PREBOOK_STATUS=next;return next;
  }finally{clearTimeout(timer);if(inflight?.prebookId===pid)inflight=null;}})();
  inflight={prebookId:pid,promise,controller};return promise;
}
function patchGate(){const prior=window.NOREYO_V1128;if(!prior||prior.__noreyoV1136)return false;window.NOREYO_V1128=Object.freeze({...prior,__noreyoV1136:true,checkoutReady(){return !!prior.checkoutReady?.()&&current();}});return true;}
function render(){raf=0;patchGate();const box=document.querySelector('.noreyo-v1128-ready'),s=snap();if(!box||!s)return false;if(status()&&!current())clear();let btn=box.querySelector('.noreyo-v1136-session-check');if(!btn){btn=document.createElement('button');btn.type='button';btn.className='dark-btn noreyo-v1136-session-check';btn.style.minHeight='48px';btn.style.width='100%';btn.style.marginTop='10px';box.appendChild(btn);}btn.textContent=current()?'Checkout-Session erneut live prüfen':'Checkout-Session jetzt live prüfen';btn.disabled=false;let note=box.querySelector('.noreyo-v1136-session-note');if(!note){note=document.createElement('p');note.className='noreyo-v1136-session-note';note.setAttribute('role','status');note.setAttribute('aria-live','polite');box.appendChild(note);}note.textContent=current()?'Checkout-Session wurde live erneut bestätigt.':'Vor dem nächsten Buchungsschritt muss die aktuelle Checkout-Session noch einmal live bestätigt werden.';box.setAttribute('data-checkout-ready',window.NOREYO_V1128?.checkoutReady?.()?'true':'false');return true;}
async function onClick(e){const btn=e.target?.closest?.('.noreyo-v1136-session-check');if(!btn)return;e.preventDefault();e.stopPropagation();btn.disabled=true;btn.textContent='Checkout-Session wird geprüft …';try{await revalidate();render();}catch(error){if(error?.status===409)clearCheckout();render();try{showToast?.(String(error?.message||error));}catch(_){}}finally{if(btn.isConnected)btn.disabled=false;}}
function schedule(){if(!raf)raf=requestAnimationFrame(render);}
function install(){patchGate();if(bound)return false;bound=true;if(typeof MutationObserver!=='undefined'&&document.body){observer=new MutationObserver(schedule);observer.observe(document.body,{subtree:true,childList:true,characterData:true});}document.addEventListener('click',onClick,true);schedule();return true;}
function cleanup(){if(observer){observer.disconnect();observer=null;}if(bound){document.removeEventListener('click',onClick,true);bound=false;}if(raf){cancelAnimationFrame(raf);raf=0;}try{inflight?.controller?.abort?.();}catch(_){}inflight=null;}
install();window.addEventListener('pagehide',cleanup,{passive:true});window.addEventListener('pageshow',install,{passive:true});
window.NOREYO_V1136=Object.freeze({BUILD,ENDPOINT,TIMEOUT_MS,snap,status,key,current,clear,clearCheckout,revalidate,patchGate,render,onClick,schedule,install,cleanup});
})();