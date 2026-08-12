/* NOREYO V11.88 — refresh-only recovery after auth hygiene purge.
   V11.64 can correctly purge an almost-expired access token before V11.84 runs.
   A still-valid refresh token must remain sufficient to obtain a fresh access token.
   Patch V11.84's refresh method to recover from refresh-token-only state, while
   invalid refresh credentials retire auth/checkout fail-closed. */
(function(){
'use strict';
const BUILD='11.88';
let refreshing=null,patched=false,priorRefresh=null;
function api(){return window.NOREYO_V1184||null;}
function auth(){return window.NOREYO_V1158||null;}
function refreshToken(){try{return String(api()?.rawRefresh?.()||'').trim();}catch(_){return'';}}
function current(){try{return auth()?.session?.()||null;}catch(_){return null;}}
function key(){try{return String(auth()?.anon?.()||'');}catch(_){return'';}}
function endpoint(){try{const fromApi=String(api()?.endpoint?.()||'');if(fromApi)return fromApi;const base=String(auth()?.PROJECT_URL||'').replace(/\/+$/,'');return base?`${base}/auth/v1/token?grant_type=refresh_token`:'';}catch(_){return'';}}
function retireInvalid(){try{api()?.clearRefresh?.();}catch(_){}try{auth()?.clear?.();}catch(_){}try{window.NOREYO_V1180?.retire?.('REFRESH_REJECTED');}catch(_){}}
async function refresh(force=false){const a=api(),rt=refreshToken();if(!a||!rt)return null;const s=current();if(!force&&s?.access_token&&!a.expiring?.(s))return s;if(refreshing)return refreshing;const publicKey=key(),url=endpoint();if(!publicKey||!url)return null;refreshing=(async()=>{try{const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),10000);let response;try{response=await fetch(url,{method:'POST',headers:{apikey:publicKey,'Content-Type':'application/json'},body:JSON.stringify({refresh_token:rt}),signal:controller.signal});}finally{clearTimeout(timer);}let payload={};try{payload=await response.json();}catch(_){}if(!response.ok||!payload?.access_token){if([400,401,403].includes(response.status))retireInvalid();return null;}const expiresIn=Math.max(60,Number(payload.expires_in)||3600);const next={...(s||{}),...payload,access_token:String(payload.access_token),refresh_token:String(payload.refresh_token||rt),expires_at:Math.floor(Date.now()/1000)+expiresIn};if(!a.save?.(next))return null;try{await auth()?.hydrateIdentity?.();}catch(_){}try{a.scheduleRefresh?.();}catch(_){}return auth()?.session?.()||next;}catch(_){return null;}finally{refreshing=null;}})();return refreshing;}
function patch(){const a=api();if(!a||a.__noreyoV1188)return false;priorRefresh=a.refresh;window.NOREYO_V1184=Object.freeze({...a,__noreyoV1188:true,refresh});patched=true;return true;}
function install(){patch();if(refreshToken()&&!current()?.access_token)refresh(true).catch(()=>{});return true;}
install();window.addEventListener('pageshow',install,{passive:true});
window.NOREYO_V1188=Object.freeze({BUILD,api,auth,refreshToken,current,key,endpoint,retireInvalid,refresh,patch,install,get patched(){return patched;},get priorRefresh(){return priorRefresh;}});
})();