/* NOREYO V12.24 — server-backed sign-out without logout fragility.
   Profile logout currently clears only the local sessionStorage token. Snapshot the
   validated token before the existing document-capture logout handler runs, revoke
   the Supabase session best-effort, and never let network failure block local logout. */
(function(){
'use strict';
const BUILD='12.24',TIMEOUT_MS=8000;
let bound=false,inflight=null;

function auth(){return window.NOREYO_V1158||null;}
function token(){
  try{
    const s=auth()?.session?.();
    return s?.access_token&&auth()?.authenticated?.()?String(s.access_token):'';
  }catch(_){return'';}
}
function anon(){try{return String(auth()?.anon?.()||'');}catch(_){return'';}}
function endpoint(){try{return `${String(auth()?.PROJECT_URL||'').replace(/\/+$/,'')}/auth/v1/logout?scope=local`;}catch(_){return'';}}
async function revoke(accessToken=token()){
  const key=anon(),url=endpoint();
  if(!accessToken||!key||!url)return false;
  if(inflight?.token===accessToken)return inflight.promise;
  const controller=new AbortController();
  const timer=setTimeout(()=>controller.abort(),TIMEOUT_MS);
  const promise=(async()=>{
    try{
      const response=await fetch(url,{
        method:'POST',
        headers:{apikey:key,Authorization:`Bearer ${accessToken}`},
        signal:controller.signal
      });
      return response.ok||response.status===401||response.status===403;
    }catch(_){
      return false;
    }finally{
      clearTimeout(timer);
      if(inflight?.token===accessToken)inflight=null;
    }
  })();
  inflight={token:accessToken,promise,controller};
  return promise;
}
function localSafety(){
  try{window.NOREYO_V1160?.clear?.();}catch(_){}
  try{window.NOREYO_V1148?.clear?.();}catch(_){}
  try{window.NOREYO_V1210?.clear?.();}catch(_){}
}
function onClick(e){
  if(!e.target?.closest?.('.noreyo-v1162-logout'))return;
  const accessToken=token();
  localSafety();
  if(accessToken)revoke(accessToken).catch(()=>{});
}
function install(){
  if(bound)return false;
  bound=true;
  window.addEventListener('click',onClick,true);
  return true;
}
function cleanup(){
  if(!bound)return false;
  window.removeEventListener('click',onClick,true);
  bound=false;
  return true;
}
install();
window.addEventListener('pagehide',cleanup,{passive:true});
window.addEventListener('pageshow',install,{passive:true});
window.NOREYO_V1224=Object.freeze({BUILD,TIMEOUT_MS,auth,token,anon,endpoint,revoke,localSafety,onClick,install,cleanup});
})();