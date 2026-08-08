(function(){
  function applyCleanFirstScreen(){
    const discover=document.getElementById('discover');
    if(!discover)return;
    const hero=discover.querySelector('.hero');
    if(hero){
      const oldLogic=hero.querySelector('.noreyo-firstscreen-logic');if(oldLogic)oldLogic.remove();
      const oldNote=hero.querySelector('.noreyo-firstscreen-note');if(oldNote)oldNote.remove();
      const signet=hero.querySelector('.hero-signet');
      if(signet)signet.innerHTML='<span></span>NOREYO MATCH';
      const copy=hero.querySelector('.hero-copy');
      if(copy){
        const kicker=copy.querySelector('.hero-kicker');
        const title=copy.querySelector('h1');
        const lead=copy.querySelector('p');
        if(kicker)kicker.textContent='DEINE WÜNSCHE · UNSER MATCH';
        if(title)title.textContent='Sag, was Pflicht ist. Wir finden, was wirklich passt.';
        if(lead)lead.textContent='Pflichtkriterien zuerst. Wünsche danach. Bei jedem Treffer siehst du sofort, warum er zu dir passt.';
      }
      let strip=hero.querySelector('.noreyo-usp-strip');
      if(!strip){
        strip=document.createElement('div');
        strip.className='noreyo-usp-strip';
        strip.innerHTML='<span><b>MUSS</b>filtert strikt</span><span><b>WUNSCH</b>rankt besser</span><span><b>MATCH</b>erklärt warum</span>';
        hero.appendChild(strip);
      }
    }
    discover.querySelectorAll('.search-console-head').forEach(head=>{
      const label=head.querySelector('span');
      const title=head.querySelector('b');
      if(label)label.textContent='DEINE PRIORITÄTEN';
      if(title&&typeof productMode!=='undefined'&&productMode!=='flight')title.textContent='Was ist dir wirklich wichtig?';
    });
  }
  try{
    if(typeof renderProductControls==='function'){
      const base=renderProductControls;
      renderProductControls=function(){base();applyCleanFirstScreen();};
    }
    if(typeof go==='function'){
      const baseGo=go;
      go=function(id){const r=baseGo(id);if(id==='discover')setTimeout(applyCleanFirstScreen,0);return r;};
    }
  }catch(e){console.warn('NOREYO V5.37 hooks',e);}
  applyCleanFirstScreen();
  setTimeout(applyCleanFirstScreen,120);
  window.addEventListener('pageshow',applyCleanFirstScreen);
})();
