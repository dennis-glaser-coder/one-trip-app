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
    const buttons=[...card.querySelectorAll('button')].filter(b=>!b.dataset.noreyoSynthetic);
    const byText=buttons.find(b=>{
      const t=(b.textContent||'').replace(/\s+/g,' ').trim();
      return /urlaub\s*finden|reise[n]?\s*(finden|suchen)|angebote?\s*(finden|suchen)|jetzt\s*suchen|^suchen$/i.test(t);
    });
    if(byText)return byText;
    return buttons.find(b=>b.classList.contains('dark-btn')||b.classList.contains('primary-btn')||b.classList.contains('search-btn'))||null;
  }

  function markGridItems(grid){
    const cellItems=[...grid.children].filter(el=>{
      if(!el||!el.classList)return false;
      return el.classList.contains('command-cell')||!!el.querySelector('.command-cell');
    });
    cellItems.forEach((item,index)=>{
      item.classList.remove('noreyo-v541-main-cell','noreyo-v541-extra-cell');
      item.classList.add(index<4?'noreyo-v541-main-cell':'noreyo-v541-extra-cell');
    });
  }

  function adoptNativeBookingCTA(card){
    if(!card)return;
    card.querySelectorAll('.noreyo-v541-search-note').forEach(el=>el.remove());

    /* Remove the temporary extra CTA from the previous build. */
    card.querySelectorAll('.noreyo-v541-booking-cta[data-noreyo-synthetic="1"]').forEach(el=>el.remove());

    let btn=card.querySelector('.noreyo-v541-booking-cta[data-noreyo-native="1"]');
    if(!btn){
      btn=findNativeSearchButton(card);
      if(!btn)return;
      btn.dataset.noreyoNative='1';
      btn.classList.add('noreyo-v541-booking-cta');
    }

    btn.innerHTML='<span>Passende Reisen finden</span><span aria-hidden="true">→</span>';

    const grid=card.querySelector('.booking-command-grid');
    if(!grid)return;
    markGridItems(grid);
    if(btn.parentElement!==grid)grid.appendChild(btn);
    btn.classList.add('noreyo-v541-cta-grid-item');
  }

  function preferenceScore(o){
    if(typeof states==='undefined')return 0;
    const checks=[
      ['Zimmer0',x=>x.confirmed?.balcony===true],
      ['Zimmer1',x=>x.confirmed?.seaView===true],
      ['Zimmer2',x=>x.confirmed?.terrace===true],
      ['Hotel0',x=>Number(x.stars||0)>=4],
      ['Hotel4',x=>x.confirmed?.spa===true],
      ['Hotel5',x=>x.confirmed?.fitness===true],
      ['Hotel6',x=>x.confirmed?.breakfast===true],
      ['Hotel7',x=>x.confirmed?.allInclusive===true],
      ['Preis2',x=>x.refundable===true]
    ];
    let score=0;
    for(const [key,test] of checks){
      const state=states[key]||'any';
      if(state==='any')continue;
      if(test(o))score+=state==='must'?6:2;
    }
    return score;
  }

  function installSoftWishRanking(){
    if(typeof filterAndRankOffers!=='function'||filterAndRankOffers.__noreyoSoftWish)return;
    const prior=filterAndRankOffers;
    const wrapped=function(input){
      if(typeof states==='undefined')return prior(input);
      const wishKeys=Object.keys(states).filter(k=>states[k]==='wish');
      if(!wishKeys.length)return prior(input);

      const saved=wishKeys.map(k=>[k,states[k]]);
      let out;
      try{
        /* WUNSCH must never remove an offer. Only MUSS stays strict. */
        wishKeys.forEach(k=>{states[k]='any';});
        out=prior(input);
      }finally{
        saved.forEach(([k,v])=>{states[k]=v;});
      }

      if(Array.isArray(out)){
        out.sort((a,b)=>{
          const scoreDiff=preferenceScore(b)-preferenceScore(a);
          if(scoreDiff)return scoreDiff;
          const rb=Number(String(b?.rating||0).replace(',','.'))||0;
          const ra=Number(String(a?.rating||0).replace(',','.'))||0;
          if(rb!==ra)return rb-ra;
          return (Number(a?.price)||Infinity)-(Number(b?.price)||Infinity);
        });
      }
      return out;
    };
    wrapped.__noreyoSoftWish=true;
    filterAndRankOffers=wrapped;
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
      adoptNativeBookingCTA(discover.querySelector('.search-card'));
    }finally{lock=false;}
  }

  function schedule(){if(raf)return;raf=requestAnimationFrame(()=>{raf=0;enforce();});}

  installSoftWishRanking();

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
  }catch(e){console.warn('NOREYO V5.42 hooks',e)}

  enforce();
  setTimeout(enforce,80);setTimeout(enforce,220);setTimeout(enforce,500);
  const discover=document.getElementById('discover');
  if(discover&&typeof MutationObserver!=='undefined')new MutationObserver(()=>{if(!lock)schedule();}).observe(discover,{childList:true,subtree:true});
  window.addEventListener('pageshow',schedule);
})();
