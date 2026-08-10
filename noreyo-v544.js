(function(){
  'use strict';
  const BUILD='6.11';
  let plannerScrollY=0;
  let plannerLocked=false;

  function destinationOpen(){
    try{return typeof plannerMode!=='undefined'&&plannerMode==='destination'&&document.getElementById('plannerSheet')?.classList.contains('show');}
    catch(_){return false;}
  }

  function viewportMetrics(){
    const vv=window.visualViewport;
    return {
      height:Math.max(260,Math.round(vv?.height||window.innerHeight||700)),
      top:Math.max(0,Math.round(vv?.offsetTop||0)),
      left:Math.max(0,Math.round(vv?.offsetLeft||0))
    };
  }

  function syncVisualViewport(){
    const m=viewportMetrics();
    const root=document.documentElement;
    root.style.setProperty('--noreyo-vv-height',m.height+'px');
    root.style.setProperty('--noreyo-vv-top',m.top+'px');
    root.style.setProperty('--noreyo-vv-left',m.left+'px');
    if(!destinationOpen())return;

    const keyboardOpen=document.activeElement?.matches?.('#plannerSheet .planner-search input')||
      m.height<(window.innerHeight||m.height)-100;
    document.body.classList.toggle('noreyo-planner-keyboard',!!keyboardOpen);
  }

  function lockPlannerPage(){
    if(plannerLocked)return;
    plannerScrollY=Math.max(0,window.scrollY||window.pageYOffset||0);
    plannerLocked=true;
    document.documentElement.classList.add('noreyo-planner-lock');
    document.body.classList.add('noreyo-planner-lock');
    document.body.style.top=(-plannerScrollY)+'px';
    syncVisualViewport();
  }

  function clearPlannerLock(restoreScroll,immediate){
    const wasLocked=plannerLocked;
    plannerLocked=false;
    document.documentElement.classList.remove('noreyo-planner-lock');
    document.body.classList.remove('noreyo-planner-lock','noreyo-planner-keyboard');
    document.body.style.top='';
    document.getElementById('plannerSheet')?.classList.remove('noreyo-destination-sheet');
    if(!restoreScroll||!wasLocked)return;
    if(immediate)window.scrollTo(0,plannerScrollY);
    else requestAnimationFrame(()=>window.scrollTo(0,plannerScrollY));
  }

  function unlockPlannerPage(){clearPlannerLock(true,false);}

  function stabilizeDestinationSheet(){
    if(!destinationOpen())return;
    lockPlannerPage();
    const sheet=document.getElementById('plannerSheet');
    const body=document.getElementById('plannerBody');
    if(sheet)sheet.classList.add('noreyo-destination-sheet');
    if(body){body.scrollTop=0;body.scrollLeft=0;}
    syncVisualViewport();
  }

  function installPlannerHooks(){
    if(typeof openPlanner==='function'&&!openPlanner.__noreyo611){
      const baseOpen=openPlanner;
      const wrapped=function(mode){
        const r=baseOpen.apply(this,arguments);
        if(mode==='destination'){
          requestAnimationFrame(()=>{stabilizeDestinationSheet();requestAnimationFrame(stabilizeDestinationSheet);});
          setTimeout(stabilizeDestinationSheet,80);
        }
        return r;
      };
      wrapped.__noreyo611=true;
      openPlanner=wrapped;
    }

    if(typeof closePlanner==='function'&&!closePlanner.__noreyo611){
      const baseClose=closePlanner;
      const wrapped=function(){const r=baseClose.apply(this,arguments);unlockPlannerPage();return r;};
      wrapped.__noreyo611=true;
      closePlanner=wrapped;
    }

    if(typeof chooseDestination==='function'&&!chooseDestination.__noreyo611){
      const baseChoose=chooseDestination;
      const wrapped=function(){const r=baseChoose.apply(this,arguments);unlockPlannerPage();return r;};
      wrapped.__noreyo611=true;
      chooseDestination=wrapped;
    }
  }

  document.addEventListener('focusin',e=>{
    const input=e.target?.closest?.('#plannerSheet .planner-search input');
    if(!input||!destinationOpen())return;
    document.body.classList.add('noreyo-planner-keyboard');
    syncVisualViewport();
    const body=document.getElementById('plannerBody');
    requestAnimationFrame(()=>{if(body)body.scrollTop=0;syncVisualViewport();});
    setTimeout(()=>{if(body&&body.scrollTop<24)body.scrollTop=0;syncVisualViewport();},80);
  },true);

  document.addEventListener('focusout',e=>{
    if(!e.target?.closest?.('#plannerSheet .planner-search input'))return;
    setTimeout(()=>{
      if(!document.activeElement?.closest?.('#plannerSheet .planner-search input')){
        document.body.classList.remove('noreyo-planner-keyboard');
        syncVisualViewport();
      }
    },80);
  },true);

  const onViewportChange=()=>{syncVisualViewport();};

  window.visualViewport?.addEventListener('resize',onViewportChange);
  window.visualViewport?.addEventListener('scroll',onViewportChange);
  window.addEventListener('resize',onViewportChange);
  window.addEventListener('pagehide',()=>{clearPlannerLock(true,true);},{passive:true});
  window.addEventListener('pageshow',()=>{
    installPlannerHooks();
    if(destinationOpen())requestAnimationFrame(stabilizeDestinationSheet);
    else clearPlannerLock(false,true);
    syncVisualViewport();
  },{passive:true});

  installPlannerHooks();
  syncVisualViewport();
  setTimeout(installPlannerHooks,120);
  window.NOREYO_V544=Object.freeze({BUILD,destinationOpen,stabilizeDestinationSheet,clearPlannerLock});
})();