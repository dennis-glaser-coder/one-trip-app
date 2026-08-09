(function(){
  'use strict';
  const BUILD='5.58';
  let raf=0;

  function currentMode(){
    const active=document.querySelector('#discover .product-mode.on');
    const t=(active?.textContent||'').toLowerCase();
    if(t.includes('flug'))return 'flight';
    if(t.includes('kreuzfahrt'))return 'cruise';
    if(t.includes('hotel'))return 'hotel';
    try{if(typeof productMode==='string')return productMode;}catch(_){ }
    return 'package';
  }
  function setText(el,text){if(el&&el.textContent!==text)el.textContent=text;}
  function setHTML(el,html){if(el&&el.innerHTML!==html)el.innerHTML=html;}

  const rules={
    Zimmer0:{label:'Balkon',read:o=>tri(o?.confirmed?.balcony)},
    Zimmer1:{label:'Meerblick',read:o=>tri(o?.confirmed?.seaView)},
    Zimmer2:{label:'Terrasse',read:o=>tri(o?.confirmed?.terrace)},
    Hotel0:{label:'Mind. 4 Sterne',read:o=>{const n=Number(o?.stars);return Number.isFinite(n)&&n>0?n>=4:null;}},
    Hotel4:{label:'Spa / Wellness',read:o=>tri(o?.confirmed?.spa)},
    Hotel5:{label:'Fitness',read:o=>tri(o?.confirmed?.fitness)},
    Hotel6:{label:'Frühstück',read:o=>tri(o?.confirmed?.breakfast)},
    Hotel7:{label:'All Inclusive',read:o=>tri(o?.confirmed?.allInclusive)},
    Preis2:{label:'Kostenlos stornierbar',read:o=>typeof o?.refundable==='boolean'?o.refundable:null}
  };

  function tri(v){return v===true?true:v===false?false:null;}
  function stateOf(key){try{return states?.[key]||'any';}catch(_){return 'any';}}
  function activePrefs(){
    const out=[];
    for(const [key,rule] of Object.entries(rules)){
      const state=stateOf(key);
      if(state==='must'||state==='wish')out.push({key,state,...rule});
    }
    return out;
  }
  function allActiveCounts(){
    try{
      const vals=Object.values(states||{});
      return {must:vals.filter(v=>v==='must').length,wish:vals.filter(v=>v==='wish').length};
    }catch(_){return {must:0,wish:0};}
  }
  function matchInfo(o){
    const selected=activePrefs(),counts=allActiveCounts();
    const checked=selected.map(p=>({...p,value:p.read(o)}));
    const yes=checked.filter(x=>x.value===true);
    const no=checked.filter(x=>x.value===false);
    const unknown=checked.filter(x=>x.value===null);
    const must=checked.filter(x=>x.state==='must');
    const knownMust=must.filter(x=>x.value!==null);
    const failedMust=must.filter(x=>x.value===false);
    const unknownMust=must.filter(x=>x.value===null);
    const allMustConfirmed=must.length>0&&failedMust.length===0&&unknownMust.length===0&&must.every(x=>x.value===true);
    return {selected,checked,yes,no,unknown,must,knownMust,failedMust,unknownMust,allMustConfirmed,counts,totalActive:counts.must+counts.wish};
  }
  function labelFor(info,index){
    if(!info.selected.length){
      if(info.totalActive)return index===0?'Beste Auswahl':'Passend';
      return index===0?'Live Auswahl':'Live verfügbar';
    }
    if(info.failedMust.length)return 'Muss-Kriterium fehlt';
    if(info.unknownMust.length&&index===0)return 'Beste Auswahl';
    if(index===0&&info.yes.length)return 'Bester Treffer';
    if(info.allMustConfirmed&&info.yes.length>=2)return 'Sehr passend';
    if(info.yes.length>=2)return 'Gut passend';
    return 'Passend';
  }
  function displayName(){return currentMode()==='hotel'?'Hotels':'Reisen';}
  function preferenceSummary(counts){
    const parts=[];
    if(counts.must)parts.push(counts.must+' '+(counts.must===1?'Muss-Kriterium':'Muss-Kriterien'));
    if(counts.wish)parts.push(counts.wish+' '+(counts.wish===1?'wichtiger Wunsch':'wichtige Wünsche'));
    return parts.join(' · ');
  }

  function cleanTop(cards){
    const mode=currentMode();
    if(mode==='flight'||mode==='cruise')return;
    document.querySelector('#results .noreyo-results-principle')?.remove();
    const match=document.querySelector('#results .match');
    if(!match||!cards.length)return;
    const counts=allActiveCounts();
    setText(match.querySelector('b'),cards.length+' '+displayName()+' gefunden');
    setText(match.querySelector('small'),(counts.must||counts.wish)
      ?preferenceSummary(counts)+' · beste Übereinstimmungen zuerst'
      :'Preis & Verfügbarkeit geprüft · beste Treffer zuerst');
    match.classList.add('noreyo-v558-match');
  }

  function decorateCard(card,o,index){
    if(!card)return;
    card.classList.add('noreyo-v558-offer');
    if(!o)return;
    const info=matchInfo(o),label=labelFor(info,index);

    const badge=card.querySelector('.noreyo-match-badge');
    if(badge){
      badge.classList.add('noreyo-v558-badge');
      setHTML(badge,'<strong>'+label+'</strong>');
    }

    const line=card.querySelector('.offer-matchline');
    if(line){
      line.classList.add('noreyo-v558-reasons');
      let title=line.previousElementSibling;
      if(!title||!title.classList?.contains('noreyo-v558-why')){
        title=document.createElement('div');
        title.className='noreyo-v558-why';
        line.insertAdjacentElement('beforebegin',title);
      }
      setText(title,info.totalActive?'Warum passt das?':'Auf einen Blick');

      const positives=[
        ...info.yes.filter(x=>x.state==='must'),
        ...info.yes.filter(x=>x.state==='wish')
      ].slice(0,3);
      const negative=info.no.find(x=>x.state==='must')||info.no[0];
      const chips=positives.map(x=>'<span class="offer-matchchip '+x.state+'"><i>✓</i>'+x.label+'</span>');
      if(negative)chips.push('<span class="offer-matchchip noreyo-v558-unconfirmed"><i>–</i>'+negative.label+' nicht bestätigt</span>');
      if(!chips.length){
        chips.push('<span class="offer-matchchip neutral"><i>✓</i>'+(info.totalActive?'Weitere gewählte Kriterien werden in der Suche berücksichtigt':'Preis & Verfügbarkeit geprüft')+'</span>');
      }
      setHTML(line,chips.join(''));
    }

    const trust=card.querySelector('.noreyo-trust-row');
    if(trust){
      trust.classList.add('noreyo-v558-trust');
      const live=o.live===true?'Preis & Verfügbarkeit geprüft':'Tarifstand verfügbar';
      setHTML(trust,'<span><i></i>'+live+'</span>'+(typeof o.refundable==='boolean'?'<span>'+(o.refundable?'Stornierbar':'Tarifbedingungen')+'</span>':''));
    }

    const btn=card.querySelector('.noreyo-cta,.dark-btn');
    if(btn){
      btn.classList.add('noreyo-v558-cta');
      const text=currentMode()==='hotel'?'Hotel & Preise ansehen':'Reise & Preise ansehen';
      setHTML(btn,'<span>'+text+'</span><span aria-hidden="true">→</span>');
    }
  }

  function decorateDetail(){
    const root=document.getElementById('detailContent');
    if(!root)return;
    const box=root.querySelector('.noreyo-detail-match');
    if(!box)return;
    box.classList.add('noreyo-v558-detail');
    box.querySelectorAll('.noreyo-detail-chip').forEach(chip=>{
      const next=(chip.textContent||'').replace(/^Pflicht\s*·/,'Muss sein ·').replace(/^Wunsch\s*·/,'Wichtig ·');
      setText(chip,next);
    });
    setText(box.querySelector('.noreyo-detail-why b'),'Warum passt das zu dir?');
  }

  function decorate(){
    const mode=currentMode();
    if(mode==='flight'||mode==='cruise')return;
    const cards=[...document.querySelectorAll('#offers .offer')];
    cleanTop(cards);
    if(!cards.length){decorateDetail();return;}
    let data=[];
    try{if(Array.isArray(offers))data=offers;}catch(_){ }
    cards.forEach((card,i)=>decorateCard(card,data[i],i));
    decorateDetail();
  }

  function schedule(){if(raf)return;raf=requestAnimationFrame(()=>{raf=0;decorate();});}

  try{
    if(typeof renderOffers==='function'&&!renderOffers.__noreyoV558){
      const prior=renderOffers;
      const wrapped=function(){const r=prior.apply(this,arguments);schedule();return r;};
      wrapped.__noreyoV558=true;renderOffers=wrapped;
    }
    if(typeof renderDetail==='function'&&!renderDetail.__noreyoV558){
      const prior=renderDetail;
      const wrapped=function(){const r=prior.apply(this,arguments);schedule();return r;};
      wrapped.__noreyoV558=true;renderDetail=wrapped;
    }
  }catch(e){console.warn('NOREYO '+BUILD+' hooks',e);}

  decorate();setTimeout(decorate,100);setTimeout(decorate,320);
  const results=document.getElementById('results');
  if(results&&typeof MutationObserver!=='undefined')new MutationObserver(schedule).observe(results,{childList:true,subtree:true});
  window.addEventListener('pageshow',schedule,{passive:true});
  window.NOREYO_V558=Object.freeze({decorate,version:BUILD});
})();
