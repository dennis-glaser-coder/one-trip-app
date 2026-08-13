/* NOREYO V11.60 — booking draft bound to authenticated user identity.
   UI disabling alone is not an authorization boundary. Patch the public booking
   preparation API so a draft can only be created/owned while a validated Supabase
   auth identity is present. Never copy access tokens into the booking draft. */
(function(){
'use strict';
const BUILD='11.60';
let observer=null,raf=0,priorPayload=null,priorOwned=null,patched=false;
function auth(){return window.NOREYO_V1158||null;}
function identity(){const a=auth();if(!a)return null;try{const s=a.session?.();if(!s?.access_token||!s?.user_id||!a.authenticated?.())return null;return Object.freeze({userId:String(s.user_id),email:String(s.email||'')});}catch(_){return null;}}
function draft(){return window.NOREYO_HOTEL_BOOKING_DRAFT||null;}
function clear(){try{return !!window.NOREYO_V1148?.clear?.();}catch(_){if(!draft())return false;try{delete window.NOREYO_HOTEL_BOOKING_DRAFT;}catch(_){window.NOREYO_HOTEL_BOOKING_DRAFT=undefined;}return true;}}
function bindDraft(d,user=identity()){if(!d||!user?.userId)return null;const {access_token,...safeUser}=user;return Object.freeze({...d,authUserId:safeUser.userId});}
function owned(d=draft()){const user=identity();if(!d||!user?.userId||String(d.authUserId||'')!==user.userId)return false;try{return typeof priorOwned==='function'?!!priorOwned(d):false;}catch(_){return false;}}
function patch(){const api=window.NOREYO_V1146;if(!api||api.__noreyoV1160)return false;priorPayload=api.payload;priorOwned=api.owned;if(typeof priorPayload!=='function'||typeof priorOwned!=='function')return false;const payload=function(data){const user=identity();if(!user)return null;const d=priorPayload(data);return bindDraft(d,user);};window.NOREYO_V1146=Object.freeze({...api,__noreyoV1160:true,payload,owned});patched=true;return true;}
function sync(){raf=0;patch();const d=draft();if(!d)return false;if(!owned(d))return clear();return false;}
function schedule(){if(!raf)raf=requestAnimationFrame(sync);}
function install(){patch();if(observer||typeof MutationObserver==='undefined'||!document.body)return false;observer=new MutationObserver(schedule);observer.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['data-checkout-ready']});window.addEventListener('storage',schedule);schedule();return true;}
function cleanup(){if(observer){observer.disconnect();observer=null;}window.removeEventListener('storage',schedule);if(raf){cancelAnimationFrame(raf);raf=0;}clear();}
install();window.addEventListener('pagehide',cleanup,{passive:true});window.addEventListener('pageshow',install,{passive:true});
window.NOREYO_V1160=Object.freeze({BUILD,auth,identity,draft,clear,bindDraft,owned,patch,sync,schedule,install,cleanup,get patched(){return patched;}});
})();