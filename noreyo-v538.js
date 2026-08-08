(function(){
  const priorityOptions=[
    {key:'Zimmer0',label:'Balkon'},
    {key:'Zimmer1',label:'Meerblick'},
    {key:'Hotel4',label:'Spa'},
    {key:'Hotel7',label:'All Inclusive'}
  ];

  function stateBag(){
    try{return states||null}catch(_){return null}
  }

  function activeMode(key){
    const bag=stateBag();
    return bag&&bag[key]?bag[key]:'any';
  }

  function panelMarkup(){
    return `<div class="noreyo-priority-live" aria-label="NOREYO Prioritäten direkt festlegen">
      <div class="noreyo-priority-live-head">
        <div><span>DEIN MATCH STARTET HIER</span><b>Was ist dir wirklich wichtig?</b></div>
        <small>MUSS oder WUNSCH</small>
      </div>
      <div class="noreyo-priority-grid">
        ${priorityOptions.map(o=>`<div class="noreyo-priority-item" data-key="${o.key}"><strong>${o.label}</strong><div class="noreyo-priority-modes"><button type="button" class="noreyo-priority-mode must" data-mode="must">MUSS</button><button type="button" class="noreyo-priority-mode wish" data-mode="wish">WUNSCH</button></div></div>`).join('')}
      </div>
      <div class="noreyo-priority-live-foot">
        <div class="noreyo-priority-summary"><i></i><span>Wähle direkt aus – dein Ranking passt sich an.</span></div>
        <button type="button" class="noreyo-priority-next">Reise festlegen →</button>
      </div>
    </div>`;
  }

  function syncPanel(panel){
    if(!panel)return;
    let must=0,wish=0;
    panel.querySelectorAll('.noreyo-priority-item').forEach(item=>{
      const mode=activeMode(item.dataset.key);
      if(mode==='must')must++;
      if(mode==='wish')wish++;
      item.querySelectorAll('.noreyo-priority-mode').forEach(btn=>{
        const on=btn.dataset.mode===mode;
        btn.classList.toggle('active',on);
        btn.setAttribute('aria-pressed',on?'true':'false');
      });
    });
    const text=panel.querySelector('.noreyo-priority-summary span');
    if(text){
      if(must||wish)text.textContent=`${must} Pflicht · ${wish} ${wish===1?'Wunsch':'Wünsche'} – NOREYO baut daraus dein Ranking.`;
      else text.textContent='Wähle direkt aus – dein Ranking passt sich an.';
    }
  }

  function setPriority(key,mode,panel){
    const bag=stateBag();if(!bag)return;
    bag[key]=bag[key]===mode?'any':mode;
    try{if(typeof updateCounts==='function')updateCounts()}catch(e){console.warn('NOREYO priority count',e)}
    syncPanel(panel);
  }

  function bindPanel(panel,discover){
    if(!panel||panel.dataset.bound)return;
    panel.dataset.bound='1';
    panel.addEventListener('click',e=>{
      const modeBtn=e.target.closest('.noreyo-priority-mode');
      if(modeBtn){
        const item=modeBtn.closest('.noreyo-priority-item');
        if(item)setPriority(item.dataset.key,modeBtn.dataset.mode,panel);
        return;
      }
      const next=e.target.closest('.noreyo-priority-next');
      if(next){
        const card=discover.querySelector('.search-card');
        if(card){
          card.scrollIntoView({behavior:'smooth',block:'start'});
          card.classList.remove('noreyo-search-pulse-v538');void card.offsetWidth;card.classList.add('noreyo-search-pulse-v538');
        }
      }
    });
  }

  function applyInteractiveFirstScreen(){
    const discover=document.getElementById('discover');if(!discover)return;
    const hero=discover.querySelector('.hero');if(!hero)return;
    const isFlight=typeof productMode!=='undefined'&&productMode==='flight';
    const previous=hero.querySelector('.noreyo-priority-live');
    if(isFlight){
      hero.classList.remove('noreyo-interactive-hero');
      if(previous)previous.remove();
      return;
    }

    hero.classList.add('noreyo-interactive-hero');
    hero.querySelectorAll('.noreyo-usp-strip,.noreyo-firstscreen-logic,.noreyo-firstscreen-note').forEach(el=>el.remove());
    const signet=hero.querySelector('.hero-signet');
    if(signet)signet.innerHTML='<span></span>NOREYO PERSONAL MATCH';
    const copy=hero.querySelector('.hero-copy');
    if(copy){
      const kicker=copy.querySelector('.hero-kicker');
      const title=copy.querySelector('h1');
      const lead=copy.querySelector('p');
      if(kicker)kicker.textContent='DEINE REISE · DEINE REGELN';
      if(title)title.textContent='Sag, was Pflicht ist. NOREYO findet den Rest.';
      if(lead)lead.textContent='Tippe direkt auf Muss oder Wunsch – dein persönliches Ranking entsteht sofort.';
    }

    let panel=hero.querySelector('.noreyo-priority-live');
    if(!panel){
      const wrap=document.createElement('div');wrap.innerHTML=panelMarkup();panel=wrap.firstElementChild;hero.appendChild(panel);
    }
    syncPanel(panel);bindPanel(panel,discover);

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
      renderProductControls=function(){const r=baseControls();applyInteractiveFirstScreen();return r;};
    }
    if(typeof updateCounts==='function'){
      const baseCounts=updateCounts;
      updateCounts=function(){const r=baseCounts();applyInteractiveFirstScreen();return r;};
    }
    if(typeof go==='function'){
      const baseGo=go;
      go=function(id){const r=baseGo(id);if(id==='discover')setTimeout(applyInteractiveFirstScreen,0);return r;};
    }
  }catch(e){console.warn('NOREYO V5.38 hooks',e)}

  applyInteractiveFirstScreen();
  setTimeout(applyInteractiveFirstScreen,120);
  window.addEventListener('pageshow',applyInteractiveFirstScreen);
})();
