/* NOREYO V8.31 bootstrap arbiter — component-isolated retry and full search preconditions.
   The proven V8.24 inner stack is never replayed just because a later guard fails.
   Each component has its own bounded retry and readiness check. */
(()=>{
'use strict';
const BUILD='8.31-safe',ATTEMPTS=2,RETRY_MS=260,TIMEOUT_MS=15000;
const KEY='__NOREYO_V831_SINGLE_FLIGHT__';
const COMPONENTS=Object.freeze([
  {name:'inner',src:'./noreyo-bootstrap-v824.js?build=824',ready:()=>String(window.NOREYO_BOOTSTRAP_PRELOAD?.BUILD||'')==='8.24-safe'},
  {name:'request',src:'./noreyo-v826.js?build=826',ready:()=>window.NOREYO_V826?.BUILD==='8.26'},
  {name:'destination',src:'./noreyo-v828.js?build=828',ready:()=>window.NOREYO_V828?.BUILD==='8.28'},
  {name:'occupancy',src:'./noreyo-v830.js?build=830',ready:()=>window.NOREYO_V830?.BUILD==='8.30'}
]);

function state(){
  const prior=window[KEY];
  if(prior&&prior.status)return prior;
  const next={status:'idle',component:null,attempt:0,promise:null,error:null};
  try{window[KEY]=next;}catch(_){}
  return next;
}
function retrySrc(src,attempt){
  return attempt<=1?src:src+(src.includes('?')?'&':'?')+'noreyo_v831_retry='+attempt;
}
function fail(error){
  const bar=document.getElementById('bar'),status=document.getElementById('status'),box=document.getElementById('error');
  if(bar)bar.style.display='none';
  if(status)status.textContent='NOREYO konnte nicht geladen werden';
  if(box){
    box.style.display='block';box.setAttribute('role','alert');box.setAttribute('aria-live','assertive');
    if(!box.querySelector('[data-noreyo-v831-retry="1"]')){
      box.textContent='Die Verbindung zum Reisemodul ist fehlgeschlagen.';
      const br=document.createElement('br'),button=document.createElement('button');
      button.type='button';button.className='boot-retry';button.setAttribute('data-noreyo-v831-retry','1');
      button.textContent='Erneut versuchen';button.addEventListener('click',()=>location.reload());
      box.appendChild(br);box.appendChild(button);
    }
  }
  console.error(error);
}
function loadOnce(component,attempt){
  return new Promise((resolve,reject)=>{
    if(component.ready())return resolve(true);
    const script=document.createElement('script');let settled=false,timer=0;
    const finish=(ok,error)=>{
      if(settled)return;settled=true;
      if(timer)clearTimeout(timer);
      script.onload=script.onerror=null;
      if(!ok){try{script.remove();}catch(_){}}
      ok?resolve(true):reject(error||new Error(component.name+' konnte nicht geladen werden'));
    };
    timer=setTimeout(()=>finish(false,new Error(component.name+' Timeout')),TIMEOUT_MS);
    script.src=retrySrc(component.src,attempt);
    script.onload=()=>finish(component.ready(),new Error(component.name+' meldet keinen gültigen Startzustand'));
    script.onerror=()=>finish(false,new Error(component.name+' konnte nicht geladen werden'));
    document.head.appendChild(script);
  });
}
async function loadComponent(component,s=state()){
  if(component.ready())return true;
  let last=null;
  s.component=component.name;
  for(let attempt=1;attempt<=ATTEMPTS;attempt++){
    s.attempt=attempt;
    try{return await loadOnce(component,attempt);}
    catch(error){
      last=error;
      if(attempt<ATTEMPTS)await new Promise(resolve=>setTimeout(resolve,RETRY_MS));
    }
  }
  throw last||new Error(component.name+' konnte nicht geladen werden');
}
async function run(){
  const s=state();
  if(s.status==='ready')return true;
  if(s.promise)return s.promise;
  s.status='loading';s.error=null;
  s.promise=(async()=>{
    try{
      for(const component of COMPONENTS)await loadComponent(component,s);
      s.status='ready';s.component=null;s.attempt=0;
      return true;
    }catch(error){
      s.status='failed';s.error=error;fail(error);throw error;
    }
  })().finally(()=>{s.promise=null;});
  return s.promise;
}
window.NOREYO_V831=Object.freeze({BUILD,ATTEMPTS,RETRY_MS,TIMEOUT_MS,KEY,COMPONENTS,state,retrySrc,loadOnce,loadComponent,run});
run().catch(()=>{});
})();