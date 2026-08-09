(function(){
  let plannerScrollY=0;
  let plannerLocked=false;
  let vvTimer=0;

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

    const keyboardOpen=document.activeElement?.matches?.('#plannerSheet .planner-search input')||m.height<(window.innerHeight||m.height)-100;
    document.body.classList.toggle('noreyo-planner-keyboard',!!keyboardOpen);

    const body=document.getElementById('plannerBody');
    if(keyboardOpen&&body){
      clearTimeout(vvTimer);
      vvTimer=setTimeout(()=>{body.scrollTop=0;},30);
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
    requestAnimationFrame(()=>window.scrollTo(0,plannerScrollY));
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
    if(typeof openPlanner==='function'&&!openPlanner.__noreyo545){
      const baseOpen=openPlanner;
      const wrapped=function(mode){
        const r=baseOpen.apply(this,arguments);
        if(mode==='destination'){
          requestAnimationFrame(()=>{stabilizeDestinationSheet();requestAnimationFrame(stabilizeDestinationSheet);});
          setTimeout(stabilizeDestinationSheet,80);
        }
        return r;
      };
      wrapped.__noreyo545=true;
      openPlanner=wrapped;
    }

    if(typeof closePlanner==='function'&&!closePlanner.__noreyo545){
      const baseClose=closePlanner;
      const wrapped=function(){const r=baseClose.apply(this,arguments);unlockPlannerPage();return r;};
      wrapped.__noreyo545=true;
      closePlanner=wrapped;
    }

    if(typeof chooseDestination==='function'&&!chooseDestination.__noreyo545){
      const baseChoose=chooseDestination;
      const wrapped=function(){const r=baseChoose.apply(this,arguments);unlockPlannerPage();return r;};
      wrapped.__noreyo545=true;
      chooseDestination=wrapped;
    }
  }

  document.addEventListener('focusin',e=>{
    const input=e.target?.closest?.('#plannerSheet .planner-search input');
    if(!input||!destinationOpen())return;
    document.body.classList.add('noreyo-planner-keyboard');
    syncVisualViewport();

    /* Important on iOS: do NOT call scrollIntoView here. Safari would pan the
       visual viewport again and move the complete bottom sheet. */
    const body=document.getElementById('plannerBody');
    requestAnimationFrame(()=>{if(body)body.scrollTop=0;syncVisualViewport();});
    setTimeout(()=>{if(body)body.scrollTop=0;syncVisualViewport();},80);
    setTimeout(()=>{if(body)body.scrollTop=0;syncVisualViewport();},260);
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

  const onViewportChange=()=>{
    syncVisualViewport();
    if(destinationOpen()&&document.activeElement?.closest?.('#plannerSheet .planner-search input')){
      const body=document.getElementById('plannerBody');
      if(body)body.scrollTop=0;
    }
  };

  window.visualViewport?.addEventListener('resize',onViewportChange);
  window.visualViewport?.addEventListener('scroll',onViewportChange);
  window.addEventListener('resize',onViewportChange);
  window.addEventListener('pageshow',()=>{installPlannerHooks();syncVisualViewport();});

  installPlannerHooks();
  syncVisualViewport();
  setTimeout(installPlannerHooks,120);
})();