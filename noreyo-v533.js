(function(){
  if(!document.querySelector('link[data-noreyo-v534]')){
    const link=document.createElement('link');
    link.rel='stylesheet';link.href='./noreyo-v534.css?build=534';link.dataset.noreyoV534='1';
    document.head.appendChild(link);
  }

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

  function matchData(o){
    let points=0;
    const items=[];
    for(const [key,label,test] of checks){
      const state=states[key]||'any';
      if(state==='any')continue;
      const ok=!!test(o);
      if(ok)points+=state==='must'?6:2;
      items.push({label,state,ok});
    }
    if(mealPlanFilter&&mealPlanFilter!=='ANY'){
      points+=6;
      items.push({label:mealPlanLabel(),state:'must',ok:true});
    }
    return {
      points,
      items,
      confirmed:items.filter(x=>x.ok).length,
      active:items.length
    };
  }

  function resultMatchLabel(m,index){
    if(!m.active)return index===0?'LIVE AUSWAHL':'LIVE VERFÜGBAR';
    if(index===0)return 'BESTER TREFFER';
    if(m.confirmed>=4)return 'SEHR PASSEND';
    if(m.confirmed>=2)return 'GUT PASSEND';
    return 'PASSEND';
  }

  function detailMatchLabel(m){
    if(!m.active)return 'LIVE';
    if(m.confirmed>=4)return 'SEHR PASSEND';
    if(m.confirmed>=2)return 'GUT PASSEND';
    return 'PASSEND';
  }

  function preferenceCounts(){
    return {
      must:Object.values(states).filter(x=>x==='must').length,
      wish:Object.values(states).filter(x=>x==='wish').length
    };
  }

  function decorateSearch(){
    document.querySelectorAll('#discover .search-card,#searchView .search-card').forEach(card=>{
      const head=card.querySelector('.search-console-head');
      const old=card.querySelector('.noreyo-search-logic');
      if(productMode==='flight'||!head){if(old)old.remove();return;}
      if(old)return;
      head.insertAdjacentHTML('afterend',`<div class="noreyo-search-logic" aria-label="So priorisiert NOREYO deine Wünsche"><div><span class="noreyo-logic-tag must">MUSS</span><b>wird strikt geprüft</b></div><span class="noreyo-logic-arrow">→</span><div><span class="noreyo-logic-tag wish">WUNSCH</span><b>verbessert deinen Match</b></div></div>`);
    });
  }

  function decorateResultPrinciple(){
    const anchor=document.querySelector('#results .match');
    if(!anchor)return;
    const counts=preferenceCounts();
    let box=document.querySelector('#results .noreyo-results-principle');
    if(!box){
      anchor.insertAdjacentHTML('afterend','<div class="noreyo-results-principle"></div>');
      box=document.querySelector('#results .noreyo-results-principle');
    }
    const title=(counts.must||counts.wish)?`${counts.must} Pflicht · ${counts.wish} ${counts.wish===1?'Wunsch':'Wünsche'}`:'Noch keine Prioritäten gesetzt';
    const copy=(counts.must||counts.wish)?'Pflichtkriterien werden strikt geprüft. Danach zählt jede bestätigte Wunsch-Übereinstimmung für dein persönliches Ranking.':'Setze Wünsche oder Pflichtkriterien – dann wird aus einer normalen Hotelsuche dein persönliches Ranking.';
    box.innerHTML=`<div><span>NOREYO PRIORITÄTEN</span><strong>${safeText(title)}</strong></div><p>${safeText(copy)}</p>`;
  }

  function decorateOffers(){
    document.querySelectorAll('#offers .offer').forEach((card,i)=>{
      const o=offers[i];if(!o)return;
      const m=matchData(o);
      card.classList.add('noreyo-offer');
      const img=card.querySelector('.offer-img');
      if(img){
        const old=img.querySelector('.noreyo-match-badge');
        if(old)old.remove();
        const label=resultMatchLabel(m,i);
        const sub=m.active?`${m.confirmed} ${m.confirmed===1?'Kriterium':'Kriterien'} bestätigt`:'Preis & Verfügbarkeit live geprüft';
        img.insertAdjacentHTML('beforeend',`<div class="noreyo-match-badge"><span>NOREYO MATCH</span><strong>${safeText(label)}</strong><small>${safeText(sub)}</small></div>`);
      }
      const line=card.querySelector('.offer-matchline');
      if(line){
        const must=m.items.filter(x=>x.ok&&x.state==='must').slice(0,2);
        const wish=m.items.filter(x=>x.ok&&x.state==='wish').slice(0,3);
        line.innerHTML=[...must,...wish].slice(0,4).map(x=>`<span class="offer-matchchip ${x.state}">${x.state==='must'?'Pflicht':'Wunsch'} · ${safeText(x.label)}</span>`).join('')||'<span class="offer-matchchip neutral">Live-Tarif geprüft</span>';
      }
      const e=card.querySelector('.offer-essentials');if(e)e.classList.add('noreyo-essentials');
      const p=card.querySelector('.offer-price-context');if(p)p.classList.add('noreyo-price-panel');
      const btn=card.querySelector('.dark-btn');
      if(btn){
        btn.classList.add('noreyo-cta');
        btn.innerHTML=`Hotel & Tarife ansehen ${svg('chev')}`;
        const existing=card.querySelector('.noreyo-trust-row');if(existing)existing.remove();
        btn.insertAdjacentHTML('beforebegin',`<div class="noreyo-trust-row"><span><i></i>${o.live===true?'Preis & Verfügbarkeit gerade live geprüft':'Gespeicherter Stand'}</span><span>${o.refundable?'Stornierbar':'Tarifbedingungen'}</span></div>`);
      }
    });
    decorateResultPrinciple();
  }

  function detailMatchCopy(m){
    if(!m.active)return 'Aktiviere Wünsche oder Pflichtkriterien – NOREYO erklärt dir danach für jedes Hotel, warum es zu dir passt.';
    const must=m.items.filter(x=>x.state==='must');
    const wishOk=m.items.filter(x=>x.state==='wish'&&x.ok).length;
    const mustOk=must.filter(x=>x.ok).length;
    if(must.length&&mustOk===must.length&&wishOk)return `Alle ${must.length} Pflichtkriterien bestätigt · zusätzlich ${wishOk} ${wishOk===1?'Wunsch':'Wünsche'} durch Hoteldaten bestätigt.`;
    if(must.length&&mustOk===must.length)return `Alle ${must.length} Pflichtkriterien bestätigt. NOREYO wertet nur zusätzlich bestätigte Wünsche positiv.`;
    if(wishOk)return `${wishOk} ${wishOk===1?'deiner Wünsche ist':'deiner Wünsche sind'} durch vorhandene Hoteldaten bestätigt.`;
    return 'NOREYO wertet nur Merkmale als Treffer, die sich mit den vorhandenen Hotel- und Tarifdaten tatsächlich bestätigen lassen.';
  }

  function decorateDetail(o){
    const root=document.getElementById('detailContent');if(!root)return;
    const old=root.querySelector('.noreyo-detail-match');if(old)old.remove();
    const rating=root.querySelector('.detail-rating');if(!rating)return;
    const m=matchData(o);
    const confirmed=m.items.filter(x=>x.ok);
    const chips=confirmed.slice(0,5).map(x=>`<span class="noreyo-detail-chip ${x.state}">${x.state==='must'?'Pflicht':'Wunsch'} · ${safeText(x.label)} ✓</span>`).join('');
    rating.insertAdjacentHTML('afterend',`<section class="noreyo-detail-match"><div class="noreyo-detail-score"><span>DEIN NOREYO MATCH</span><strong>${safeText(detailMatchLabel(m))}</strong></div><div class="noreyo-detail-why"><b>Warum passt dieses Hotel zu dir?</b><p>${safeText(detailMatchCopy(m))}</p></div>${chips?`<div class="noreyo-detail-chips">${chips}</div>`:''}</section>`);
  }

  const baseRender=renderOffers;
  renderOffers=function(){baseRender();decorateOffers();};

  const baseFilter=filterAndRankOffers;
  filterAndRankOffers=function(input){
    const out=baseFilter(input);
    out.sort((a,b)=>matchData(b).points-matchData(a).points||Number(String(b.rating||0).replace(',','.'))-Number(String(a.rating||0).replace(',','.'))||Number(a.price||Infinity)-Number(b.price||Infinity));
    return out;
  };

  const baseDetail=renderDetail;
  renderDetail=function(o){baseDetail(o);decorateDetail(o);};

  const baseControls=renderProductControls;
  renderProductControls=function(){baseControls();decorateSearch();};

  const baseCounts=updateCounts;
  updateCounts=function(){baseCounts();decorateSearch();decorateResultPrinciple();};

  decorateSearch();
  decorateOffers();
  decorateResultPrinciple();
})();
