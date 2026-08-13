/* NOREYO V12.06 — accessible checkout-auth lock semantics.
   Tie the disabled final-check action to the visible auth explanation, announce
   auth-lock changes politely, and remove only NOREYO's own describedby token after
   successful sign-in. */
(function(){
'use strict';
const BUILD='12.06',NOTE_ID='noreyo-checkout-auth-note';
let observer=null,raf=0;
function tokens(value){return String(value||'').trim().split(/\s+/).filter(Boolean);}
function addToken(el,attr,token){if(!el)return false;const set=new Set(tokens(el.getAttribute(attr)));if(set.has(token))return false;set.add(token);el.setAttribute(attr,[...set].join(' '));return true;}
function removeToken(el,attr,token){if(!el)return false;const before=tokens(el.getAttribute(attr)),after=before.filter(x=>x!==token);if(after.length===before.length)return false;if(after.length)el.setAttribute(attr,after.join(' '));else el.removeAttribute(attr);return true;}
function sync(){raf=0;const root=document.querySelector('.noreyo-v1106-prebook');if(!root)return false;const note=root.querySelector('.noreyo-v1202-auth-note'),action=root.querySelector('.noreyo-v1106-action');let changed=false;if(note){if(note.id!==NOTE_ID){note.id=NOTE_ID;changed=true;}if(note.getAttribute('role')!=='status'){note.setAttribute('role','status');changed=true;}if(note.getAttribute('aria-live')!=='polite'){note.setAttribute('aria-live','polite');changed=true;}if(note.getAttribute('aria-atomic')!=='true'){note.setAttribute('aria-atomic','true');changed=true;}changed=addToken(action,'aria-describedby',NOTE_ID)||changed;}else{changed=removeToken(action,'aria-describedby',NOTE_ID)||changed;}return changed;}
function schedule(){if(!raf)raf=requestAnimationFrame(sync);}
function install(){if(observer||typeof MutationObserver==='undefined'||!document.body)return false;observer=new MutationObserver(schedule);observer.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['class','disabled']});schedule();return true;}
function cleanup(){if(observer){observer.disconnect();observer=null;}if(raf){cancelAnimationFrame(raf);raf=0;}}
install();window.addEventListener('pagehide',cleanup,{passive:true});window.addEventListener('pageshow',install,{passive:true});
window.NOREYO_V1206=Object.freeze({BUILD,NOTE_ID,tokens,addToken,removeToken,sync,schedule,install,cleanup});
})();