/* NOREYO V8.66 bootstrap arbiter — V8.64 plus duplicate-safe favorites. */
(()=>{
'use strict';
const BUILD='8.66-safe',INNER='./noreyo-bootstrap-v864.js?build=864',FAVORITES='./noreyo-v865.js?build=865';
const ATTEMPTS=2,RETRY_MS=260,TIMEOUT_MS=15000,KEY='__NOREYO_V866_SINGLE_FLIGHT__';
function state(){const old=window[KEY];if(old&&old.status)return old;const s={status:'idle',promise:null,error:null,component:null,attempt:0};try{window[KEY]=s;}catch(_){}return s;}
function readyInner(){return window.NOREYO_V864?.BUILD==='8.64-safe'&&window.NOREYO_V863?.BUILD==='8.63';}
function readyFav(){return window.NOREYO_V865?.BUILD==='8.65';}
function src(base,attempt){return attempt<=1?base:base+(base.includes('?')?'&':'?')+'noreyo_v866_retry='+attempt;}
function sleep(ms){return new Promise(r=>setTimeout(r,ms));}
function loadOnce(name,url,ready,attempt){return new Promise((resolve,reject)=>{if(ready())return resolve(true);const s=document.createElement('script');let done=false,timer=0;const finish=(ok,error)=>{if(done)return;done=true;if(timer)clearTimeout(timer);s.onload=s.onerror=null;if(!ok){try{s.remove();}catch(_){}}ok?resolve(true):reject(error||new Error(name+' konnte nicht geladen werden'));};timer=setTimeout(()=>finish(false,new Error(name+' Timeout')),TIMEOUT_MS);s.src=src(url,attempt);s.onload=()=>finish(ready(),new Error(name+' meldet keinen gültigen Build'));s.onerror=()=>finish(false,new Error(name+' konnte nicht geladen werden'));document.head.appendChild(s);});}
async function load(name,url,ready,st){if(ready())return true;st.component=name;let last=null;for(let attempt=1;attempt<=ATTEMPTS;attempt++){st.attempt=attempt;try{return await loadOnce(name,url,ready,attempt);}catch(e){last=e;if(attempt<ATTEMPTS)await sleep(RETRY_MS);}}throw last;}
function fail(error){const status=document.getElementById('status'),bar=document.getElementById('bar'),box=document.getElementById('error');if(bar)bar.style.display='none';if(status)status.textContent='NOREYO konnte nicht geladen werden';if(box){box.style.display='block';box.setAttribute('role','alert');box.setAttribute('aria-live','assertive');box.textContent='Die Verbindung zum Reisemodul ist fehlgeschlagen.';}console.error(error);}
async function run(){const st=state();if(st.status==='ready')return true;if(st.promise)return st.promise;st.status='loading';st.error=null;st.promise=(async()=>{try{await load('V8.64',INNER,readyInner,st);await load('Favoriten V8.65',FAVORITES,readyFav,st);st.status='ready';st.component=null;st.attempt=0;return true;}catch(e){st.status='failed';st.error=e;fail(e);throw e;}})().finally(()=>{st.promise=null;});return st.promise;}
window.NOREYO_V866=Object.freeze({BUILD,INNER,FAVORITES,ATTEMPTS,RETRY_MS,TIMEOUT_MS,KEY,state,readyInner,readyFav,src,loadOnce,load,run});run().catch(()=>{});
})();