/* NOREYO V11.64 — Supabase auth session hygiene + server logout.
   Completes V11.58's passwordless auth lifecycle:
   - expired sessions are purged before use;
   - magic-link error/token hashes are scrubbed from the URL;
   - logout revokes the current Supabase session server-side when possible, then
     always clears local auth/checkout state;
   - no token is copied into UI, booking drafts or localStorage. */
(function(){
'use strict';
const BUILD='11.64';
let priorAuthenticated=null,patched=false,lastAuthError='';

function auth(){return window.NOREYO_V1158||null;}
function rawSession(){try{return auth()?.session?.()||null;}catch(_){return null;}}
function expired(s=rawSession()){
  if(!s?.access_token)return true;
  const exp=Number(s.expires_at)||0;
  return !!exp && exp<=Math.floor(Date.now()/1000)+30;
}
function clearLocal(){try{return !!auth()?.clear?.();}catch(_){return false;}}
function purgeExpired(){
  const s=rawSession();
  if(!s||!expired(s))return false;
  clearLocal();
  try{window.NOREYO_V1160?.clear?.();}catch(_){}
  try{window.NOREYO_V1148?.clear?.();}catch(_){}
  return true;
}
function authErrorFromHash(){
  try{
    const h=String(location.hash||'');
    if(!h.startsWith('#'))return'';
    const p=new URLSearchParams(h.slice(1));
    const code=String(p.get('error_code')||p.get('error')||'').trim();
    const desc=String(p.get('error_description')||'').trim().replace(/\+/g,' ');
    return (desc||code).slice(0,280);
  }catch(_){return'';}
}
function scrubAuthHash(){
  try{
    const h=String(location.hash||'');
    if(!h.startsWith('#'))return false;
    const p=new URLSearchParams(h.slice(1));
    if(!p.has('access_token')&&!p.has('refresh_token')&&!p.has('error')&&!p.has('error_code'))return false;
    lastAuthError=authErrorFromHash();
    history.replaceState(null,'',`${location.pathname}${location.search||''}`);
    return true;
  }catch(_){return false;}
}
async function signOut(){
  const a=auth(),s=rawSession(),key=a?.anon?.()||'';
  try{
    if(s?.access_token&&key){
      const controller=new AbortController();
      const timer=setTimeout(()=>controller.abort(),8000);
      try{
        await fetch(`${a.PROJECT_URL}/auth/v1/logout`,{
          method:'POST',
          headers:{apikey:key,Authorization:`Bearer ${s.access_token}`},
          signal:controller.signal
        });
      }catch(_){}
      finally{clearTimeout(timer);}
    }
  }finally{
    clearLocal();
    try{window.NOREYO_V1160?.clear?.();}catch(_){}
    try{window.NOREYO_V1148?.clear?.();}catch(_){}
  }
  return true;
}
function authenticated(){
  if(purgeExpired())return false;
  try{return typeof priorAuthenticated==='function'?!!priorAuthenticated():false;}catch(_){return false;}
}
function patch(){
  const a=auth();
  if(!a||a.__noreyoV1164)return false;
  priorAuthenticated=a.authenticated;
  window.NOREYO_V1158=Object.freeze({...a,__noreyoV1164:true,signOut,authenticated,purgeExpired,scrubAuthHash,authError:()=>lastAuthError});
  patched=true;
  return true;
}
function install(){scrubAuthHash();purgeExpired();return patch();}
install();
window.addEventListener('pageshow',install,{passive:true});
window.NOREYO_V1164=Object.freeze({BUILD,auth,rawSession,expired,clearLocal,purgeExpired,authErrorFromHash,scrubAuthHash,signOut,authenticated,patch,install,get patched(){return patched;}});
})();