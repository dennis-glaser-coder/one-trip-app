/* NOREYO V11.53 bootstrap — V11.51 plus deterministic BOOK idempotency reference. */
(()=>{
'use strict';
const BUILD='11.53-safe',ATTEMPTS=2,RETRY_MS=260,TIMEOUT_MS=15000,READY_TIMEOUT_MS=45000,POLL_MS=25,KEY='__NOREYO_V1153_SINGLE_FLIGHT__';
const COMPONENTS=Object.freeze([
  {name:'V11.31',src:'./noreyo-bootstrap-v1131.js?build=1131',asyncReady:true,ready:()=>window.NOREYO_V1131?.state?.().status==='ready'},
  {name:'PREBOOK price acknowledgement V11.32',src:'./noreyo-v1132.js?build=1132',ready:()=>window.NOREYO_V1132?.BUILD==='11.32'},
  {name:'Cancellation acknowledgement V11.34',src:'./noreyo-v1134.js?build=1134',ready:()=>window.NOREYO_V1134?.BUILD==='11.34'},
  {name:'PREBOOK session revalidation V11.36',src:'./noreyo-v1136.js?build=1136',ready:()=>window.NOREYO_V1136?.BUILD==='11.36'},
  {name:'PREBOOK freshness V11.38',src:'./noreyo-v1138.js?build=1138',ready:()=>window.NOREYO_V1138?.BUILD==='11.38'},
  {name:'PREBOOK freshness UI V11.40',src:'./noreyo-v1140.js?build=1140',ready:()=>window.NOREYO_V1140?.BUILD==='11.40'},
  {name:'PREBOOK refresh reconciliation V11.42',src:'./noreyo-v1142.js?build=1142',ready:()=>window.NOREYO_V1142?.BUILD==='11.42'},
  {name:'Checkout UI authority V11.44',src:'./noreyo-v1144.js?build=1144',ready:()=>window.NOREYO_V1144?.BUILD==='11.44'},
  {name:'Hotel booking-data preparation V11.46',src:'./noreyo-v1146.js?build=1146',ready:()=>window.NOREYO_V1146?.BUILD==='11.46'},
  {name:'Booking draft binding V11.48',src:'./noreyo-v1148.js?build=1148',ready:()=>window.NOREYO_V1148?.BUILD==='11.48'},
  {name:'Booking-data phone UX V11.50',src:'./noreyo-v1150.js?build=1150',ready:()=>window.NOREYO_V1150?.BUILD==='11.50'},
  {name:'BOOK idempotency reference V11.52',src:'./noreyo-v1152.js?build=1152',ready:()=>window.NOREYO_V1152?.BUILD==='11.52'}
]);
function state(){const o=window[KEY];if(o?.status)return o;const s={status:'idle',promise:null,error:null,component:null,attempt:0};try{window[KEY]=s}catch(_){}return s}
function src(base,attempt){return attempt<=1?base:base+(base.includes('?')?'&':'?')+'noreyo_v1153_retry='+attempt}
function sleep(ms){return new Promise(r=>setTimeout(r,ms))}
async function waitReady(c){if(c.ready())return true;const start=Date.now();while(Date.now()-start<READY_TIMEOUT_MS){await sleep(POLL_MS);if(c.ready())return true;if(c.name==='V11.31'){const i=window.NOREYO_V1131?.state?.();if(i?.status==='failed')throw Object.assign(i.error||new Error('V11.31 inner failed'),{replaySafe:false})}}return false}
function loadOnce(c,a){return new Promise((resolve,reject)=>{if(c.ready())return resolve(true);const s=document.createElement('script');let done=false,t=0,loaded=false;const finish=(ok,e)=>{if(done)return;done=true;if(t)clearTimeout(t);s.onload=s.onerror=null;if(!ok&&!loaded){try{s.remove()}catch(_){}}ok?resolve(true):reject(e||new Error(c.name+' konnte nicht geladen werden'))};t=setTimeout(()=>finish(false,Object.assign(new Error(c.name+' Netzwerk-/Script-Timeout'),{replaySafe:!loaded})),TIMEOUT_MS);s.src=src(c.src,a);s.onload=async()=>{loaded=true;if(t){clearTimeout(t);t=0}if(!c.asyncReady)return finish(c.ready(),Object.assign(new Error(c.name+' meldet keinen gültigen Build'),{replaySafe:false}));try{finish(await waitReady(c),Object.assign(new Error(c.name+' wurde geladen, aber nicht vollständig bereit'),{replaySafe:false}))}catch(e){finish(false,Object.assign(e,{replaySafe:false}))}};s.onerror=()=>finish(false,Object.assign(new Error(c.name+' konnte nicht geladen werden'),{replaySafe:true}));document.head.appendChild(s)})}
async function loadComponent(c,st){if(c.ready())return true;st.component=c.name;let last=null;for(let a=1;a<=ATTEMPTS;a++){st.attempt=a;try{return await loadOnce(c,a)}catch(e){last=e;if(e?.replaySafe===false||a>=ATTEMPTS)break;await sleep(RETRY_MS)}}throw last}
function fail(e){const status=document.getElementById('status'),bar=document.getElementById('bar'),box=document.getElementById('error');if(bar)bar.style.display='none';if(status)status.textContent='NOREYO konnte nicht geladen werden';if(box){box.style.display='block';box.setAttribute('role','alert');box.setAttribute('aria-live','assertive');if(!box.querySelector('[data-noreyo-v1153-retry="1"]')){box.textContent='Die Verbindung zum Reisemodul ist fehlgeschlagen.';const br=document.createElement('br'),button=document.createElement('button');button.type='button';button.className='boot-retry';button.setAttribute('data-noreyo-v1153-retry','1');button.textContent='Erneut versuchen';button.addEventListener('click',()=>location.reload());box.appendChild(br);box.appendChild(button);try{button.focus({preventScroll:true})}catch(_){}}}console.error(e)}
async function run(){const st=state();if(st.status==='ready')return true;if(st.promise)return st.promise;st.status='loading';st.error=null;st.promise=(async()=>{try{for(const c of COMPONENTS)await loadComponent(c,st);st.status='ready';st.component=null;st.attempt=0;return true}catch(e){st.status='failed';st.error=e;fail(e);throw e}})().finally(()=>{st.promise=null});return st.promise}
window.NOREYO_V1153=Object.freeze({BUILD,COMPONENTS,state,run});run().catch(()=>{})
})();