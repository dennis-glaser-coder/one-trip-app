(function(){
  'use strict';

  let modalLocked=false;
  let lockedScrollY=0;
  let previousBodyStyle=null;
  let bodyObserver=null;

  function snapshotBodyStyle(){
    const s=document.body.style;
    return {
      position:s.position,
      top:s.top,
      left:s.left,
      right:s.right,
      width:s.width,
      overflow:s.overflow
    };
  }

  function restoreBodyStyle(snapshot){
    if(!snapshot)return;
    const s=document.body.style;
    s.position=snapshot.position;
    s.top=snapshot.top;
    s.left=snapshot.left;
    s.right=snapshot.right;
    s.width=snapshot.width;
    s.overflow=snapshot.overflow;
  }

  function lockScroll(){
    if(modalLocked||!document.body)return;
    modalLocked=true;
    lockedScrollY=Math.max(0,window.scrollY||window.pageYOffset||0);
    previousBodyStyle=snapshotBodyStyle();
    const s=document.body.style;
    s.position='fixed';
    s.top=`-${lockedScrollY}px`;
    s.left='0';
    s.right='0';
    s.width='100%';
    s.overflow='hidden';
    document.documentElement.style.setProperty('--noreyo-modal-scroll-y',`${lockedScrollY}px`);
  }

  function unlockScroll(){
    if(!modalLocked||!document.body)return;
    modalLocked=false;
    const y=lockedScrollY;
    restoreBodyStyle(previousBodyStyle);
    previousBodyStyle=null;
    lockedScrollY=0;
    requestAnimationFrame(()=>{
      try{window.scrollTo({top:y,left:0,behavior:'auto'});}
      catch{window.scrollTo(0,y);}
    });
  }

  function syncScrollLock(){
    if(!document.body)return;
    if(document.body.classList.contains('noreyo-modal-open'))lockScroll();
    else unlockScroll();
  }

  function installScrollLock(){
    if(!document.body||typeof MutationObserver==='undefined')return;
    bodyObserver=new MutationObserver(syncScrollLock);
    bodyObserver.observe(document.body,{attributes:true,attributeFilter:['class']});
    syncScrollLock();
  }

  function recoverAfterPageShow(event){
    // BFCache can restore stale inline fixed-body styles without a live planner.
    const modal=document.querySelector('.planner-sheet.show,.sheet.show,[role="dialog"].show');
    if(!modal&&document.body?.classList.contains('noreyo-modal-open')){
      document.body.classList.remove('noreyo-modal-open');
    }
    syncScrollLock();
  }

  function cleanupBeforePageHide(){
    // Avoid persisting a fixed body offset into Safari BFCache.
    if(modalLocked)unlockScroll();
  }

  function install(){
    installScrollLock();
    window.addEventListener('pageshow',recoverAfterPageShow,{passive:true});
    window.addEventListener('pagehide',cleanupBeforePageHide,{passive:true});
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});
  else install();
})();