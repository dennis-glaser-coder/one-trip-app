/* NOREYO V11.90 — token-owned Supabase user validation.
   Legacy V11.58 deduplicates /auth/v1/user globally. During access-token rotation
   a stale validation can resolve late and write the old token/user back over the
   refreshed session. Make user validation token-scoped and only mutate auth state
   when the response still belongs to the current access token. */
(function(){
'use strict';
const BUILD='11.90';
let patched=false,priorUser=null;
const inflight=new Map();

function auth(){return window.NOREYO_V1158||null;}
function currentToken(){
  try{return String(auth()?.session?.()?.access_token||'');}catch(_){return'';}
}
function tokenOf(session){return String(session?.access_token||'');}
function sameCurrent(token){return !!token&&currentToken()===token;}
function key(){try{return String(auth()?.anon?.()||'');}catch(_){return'';}}
function endpoint(){try{return `${String(auth()?.PROJECT_URL||'').replace(/\/+$/,'')}/auth/v1/user`;}catch(_){return'';}}
function safeClear(token){
  if(!sameCurrent(token))return false;
  try{auth()?.clear?.();return true;}catch(_){return false;}
}
function safeSave(token,session,user){
  if(!sameCurrent(token)||!user?.id)return false;
  try{return !!auth()?.save?.({...session,user});}catch(_){return false;}
}
async function user(session){
  const a=auth(),s=session||a?.session?.(),token=tokenOf(s),publicKey=key(),url=endpoint();
  if(!a||!token||!publicKey||!url)return null;
  if(inflight.has(token))return inflight.get(token);
  const promise=(async()=>{
    const controller=new AbortController();
    const timer=setTimeout(()=>controller.abort(),10000);
    try{
      const response=await fetch(url,{headers:{apikey:publicKey,Authorization:`Bearer ${token}`},signal:controller.signal});
      let payload=null;
      try{payload=await response.json();}catch(_){}
      if(!response.ok){
        if([400,401,403].includes(response.status))safeClear(token);
        return null;
      }
      if(!payload?.id)return null;
      if(!sameCurrent(token))return null;
      safeSave(token,s,payload);
      return payload;
    }catch(_){
      return null;
    }finally{
      clearTimeout(timer);
      if(inflight.get(token)===promise)inflight.delete(token);
    }
  })();
  inflight.set(token,promise);
  return promise;
}
function patch(){
  const a=auth();
  if(!a||a.__noreyoV1190)return false;
  priorUser=a.user;
  window.NOREYO_V1158=Object.freeze({...a,__noreyoV1190:true,user});
  patched=true;
  return true;
}
function install(){patch();return true;}
install();
window.addEventListener('pageshow',install,{passive:true});
window.NOREYO_V1190=Object.freeze({BUILD,auth,currentToken,tokenOf,sameCurrent,key,endpoint,safeClear,safeSave,user,patch,install,get patched(){return patched;},get priorUser(){return priorUser;},get inflightCount(){return inflight.size;}});
})();