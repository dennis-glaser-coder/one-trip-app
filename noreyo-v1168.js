/* NOREYO V11.68 — Supabase logout scope correction.
   Supabase Auth defaults signOut to global/all-device logout. NOREYO's profile
   action should retire only the current browser session, matching normal app
   expectations. Override V11.64 signOut with /logout?scope=local while preserving
   fail-closed local checkout/auth cleanup. */
(function(){
'use strict';
const BUILD='11.68';
let patched=false;
function auth(){return window.NOREYO_V1158||null;}
function rawSession(){try{return auth()?.session?.()||null;}catch(_){return null;}}
function clearLocal(){try{return !!auth()?.clear?.();}catch(_){return false;}}
async function signOut(){const a=auth(),s=rawSession(),key=a?.anon?.()||'';try{if(s?.access_token&&key){const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),8000);try{await fetch(`${a.PROJECT_URL}/auth/v1/logout?scope=local`,{method:'POST',headers:{apikey:key,Authorization:`Bearer ${s.access_token}`},signal:controller.signal});}catch(_){}finally{clearTimeout(timer);}}}finally{clearLocal();try{window.NOREYO_V1160?.clear?.();}catch(_){}try{window.NOREYO_V1148?.clear?.();}catch(_){}}return true;}
function patch(){const a=auth();if(!a||a.__noreyoV1168)return false;window.NOREYO_V1158=Object.freeze({...a,__noreyoV1168:true,signOut});patched=true;return true;}
function install(){return patch();}
install();window.addEventListener('pageshow',install,{passive:true});window.NOREYO_V1168=Object.freeze({BUILD,auth,rawSession,clearLocal,signOut,patch,install,get patched(){return patched;}});
})();