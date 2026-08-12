/* NOREYO V9.08 — hotel gallery modal keyboard/focus + 44px touch target. */
(function(){
'use strict';
const BUILD='9.08',STYLE_ID='noreyo-v908-gallery-style';
let observer=null,returnFocus=null,lastOpen=false,bound=false,raf=0;
function root(){return document.getElementById('galleryModal');}
function open(el=root()){return !!el?.classList?.contains('show');}
function ensureStyle(){if(document.getElementById(STYLE_ID))return false;const s=document.createElement('style');s.id=STYLE_ID;s.textContent='.gallery-close{min-width:44px!important;min-height:44px!important}.gallery-nav{min-width:44px!important}';(document.head||document.documentElement).appendChild(s);return true;}
function controls(el=root()){if(!el)return[];return [...el.querySelectorAll('.gallery-close,.gallery-prev,.gallery-next')].filter(x=>{const cs=getComputedStyle(x);return cs.display!=='none'&&cs.visibility!=='hidden';});}
function enhance(){const el=root();if(!open(el))return false;el.setAttribute('role','dialog');el.setAttribute('aria-modal','true');el.setAttribute('aria-label','Hotelgalerie');const close=el.querySelector('.gallery-close');if(close&&!close.getAttribute('aria-label'))close.setAttribute('aria-label','Galerie schließen');try{(close||el).focus({preventScroll:true});}catch(_){}return true;}
function restoreFocus(){const t=returnFocus;returnFocus=null;if(!t?.isConnected)return false;setTimeout(()=>{try{t.focus({preventScroll:true});}catch(_){}},0);return true;}
function close(){if(!open())return false;try{if(typeof closeGallery==='function')closeGallery();else root()?.classList.remove('show');}catch(_){return false;}restoreFocus();return true;}
function onKey(e){const el=root();if(!open(el))return;if(e.key==='Escape'){e.preventDefault();e.stopPropagation();close();return;}if(e.key==='ArrowLeft'){e.preventDefault();try{galleryStep?.(-1);}catch(_){}return;}if(e.key==='ArrowRight'){e.preventDefault();try{galleryStep?.(1);}catch(_){}return;}if(e.key!=='Tab')return;const list=controls(el);if(!list.length)return;const first=list[0],last=list[list.length-1],active=document.activeElement;if(e.shiftKey&&(active===first||!el.contains(active))){e.preventDefault();last.focus();}else if(!e.shiftKey&&(active===last||!el.contains(active))){e.preventDefault();first.focus();}}
function sync(){raf=0;const isOpen=open();if(isOpen&&!lastOpen){try{const a=document.activeElement;if(a instanceof Element&&!root()?.contains(a))returnFocus=a;}catch(_){}setTimeout(enhance,0);}else if(!isOpen&&lastOpen)restoreFocus();lastOpen=isOpen;}
function schedule(){if(!raf)raf=requestAnimationFrame(sync);}
function observe(){if(observer){observer.disconnect();observer=null;}const el=root();if(typeof MutationObserver==='undefined'||!el)return false;lastOpen=open(el);observer=new MutationObserver(schedule);observer.observe(el,{attributes:true,attributeFilter:['class']});schedule();return true;}
function bind(){if(bound)return false;bound=true;document.addEventListener('keydown',onKey,true);ensureStyle();observe();return true;}
function cleanup(){if(observer){observer.disconnect();observer=null;}if(bound){document.removeEventListener('keydown',onKey,true);bound=false;}if(raf){cancelAnimationFrame(raf);raf=0;}returnFocus=null;lastOpen=false;}
bind();window.addEventListener('pagehide',cleanup,{passive:true});window.addEventListener('pageshow',bind,{passive:true});
window.NOREYO_V908=Object.freeze({BUILD,STYLE_ID,root,open,ensureStyle,controls,enhance,restoreFocus,close,onKey,sync,schedule,observe,bind,cleanup});
})();
