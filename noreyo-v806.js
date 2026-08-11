/* NOREYO V8.06 — actionable bootstrap failure state.
   Adds an accessible retry action only when the startup shell enters a hard
   failure state. Successful boot/document replacement remains untouched. */
(function(){
'use strict';
const BUILD='8.06';
let observer=null,raf=0;
function status(){return document.getElementById('status');}
function errorBox(){return document.getElementById('error');}
function failed(){const s=String(status()?.textContent||'').toLowerCase();const e=errorBox();if(!e)return false;let visible=false;try{const style=getComputedStyle(e);visible=style.display!=='none'&&style.visibility!=='hidden';}catch(_){visible=e.style.display!=='none';}return visible&&(/konnte nicht geladen werden|neu laden|fehler/.test(s+' '+String(e.textContent||'').toLowerCase()));}
function retry(){try{location.reload();return true;}catch(_){return false;}}
function enhance(){raf=0;if(!failed())return false;const box=errorBox();if(!box||box.querySelector('[data-noreyo-boot-retry="1"]'))return false;box.setAttribute('role','alert');box.setAttribute('aria-live','assertive');const actions=document.createElement('div');actions.setAttribute('data-noreyo-boot-retry','1');actions.style.marginTop='18px';const button=document.createElement('button');button.type='button';button.textContent='Erneut versuchen';button.style.cssText='appearance:none;border:0;border-radius:14px;padding:12px 18px;font:800 14px/1 -apple-system,BlinkMacSystemFont,"SF Pro Display","Segoe UI",sans-serif;background:#fff;color:#07111f;cursor:pointer;min-height:44px';button.addEventListener('click',retry);actions.appendChild(button);box.appendChild(actions);try{button.focus({preventScroll:true});}catch(_){}return true;}
function schedule(){if(raf)return;raf=requestAnimationFrame(enhance);}
function observe(){if(observer){observer.disconnect();observer=null;}if(typeof MutationObserver==='undefined'||!document.body)return false;observer=new MutationObserver(schedule);observer.observe(document.body,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['style','class']});schedule();return true;}
function cleanup(){if(observer){observer.disconnect();observer=null;}if(raf){cancelAnimationFrame(raf);raf=0;}}
observe();window.addEventListener('pagehide',cleanup,{passive:true});
window.NOREYO_V806=Object.freeze({BUILD,status,errorBox,failed,retry,enhance,schedule,observe,cleanup});
})();