/* NOREYO V11.94 — pre-hydration token-owned user validator.
   V11.90 fixes token ownership once V11.89 is fully loaded, but V11.76 may start
   identity hydration inside that bootstrap before V11.90 executes. Preload this
   guard and wait for base auth so /auth/v1/user is token-owned before V11.76 can run. */
(function(){
'use strict';
const BUILD='11.94',MAX_WAIT_MS=45000;
let patched=false,waitTimer=0,priorUser=null;
const inflight=new Map();
function auth(){return window.NOREYO_V1158||null;}
function currentToken(){try{return String(auth()?.session?.()?.access_token||'');}catch(_){return'';}}
function sameCurrent(token){return !!token&&currentToken()===token;}
function key(){try{return String(auth()?.anon?.()||'');}catch(_){return'';}}
function endpoint(){try{const base=String(auth()?.PROJECT_URL||'').replace(/\/+$/,'');return base?`${base}/auth/v1/user`:'';}catch(_){return'';}}
async function user(session){
  const a=auth(),s=session||a?.session?.(),token=String(s?.access_token||''),publicKey=key(),url=endpoint();
  if(!a||!token||!publicKey||!url)return null;
  if(inflight.has(token))return inflight.get(token);
  const promise=(async()=>{
    const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),10000);
    try{
      const response=await fetch(url,{headers:{apikey:publicKey,Authorization:`Bearer ${token}`},signal:controller.signal});
      let payload=null;try{payload=await response.json();}catch(_){}
      if(!response.ok){
        if([400,401,403].includes(response.status)&&sameCurrent(token)){try{a.clear?.();}catch(_){}}
        return null;
      }
      if(!payload?.id||!sameCurrent(token))return null;
      try{a.save?.({...s,user:payload});}catch(_){}
      return sameCurrent(token)?payload:null;
    }catch(_){return null;}
    finally{clearTimeout(timer);if(inflight.get(token)===promise)inflight.delete(token);}
  })();
  inflight.set(token,promise);
  return promise;
}
function patch(){
  const a=auth();
  if(!a||a.__noreyoV1194)return false;
  priorUser=a.user;
  window.NOREYO_V1158=Object.freeze({...a,__noreyoV1194:true,user});
  patched=true;
  return true;
}
function waitForAuth(start=Date.now()){
  if(patch())return true;
  if(Date.now()-start>=MAX_WAIT_MS)return false;
  waitTimer=setTimeout(()=>waitForAuth(start),10);
  return false;
}
function cleanup(){if(waitTimer){clearTimeout(waitTimer);waitTimer=0;}}
waitForAuth();
window.addEventListener('pageshow',()=>{cleanup();waitForAuth();},{passive:true});
window.addEventListener('pagehide',cleanup,{passive:true});
window.NOREYO_V1194=Object.freeze({BUILD,MAX_WAIT_MS,auth,currentToken,sameCurrent,key,endpoint,user,patch,waitForAuth,cleanup,get patched(){return patched;},get priorUser(){return priorUser;},get inflightCount(){return inflight.size;}});
})();