(function(){
  const checks=[
    ['Zimmer0','Balkon',o=>o.confirmed?.balcony===true],
    ['Zimmer1','Meerblick',o=>o.confirmed?.seaView===true],
    ['Zimmer2','Terrasse',o=>o.confirmed?.terrace===true],
    ['Hotel0','4★+',o=>Number(o.stars||0)>=4],
    ['Hotel4','Spa',o=>o.confirmed?.spa===true],
    ['Hotel5','Fitness',o=>o.confirmed?.fitness===true],
    ['Hotel6','Frühstück',o=>o.confirmed?.breakfast===true],
    ['Hotel7','All Inclusive',o=>o.confirmed?.allInclusive===true],
    ['Preis2','Stornierbar',o=>o.refundable===true]
  ];
  function mealMatches(o){return mealPlanFilter==='ANY'||mealPlanCodeFromBoard(o.board||((o.features||[])[0])||'')===mealPlanFilter}
  function matchData(o){
    let earned=0,total=0;const items=[];
    for(const [key,label,test] of checks){const state=states[key]||'any';if(state==='any')continue;const ok=!!test(o),w=state==='must'?3:1;total+=w;if(ok)earned+=w;items.push({label,state,ok})}
    if(mealPlanFilter&&mealPlanFilter!=='ANY'){const ok=mealMatches(o);total+=3;if(ok)earned+=3;items.push({label:mealPlanLabel(),state:'must',ok})}
    return {percent:total?Math.round(earned/total*100):null,items};
  }
  function signature(){
    const root=document.getElementById('offers');if(!root)return;
    let box=document.querySelector('.noreyo-results-signature');
    const active=Object.values(states||{}).filter(v=>v==='must'||v==='wish').length+(mealPlanFilter!=='ANY'?1:0);
    if(!box){box=document.createElement('div');box.className='noreyo-results-signature';root.parentNode.insertBefore(box,root)}
    box.innerHTML=`<div class="mark">N</div><div><b>${active?'Für dich nach Passung sortiert':'NOREYO Auswahl'}</b><small>${active?active+' aktive Präferenz'+(active===1?'':'en')+' · Pflichtkriterien zählen stärker als Wünsche':'Live-Verfügbarkeit, Preis und Qualität klar zusammengefasst'}</small></div>`;
  }
  function decorate(){
    signature();
    document.querySelectorAll('#offers .offer').forEach((card,i)=>{
      const o=offers[i];if(!o)return;const m=matchData(o);card.classList.add('noreyo-offer');
      const img=card.querySelector('.offer-img');
      if(img){const old=img.querySelector('.noreyo-match-badge');if(old)old.remove();const confirmed=m.items.filter(x=>x.ok).length;img.insertAdjacentHTML('beforeend',`<div class="noreyo-match-badge"><span>NOREYO MATCH</span><strong>${m.percent===null?'LIVE':m.percent+'%'}</strong><small>${m.items.length?confirmed+' von '+m.items.length+' ausgewählten Kriterien bestätigt':'Preis & Verfügbarkeit live geprüft'}</small></div>`)}
      const line=card.querySelector('.offer-matchline');
      if(line){const ok=m.items.filter(x=>x.ok).slice(0,4),miss=m.items.filter(x=>!x.ok);line.innerHTML=ok.map(x=>`<span class="offer-matchchip ${x.state}">${x.state==='must'?'Pflicht':'Wunsch'} · ${safeText(x.label)}</span>`).join('')+(miss.length?`<span class="offer-matchchip neutral">${miss.length} nicht bestätigt</span>`:'')||'<span class="offer-matchchip neutral">Live-Tarif geprüft</span>'}
      const e=card.querySelector('.offer-essentials');if(e)e.classList.add('noreyo-essentials');
      const p=card.querySelector('.offer-price-context');if(p)p.classList.add('noreyo-price-panel');
      const btn=card.querySelector('.dark-btn');if(btn){btn.classList.add('noreyo-cta');btn.innerHTML=`Hotel & Tarife ansehen ${svg('chev')}`;if(!card.querySelector('.noreyo-trust-row'))btn.insertAdjacentHTML('beforebegin',`<div class="noreyo-trust-row"><span><i></i>${o.live===true?'Preis & Verfügbarkeit live geprüft':'Aktueller gespeicherter Stand'}</span><span>${o.refundable?'Stornierbar':'Tarifbedingungen prüfen'}</span></div>`)}
    });
  }
  const baseRender=renderOffers;renderOffers=function(){baseRender();decorate()};
  const baseFilter=filterAndRankOffers;filterAndRankOffers=function(input){const out=baseFilter(input);out.sort((a,b)=>(matchData(b).percent??-1)-(matchData(a).percent??-1)||Number(String(b.rating||0).replace(',','.'))-Number(String(a.rating||0).replace(',','.'))||Number(a.price||Infinity)-Number(b.price||Infinity));return out};
  decorate();
})();
