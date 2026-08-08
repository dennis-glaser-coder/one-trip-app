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

  function findNativeSearchButton(card){
    const buttons=[...card.querySelectorAll('button')].filter(b=>!b.classList.contains('noreyo-v541-booking-cta'));
    const exact=buttons.find(b=>/reise.*(finden|suchen)|angebote.*(finden|suchen)|jetzt.*suchen|suchen/i.test((b.textContent||'').trim())&&!/muss|wunsch/i.test((b.textContent||'').trim()));
    if(exact)return exact;
    return buttons.find(b=>b.classList.contains('dark-btn')||b.classList.contains('primary-btn')||b.classList.contains('search-btn'))||null;
  }

  function ensureBookingCTA(card){
    if(!card)return;
    let btn=card.querySelector('.noreyo-v541-booking-cta');
    if(!btn){
      btn=document.createElement('button');
      btn.type='button';
      btn.className='noreyo-v541-booking-cta';
      btn.innerHTML='<span>Passende Reisen finden</span><span aria-hidden="true">→</span>';
      const grid=card.querySelector('.booking-command-grid');
      const host=grid?.parentElement||card;
      if(grid&&grid.nextSibling)host.insertBefore(btn,grid.nextSibling);else host.appendChild(btn);
      const note=document.createElement('div');
      note.className='noreyo-v541-search-note';
      note.innerHTML='<i></i><span>Deine Prioritäten legst du direkt im nächsten Schritt fest.</span>';
      btn.insertAdjacentElement('afterend',note);
    }
    if(!btn.dataset.bound){
      btn.dataset.bound='1';
      btn.addEventListener('click',()=>{
        const native=findNativeSearchButton(card);
        if(native){native.click();return;}
        const bottom=card.lastElementChild||card;
        bottom.scrollIntoView({behavior:'smooth',block:'center'});
      });
    }
  }

  function enforce(){
    if(lock)return;
    lock=true;
    try{
      const discover=document.getElementById('discover');if(!discover)return;
      const hero=discover.querySelector('.hero');if(!hero)return;
      const isFlight=typeof productMode!=='undefined'&&productMode==='flight';
      if(isFlight){
        hero.classList.remove('noreyo-v541-hero');
        hero.querySelector('.noreyo-v541-trust')?.remove();
        return;
      }

      cleanHero(hero);
      const signet=hero.querySelector('.hero-signet');
      if(signet&&signet.textContent.trim()!=='NOREYO MATCH')signet.innerHTML='<span></span>NOREYO MATCH';
      const copy=hero.querySelector('.hero-copy');
      if(copy){
        setText(copy.querySelector('.hero-kicker'),'TRAVEL MADE FOR YOU');
        setText(copy.querySelector('h1'),'Dein Urlaub. Nach deinen Regeln.');
        setText(copy.querySelector('p'),'Sag uns, was wirklich zählt. NOREYO zeigt dir zuerst die Reisen, die wirklich zu dir passen.');
      }

      discover.querySelectorAll('.search-console-head').forEach(head=>{
        setText(head.querySelector('span'),'DEINE REISE');
        setText(head.querySelector('b'),'Ziel, Zeitraum & Reisende festlegen');
      });
      const card=discover.querySelector('.search-card');
      ensureBookingCTA(card);
    }finally{lock=false;}
  }

  function schedule(){if(raf)return;raf=requestAnimationFrame(()=>{raf=0;enforce();});}
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
      go=function(id){const r=baseGo(id);if(id==='discover')schedule();return r;};
    }
  }catch(e){console.warn('NOREYO V5.41 hooks',e)}

  enforce();
  setTimeout(enforce,80);setTimeout(enforce,220);
  const discover=document.getElementById('discover');
  if(discover&&typeof MutationObserver!=='undefined')new MutationObserver(()=>{if(!lock)schedule();}).observe(discover,{childList:true,subtree:true});
  window.addEventListener('pageshow',schedule);
})();
