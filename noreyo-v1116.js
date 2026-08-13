/* NOREYO V11.16 — stabilize hotel price-change acknowledgement reconciliation.
   Retire V11.14's non-idempotent observer/listener and own the same acknowledgement
   UI with change-only DOM writes, preventing a MutationObserver feedback loop. */
(function(){
'use strict';
const BUILD='11.16';
let observer=null,raf=0,bound=false;
try{window.NOREYO_V1114?.cleanup?.();}catch(_){}
function api(){return window.NOREYO_V1114||null;}
function snap(){return api()?.snap?.()||null;}
function model(){return api()?.model?.()||null;}
function isAccepted(){return !!api()?.isAccepted?.();}
function clearAccepted(){return !!api()?.clearAccepted?.();}
function setText(el,value){if(!el||el.textContent===value)return false;el.textContent=value;return true;}
function setAttr(el,key,value){if(!el||el.getAttribute?.(key)===value)return false;el.setAttribute(key,value);return true;}
function setDisabled(el,value){if(!el||el.disabled===value)return false;el.disabled=value;return true;}
function render(){raf=0;const status=document.querySelector('.noreyo-v1106-status'),s=snap(),m=model();if(!status||!s)return false;if(api()?.accepted?.()&&!isAccepted())clearAccepted();let changed=false,box=status.querySelector('.noreyo-v1114-ack');if(!m?.changed){if(box){box.remove();changed=true;}return changed;}if(!box){box=document.createElement('div');box.className='noreyo-v1114-ack';const p=document.createElement('p'),btn=document.createElement('button');p.textContent='Der Anbieter hat einen anderen finalen Preis bestätigt. Bitte bestätige die Änderung ausdrücklich, bevor es später zur Buchung weitergeht.';btn.type='button';btn.className='noreyo-v1114-confirm';btn.setAttribute('aria-label','Finale Hotelpreisänderung bestätigen');box.append(p,btn);status.appendChild(box);changed=true;}const btn=box.querySelector('.noreyo-v1114-confirm'),accepted=isAccepted();changed=setText(btn,accepted?'Preisänderung bestätigt ✓':'Preisänderung bestätigen')||changed;changed=setDisabled(btn,accepted)||changed;changed=setAttr(btn,'aria-pressed',accepted?'true':'false')||changed;return changed;}
function onClick(e){const btn=e.target?.closest?.('.noreyo-v1114-confirm');if(!btn)return;e.preventDefault();e.stopPropagation();const s=snap(),m=model();if(!s||!m?.changed||isAccepted())return;window.NOREYO_HOTEL_PREBOOK_ACCEPTED=Object.freeze({prebookId:String(s.prebookId),acceptedAt:new Date().toISOString()});render();}
function schedule(){if(!raf)raf=requestAnimationFrame(render);}
function install(){if(bound)return false;bound=true;if(typeof MutationObserver!=='undefined'&&document.body){observer=new MutationObserver(schedule);observer.observe(document.body,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['class']});}document.addEventListener('click',onClick,true);schedule();return true;}
function cleanup(){if(observer){observer.disconnect();observer=null;}if(bound){document.removeEventListener('click',onClick,true);bound=false;}if(raf){cancelAnimationFrame(raf);raf=0;}}
install();window.addEventListener('pagehide',cleanup,{passive:true});window.addEventListener('pageshow',install,{passive:true});
window.NOREYO_V1116=Object.freeze({BUILD,api,snap,model,isAccepted,clearAccepted,setText,setAttr,setDisabled,render,onClick,schedule,install,cleanup});
})();