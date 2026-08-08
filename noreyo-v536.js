(function(){
  function applyFirstScreen(){
    const discover=document.getElementById('discover');
    if(!discover)return;
    const hero=discover.querySelector('.hero');
    if(hero){
      const signet=hero.querySelector('.hero-signet');
      if(signet)signet.innerHTML='<span></span>NOREYO MATCHING';
      const copy=hero.querySelector('.hero-copy');
      if(copy){
        const kicker=copy.querySelector('.hero-kicker');
        const title=copy.querySelector('h1');
        const lead=copy.querySelector('p');
        if(kicker)kicker.textContent='DEINE PRIORITÄTEN · UNSER MATCH';
        if(title)title.textContent='Nicht suchen. Finden, was wirklich zu dir passt.';
        if(lead)lead.textContent='Sag NOREYO, was Pflicht ist – und was einfach schön wäre. Wir sortieren nicht nur Hotels. Wir finden die passendsten Treffer für dich.';
      }
      if(!hero.querySelector('.noreyo-firstscreen-logic')){
        const logic=document.createElement('div');
        logic.className='noreyo-firstscreen-logic';
        logic.innerHTML='<div class="noreyo-firstscreen-box must"><span>MUSS ICH HABEN</span><b>wird zuerst strikt geprüft</b></div><div class="noreyo-firstscreen-arrow">→</div><div class="noreyo-firstscreen-box wish"><span>WÄRE SCHÖN</span><b>verbessert dein persönliches Ranking</b></div>';
        hero.appendChild(logic);
      }
      if(!hero.querySelector('.noreyo-firstscreen-note')){
        const note=document.createElement('div');
        note.className='noreyo-firstscreen-note';
        note.textContent='Du siehst bei jedem Treffer direkt, warum er zu dir passt.';
        hero.appendChild(note);
      }
    }

    discover.querySelectorAll('.search-console-head').forEach(head=>{
      const label=head.querySelector('span');
      const title=head.querySelector('b');
      if(label)label.textContent='DEIN NOREYO MATCH';
      if(title&&typeof productMode!=='undefined'&&productMode!=='flight')title.textContent='Pflicht zuerst. Wünsche danach.';
    });
  }

  try{
    if(typeof renderProductControls==='function'){
      const base=renderProductControls;
      renderProductControls=function(){base();applyFirstScreen();};
    }
    if(typeof go==='function'){
      const baseGo=go;
      go=function(id){const r=baseGo(id);if(id==='discover')setTimeout(applyFirstScreen,0);return r;};
    }
  }catch(e){console.warn('NOREYO V5.36 hooks',e);}

  applyFirstScreen();
  setTimeout(applyFirstScreen,150);
  window.addEventListener('pageshow',applyFirstScreen);
})();
