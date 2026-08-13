/* NOREYO V11.78 — authenticated hotel-checkout transport + PREBOOK ownership token.
   Sensitive PREBOOK/status calls must use the validated user JWT, never the public
   anon token. Capture a server-issued session-only ownership token from PREBOOK and
   attach it to later status revalidation calls. Nothing is persisted. */
(function(){
'use strict';
const BUILD='11.78';
const PREBOOK='/functions/v1/hotel-prebook';
const PREBOOK_STATUS='/functions/v1/hotel-prebook-status';
const CHECKOUT_STATUS='/functions/v1/hotel-checkout-status';
let installed=false,priorFetch=null,ownership=null,priorSignOut=null;
function inputUrl(input){if(typeof input==='string')return input;try{if(typeof Request!=='undefined'&&input instanceof Request)return input.url||'';}catch(_){}return String(input?.url||'');}
function kind(input){const url=inputUrl(input);if(url.includes(PREBOOK_STATUS)||url.includes(CHECKOUT_STATUS))return'status';if(url.includes(PREBOOK))return'prebook';return'';}
function auth(){return window.NOREYO_V1158||null;}
function identity(){const a=auth();try{if(!a?.identityValidated?.()||!a?.authenticated?.())return null;const s=a.session?.();if(!s?.access_token||!s?.user_id)return null;return Object.freeze({token:String(s.access_token),userId:String(s.user_id)});}catch(_){return null;}}
function currentOwnership(){return ownership;}
function clearOwnership(){if(!ownership)return false;ownership=null;return true;}
function validOwnership(o=ownership){if(!o?.prebookId||!o?.token)return false;const s=window.NOREYO_HOTEL_PREBOOK;return !!s&&String(s.prebookId||'')===String(o.prebookId);}
function localError(message,status=401,code='AUTH_REQUIRED'){return new Response(JSON.stringify({error:{code,message}}),{status,headers:{'content-type':'application/json'}});}
async function bodyObject(input,init){if(typeof init?.body==='string'){try{return JSON.parse(init.body);}catch(_){return null;}}try{if(typeof Request!=='undefined'&&input instanceof Request&&!input.bodyUsed){const text=await input.clone().text();return text?JSON.parse(text):null;}}catch(_){}return null;}
function headers(input,init,user){const h=new Headers();try{if(typeof Request!=='undefined'&&input instanceof Request)input.headers.forEach((v,k)=>h.set(k,v));}catch(_){}try{new Headers(init?.headers||{}).forEach((v,k)=>h.set(k,v));}catch(_){}h.set('Authorization',`Bearer ${user.token}`);return h;}
function capture(payload){const data=payload?.data&&typeof payload.data==='object'?payload.data:payload;const prebookId=String(data?.prebookId||'').trim(),token=String(data?.ownershipToken||'').trim();if(!prebookId||token.length<20)return false;ownership=Object.freeze({prebookId,token,capturedAt:new Date().toISOString()});return true;}
async function wrappedFetch(input,init){const k=kind(input);if(!k)return priorFetch(input,init);const user=identity();if(!user)return localError('Bitte melde dich an, bevor du den Checkout live bestätigst.',401,'AUTH_REQUIRED');const next={...(init||{}),headers:headers(input,init,user)};if(k==='status'){const raw=await bodyObject(input,init);const pid=String(raw?.prebookId||'').trim();const own=ownership;if(!pid||!own||String(own.prebookId)!==pid)return localError('Diese Checkout-Session gehört nicht mehr zur aktuellen Anmeldung. Bitte bestätige den Tarif erneut.',409,'CHECKOUT_OWNERSHIP_REQUIRED');next.body=JSON.stringify({...raw,ownershipToken:own.token});}const response=await priorFetch(input,next);if(k==='prebook'&&response?.ok){try{const payload=await response.clone().json();if(!capture(payload))clearOwnership();}catch(_){clearOwnership();}}if(k==='prebook'&&!response?.ok)clearOwnership();return response;}
function patchSignOut(){const a=auth();if(!a||a.__noreyoV1178)return false;priorSignOut=a.signOut;const signOut=async function(...args){try{return typeof priorSignOut==='function'?await priorSignOut.apply(this,args):a.clear?.();}finally{clearOwnership();}};window.NOREYO_V1158=Object.freeze({...a,__noreyoV1178:true,signOut});return true;}
function install(){patchSignOut();if(installed||typeof window.fetch!=='function'||window.fetch.__noreyoV1178)return false;priorFetch=window.fetch.bind(window);const f=function(input,init){return wrappedFetch(input,init);};f.__noreyoV1178=true;f.__noreyoV1178Prior=priorFetch;window.fetch=f;installed=true;return true;}
function sync(){patchSignOut();if(ownership&&!validOwnership())clearOwnership();}
function cleanup(){clearOwnership();if(installed&&window.fetch?.__noreyoV1178&&priorFetch)window.fetch=priorFetch;installed=false;priorFetch=null;}
install();window.addEventListener('pageshow',install,{passive:true});window.addEventListener('pagehide',cleanup,{passive:true});
window.NOREYO_V1178=Object.freeze({BUILD,PREBOOK,PREBOOK_STATUS,CHECKOUT_STATUS,inputUrl,kind,auth,identity,currentOwnership,clearOwnership,validOwnership,localError,bodyObject,headers,capture,wrappedFetch,patchSignOut,install,sync,cleanup});
})();