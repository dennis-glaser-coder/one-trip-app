/* NOREYO V11.84 — Supabase refresh-token session continuity.
   Capture the implicit-flow refresh token before legacy auth layers scrub the hash,
   keep it in sessionStorage only, rotate it through Supabase Auth, and patch the
   public auth surface once V11.58+ is available. No token is copied to UI/localStorage. */
(function(){
'use strict';
const BUILD='11.84';
const REFRESH_KEY='noreyo_auth_refresh_v1';
const REFRESH_SKEW_SEC=120;
const MAX_WAIT_MS=45000;
let priorSession=null,priorSave=null,patched=false,waitTimer=0,refreshTimer=0,refreshing=null;
function rawRefresh(){try{return String(sessionStorage.getItem(REFRESH_KEY)||'');}catch(_){return'';}}
function saveRefresh(token){const t=String(token||'').trim();try{if(t)sessionStorage.setItem(REFRESH_KEY,t);else sessionStorage.removeItem(REFRESH_KEY);return true;}catch(_){return false;}}
function clearRefresh(){return saveRefresh('');}
function captureHash(){try{const h=String(location.hash||'');if(!h.startsWith('#'))return false;const p=new URLSearchParams(h.slice(1)),token=String(p.get('refresh_token')||'').trim();return token?saveRefresh(token):false;}catch(_){return false;}}
function auth(){return window.NOREYO_V1158||null;}
function session(){const base=typeof priorSession==='function'?priorSession():null;if(!base)return null;const refresh_token=rawRefresh();return refresh_token?{...base,refresh_token}:base;}
function save(s){if(s?.refresh_token)saveRefresh(s.refresh_token);return typeof priorSave==='function'?priorSave(s):false;}
function expiring(s=session()){if(!s?.access_token)return true;const exp=Number(s.expires_at)||0;return !!exp&&exp<=Math.floor(Date.now()/1000)+REFRESH_SKEW_SEC;}
function endpoint(){const a=auth(),base=String(a?.PROJECT_URL||'').replace(/\/+$/,'');return base?`${base}/auth/v1/token?grant_type=refresh_token`:'';}
async function refresh(force=false){const a=auth(),s=session(),rt=String(s?.refresh_token||rawRefresh()||'');if(!a||!s?.access_token||!rt)return null;if(!force&&!expiring(s))return s;if(refreshing)return refreshing;const key=String(a.anon?.()||''),url=endpoint();if(!key||!url)return null;refreshing=(async()=>{try{const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),10000);let response;try{response=await fetch(url,{method:'POST',headers:{apikey:key,'Content-Type':'application/json'},body:JSON.stringify({refresh_token:rt}),signal:controller.signal});}finally{clearTimeout(timer);}let payload={};try{payload=await response.json();}catch(_){}if(!response.ok||!payload?.access_token){if(response.status===400||response.status===401||response.status===403)clearRefresh();return null;}const expiresIn=Math.max(60,Number(payload.expires_in)||3600);const next={...s,...payload,expires_at:Math.floor(Date.now()/1000)+expiresIn,refresh_token:String(payload.refresh_token||rt)};save(next);try{await window.NOREYO_V1158?.hydrateIdentity?.();}catch(_){}scheduleRefresh();return session();}catch(_){return null;}finally{refreshing=null;}})();return refreshing;}
function scheduleRefresh(){if(refreshTimer){clearTimeout(refreshTimer);refreshTimer=0;}const s=session(),exp=Number(s?.expires_at)||0;if(!exp||!rawRefresh())return false;const ms=Math.max(1000,(exp-Math.floor(Date.now()/1000)-REFRESH_SKEW_SEC)*1000);refreshTimer=setTimeout(()=>{refresh().catch(()=>{});},Math.min(ms,2147483647));return true;}
function patch(){const a=auth();if(!a||a.__noreyoV1184)return false;priorSession=a.session;priorSave=a.save;window.NOREYO_V1158=Object.freeze({...a,__noreyoV1184:true,session,save,refreshSession:refresh,refreshToken:rawRefresh,clearRefreshToken:clearRefresh});patched=true;scheduleRefresh();return true;}
function waitForAuth(start=Date.now()){if(patch())return true;if(Date.now()-start>=MAX_WAIT_MS)return false;waitTimer=setTimeout(()=>waitForAuth(start),25);return false;}
function clear(){if(waitTimer){clearTimeout(waitTimer);waitTimer=0;}if(refreshTimer){clearTimeout(refreshTimer);refreshTimer=0;}clearRefresh();return true;}
function onFocus(){patch();refresh().catch(()=>{});}
captureHash();waitForAuth();window.addEventListener('focus',onFocus,{passive:true});window.addEventListener('pageshow',()=>{captureHash();patch();refresh().catch(()=>{});},{passive:true});
window.NOREYO_V1184=Object.freeze({BUILD,REFRESH_KEY,REFRESH_SKEW_SEC,MAX_WAIT_MS,rawRefresh,saveRefresh,clearRefresh,captureHash,auth,session,save,expiring,endpoint,refresh,scheduleRefresh,patch,waitForAuth,clear,onFocus,get patched(){return patched;}});
})();