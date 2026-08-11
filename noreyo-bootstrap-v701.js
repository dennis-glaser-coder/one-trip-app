/* NOREYO V7.01 bootstrap — installs the current final request guard plus transactional favorite safety after the generated app loads. */
(()=>{
'use strict';
const BUILD='7.01-safe',GUARD='./noreyo-v701.js?build=701',FAVORITES='./noreyo-v700.js?build=700',BASE='./noreyo-bootstrap-v698.js?build=701';
const statusEl=document.getElementById('status');
function setStatus(t){if(statusEl)statusEl.textContent=t;}
function fail(error){console.error(error);const bar=document.getElementById('bar');if(bar)bar.style.display='none';if(statusEl)statusEl.textContent='NOREYO konnte nicht geladen werden';const e=document.getElementById('error');if(e){e.style.display='block';e.textContent='Bitte Seite neu laden.\n\n'+(error?.message||String(error));}}
function load(src){return new Promise((resolve,reject)=>{const s=document.createElement('script');let done=false;const finish=(ok,err)=>{if(done)return;done=true;clearTimeout(timer);s.onload=s.onerror=null;ok?resolve():reject(err||new Error('Script konnte nicht geladen werden: '+src));};const timer=setTimeout(()=>finish(false,new Error('Script-Timeout: '+src)),15000);s.src=src;s.onload=()=>finish(true);s.onerror=()=>finish(false);document.head.appendChild(s);});}
function armDocumentWriteInjection(){try{if(typeof Document==='undefined'||typeof Document.prototype.write!=='function')return()=>{};const proto=Document.prototype,prior=proto.write;let active=true,timer=0;const restore=()=>{if(proto.write===wrapped)proto.write=prior;active=false;if(timer){clearTimeout(timer);timer=0;}};const wrapped=function(...parts){if(active&&this===document){let injected=false;parts=parts.map(part=>{if(injected||typeof part!=='string'||!part.includes('</body>'))return part;injected=true;return part.replace('</body>','<script src="'+GUARD+'"></scr'+'ipt><script src="'+FAVORITES+'"></scr'+'ipt></body>');});if(injected)restore();}return prior.apply(this,parts);};proto.write=wrapped;timer=setTimeout(restore,30000);return restore;}catch(_){return()=>{};}}
async function boot(){let disarm=()=>{};try{setStatus('NOREYO '+BUILD+' wird vorbereitet …');await load(GUARD);disarm=armDocumentWriteInjection();await load(BASE);}catch(error){disarm();fail(error);}}
window.NOREYO_BOOTSTRAP_PRELOAD=Object.freeze({BUILD,GUARD,FAVORITES,BASE,armDocumentWriteInjection});
boot();
})();
