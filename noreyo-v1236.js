/* NOREYO V12.36 — focusable checkout blocker explanations.
   The PREBOOK action is intentionally natively disabled while authentication or
   unsupported MUST criteria block checkout. Disabled controls do not reliably emit
   click/focus events, so make the existing blocker notes themselves keyboard/
   VoiceOver reachable and link the action to them without weakening any safety gate. */
(function(){
'use strict';
const BUILD='12.36',STYLE_ID='noreyo-v1236-blocker-a11y';
let observer=null,raf=0;
const TOKENS=Object.freeze({must:'noreyo-checkout-must-note',auth:'noreyo-checkout-auth-note'});

function words(v){return String(v||'').trim().split(/\s+/).filter(Boolean);}
function setTokens(el,items){
  if(!el)return false;
  const next=[...new Set(items.filter(Boolean))].join(' ');
  const prev=el.getAttribute('aria-describedby')||'';
  if(prev===next)return false;
  if(next)el.setAttribute('aria-describedby',next);else el.removeAttribute('aria-describedby');
  return true;
}
function enhanceNote(note,id){
  if(!note)return false;let changed=false;
  if(note.id!==id){note.id=id;changed=true;}
  if(note.getAttribute('role')!=='status'){note.setAttribute('role','status');changed=true;}
  if(note.getAttribute('aria-live')!=='polite'){note.setAttribute('aria-live','polite');changed=true;}
  if(note.getAttribute('aria-atomic')!=='true'){note.setAttribute('aria-atomic','true');changed=true;}
  if(note.getAttribute('tabindex')!=='0'){note.setAttribute('tabindex','0');changed=true;}
  return changed;
}
function installStyle(){
  if(document.getElementById(STYLE_ID))return false;
  const s=document.createElement('style');s.id=STYLE_ID;
  s.textContent='.noreyo-v1200-must-note:focus-visible,.noreyo-v1202-auth-note:focus-visible{outline:3px solid #1fa2a4;outline-offset:3px;border-radius:12px}';
  document.head.appendChild(s);return true;
}
function sync(){
  raf=0;const root=document.querySelector('.noreyo-v1106-prebook');if(!root)return false;
  const btn=root.querySelector('.noreyo-v1106-action');
  const must=root.querySelector('.noreyo-v1200-must-note');
  const auth=root.querySelector('.noreyo-v1202-auth-note');
  let changed=false;
  changed=enhanceNote(must,TOKENS.must)||changed;
  changed=enhanceNote(auth,TOKENS.auth)||changed;
  const existing=words(btn?.getAttribute('aria-describedby')).filter(x=>!Object.values(TOKENS).includes(x));
  if(must)existing.push(TOKENS.must);
  if(auth)existing.push(TOKENS.auth);
  changed=setTokens(btn,existing)||changed;
  return changed;
}
function schedule(){if(!raf)raf=requestAnimationFrame(sync);}
function install(){
  installStyle();
  if(observer||typeof MutationObserver==='undefined'||!document.body)return false;
  observer=new MutationObserver(schedule);
  observer.observe(document.body,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['class','disabled','data-noreyo-v1200-must','data-noreyo-v1202-auth']});
  schedule();return true;
}
function cleanup(){if(observer){observer.disconnect();observer=null;}if(raf){cancelAnimationFrame(raf);raf=0;}}
install();window.addEventListener('pagehide',cleanup,{passive:true});window.addEventListener('pageshow',install,{passive:true});
window.NOREYO_V1236=Object.freeze({BUILD,STYLE_ID,TOKENS,words,setTokens,enhanceNote,installStyle,sync,schedule,install,cleanup});
})();