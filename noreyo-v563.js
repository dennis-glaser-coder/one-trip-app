/* NOREYO V5.63 — Travel DNA WOW polish */
(()=>{
'use strict';
const PROFILE_KEY='noreyoTravelDNA';
let lastBody=null;
function profile(){try{return JSON.parse(localStorage.getItem(PROFILE_KEY)||'null');}catch(_){return null;}}
function esc(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot',"'":'&#39;'}[c]));}
function toast(text){
  let el=document.getElementById('noreyoV563Toast');
  if(!el){el=document.createElement('div');el.id='noreyoV563Toast';el.className='noreyo-v563-toast';document.body.appendChild(el);}
  el.textContent=text;el.classList.remove('show');void el.offsetWidth;el.classList.add('show');
  clearTimeout(el._timer);el._timer=setTimeout(()=>el.classList.remove('show'),3200);
}
function decorateLauncher(){
  const p=profile();
  document.querySelectorAll('#discover .noreyo-v560-launch').forEach(btn=>{
    btn.classList.toggle('noreyo-v563-profile-active',!!p);
    if(!p)return;
    const small=btn.querySelector('.noreyo-v560-launch-copy small');
    const em=btn.querySelector('.noreyo-v560-launch-copy em');
    if(small)small.textContent='TRAVEL DNA AKTIV';
    if(em)em.textContent='NOREYO kennt deinen Reisegeschmack';
  });
}
function decorateIntro(body){
  const intro=body.querySelector('.noreyo-v560-intro');if(!intro)return false;
  const photoCopy=intro.querySelector('.noreyo-v560-photo small');
  if(photoCopy)photoCopy.textContent='Wähle einzelne Bilder aus, die deinen Reisegeschmack besonders gut zeigen.';
  const privacy=intro.querySelector('.noreyo-v560-privacy');
  if(privacy)privacy.textContent='Visuelle Fotoanalyse ist für eine kommende Ausbaustufe vorgesehen.';
  const primary=intro.querySelector('[data-dna-start]');
  if(primary&&!intro.querySelector('.noreyo-v563-start-note')){
    const note=document.createElement('p');note.className='noreyo-v563-start-note';note.textContent='Spontan entscheiden. NOREYO lernt daraus, was sich für dich nach Urlaub anfühlt.';
    primary.insertAdjacentElement('beforebegin',note);
  }
  return true;
}
function decorateQuestion(body){
  const test=body.querySelector('.noreyo-v560-test');if(!test)return false;
  const progress=test.querySelector('.noreyo-v560-progress');
  let current=1,total=5;
  const label=progress?.querySelector('span');
  const match=(label?.textContent||'').match(/(\d+)\s*VON\s*(\d+)/i);
  if(match){current=Number(match[1])||1;total=Number(match[2])||5;}
  if(label)label.textContent=`${current} / ${total} · SPONTAN ENTSCHEIDEN`;
  if(progress&&!progress.querySelector('.noreyo-v563-dots')){
    const dots=document.createElement('div');dots.className='noreyo-v563-dots';
    for(let i=1;i<=total;i++){const dot=document.createElement('i');if(i<=current)dot.classList.add('on');dots.appendChild(dot);}
    progress.appendChild(dots);
  }
  const grid=test.querySelector('.noreyo-v560-choice-grid');
  if(grid&&!test.querySelector('.noreyo-v563-instruction')){
    const hint=document.createElement('div');hint.className='noreyo-v563-instruction';hint.innerHTML='<b>Nicht zerdenken.</b><span>Was fühlt sich mehr nach deinem Urlaub an?</span>';
    grid.insertAdjacentElement('beforebegin',hint);
  }
  test.querySelectorAll('[data-dna-choice]').forEach((btn,i)=>{
    if(!btn.querySelector('.noreyo-v563-choice-label')){
      const badge=document.createElement('span');badge.className='noreyo-v563-choice-label';badge.textContent=i===0?'A':'B';btn.appendChild(badge);
    }
  });
  return true;
}
function decorateResult(body){
  const result=body.querySelector('.noreyo-v560-result');if(!result)return false;
  const p=profile()||{};
  const kicker=result.querySelector('.noreyo-v560-kicker');
  if(kicker)kicker.textContent='NOREYO HAT DEINEN REISEGESCHMACK GELERNT';
  const sub=result.querySelector('.noreyo-v560-result-sub');
  if(sub&&!result.querySelector('.noreyo-v563-result-lead')){
    const lead=document.createElement('p');lead.className='noreyo-v563-result-lead';lead.textContent='Ab jetzt startet deine Suche nicht mehr bei null.';sub.insertAdjacentElement('afterend',lead);
  }
  const tags=result.querySelector('.noreyo-v560-tags');
  if(tags&&!result.querySelector('.noreyo-v563-profile-card')){
    const list=(p.tags||[]).slice(0,5);
    const card=document.createElement('div');card.className='noreyo-v563-profile-card';
    card.innerHTML='<div class="noreyo-v563-profile-head"><span>✦</span><div><small>DEIN PERSÖNLICHER STARTPUNKT</small><b>So sucht NOREYO jetzt für dich</b></div></div>'+
      (list.length?'<div class="noreyo-v563-profile-rows">'+list.map(t=>'<span><i>✓</i>'+esc(t)+'<em>WUNSCH</em></span>').join('')+'</div>':'')+
      '<p>Budget, Zeitraum und Verpflegung bleiben in deiner Hand. Dein Geschmack läuft automatisch mit.</p>';
    tags.insertAdjacentElement('afterend',card);
  }
  const explain=result.querySelector('.noreyo-v560-explain');
  if(explain){const b=explain.querySelector('b');const pEl=explain.querySelector('p');if(b)b.textContent='Was jetzt anders ist';if(pEl)pEl.innerHTML='NOREYO nutzt deine Travel DNA als <strong>persönlichen Ausgangspunkt</strong> und priorisiert Reisen, die zu deinem Geschmack passen.';}
  const apply=result.querySelector('[data-dna-apply]');if(apply)apply.textContent='Meine Travel DNA aktivieren →';
  result.classList.add('noreyo-v563-result-wow');
  return true;
}
function decorate(){
  decorateLauncher();
  const body=document.getElementById('noreyoDnaBody');if(!body)return;
  if(body!==lastBody){lastBody=body;}
  decorateIntro(body)||decorateQuestion(body)||decorateResult(body);
}
document.addEventListener('click',e=>{
  const choice=e.target.closest?.('[data-dna-choice]');if(choice){try{navigator.vibrate?.(10);}catch(_){}}
  if(e.target.closest?.('[data-dna-apply]'))setTimeout(()=>{decorateLauncher();toast('Travel DNA aktiv · NOREYO sucht jetzt mit deinem Geschmack.');},260);
},true);
const observer=new MutationObserver(()=>requestAnimationFrame(decorate));
observer.observe(document.documentElement,{childList:true,subtree:true});
setTimeout(decorate,300);setTimeout(decorate,1200);
window.NOREYO_V563={decorate};
})();
