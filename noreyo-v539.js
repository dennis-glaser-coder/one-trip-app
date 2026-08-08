(function(){
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

  function applyPremiumHero(){
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
    if(signet)signet.innerHTML='<span></span>NOREYO MATCH';

    const copy=hero.querySelector('.hero-copy');
    if(copy){
      const kicker=copy.querySelector('.hero-kicker');
      const title=copy.querySelector('h1');
      const lead=copy.querySelector('p');
      if(kicker)kicker.textContent='PERSÖNLICH STATT ENDLOS SUCHEN';
      if(title)title.textContent='Nicht 200 Hotels. Die passenden zuerst.';
      if(lead)lead.textContent='Du entscheidest: Muss oder Wunsch. NOREYO prüft deine Prioritäten, rankt die Treffer und zeigt dir sofort, warum ein Hotel passt.';
    }

    addAction(hero,discover);

    discover.querySelectorAll('.search-console-head').forEach(head=>{
      const label=head.querySelector('span');
      const title=head.querySelector('b');
      if(label)label.textContent='DEINE REISE';
      if(title)title.textContent='Ziel, Zeitraum & Reisende festlegen';
    });
  }

  try{
    if(typeof renderProductControls==='function'){
      const baseControls=renderProductControls;
      renderProductControls=function(){const r=baseControls();applyPremiumHero();return r;};
    }
    if(typeof updateCounts==='function'){
      const baseCounts=updateCounts;
      updateCounts=function(){const r=baseCounts();applyPremiumHero();return r;};
    }
    if(typeof go==='function'){
      const baseGo=go;
      go=function(id){const r=baseGo(id);if(id==='discover')setTimeout(applyPremiumHero,0);return r;};
    }
  }catch(e){console.warn('NOREYO V5.39 hooks',e)}

  applyPremiumHero();
  setTimeout(applyPremiumHero,120);
  window.addEventListener('pageshow',applyPremiumHero);
})();
