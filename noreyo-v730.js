/* NOREYO V7.30 — iPhone filter-sheet scroll/focus lifecycle.
   Locks background scrolling while the smart filter sheet is open, restores
   the exact prior body styles/scroll position on close, and supports Escape. */
(function(){
'use strict';
const BUILD='7.30';
let observer=null,locked=false,scrollY=0,returnFocus=null,saved=null,bound=false;
function sheet(){return document.getElementById('noreyoFilter557');}
function isOpen(){return !!sheet()?.classList.contains('show');}
function saveBody(){const s=document.body?.style;if(!s)return null;return{position:s.position,top:s.top,left:s.left,right:s.right,width:s.width,overflow:s.overflow};}
function restoreBody(snapshot){const s=document.body?.style;if(!s||!snapshot)return;s.position=snapshot.position;s.top=snapshot.top;s.left=snapshot.left;s.right=snapshot.right;s.width=snapshot.width;s.overflow=snapshot.overflow;}
function lock(){if(locked||!isOpen()||!document.body)return false;if(document.body.classList.contains('noreyo-v556-lock'))return false;locked=true;scrollY=window.scrollY||window.pageYOffset||0;returnFocus=document.activeElement&&document.activeElement!==document.body?document.activeElement:null;saved=saveBody();const s=document.body.style;s.position='fixed';s.top=(-scrollY)+'px';s.left='0';s.right='0';s.width='100%';s.overflow='hidden';document.body.classList.add('noreyo-v730-filter-lock');requestAnimationFrame(()=>{try{sheet()?.querySelector('.noreyo-v557-close')?.focus?.({preventScroll:true});}catch(_){}});return true;}
function unlock({restoreScroll=true,focus=true}={}){if(!locked)return false;locked=false;document.body?.classList.remove('noreyo-v730-filter-lock');restoreBody(saved);saved=null;if(restoreScroll)try{window.scrollTo(0,scrollY);}catch(_){}if(focus&&returnFocus?.isConnected)try{returnFocus.focus({preventScroll:true});}catch(_){}returnFocus=null;return true;}
function sync(){if(isOpen())lock();else unlock();}
function onKey(e){if(e.key!=='Escape'||!isOpen())return;e.preventDefault();e.stopPropagation();sheet()?.querySelector('.noreyo-v557-close')?.click?.();}
function observe(){const w=sheet();if(observer){observer.disconnect();observer=null;}if(!w||typeof MutationObserver==='undefined')return false;observer=new MutationObserver(records=>{if(records.some(r=>r.type==='attributes'&&r.attributeName==='class'))sync();});observer.observe(w,{attributes:true,attributeFilter:['class']});sync();return true;}
function install(){if(!bound){bound=true;document.addEventListener('keydown',onKey,true);}if(observe())return true;if(typeof MutationObserver!=='undefined'&&document.body){observer=new MutationObserver(()=>{if(sheet())observe();});observer.observe(document.body,{childList:true,subtree:true});}return false;}
function cleanup(){if(observer){observer.disconnect();observer=null;}if(bound){document.removeEventListener('keydown',onKey,true);bound=false;}unlock({restoreScroll:false,focus:false});}
install();window.addEventListener('pagehide',cleanup,{passive:true});window.addEventListener('pageshow',install,{passive:true});
window.NOREYO_V730=Object.freeze({BUILD,sheet,isOpen,saveBody,restoreBody,lock,unlock,sync,observe,install,cleanup,get locked(){return locked;},get scrollY(){return scrollY;}});
})();