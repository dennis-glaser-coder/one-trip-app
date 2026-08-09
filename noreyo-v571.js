(function(){
  'use strict';

  const BUILD='5.71';
  let pendingFamily=null;

  function norm(v){
    return String(v||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/ß/g,'ss');
  }

  function wordNumber(v){
    const map={ein:1,eine:1,einen:1,einem:1,einer:1,zwei:2,drei:3,vier:4,fuenf:5,funf:5,sechs:6,sieben:7,acht:8};
    if(/^\d+$/.test(String(v||'')))return Number(v);
    return map[norm(v)]??null;
  }

  function parseAdults(text){
    const t=norm(text);
    let m=t.match(/\b(\d|ein(?:e|en|em|er)?|zwei|drei|vier|fuenf|funf|sechs)\s+erwachsene(?:n)?\b/);
    if(m)return wordNumber(m[1]);
    if(/\bzu zweit\b/.test(t))return 2;
    return null;
  }

  function parseChildCount(text){
    const t=norm(text);
    let m=t.match(/\b(\d|ein(?:e|en|em|er)?|zwei|drei|vier|fuenf|funf|sechs|sieben|acht)\s+(?:kinder|kindern|kind)\b/);
    if(m)return wordNumber(m[1]);
    if(/\b(?:mit\s+)?(?:einem\s+)?baby\b/.test(t))return 1;
    return null;
  }

  function uniqueAges(values){
    const out=[];
    for(const value of values){
      const n=Number(value);
      if(Number.isInteger(n)&&n>=0&&n<=17)out.push(n);
    }
    return out;
  }

  function parseChildAges(text){
    const t=norm(text);
    const ages=[];

    const listPatterns=[
      /(?:kinder|kindern|kinderalter|alter der kinder)[^.!?;]{0,45}?(\d{1,2}(?:\s*(?:,|und|&)\s*\d{1,2})+)(?:\s*jahre?)?/g,
      /(?:mit|und)\s+(\d{1,2}(?:\s*(?:,|und|&)\s*\d{1,2})+)\s*jahre(?:\s+alt)?/g
    ];

    for(const re of listPatterns){
      let m;
      while((m=re.exec(t))){
        const nums=m[1].match(/\d{1,2}/g)||[];
        ages.push(...nums.map(Number));
      }
    }

    const singlePatterns=[
      /\b(?:kind|sohn|tochter|baby)\s*(?:ist|mit|,)?\s*(\d{1,2})\s*(?:jahre?|jahr|j\.)\b/g,
      /\b(\d{1,2})\s*(?:jahre?|jahr)\s*(?:altes?|alte|alter)\s*(?:kind|sohn|tochter|baby)\b/g
    ];

    for(const re of singlePatterns){
      let m;
      while((m=re.exec(t)))ages.push(Number(m[1]));
    }

    if(/\bbaby\b/.test(t)&&!ages.length){
      const baby=t.match(/\bbaby[^.!?;]{0,18}?(\d{1,2})\s*(?:monate?|monat)\b/);
      if(baby)ages.push(0);
    }

    return uniqueAges(ages);
  }

  function parseFamily(text){
    const adults=parseAdults(text);
    const childCount=parseChildCount(text);
    const ages=parseChildAges(text);
    const hasFamilyIntent=childCount!==null||ages.length>0||/\b(kinder|kindern|kind|baby|sohn|tochter|familie)\b/.test(norm(text));
    if(!hasFamilyIntent)return null;

    const count=childCount!==null?childCount:ages.length;
    const effectiveAdults=adults||null;
    const errors=[];

    if(!count)errors.push('Kinderanzahl fehlt');
    if(count>8)errors.push('Maximal 8 Kinder pro Suche');
    if(ages.length!==count)errors.push(`Bitte Alter für ${count||'alle'} Kinder angeben`);
    if(ages.some(age=>age<0||age>17))errors.push('Kinderalter muss zwischen 0 und 17 liegen');
    if(effectiveAdults&&effectiveAdults+count>9)errors.push('Maximal 9 Reisende pro Suche');
    if(effectiveAdults&&ages.filter(age=>age<=1).length>effectiveAdults)errors.push('Maximal ein Kleinkind unter 2 pro Erwachsenem');

    return{
      adults:effectiveAdults,
      childCount:count,
      ages,
      complete:errors.length===0&&count>0&&ages.length===count,
      errors:[...new Set(errors)]
    };
  }

  function textarea(){return document.getElementById('noreyoAi556Text');}
  function resultRoot(){return document.getElementById('noreyoAi556Result');}

  function familySummary(family){
    if(!family)return'';
    const parts=[];
    if(family.adults)parts.push(`${family.adults} ${family.adults===1?'Erwachsener':'Erwachsene'}`);
    if(family.childCount)parts.push(`${family.childCount} ${family.childCount===1?'Kind':'Kinder'}`);
    if(family.ages.length)parts.push(`Alter ${family.ages.join(' / ')}`);
    return parts.join(' · ');
  }

  function decorateResult(){
    const root=resultRoot();
    const card=root?.querySelector('.noreyo-v556-result');
    if(!card)return;

    card.querySelectorAll('[data-noreyo-v571-family]').forEach(el=>el.remove());
    const family=parseFamily(textarea()?.value||'');
    if(!family)return;

    const anchor=card.querySelector('.noreyo-v556-safe,.noreyo-v556-actions');
    const block=document.createElement('div');
    block.dataset.noreyoV571Family='1';

    if(family.complete){
      block.className='noreyo-v556-group';
      block.innerHTML='<p class="noreyo-v556-grouplabel">Familie</p><div class="noreyo-v556-chips"><span class="noreyo-v556-chip"><i>✓</i>'+familySummary(family)+'</span></div>';
    }else{
      block.className='noreyo-v556-open';
      block.innerHTML='<b>Kinderalter noch offen:</b> '+(family.errors.join(' · ')||'Bitte Reisende prüfen')+'. Vor der Live-Suche musst du die Reisenden vollständig ergänzen.';
    }

    if(anchor)card.insertBefore(block,anchor);else card.appendChild(block);
  }

  function nativeSearchState(){
    try{return typeof searchState!=='undefined'&&searchState?searchState:null;}catch(_){return null;}
  }

  function applyFamilyAfterNative(){
    const family=parseFamily(textarea()?.value||'');
    if(!family){pendingFamily=null;return;}

    const state=nativeSearchState();
    if(family.complete&&state){
      if(family.adults)state.adults=Math.max(1,Math.min(9,family.adults));
      state.childAges=family.ages.slice(0,8);
      pendingFamily=null;
      try{if(typeof updateSearchUI==='function')updateSearchUI();}catch(_){ }
      try{if(typeof persistState==='function')persistState();}catch(_){ }
      return;
    }

    pendingFamily={...family,createdAt:Date.now()};
  }

  function reconcilePendingFamily(){
    if(!pendingFamily)return;
    const state=nativeSearchState();
    if(!state)return;
    const ages=Array.isArray(state.childAges)?state.childAges.map(Number):[];
    const adults=Math.round(Number(state.adults));
    if(
      Number.isInteger(adults)&&adults>=1&&
      ages.length===pendingFamily.childCount&&
      ages.every(age=>Number.isInteger(age)&&age>=0&&age<=17)&&
      ages.filter(age=>age<=1).length<=adults&&
      adults+ages.length<=9
    )pendingFamily=null;
  }

  function onClickCapture(event){
    const button=event.target instanceof Element?event.target.closest('.noreyo-v556-apply'):null;
    if(!button)return;
    const family=parseFamily(textarea()?.value||'');
    if(family&&!family.complete)pendingFamily={...family,createdAt:Date.now()};
    setTimeout(applyFamilyAfterNative,0);
  }

  function install(){
    document.addEventListener('click',onClickCapture,true);
    document.addEventListener('click',()=>setTimeout(reconcilePendingFamily,0),false);

    if(typeof MutationObserver!=='undefined'){
      new MutationObserver(()=>decorateResult()).observe(document.body,{subtree:true,childList:true});
    }
  }

  window.NOREYO_V571=Object.freeze({
    parseFamily,
    reconcilePendingFamily,
    get pendingFamily(){return pendingFamily;}
  });

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});
  else install();
})();