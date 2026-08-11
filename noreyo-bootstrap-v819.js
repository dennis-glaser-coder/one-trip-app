/* NOREYO V8.19 bootstrap — bounded retry for bootstrap dependency scripts. */
(()=>{
'use strict';
const BUILD='8.19-safe',BOOTFETCH='./noreyo-v804.js?build=804',BOOTERROR='./noreyo-v806.js?build=806',GUARD='./noreyo-v719.js?build=719',SHAPE='./noreyo-v717.js?build=717',GENERATION='./noreyo-v723.js?build=723',TRANSPORT='./noreyo-v736.js?build=736',URLBRIDGE='./noreyo-v716.js?build=716',LIFECYCLE='./noreyo-v743.js?build=743',STABILIZER='./noreyo-v744.js?build=744',FAVORITES='./noreyo-v703.js?build=703',FAVORITESAFE='./noreyo-v791.js?build=791',RANKING='./noreyo-v707.js?build=707',PRIORITY='./noreyo-v708.js?build=708',PRIORITYTRUTH='./noreyo-v810.js?build=810',PRIORITYNOTE='./noreyo-v815.js?build=815',PREFSEM='./noreyo-v738.js?build=738',FILTERUX='./noreyo-v802.js?build=802',FILTERVIEW='./noreyo-v813.js?build=813',ADULTAI='./noreyo-v732.js?build=732',CHILDAI='./noreyo-v747.js?build=747',CHILDNATURAL='./noreyo-v795.js?build=795',CHILDGATE='./noreyo-v797.js?build=797',TOTALPARTY='./noreyo-v796.js?build=796',TRAVELLERATOMIC='./noreyo-v798.js?build=798',TRAVELLERSTATE='./noreyo-v751.js?build=751',AIRPORTAI='./noreyo-v800.js?build=800',STARTUPSTATE='./noreyo-v755.js?build=755',DATESTATE='./noreyo-v768.js?build=768',AIDATERANGE='./noreyo-v781.js?build=781',NAMEDDATE='./noreyo-v817.js?build=817',NAVSTABILIZER='./noreyo-v759.js?build=759',HOTSTABILIZER='./noreyo-v764.js?build=764',VIEWPORT='./noreyo-v702.js?build=702',PLANNERVIEW='./noreyo-v786.js?build=786',AIVIEWPORT='./noreyo-v782.js?build=782',AIWIDTH='./noreyo-v784.js?build=784',BASE='./noreyo-bootstrap-v698.js?build=819';
const SCRIPT_ATTEMPTS=2,SCRIPT_RETRY_MS=220,SCRIPT_TIMEOUT_MS=15000;
const statusEl=document.getElementById('status');
function setStatus(t){if(statusEl)statusEl.textContent=t;}
function fail(error){console.error(error);const bar=document.getElementById('bar');if(bar)bar.style.display='none';if(statusEl)statusEl.textContent='NOREYO konnte nicht geladen werden';const e=document.getElementById('error');if(e){e.style.display='block';e.textContent='Bitte Seite neu laden.\n\n'+(error?.message||String(error));}}
function retrySrc(src,attempt){return attempt<=1?src:src+(src.includes('?')?'&':'?')+'noreyo_retry='+attempt;}
function loadOnce(src,attempt=1){
  return new Promise((resolve,reject)=>{
    const s=document.createElement('script');let done=false,timer=0;
    const finish=(ok,err)=>{if(done)return;done=true;if(timer)clearTimeout(timer);s.onload=s.onerror=null;ok?resolve():reject(err||new Error('Script konnte nicht geladen werden: '+src));};
    timer=setTimeout(()=>finish(false,new Error('Script-Timeout: '+src)),SCRIPT_TIMEOUT_MS);
    s.src=retrySrc(src,attempt);
    s.onload=()=>finish(true);
    s.onerror=()=>finish(false,new Error('Script konnte nicht geladen werden: '+src));
    document.head.appendChild(s);
  });
}
async function load(src){
  let lastError=null;
  for(let attempt=1;attempt<=SCRIPT_ATTEMPTS;attempt++){
    try{return await loadOnce(src,attempt);}
    catch(error){
      lastError=error;
      if(attempt>=SCRIPT_ATTEMPTS)break;
      await new Promise(resolve=>setTimeout(resolve,SCRIPT_RETRY_MS));
    }
  }
  throw lastError||new Error('Script konnte nicht geladen werden: '+src);
}
function armDocumentWriteInjection(){try{if(typeof Document==='undefined'||typeof Document.prototype.write!=='function')return()=>{};const proto=Document.prototype,prior=proto.write;let active=true,timer=0;const restore=()=>{if(proto.write===wrapped)proto.write=prior;active=false;if(timer){clearTimeout(timer);timer=0;}};const wrapped=function(...parts){if(active&&this===document){let injected=false;parts=parts.map(part=>{if(injected||typeof part!=='string'||!part.includes('</body>'))return part;injected=true;return part.replace('</body>','<script src="'+GUARD+'"></scr'+'ipt><script src="'+SHAPE+'"></scr'+'ipt><script src="'+GENERATION+'"></scr'+'ipt><script src="'+TRANSPORT+'"></scr'+'ipt><script src="'+URLBRIDGE+'"></scr'+'ipt><script src="'+LIFECYCLE+'"></scr'+'ipt><script src="'+STABILIZER+'"></scr'+'ipt><script src="'+FAVORITES+'"></scr'+'ipt><script src="'+FAVORITESAFE+'"></scr'+'ipt><script src="'+RANKING+'"></scr'+'ipt><script src="'+PRIORITY+'"></scr'+'ipt><script src="'+PRIORITYTRUTH+'"></scr'+'ipt><script src="'+PRIORITYNOTE+'"></scr'+'ipt><script src="'+PREFSEM+'"></scr'+'ipt><script src="'+FILTERUX+'"></scr'+'ipt><script src="'+FILTERVIEW+'"></scr'+'ipt><script src="'+ADULTAI+'"></scr'+'ipt><script src="'+CHILDAI+'"></scr'+'ipt><script src="'+CHILDNATURAL+'"></scr'+'ipt><script src="'+CHILDGATE+'"></scr'+'ipt><script src="'+TOTALPARTY+'"></scr'+'ipt><script src="'+TRAVELLERATOMIC+'"></scr'+'ipt><script src="'+TRAVELLERSTATE+'"></scr'+'ipt><script src="'+AIRPORTAI+'"></scr'+'ipt><script src="'+STARTUPSTATE+'"></scr'+'ipt><script src="'+DATESTATE+'"></scr'+'ipt><script src="'+AIDATERANGE+'"></scr'+'ipt><script src="'+NAMEDDATE+'"></scr'+'ipt><script src="'+NAVSTABILIZER+'"></scr'+'ipt><script src="'+HOTSTABILIZER+'"></scr'+'ipt><script src="'+VIEWPORT+'"></scr'+'ipt><script src="'+PLANNERVIEW+'"></scr'+'ipt><script src="'+AIVIEWPORT+'"></scr'+'ipt><script src="'+AIWIDTH+'"></scr'+'ipt></body>');});if(injected)restore();}return prior.apply(this,parts);};proto.write=wrapped;timer=setTimeout(restore,30000);return restore;}catch(_){return()=>{};}}
async function boot(){let disarm=()=>{};try{setStatus('NOREYO '+BUILD+' wird vorbereitet …');await load(BOOTFETCH);await load(BOOTERROR);await load(GUARD);disarm=armDocumentWriteInjection();await load(BASE);}catch(error){disarm();fail(error);}}
window.NOREYO_BOOTSTRAP_PRELOAD=Object.freeze({BUILD,SCRIPT_ATTEMPTS,SCRIPT_RETRY_MS,SCRIPT_TIMEOUT_MS,BOOTFETCH,BOOTERROR,GUARD,SHAPE,GENERATION,TRANSPORT,URLBRIDGE,LIFECYCLE,STABILIZER,FAVORITES,FAVORITESAFE,RANKING,PRIORITY,PRIORITYTRUTH,PRIORITYNOTE,PREFSEM,FILTERUX,FILTERVIEW,ADULTAI,CHILDAI,CHILDNATURAL,CHILDGATE,TOTALPARTY,TRAVELLERATOMIC,TRAVELLERSTATE,AIRPORTAI,STARTUPSTATE,DATESTATE,AIDATERANGE,NAMEDDATE,NAVSTABILIZER,HOTSTABILIZER,VIEWPORT,PLANNERVIEW,AIVIEWPORT,AIWIDTH,BASE,retrySrc,loadOnce,load,armDocumentWriteInjection});
boot();
})();