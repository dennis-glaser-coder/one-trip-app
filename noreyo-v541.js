(function(){
  let lock=false,raf=0;

  function setText(el,text){if(el&&el.textContent!==text)el.textContent=text;}

  function trustMarkup(){
    return '<div class="noreyo-v541-trust" aria-label="NOREYO Vorteile"><span><i>✓</i>Live-Preisprüfung</span><span><i>✓</i>Pflichtfilter</span><span><i>✓</i>Match erklärt</span></div>';
  }

  function cleanHero(hero){
    hero.classList.remove('noreyo-interactive-hero','noreyo-v539-hero','noreyo-v540-hero');
    hero.classList.add('noreyo-v541-hero');
    hero.querySelectorAll('.noreyo-priority-live,.noreyo-usp-strip,.noreyo-firstscreen-logic,.noreyo-firstscreen-note,.noreyo-v539-action,.noreyo-v540-action').forEach(el=>el.remove());
    let trust=hero.querySelector('.noreyo-v541-trust');
    if(!trust){hero.insertAdjacentHTML('beforeend',trustMarkup());trust=hero.querySelector('.noreyo-v541-trust');}
    return trust;
  }

  function productModeValue(){
    try{return typeof productMode!=='undefined'?productMode:'package';}catch{return 'package';}
  }

  function bookingCtaLabel(){
    const mode=productModeValue();
    if(mode==='hotel')return 'Live-Hotels finden';
    if(mode==='flight')return 'Live-Flüge finden';
    return 'Pauschalreise suchen';
  }

  function findNativeSearchButton(card){
    const buttons=[...card.querySelectorAll('button')].filter(b=>!b.classList.contains('noreyo-v541-booking-cta'));
    const exact=buttons.find(b=>/reise.*(finden|suchen)|angebote.*(finden|suchen)|jetzt.*suchen|suchen/i.test((b.textContent||'').trim())&&!/muss|wunsch/i.test((b.textContent||'').trim()));
    if(exact)return exact;
    return buttons.find(b=>b.classList.contains('dark-btn')||b.classList.contains('primary-btn')||b.classList.contains('search-btn'))||null;
  }

  function placeBookingCTA(card,btn){
    const grid=card.querySelector('.booking-command-grid');
    if(!grid){
      if(btn.parentElement!==card)card.appendChild(btn);
      return;
    }
    const cells=[...grid.children].filter(el=>el.classList&&el.classList.contains('command-cell'));
    if(cells.length>=4){
      const fourth=cells[3];
      if(fourth.nextElementSibling!==btn)fourth.insertAdjacentElement('afterend',btn);
    }else if(btn.parentElement!==grid){
      grid.appendChild(btn);
    }
  }

  function ensureBookingCTA(card){
    if(!card)return;
    card.querySelectorAll('.noreyo-v541-search-note').forEach(el=>el.remove());
    let btn=card.querySelector('.noreyo-v541-booking-cta');
    if(!btn){
      btn=document.createElement('button');
      btn.type='button';
      btn.className='noreyo-v541-booking-cta';
    }
    placeBookingCTA(card,btn);
    btn.innerHTML=`<span>${bookingCtaLabel()}</span><span aria-hidden="true">→</span>`;
    if(!btn.dataset.bound){
      btn.dataset.bound='1';
      btn.addEventListener('click',()=>{
        const native=findNativeSearchButton(card);
        if(native){native.click();return;}
        const bottom=card.lastElementChild||card;
        bottom.scrollIntoView({behavior:reduceMotion()?'auto':'smooth',block:'center'});
      });
    }
  }

  function reduceMotion(){
    return !!window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
  }

  function enforce(){
    if(lock)return;
    lock=true;
    try{
      const discover=document.getElementById('discover');if(!discover)return;
      const hero=discover.querySelector('.hero');if(!hero)return;
      const isFlight=productModeValue()==='flight';
      if(isFlight){
        hero.classList.remove('noreyo-v541-hero');
        hero.querySelector('.noreyo-v541-trust')?.remove();
      }else{
        cleanHero(hero);
        const signet=hero.querySelector('.hero-signet');
        if(signet&&signet.textContent.trim()!=='NOREYO MATCH')signet.innerHTML='<span></span>NOREYO MATCH';
        const copy=hero.querySelector('.hero-copy');
        if(copy){
          setText(copy.querySelector('.hero-kicker'),'TRAVEL MADE FOR YOU');
          setText(copy.querySelector('h1'),'Dein Urlaub. Nach deinen Regeln.');
          setText(copy.querySelector('p'),'Sag uns, was wirklich zählt. NOREYO zeigt dir zuerst die Reisen, die wirklich zu dir passen.');
        }
      }

      discover.querySelectorAll('.search-console-head').forEach(head=>{
        setText(head.querySelector('span'),'DEINE REISE');
        setText(head.querySelector('b'),'Ziel, Zeitraum & Reisende festlegen');
      });
      const card=discover.querySelector('.search-card');
      ensureBookingCTA(card);
    }finally{lock=false;}
  }

  function schedule(){if(raf)return;raf=requestAnimationFrame(()=>{raf=0;enforce();syncModalState();});}

  let modalReturnFocus=null;
  let activeModal=null;
  let modalObserver=null;

  function focusable(root){
    return [...root.querySelectorAll('button:not([disabled]),a[href],input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])')]
      .filter(el=>!el.hidden&&el.getClientRects().length!==0);
  }

  function visibleModal(){
    return document.querySelector('.planner-sheet.show,.sheet.show,[role="dialog"].show');
  }

  function modalLabel(modal){
    return (modal.querySelector('h1,h2,h3')?.textContent||'Auswahl').trim();
  }

  function syncModalState(){
    const modal=visibleModal();
    if(modal===activeModal)return;

    if(activeModal&&!modal){
      document.body.classList.remove('noreyo-modal-open');
      document.querySelector('.nav')?.classList.remove('noreyo-modal-hidden');
      activeModal=null;
      const target=modalReturnFocus;
      modalReturnFocus=null;
      if(target&&document.contains(target))setTimeout(()=>target.focus?.({preventScroll:true}),0);
      return;
    }

    if(modal){
      if(!activeModal)modalReturnFocus=document.activeElement instanceof HTMLElement?document.activeElement:null;
      activeModal=modal;
      document.body.classList.add('noreyo-modal-open');
      document.querySelector('.nav')?.classList.add('noreyo-modal-hidden');
      modal.setAttribute('role','dialog');
      modal.setAttribute('aria-modal','true');
      if(!modal.getAttribute('aria-label')&&!modal.getAttribute('aria-labelledby'))modal.setAttribute('aria-label',modalLabel(modal));
      const items=focusable(modal);
      if(items.length&&!modal.contains(document.activeElement))setTimeout(()=>items[0].focus?.({preventScroll:true}),0);
    }
  }

  function handleModalKeydown(event){
    const modal=activeModal||visibleModal();
    if(!modal)return;

    if(event.key==='Escape'){
      const close=modal.querySelector('.planner-close,.close,[data-close],button[aria-label*="schließ" i],button[aria-label*="close" i]');
      if(close){event.preventDefault();close.click();}
      return;
    }
    if(event.key!=='Tab')return;
    const items=focusable(modal);if(!items.length)return;
    const first=items[0],last=items[items.length-1];
    if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}
    else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
  }

  function updateVisualViewport(){
    const vv=window.visualViewport;
    const height=Math.max(320,Math.round(vv?.height||window.innerHeight||800));
    document.documentElement.style.setProperty('--noreyo-visual-height',`${height}px`);
    const keyboardOpen=!!vv&&window.innerHeight-vv.height>120;
    document.body.classList.toggle('noreyo-keyboard-open',keyboardOpen);
  }

  function installModalSafety(){
    document.addEventListener('keydown',handleModalKeydown,true);
    updateVisualViewport();
    window.visualViewport?.addEventListener('resize',updateVisualViewport,{passive:true});
    window.visualViewport?.addEventListener('scroll',updateVisualViewport,{passive:true});
    window.addEventListener('orientationchange',()=>setTimeout(updateVisualViewport,60),{passive:true});
    modalObserver=new MutationObserver(syncModalState);
    modalObserver.observe(document.body,{subtree:true,attributes:true,attributeFilter:['class'],childList:true});
    syncModalState();
  }

  try{
    if(typeof renderProductControls==='function'){
      const baseControls=renderProductControls;
      renderProductControls=function(){const r=baseControls();schedule();return r;};
    }
    if(typeof updateCounts==='function'){
      const baseCounts=updateCounts;
      updateCounts=function(){const r=baseCounts();schedule();return r;};
    }
    if(typeof go==='function'){
      const baseGo=go;
      go=function(id){const r=baseGo(id);if(id==='discover')schedule();syncModalState();return r;};
    }
  }catch(e){console.warn('NOREYO V5.68 hooks',e)}

  enforce();
  installModalSafety();
  setTimeout(enforce,80);setTimeout(enforce,220);
  const discover=document.getElementById('discover');
  if(discover&&typeof MutationObserver!=='undefined')new MutationObserver(()=>{if(!lock)schedule();}).observe(discover,{childList:true,subtree:true});
  window.addEventListener('pageshow',()=>{updateVisualViewport();schedule();});
})();
