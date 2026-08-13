/* NOREYO V11.76 — authenticated identity hydration after Magic Link.
   V11.58 ingests the implicit-flow access token before it knows user_id/email.
   Profile and booking ownership require a real Supabase identity, so validate the
   session against /auth/v1/user immediately after redirect and make authenticated()
   fail closed until that validation succeeds. */
(function(){
'use strict';
const BUILD='11.76';
let priorAuthenticated=null,validatedToken='',hydrating=null,patched=false;
function auth(){return window.NOREYO_V1158||null;}
function session(){try{return auth()?.session?.()||null;}catch(_){return null;}}
function baseAuthenticated(){try{return typeof priorAuthenticated==='function'?!!priorAuthenticated():false;}catch(_){return false;}}
function validated(){const s=session(),t=String(s?.access_token||'');return !!t&&t===validatedToken&&!!s?.user_id&&baseAuthenticated();}
function authenticated(){return validated();}
function refreshSurfaces(){try{window.NOREYO_V1162?.render?.();}catch(_){}try{window.NOREYO_V1158?.render?.();}catch(_){}}
async function hydrate(){const a=auth(),s=session(),t=String(s?.access_token||'');if(!t||!baseAuthenticated()){validatedToken='';return null;}if(validated())return Object.freeze({id:String(s.user_id),email:String(s.email||'')});if(hydrating?.token===t)return hydrating.promise;const promise=(async()=>{try{const user=await a.user?.(s);const current=session();if(!user?.id||String(current?.access_token||'')!==t){validatedToken='';refreshSurfaces();return null;}validatedToken=t;refreshSurfaces();return user;}catch(_){validatedToken='';refreshSurfaces();return null;}finally{if(hydrating?.token===t)hydrating=null;}})();hydrating={token:t,promise};return promise;}
function patch(){const a=auth();if(!a||a.__noreyoV1176)return false;priorAuthenticated=a.authenticated;window.NOREYO_V1158=Object.freeze({...a,__noreyoV1176:true,authenticated,hydrateIdentity:hydrate,identityValidated:validated});patched=true;return true;}
function install(){patch();hydrate().catch(()=>{});return true;}
function onFocus(){hydrate().catch(()=>{});}
install();window.addEventListener('pageshow',install,{passive:true});window.addEventListener('focus',onFocus,{passive:true});
window.NOREYO_V1176=Object.freeze({BUILD,auth,session,baseAuthenticated,validated,authenticated,refreshSurfaces,hydrate,patch,install,onFocus,get validatedToken(){return validatedToken;},get patched(){return patched;}});
})();