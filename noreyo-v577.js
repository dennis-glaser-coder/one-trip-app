(function(){
'use strict';
const BUILD='5.77';
let locked=false,lockedY=0,snapshot=null,active=null;
function target(){return document.querySelector('#noreyoFilter557.show .noreyo-v557-sheet,.noreyo-v552-sheet-backdrop .noreyo-v552-sheet');}
function snap(){const s=document.body.style;return{position:s.position,top:s.top,left:s.left,right:s.right,width:s.width,overflow:s.overflow};}
function restore(){if(!snapshot)return;const s=document.body.style;Object.assign(s,snapshot);snapshot=null;}
function lock(){if(locked||!document.body)return;locked=true;lockedY=Math.max(0,window.scrollY||window.pageYOffset||0);snapshot=snap();const s=document.body.style;s.position='fixed';s.top=`-${lockedY}px`;s.left='0';s.right='0';s.width='100%';s.overflow='hidden';}
function unlock(sync=false){if(!locked)return;const y=lockedY;locked=false;lockedY=0;restore();const run=()=>{try{window.scrollTo({top:y,left:0,behavior:'auto'});}catch(_){window.scrollTo(0,y);}};sync?run():requestAnimationFrame(run);}
function sync(){const next=target();if(next===active)return;active=next;if(next)lock();else unlock(false);}
function pagehide(){active=null;unlock(true);}
function install(){sync();if(typeof MutationObserver!=='undefined')new MutationObserver(sync).observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});window.addEventListener('pagehide',pagehide,{passive:true});window.addEventListener('pageshow',sync,{passive:true});}
window.NOREYO_V577=Object.freeze({BUILD,target,lock,unlock,sync});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();
