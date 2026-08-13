/* NOREYO V8.29 bootstrap arbiter — single-flight V8.24 plus traveller/date/destination completeness. */
(()=>{
'use strict';
const BUILD='8.29-safe',INNER='./noreyo-bootstrap-v824.js?build=824',COMPLETENESS='./noreyo-v826.js?build=826',DESTINATION='./noreyo-v828.js?build=828',ATTEMPTS=2,RETRY_MS=260,TIMEOUT_MS=15000;
const KEY='__NOREYO_V829_SINGLE_FLIGHT__';

function state(){
  const prior=window[KEY];
  if(prior&&prior.status)return prior;
  const next={status:'idle',attempt:0,promise:null,error:null};
  try{window[KEY]=next;}catch(_){}
  return next;
}
function retrySrc(src,attempt){
  return attempt<=1?src:src+(src.includes('?')?'&':'?')+'noreyo_v829_retry='+attempt;
}
function fail(error){
  const bar=document.getElementById('bar');
  const status=document.getElementById('status');
  const box=document.getElementById('error');
  if(bar)bar.style.display='none';
  if(status)status.textContent='NOREYO konnte nicht geladen werden';
  if(box){
    box.style.display='block';
    box.setAttribute('role','alert');
    box.setAttribute('aria-live','assertive');
    if(!box.querySelector('[data-noreyo-v825-retry="1"]')){
      box.textContent='Die Verbindung zum Reisemodul ist fehlgeschlagen.';
      const br=document.createElement('br');
      const button=document.createElement('button');
      button.type='button';
      button.className='boot-retry';
      button.setAttribute('data-noreyo-v825-retry','1');
      button.textContent='Erneut versuchen';
      button.addEventListener('click',()=>location.reload());
      box.appendChild(br);box.appendChild(button);
    }
  }
  console.error(error);
}
function loadOnce(attempt){
  return new Promise((resolve,reject)=>{
    const script=document.createElement('script');
    let settled=false,timer=0;
    const finish=(ok,error)=>{
      if(settled)return;
      settled=true;
      if(timer)clearTimeout(timer);
      script.onload=script.onerror=null;
      if(!ok){try{script.remove();}catch(_){}}
      ok?resolve():reject(error||new Error('V8.24 konnte nicht geladen werden'));
    };
    timer=setTimeout(()=>finish(false,new Error('V8.24 Bootstrap-Timeout')),TIMEOUT_MS);
    script.src=retrySrc(INNER,attempt);
    script.onload=()=>{
      const ready=String(window.NOREYO_BOOTSTRAP_PRELOAD?.BUILD||'')==='8.24-safe';
      finish(ready,ready?null:new Error('V8.24 Bootstrap meldet keinen gültigen Startzustand'));
    };
    script.onerror=()=>finish(false,new Error('V8.24 Bootstrap konnte nicht geladen werden'));
    document.head.appendChild(script);
  });
}
function loadCompleteness(){
  return new Promise((resolve,reject)=>{
    if(window.NOREYO_V826?.BUILD==='8.26')return resolve(true);
    const script=document.createElement('script');
    let settled=false,timer=0;
    const finish=(ok,error)=>{
      if(settled)return;
      settled=true;
      if(timer)clearTimeout(timer);
      script.onload=script.onerror=null;
      if(!ok){try{script.remove();}catch(_){}}
      ok?resolve(true):reject(error||new Error('V8.26 Request-Guard konnte nicht geladen werden'));
    };
    timer=setTimeout(()=>finish(false,new Error('V8.26 Request-Guard Timeout')),TIMEOUT_MS);
    script.src=COMPLETENESS;
    script.onload=()=>finish(window.NOREYO_V826?.BUILD==='8.26',new Error('V8.26 Request-Guard meldet keinen gültigen Zustand'));
    script.onerror=()=>finish(false,new Error('V8.26 Request-Guard konnte nicht geladen werden'));
    document.head.appendChild(script);
  });
}
function loadDestination(){
  return new Promise((resolve,reject)=>{
    if(window.NOREYO_V828?.BUILD==='8.28')return resolve(true);
    const script=document.createElement('script');
    let settled=false,timer=0;
    const finish=(ok,error)=>{
      if(settled)return;
      settled=true;
      if(timer)clearTimeout(timer);
      script.onload=script.onerror=null;
      if(!ok){try{script.remove();}catch(_){}}
      ok?resolve(true):reject(error||new Error('V8.28 Destination-Guard konnte nicht geladen werden'));
    };
    timer=setTimeout(()=>finish(false,new Error('V8.28 Destination-Guard Timeout')),TIMEOUT_MS);
    script.src=DESTINATION;
    script.onload=()=>finish(window.NOREYO_V828?.BUILD==='8.28',new Error('V8.28 Destination-Guard meldet keinen gültigen Zustand'));
    script.onerror=()=>finish(false,new Error('V8.28 Destination-Guard konnte nicht geladen werden'));
    document.head.appendChild(script);
  });
}
async function run(){
  const s=state();
  if(s.status==='ready')return true;
  if(s.promise)return s.promise;
  s.status='loading';
  s.promise=(async()=>{
    let last=null;
    for(let attempt=1;attempt<=ATTEMPTS;attempt++){
      s.attempt=attempt;
      try{
        await loadOnce(attempt);
        await loadCompleteness();
        await loadDestination();
        s.status='ready';s.error=null;
        return true;
      }catch(error){
        last=error;
        if(attempt<ATTEMPTS)await new Promise(resolve=>setTimeout(resolve,RETRY_MS));
      }
    }
    s.status='failed';s.error=last;
    fail(last);
    throw last;
  })().finally(()=>{s.promise=null;});
  return s.promise;
}
window.NOREYO_V829=Object.freeze({BUILD,INNER,COMPLETENESS,DESTINATION,ATTEMPTS,RETRY_MS,TIMEOUT_MS,KEY,state,retrySrc,loadOnce,loadCompleteness,loadDestination,run});
run().catch(()=>{});
})();