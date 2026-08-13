/* NOREYO V6.90 — search request ownership across SPA navigation/BFCache.
   Keeps searchView inside the active search context while aborting requests
   only when the user truly leaves search/results. */
(function(){
'use strict';
const BUILD='6.90';
const active=new Set();
function isSearchTravel(input){const url=typeof input==='string'?input:String(input?.url||'');return url.includes('/functions/v1/search-travel');}
function requestSignal(input,init){if(init?.signal)return init.signal;try{if(typeof Request!=='undefined'&&input instanceof Request)return input.signal||null;}catch(_){ }return null;}
function trackedInit(input,init){if(typeof AbortController==='undefined')return null;const controller=new AbortController(),upstream=requestSignal(input,init);let upstreamAbort=null;if(upstream){if(upstream.aborted)controller.abort(upstream.reason);else{upstreamAbort=()=>controller.abort(upstream.reason);upstream.addEventListener?.('abort',upstreamAbort,{once:true});}}const token={controller,cleanup(){if(upstream&&upstreamAbort)upstream.removeEventListener?.('abort',upstreamAbort);active.delete(token);}};active.add(token);return{token,init:{...(init||{}),signal:controller.signal}};}
function abortActive(reason='navigation-away'){if(!active.size)return 0;const pending=[...active];pending.forEach(token=>{try{if(!token.controller.signal.aborted)token.controller.abort(reason);}catch(_){ }});return pending.length;}
function installFetchHook(){try{if(typeof window.fetch!=='function'||window.fetch.__noreyoV690)return;const prior=window.fetch.bind(window);const wrapped=async function(input,init){if(!isSearchTravel(input))return prior(input,init);const tracked=trackedInit(input,init);if(!tracked)return prior(input,init);try{return await prior(input,tracked.init);}finally{tracked.token.cleanup();}};wrapped.__noreyoV690=true;window.fetch=wrapped;}catch(_){ }}
function navigationAway(view){return ['favorites','trips','profile','discover'].includes(String(view||''));}
function installGoHook(){try{if(typeof go!=='function'||go.__noreyoV690)return;const prior=go;const wrapped=function(view){if(navigationAway(view))abortActive('navigation-away');return prior.apply(this,arguments);};wrapped.__noreyoV690=true;go=wrapped;}catch(_){ }}
function cleanup(){abortActive('pagehide');}
function install(){installFetchHook();installGoHook();}
install();window.addEventListener('pagehide',cleanup,{passive:true});window.addEventListener('pageshow',install,{passive:true});
window.NOREYO_V673=Object.freeze({BUILD,isSearchTravel,requestSignal,trackedInit,abortActive,navigationAway,install,get activeCount(){return active.size;}});
})();
