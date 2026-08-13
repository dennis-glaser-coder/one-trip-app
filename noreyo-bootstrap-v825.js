/* NOREYO V8.25 bootstrap arbiter — single-flight delivery of the proven V8.24 stack. */
(()=>{
'use strict';
const BUILD='8.25-safe',INNER='./noreyo-bootstrap-v824.js?build=824',ATTEMPTS=2,RETRY_MS=260,TIMEOUT_MS=15000;
const KEY='__NOREYO_V825_SINGLE_FLIGHT__';

function state(){
  const prior=window[KEY];
  if(prior&&prior.status)return prior;
  const next={status:'idle',attempt:0,promise:null,error:null};
  try{window[KEY]=next;}catch(_){}
  return next;
}
function retrySrc(src,attempt){
  return attempt<=1?src:src+(src.includes('?')?'&':'?')+'noreyo_v825_retry='+attempt;
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
window.NOREYO_V825=Object.freeze({BUILD,INNER,ATTEMPTS,RETRY_MS,TIMEOUT_MS,KEY,state,retrySrc,loadOnce,run});
run().catch(()=>{});
})();