(function(){
  let applying=false;
  let scheduled=false;

  function cleanInteractiveLayer(hero){
    hero.classList.remove('noreyo-interactive-hero');
    hero.querySelectorAll('.noreyo-priority-live,.noreyo-usp-strip,.noreyo-firstscreen-logic,.noreyo-firstscreen-note').forEach(el=>el.remove());
  }

  function addAction(hero,discover){
    let action=hero.querySelector('.noreyo-v539-action');
    if(!action){
      action=document.createElement('div');
      action.className='noreyo-v539-action';
      action.innerHTML='<button type="button" class="noreyo-v539-cta">Meine Reise finden →</button><div class="noreyo-v539-proof"><span><b>MUSS</b> wird geprüft · <b>WUNSCH</b> rankt · <b>WARUM</b> wird erklärt</span></div>';
      hero.appendChild(action);
    }
    const btn=action.querySelector('.noreyo-v539-cta');
    if(btn&&!btn.dataset.bound){
      btn.dataset.bound='1';
      btn.addEventListener('click',()=>{
        const card=discover.querySelector('.search-card');
        if(card){
          card.scrollIntoView({behavior:'smooth',block:'start'});
          card.animate([{transform:'scale(1)'},{transform:'scale(1.008)'},{transform:'scale(1)'}],{duration:520,easing:'ease-out'});
        }
      });
    }
  }

  function setText(el,text){if(el&&el.textContent!==text)el.textContent=text;}

  function applyPremiumHero(){
    if(applying)return;
    applying=true;
    try{
      const discover=document.getElementById('discover');if(!discover)return;
      const hero=discover.querySelector('.hero');if(!hero)return;
      const isFlight=typeof productMode!=='undefined'&&productMode==='flight';

      if(isFlight){
        hero.classList.remove('noreyo-v539-hero');
        const action=hero.querySelector('.noreyo-v539-action');if(action)action.remove();
        return;
      }

      cleanInteractiveLayer(hero);
      hero.classList.add('noreyo-v539-hero');

      const signet=hero.querySelector('.hero-signet');
      if(signet&&signet.textContent.trim()!=='NOREYO MATCH')signet.innerHTML='<span></span>NOREYO MATCH';

      const copy=hero.querySelector('.hero-copy');
      if(copy){
        setText(copy.querySelector('.hero-kicker'),'PERSÖNLICH STATT ENDLOS SUCHEN');
        setText(copy.querySelector('h1'),'Nicht 200 Hotels. Die passenden zuerst.');
        setText(copy.querySelector('p'),'Du sagst, was wirklich zählt. NOREYO prüft Pflichtkriterien, rankt deine Wünsche und erklärt jeden Treffer.');
      }

      addAction(hero,discover);

      discover.querySelectorAll('.search-console-head').forEach(head=>{
        setText(head.querySelector('span'),'DEINE REISE');
        setText(head.querySelector('b'),'Ziel, Zeitraum & Reisende festlegen');
      });
    }finally{applying=false;}
  }

  function scheduleApply(){
    if(scheduled)return;
    scheduled=true;
    requestAnimationFrame(()=>{scheduled=false;applyPremiumHero();});
  }

  try{
    if(typeof renderProductControls==='function'){
      const baseControls=renderProductControls;
      renderProductControls=function(){const r=baseControls();scheduleApply();return r;};
    }
    if(typeof updateCounts==='function'){
      const baseCounts=updateCounts;
      updateCounts=function(){const r=baseCounts();scheduleApply();return r;};
    }
    if(typeof go==='function'){
      const baseGo=go;
      go=function(id){const r=baseGo(id);if(id==='discover')scheduleApply();return r;};
    }
  }catch(e){console.warn('NOREYO premium hero hooks',e)}

  const discover=document.getElementById('discover');
  if(discover&&typeof MutationObserver!=='undefined'){
    const observer=new MutationObserver(()=>{if(!applying)scheduleApply();});
    observer.observe(discover,{childList:true,subtree:true,characterData:true});
  }

  applyPremiumHero();
  setTimeout(applyPremiumHero,80);
  setTimeout(applyPremiumHero,220);
  window.addEventListener('pageshow',scheduleApply);
})();
