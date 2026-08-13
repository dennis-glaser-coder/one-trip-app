/* NOREYO V10.97 bootstrap — V10.95 plus verified flight price-delta clarity. */
(()=>{
'use strict';
const BUILD='10.97-safe',ATTEMPTS=2,RETRY_MS=260,TIMEOUT_MS=15000,READY_TIMEOUT_MS=45000,POLL_MS=25,KEY='__NOREYO_V1097_SINGLE_FLIGHT__';
const COMPONENTS=Object.freeze([
  {name:'V10.79',src:'./noreyo-bootstrap-v1079.js?build=1079',asyncReady:true,ready:()=>window.NOREYO_V1079?.state?.().status==='ready'},
  {name:'Semantic search serialization V10.80',src:'./noreyo-v1080.js?build=1080',ready:()=>window.NOREYO_V1080?.BUILD==='10.80'},
  {name:'Provider route integrity V10.82',src:'./noreyo-v1082.js?build=1082',ready:()=>window.NOREYO_V1082?.BUILD==='10.82'},
  {name:'Flight live verify V10.84',src:'./noreyo-v1084.js?build=1084',ready:()=>window.NOREYO_V1084?.BUILD==='10.84'},
  {name:'Flight verify lifecycle V10.86',src:'./noreyo-v1086.js?build=1086',ready:()=>window.NOREYO_V1086?.BUILD==='10.86'},
  {name:'iPhone bottom safe area V10.88',src:'./noreyo-v1088.js?build=1088',ready:()=>window.NOREYO_V1088?.BUILD==='10.88'},
  {name:'iPhone touch targets V10.90',src:'./noreyo-v1090.js?build=1090',ready:()=>window.NOREYO_V1090?.BUILD==='10.90'},
  {name:'Safari input zoom V10.92',src:'./noreyo-v1092.js?build=1092',ready:()=>window.NOREYO_V1092?.BUILD==='10.92'},
  {name:'Flight verify expiry gate V10.94',src:'./noreyo-v1094.js?build=1094',ready:()=>window.NOREYO_V1094?.BUILD==='10.94'},
  {name:'Flight verify delta V10.96',src:'./noreyo-v1096.js?build=1096',ready:()=>window.NOREYO_V1096?.BUILD==='10.96'}
]);
function state(){const o=window[KEY];if(o?.status)return o;const s={status:'idle',promise:null,error:null,component:null,attempt:0};try{window[KEY]=s}catch(_){}return s;}
function src(b,a){return a<=1?b:b+(b.includes('?')?'&':'?')+'noreyo_v1097_retry='+a;}
function sleep(ms){return new Promise(r=>setTimeout(r,ms));}
async function waitReady(c){if(c.ready())return true;const start=Date.now();while(Date.now()-start<READY_TIMEOUT_MS){await sleep(POLL_MS);if(c.ready())return true;if(c.name==='V10.79'){const i=window.NOREYO_V1079?.state?.();if(i?.status==='failed')throw Object.assign(i.error||new Error('V10.79 inner failed'),{replaySafe:false});}}return false;}
function loadOnce(c,a){return new Promise((resolve,reject)=>{if(c.ready())return resolve(true);const s=document.createElement('script');let done=false,t=0,loaded=false;const finish=(ok,e)=>{if(done)return;done=true;if(t)clearTimeout(t);s.onload=s.onerror=null;if(!ok&&!loaded){try{s.remove()}catch(_){}}ok?resolve(true):reject(e||new Error(c.name+' konnte nicht geladen werden'));};t=setTimeout(()=>finish(false,Object.assign(new Error(c.name+' Netzwerk-/Script-Timeout'),{replaySafe:!loaded})),TIMEOUT_MS);s.src=src(c.src,a);s.onload=async()=>{loaded=true;if(t){clearTimeout(t);t=0;}if(!c.asyncReady)return finish(c.ready(),Object.assign(new Error(c.name+' meldet keinen gültigen Build'),{replaySafe:false}));try{finish(await waitReady(c),Object.assign(new Error(c.name+' wurde geladen, aber nicht vollständig bereit'),{replaySafe:false}));}catch(e){finish(false,Object.assign(e,{replaySafe:false}));}};s.onerror=()=>finish(false,Object.assign(new Error(c.name+' konnte nicht geladen werden'),{replaySafe:true}));document.head.appendChild(s);});}
async function loadComponent(c,st){if(c.ready())return true;st.component=c.name;let last=null;for(let a=1;a<=ATTEMPTS;a++){st.attempt=a;try{return await loadOnce(c,a);}catch(e){last=e;if(e?.replaySafe===false||a>=ATTEMPTS)break;await sleep(RETRY_MS);}}throw last;}
function fail(e){const status=document.getElementById('status'),bar=document.getElementById('bar'),box=document.getElementById('error');if(bar)bar.style.display='none';if(status)status.textContent='NOREYO konnte nicht geladen werden';if(box){box.style.display='block';box.setAttribute('role','alert');box.setAttribute('aria-live','assertive');if(!box.querySelector('[data-noreyo-v1097-retry="1"]')){box.textContent='Die Verbindung zum Reisemodul ist fehlgeschlagen.';const br=document.createElement('br'),button=document.createElement('button');button.type='button';button.className='boot-retry';button.setAttribute('data-noreyo-v1097-retry','1');button.textContent='Erneut versuchen';button.addEventListener('click',()=>location.reload());box.appendChild(br);box.appendChild(button);try{button.focus({preventScroll:true})}catch(_){}}}console.error(e);}
async function run(){const st=state();if(st.status==='ready')return true;if(st.promise)return st.promise;st.status='loading';st.error=null;st.promise=(async()=>{try{for(const c of COMPONENTS)await loadComponent(c,st);st.status='ready';st.component=null;st.attempt=0;return true;}catch(e){st.status='failed';st.error=e;fail(e);throw e;}})().finally(()=>{st.promise=null;});return st.promise;}
window.NOREYO_V1097=Object.freeze({BUILD,COMPONENTS,state,run});run().catch(()=>{});
})();