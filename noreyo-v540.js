(function(){
  let lock=false,raf=0;
  const texts={
    signet:'NOREYO MATCH',
    kicker:'PERSÖNLICH STATT ENDLOS SUCHEN',
    title:'Nicht 200 Hotels. Die passenden zuerst.',
    lead:'Du sagst, was wirklich zählt. NOREYO prüft Pflichtkriterien, rankt deine Wünsche und erklärt jeden Treffer.'
  };

  function setText(el,text){if(el&&el.textContent!==text)el.textContent=text;}
  function ensureAction(hero,discover){
    hero.querySelectorAll('.noreyo-v539-action').forEach(el=>el.remove());
    let action=hero.querySelector('.noreyo-v540-action');
    if(!action){
      action=document.createElement('div');
      action.className='noreyo-v540-action';
      action.innerHTML='<button type="button" class="noreyo-v540-cta">Meine Reise finden →</button><div class="noreyo-v540-proof"><span><b>MUSS</b> wird geprüft · <b>WUNSCH</b> rankt · <b>WARUM</b> wird erklärt</span></div>';
      hero.appendChild(action);
    }
    const btn=action.querySelector('.noreyo-v540-cta');
    if(btn&&!btn.dataset.bound){
      btn.dataset.bound='1';
      btn.addEventListener('click',()=>{
        const card=discover.querySelector('.search-card');
        if(card)card.scrollIntoView({behavior:'smooth',block:'start'});
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
      if(isFlight){hero.classList.remove('noreyo-v540-hero');return;}

      hero.classList.remove('noreyo-interactive-hero','noreyo-v539-hero');
      hero.classList.add('noreyo-v540-hero');
      hero.querySelectorAll('.noreyo-priority-live,.noreyo-usp-strip,.noreyo-firstscreen-logic,.noreyo-firstscreen-note').forEach(el=>el.remove());

      const signet=hero.querySelector('.hero-signet');
      if(signet&&signet.textContent.trim()!==texts.signet)signet.innerHTML='<span></span>'+texts.signet;
      const copy=hero.querySelector('.hero-copy');
      if(copy){
        setText(copy.querySelector('.hero-kicker'),texts.kicker);
        setText(copy.querySelector('h1'),texts.title);
        setText(copy.querySelector('p'),texts.lead);
      }
      ensureAction(hero,discover);

      discover.querySelectorAll('.search-console-head').forEach(head=>{
        setText(head.querySelector('span'),'DEINE REISE');
        setText(head.querySelector('b'),'Ziel, Zeitraum & Reisende festlegen');
      });
    }finally{lock=false;}
  }

  function schedule(){if(raf)return;raf=requestAnimationFrame(()=>{raf=0;enforce();});}
  enforce();
  setTimeout(enforce,50);setTimeout(enforce,180);setTimeout(enforce,500);
  const discover=document.getElementById('discover');
  if(discover&&typeof MutationObserver!=='undefined')new MutationObserver(()=>{if(!lock)schedule();}).observe(discover,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:['class']});
  window.addEventListener('pageshow',schedule);
})();
