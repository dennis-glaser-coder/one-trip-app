/* NOREYO V8.02 — filter-sheet scroll-lock handoff.
   If the filter opens while another modal (AI sheet) owns the body lock, it
   waits and automatically acquires its own lock as soon as that owner closes. */
(function(){
'use strict';
const BUILD='8.02';
let sheetObserver=null,bodyObserver=null,locked=false,scrollY=0,returnFocus=null,saved=null,bound=false;
function sheet(){return document.getElementById('noreyoFilter557');}
function isOpen(){return !!sheet()?.classList.contains('show');}
function externalLock(){const b=document.body;if(!b)return false;return b.classList.contains('noreyo-v556-lock')||b.classList.contains('noreyo-v730-filter-lock');}
function saveBody(){const s=document.body?.style;if(!s)return null;return{position:s.position,top:s.top,left:s.left,right:s.right,width:s.width,overflow:s.overflow};}
function restoreBody(snapshot){const s=document.body?.style;if(!s||!snapshot)return;s.position=snapshot.position;s.top=snapshot.top;s.left=snapshot.left;s.right=snapshot.right;s.width=snapshot.width;s.overflow=snapshot.overflow;}
function lock(){if(locked||!isOpen()||!document.body)return false;if(externalLock())return false;locked=true;scrollY=window.scrollY||window.pageYOffset||0;returnFocus=document.activeElement&&document.activeElement!==document.body?document.activeElement:null;saved=saveBody();const s=document.body.style;s.position='fixed';s.top=(-scrollY)+'px';s.left='0';s.right='0';s.width='100%';s.overflow='hidden';document.body.classList.add('noreyo-v802-filter-lock');requestAnimationFrame(()=>{try{sheet()?.querySelector('.noreyo-v557-close')?.focus?.({preventScroll:true});}catch(_){}});return true;}
function unlock({restoreScroll=true,focus=true}={}){if(!locked)return false;locked=false;document.body?.classList.remove('noreyo-v802-filter-lock');restoreBody(saved);saved=null;if(restoreScroll)try{window.scrollTo(0,scrollY);}catch(_){}if(focus&&returnFocus?.isConnected)try{returnFocus.focus({preventScroll:true});}catch(_){}returnFocus=null;return true;}
function sync(){if(isOpen()){if(!locked)lock();}else unlock();}
function onKey(e){if(e.key!=='Escape'||!isOpen())return;e.preventDefault();e.stopPropagation();sheet()?.querySelector('.noreyo-v557-close')?.click?.();}
function observeSheet(){const w=sheet();if(sheetObserver){sheetObserver.disconnect();sheetObserver=null;}if(!w||typeof MutationObserver==='undefined')return false;sheetObserver=new MutationObserver(records=>{if(records.some(r=>r.type==='attributes'&&r.attributeName==='class'))sync();});sheetObserver.observe(w,{attributes:true,attributeFilter:['class']});sync();return true;}
function observeBody(){if(bodyObserver){bodyObserver.disconnect();bodyObserver=null;}if(typeof MutationObserver==='undefined'||!document.body)return false;bodyObserver=new MutationObserver(records=>{if(records.some(r=>r.type==='attributes'&&r.attributeName==='class'))sync();if(!sheet()&&records.some(r=>r.type==='childList'))return;if(sheet()&&!sheetObserver)observeSheet();});bodyObserver.observe(document.body,{attributes:true,attributeFilter:['class'],childList:true,subtree:true});return true;}
function install(){if(!bound){bound=true;document.addEventListener('keydown',onKey,true);}observeBody();observeSheet();return true;}
function cleanup(){if(sheetObserver){sheetObserver.disconnect();sheetObserver=null;}if(bodyObserver){bodyObserver.disconnect();bodyObserver=null;}if(bound){document.removeEventListener('keydown',onKey,true);bound=false;}unlock({restoreScroll:false,focus:false});}
install();window.addEventListener('pagehide',cleanup,{passive:true});window.addEventListener('pageshow',install,{passive:true});
window.NOREYO_V802=Object.freeze({BUILD,sheet,isOpen,externalLock,saveBody,restoreBody,lock,unlock,sync,observeSheet,observeBody,install,cleanup,get locked(){return locked;},get scrollY(){return scrollY;}});
})();