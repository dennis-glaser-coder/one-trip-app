(function(){
  function getCounts(){
    try{
      const values=Object.values(states||{});
      return {must:values.filter(v=>v==='must').length,wish:values.filter(v=>v==='wish').length};
    }catch(_){return {must:0,wish:0};}
  }

  function heroMarkup(){
    return `<section class="noreyo-home-hero" aria-label="Warum NOREYO anders sucht">
      <div class="noreyo-home-kicker">NOREYO PERSONAL MATCHING</div>
      <h1>Nicht suchen. Finden, was wirklich zu dir passt.</h1>
      <p class="noreyo-home-lead">Sag NOREYO, was Pflicht ist – und was einfach schön wäre. Wir prüfen zuerst das Unverzichtbare und sortieren danach nach deinen persönlichen Wünschen.</p>

      <div class="noreyo-home-difference" aria-label="Klassische Suche im Vergleich zu NOREYO">
        <div class="noreyo-home-side"><span>Klassische Portale</span><strong>Listen durchsuchen und selbst vergleichen</strong></div>
        <div class="noreyo-home-diff-arrow">→</div>
        <div class="noreyo-home-side noreyo"><span>Mit NOREYO</span><strong>Pflicht prüfen, persönlich ranken, Treffer erklären</strong></div>
      </div>

      <div class="noreyo-home-priorities">
        <div class="noreyo-priority-box must">
          <div class="noreyo-priority-head"><b>MUSS ICH HABEN</b><small>BEISPIEL</small></div>
          <div class="noreyo-priority-chips"><span>Balkon</span><span>Adults Only</span><span>≤ 300 m Strand</span></div>
        </div>
        <div class="noreyo-priority-box wish">
          <div class="noreyo-priority-head"><b>WÄRE SCHÖN</b><small>BEISPIEL</small></div>
          <div class="noreyo-priority-chips"><span>Meerblick</span><span>Spa</span><span>Rooftop-Bar</span></div>
        </div>
      </div>

      <div class="noreyo-home-preview" aria-label="Beispiel für ein NOREYO Ergebnis">
        <div class="noreyo-home-preview-top"><div><span>SO SIEHT DEIN ERGEBNIS AUS</span><strong>Dein bester Treffer</strong></div><div class="noreyo-home-preview-badge">NOREYO MATCH</div></div>
        <div class="noreyo-home-preview-chips"><span class="must">Balkon ✓</span><span class="must">Adults Only ✓</span><span class="must">Strandnähe ✓</span><span class="wish">Meerblick ✓</span></div>
        <p>Pflicht zuerst. Wünsche entscheiden das Ranking. Im Ergebnis siehst du direkt, warum ein Hotel zu dir passt.</p>
      </div>

      <div class="noreyo-home-cta-row">
        <button type="button" class="noreyo-home-cta">Meine Prioritäten festlegen</button>
        <div class="noreyo-home-status"><b>Noch nichts gewählt</b><span>NOREYO wartet auf deine Wünsche</span></div>
      </div>
    </section>`;
  }

  function updateStatus(hero){
    if(!hero)return;
    const status=hero.querySelector('.noreyo-home-status');if(!status)return;
    const c=getCounts();
    if(c.must||c.wish){
      status.innerHTML=`<b>${c.must} Pflicht · ${c.wish} ${c.wish===1?'Wunsch':'Wünsche'}</b><span>für dein persönliches Ranking</span>`;
    }else{
      status.innerHTML='<b>Noch nichts gewählt</b><span>NOREYO wartet auf deine Wünsche</span>';
    }
  }

  function attachCTA(hero,card){
    const btn=hero?.querySelector('.noreyo-home-cta');if(!btn||btn.dataset.bound)return;
    btn.dataset.bound='1';
    btn.addEventListener('click',()=>{
      card.scrollIntoView({behavior:'smooth',block:'start'});
      card.classList.remove('noreyo-search-pulse');
      void card.offsetWidth;
      card.classList.add('noreyo-search-pulse');
    });
  }

  function decorateHome(){
    const discover=document.getElementById('discover');if(!discover)return;
    const card=discover.querySelector('.search-card');if(!card)return;
    let hero=discover.querySelector('.noreyo-home-hero');
    if(!hero){
      const host=discover.querySelector('.content')||card.parentElement||discover;
      const wrap=document.createElement('div');wrap.innerHTML=heroMarkup();hero=wrap.firstElementChild;
      if(host.firstElementChild)host.insertBefore(hero,host.firstElementChild);else host.appendChild(hero);
    }
    hero.style.display=(typeof productMode!=='undefined'&&productMode==='flight')?'none':'';
    updateStatus(hero);attachCTA(hero,card);
  }

  try{
    if(typeof renderProductControls==='function'){
      const baseControls=renderProductControls;
      renderProductControls=function(){baseControls();decorateHome();};
    }
    if(typeof updateCounts==='function'){
      const baseCounts=updateCounts;
      updateCounts=function(){baseCounts();decorateHome();};
    }
  }catch(e){console.warn('NOREYO V5.35 hooks',e);}

  decorateHome();
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)decorateHome();});
})();
