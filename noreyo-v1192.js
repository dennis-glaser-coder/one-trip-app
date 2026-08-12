/* NOREYO V11.92 — logout-vs-refresh race safety.
   A refresh response that started before logout must never recreate auth state after
   logout begins. Clear the refresh credential synchronously at signOut entry and
   only save a refresh response if the same refresh token is still current. */
(function(){
'use strict';
const BUILD='11.92';
let refreshing=null,patchedRefresh=false,patchedSignOut=false,priorRefresh=null,priorSignOut=null;

function refreshApi(){return window.NOREYO_V1184||null;}
function auth(){return window.NOREYO_V1158||null;}
function refreshToken(){try{return String(refreshApi()?.rawRefresh?.()||'').trim();}catch(_){return'';}}
function current(){try{return auth()?.session?.()||null;}catch(_){return null;}}
function sameRefresh(token){return !!token&&refreshToken()===token;}
function key(){try{return String(auth()?.anon?.()||'');}catch(_){return'';}}
function endpoint(){try{const direct=String(refreshApi()?.endpoint?.()||'');if(direct)return direct;const base=String(auth()?.PROJECT_URL||'').replace(/\/+$/,'');return base?`${base}/auth/v1/token?grant_type=refresh_token`:'';}catch(_){return'';}}
function retireInvalid(token){
  if(!sameRefresh(token))return false;
  try{refreshApi()?.clearRefresh?.();}catch(_){}
  try{auth()?.clear?.();}catch(_){}
  try{window.NOREYO_V1180?.retire?.('REFRESH_REJECTED');}catch(_){}
  return true;
}
async function refresh(force=false){
  const api=refreshApi(),rt=refreshToken();
  if(!api||!rt)return null;
  const s=current();
  if(!force&&s?.access_token&&!api.expiring?.(s))return s;
  if(refreshing?.token===rt)return refreshing.promise;
  const publicKey=key(),url=endpoint();
  if(!publicKey||!url)return null;
  const controller=new AbortController();
  const promise=(async()=>{
    const timer=setTimeout(()=>controller.abort(),10000);
    try{
      const response=await fetch(url,{method:'POST',headers:{apikey:publicKey,'Content-Type':'application/json'},body:JSON.stringify({refresh_token:rt}),signal:controller.signal});
      let payload={};try{payload=await response.json();}catch(_){}
      if(!response.ok||!payload?.access_token){
        if([400,401,403].includes(response.status))retireInvalid(rt);
        return null;
      }
      if(!sameRefresh(rt))return null;
      const expiresIn=Math.max(60,Number(payload.expires_in)||3600);
      const next={...(current()||s||{}),...payload,access_token:String(payload.access_token),refresh_token:String(payload.refresh_token||rt),expires_at:Math.floor(Date.now()/1000)+expiresIn};
      if(!sameRefresh(rt))return null;
      if(!api.save?.(next))return null;
      try{await auth()?.hydrateIdentity?.();}catch(_){}
      try{api.scheduleRefresh?.();}catch(_){}
      return auth()?.session?.()||next;
    }catch(_){return null;}
    finally{
      clearTimeout(timer);
      if(refreshing?.token===rt)refreshing=null;
    }
  })();
  refreshing={token:rt,promise,controller};
  return promise;
}
function patchRefresh(){
  const api=refreshApi();
  if(!api||api.__noreyoV1192)return false;
  priorRefresh=api.refresh;
  window.NOREYO_V1184=Object.freeze({...api,__noreyoV1192:true,refresh});
  patchedRefresh=true;
  return true;
}
function patchSignOut(){
  const a=auth();
  if(!a||a.__noreyoV1192)return false;
  priorSignOut=a.signOut;
  const signOut=async function(...args){
    try{refreshApi()?.clearRefresh?.();}catch(_){}
    try{return typeof priorSignOut==='function'?await priorSignOut.apply(this,args):a.clear?.();}
    finally{
      try{refreshApi()?.clearRefresh?.();}catch(_){}
      try{a.clear?.();}catch(_){}
    }
  };
  window.NOREYO_V1158=Object.freeze({...a,__noreyoV1192:true,signOut});
  patchedSignOut=true;
  return true;
}
function install(){patchRefresh();patchSignOut();return true;}
function cleanup(){try{refreshing?.controller?.abort?.();}catch(_){}refreshing=null;}
install();
window.addEventListener('pageshow',install,{passive:true});
window.addEventListener('pagehide',cleanup,{passive:true});
window.NOREYO_V1192=Object.freeze({BUILD,refreshApi,auth,refreshToken,current,sameRefresh,key,endpoint,retireInvalid,refresh,patchRefresh,patchSignOut,install,cleanup,get patchedRefresh(){return patchedRefresh;},get patchedSignOut(){return patchedSignOut;},get priorRefresh(){return priorRefresh;},get priorSignOut(){return priorSignOut;}});
})();