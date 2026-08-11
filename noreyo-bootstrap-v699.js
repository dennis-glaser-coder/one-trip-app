/* NOREYO V6.99 bootstrap — installs the Request-object integrity boundary before the current V6.98 app bootstrap. */
(()=>{
'use strict';
const BUILD='6.99-safe';
const statusEl=document.getElementById('status');
function setStatus(t){if(statusEl)statusEl.textContent=t;}
function fail(error){
  console.error(error);
  const bar=document.getElementById('bar');if(bar)bar.style.display='none';
  if(statusEl)statusEl.textContent='NOREYO konnte nicht geladen werden';
  const e=document.getElementById('error');if(e){e.style.display='block';e.textContent='Bitte Seite neu laden.\n\n'+(error?.message||String(error));}
}
function load(src){return new Promise((resolve,reject)=>{
  const s=document.createElement('script');let done=false;
  const finish=(ok,err)=>{if(done)return;done=true;clearTimeout(timer);s.onload=s.onerror=null;ok?resolve():reject(err||new Error('Script konnte nicht geladen werden: '+src));};
  const timer=setTimeout(()=>finish(false,new Error('Script-Timeout: '+src)),15000);
  s.src=src;s.onload=()=>finish(true);s.onerror=()=>finish(false);document.head.appendChild(s);
});}
async function boot(){
  try{
    setStatus('NOREYO '+BUILD+' wird vorbereitet …');
    await load('./noreyo-v699.js?build=699');
    await load('./noreyo-bootstrap-v698.js?build=699');
  }catch(error){fail(error);}
}
window.NOREYO_BOOTSTRAP_PRELOAD=Object.freeze({BUILD});
boot();
})();
