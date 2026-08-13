/* NOREYO V7.43 — action-aware request-boundary search lifecycle.
   Do not start the authoritative hotel/package guard for explicit flight requests,
   even if UI mode is momentarily stale. Unknown/non-flight requests remain guarded. */
(function(){
'use strict';
const BUILD='7.43';
function inputUrl(input){if(typeof input==='string')return input;try{if(typeof Request!=='undefined'&&input instanceof Request)return input.url||'';}catch(_){}try{if(typeof URL!=='undefined'&&input instanceof URL)return input.href||'';}catch(_){}return'';}
function isSearchTravel(input){return inputUrl(input).includes('/functions/v1/search-travel');}
function parseText(text){if(typeof text!=='string'||!text.trim())return null;try{return JSON.parse(text);}catch(_){return null;}}
async function requestJson(input,init){if(typeof init?.body==='string')return parseText(init.body);try{if(typeof Request!=='undefined'&&input instanceof Request){if(input.bodyUsed)return null;return parseText(await input.clone().text());}}catch(_){}return null;}
function isFlightAction(raw){return String(raw?.action||'').trim().toLowerCase()==='flight';}
function visible(el){if(!el)return false;try{if(el.hidden)return false;const style=getComputedStyle(el);if(style.display==='none'||style.visibility==='hidden')return false;return !!(el.offsetWidth||el.offsetHeight||el.getClientRects?.().length);}catch(_){return true;}}
function searchButton(){const active=document.querySelector('.view.active'),selectors='.noreyo-v541-booking-cta,.liveSearchButton,#searchView .search-card .primary',activeButtons=active?[...active.querySelectorAll(selectors)]:[],all=[...activeButtons,...document.querySelectorAll(selectors)];return all.find(visible)||all[0]||null;}
function authoritative(){try{return window.NOREYO_V607?.authoritativeMode?.()!==false;}catch(_){return true;}}
function ensureLifecycle(raw){if(isFlightAction(raw))return false;try{const guard=window.NOREYO_V607;if(!guard?.startGuard||guard.active||!authoritative())return false;try{window.NOREYO_V723?.bump?.();}catch(_){}return !!guard.startGuard(searchButton());}catch(_){return false;}}
function install(){try{if(typeof window.fetch!=='function'||window.fetch.__noreyoV743)return false;const prior=window.fetch.bind(window);const wrapped=function(input,init){if(!isSearchTravel(input))return prior(input,init);if(typeof init?.body==='string'){ensureLifecycle(parseText(init.body));return prior(input,init);}if(typeof Request!=='undefined'&&input instanceof Request){return requestJson(input,init).then(raw=>{ensureLifecycle(raw);return prior(input,init);},()=>prior(input,init));}ensureLifecycle(null);return prior(input,init);};wrapped.__noreyoV743=true;window.fetch=wrapped;return true;}catch(_){return false;}}
install();window.addEventListener('pageshow',install,{passive:true});
window.NOREYO_V743=Object.freeze({BUILD,inputUrl,isSearchTravel,parseText,requestJson,isFlightAction,visible,searchButton,authoritative,ensureLifecycle,install});
})();