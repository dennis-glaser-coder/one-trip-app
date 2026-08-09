(function(){
  let plannerScrollY=0;
  let plannerLocked=false;
  let vvTimer=0;

  function destinationOpen(){
    try{return typeof plannerMode!=='undefined'&&plannerMode==='destination'&&document.getElementById('plannerSheet')?.classList.contains('show');}
    catch(_){return false;}
  }

  function syncVisualViewport(){
    const vv=window.visualViewport;
    const h=Math.max(280,Math.round(vv?.height||window.innerHeight||700));
    document.documentElement.style.setProperty('--noreyo-vv-height',h+'px');
    if(!destinationOpen())return;
    const body=document.getElementById('plannerBody');
    const sheet=document.getElementById('plannerSheet');
    if(body&&document.activeElement?.closest?.('.planner-search')){
      clearTimeout(vvTimer);
      vvTimer=setTimeout(()=>{
        body.scrollTop=0;
        if(sheet)sheet.scrollTop=0;
        window.scrollTo(0,plannerScrollY);
      },35);
    }
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

  function unlockPlannerPage(){
    if(!plannerLocked)return;
    plannerLocked=false;
    document.documentElement.classList.remove('noreyo-planner-lock');
    document.body.classList.remove('noreyo-planner-lock','noreyo-planner-keyboard');
    document.body.style.top='';
    document.getElementById('plannerSheet')?.classList.remove('noreyo-destination-sheet');
    window.scrollTo(0,plannerScrollY);
  }

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
    if(typeof openPlanner==='function'&&!openPlanner.__noreyo544){
      const baseOpen=openPlanner;
      const wrapped=function(mode){
        const r=baseOpen.apply(this,arguments);
        if(mode==='destination'){
          requestAnimationFrame(()=>{stabilizeDestinationSheet();requestAnimationFrame(stabilizeDestinationSheet);});
          setTimeout(stabilizeDestinationSheet,90);
        }
        return r;
      };
      wrapped.__noreyo544=true;
      openPlanner=wrapped;
    }

    if(typeof closePlanner==='function'&&!closePlanner.__noreyo544){
      const baseClose=closePlanner;
      const wrapped=function(){
        const r=baseClose.apply(this,arguments);
        unlockPlannerPage();
        return r;
      };
      wrapped.__noreyo544=true;
      closePlanner=wrapped;
    }

    if(typeof chooseDestination==='function'&&!chooseDestination.__noreyo544){
      const baseChoose=chooseDestination;
      const wrapped=function(){
        const r=baseChoose.apply(this,arguments);
        unlockPlannerPage();
        return r;
      };
      wrapped.__noreyo544=true;
      chooseDestination=wrapped;
    }
  }

  document.addEventListener('focusin',e=>{
    const input=e.target?.closest?.('#plannerSheet .planner-search input');
    if(!input||!destinationOpen())return;
    document.body.classList.add('noreyo-planner-keyboard');
    syncVisualViewport();
    const body=document.getElementById('plannerBody');
    requestAnimationFrame(()=>{
      if(body)body.scrollTop=0;
      window.scrollTo(0,plannerScrollY);
      try{input.scrollIntoView({block:'start',inline:'nearest',behavior:'instant'});}catch(_){input.scrollIntoView(true);}
      if(body)body.scrollTop=0;
    });
    setTimeout(()=>{if(body)body.scrollTop=0;syncVisualViewport();},120);
  },true);

  document.addEventListener('focusout',e=>{
    if(!e.target?.closest?.('#plannerSheet .planner-search input'))return;
    setTimeout(()=>{if(!document.activeElement?.closest?.('#plannerSheet .planner-search input'))document.body.classList.remove('noreyo-planner-keyboard');},30);
  },true);

  window.visualViewport?.addEventListener('resize',syncVisualViewport);
  window.visualViewport?.addEventListener('scroll',syncVisualViewport);
  window.addEventListener('resize',syncVisualViewport);
  window.addEventListener('pageshow',()=>{installPlannerHooks();syncVisualViewport();});

  installPlannerHooks();
  syncVisualViewport();
  setTimeout(installPlannerHooks,120);
})();
