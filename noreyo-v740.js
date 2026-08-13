/* NOREYO V7.40 — request-boundary search lifecycle start.
   If a package/hotel search reaches search-travel without the authoritative
   guard being active (Enter/form/programmatic start), establish a new user
   generation and lock the visible search CTA before inner fetch layers run. */
(function(){
'use strict';
const BUILD='7.40';
function inputUrl(input){if(typeof input==='string')return input;try{if(typeof Request!=='undefined'&&input instanceof Request)return input.url||'';}catch(_){}try{if(typeof URL!=='undefined'&&input instanceof URL)return input.href||'';}catch(_){}return'';}
function isSearchTravel(input){return inputUrl(input).includes('/functions/v1/search-travel');}
function visible(el){if(!el)return false;try{if(el.hidden)return false;const style=getComputedStyle(el);if(style.display==='none'||style.visibility==='hidden')return false;return !!(el.offsetWidth||el.offsetHeight||el.getClientRects?.().length);}catch(_){return true;}}
function searchButton(){const active=document.querySelector('.view.active'),selectors='.noreyo-v541-booking-cta,.liveSearchButton,#searchView .search-card .primary',activeButtons=active?[...active.querySelectorAll(selectors)]:[],all=[...activeButtons,...document.querySelectorAll(selectors)];return all.find(visible)||all[0]||null;}
function authoritative(){try{return window.NOREYO_V607?.authoritativeMode?.()!==false;}catch(_){return true;}}
function ensureLifecycle(){try{const guard=window.NOREYO_V607;if(!guard?.startGuard||guard.active||!authoritative())return false;try{window.NOREYO_V723?.bump?.();}catch(_){}return !!guard.startGuard(searchButton());}catch(_){return false;}}
function install(){try{if(typeof window.fetch!=='function'||window.fetch.__noreyoV740)return false;const prior=window.fetch.bind(window);const wrapped=function(input,init){if(isSearchTravel(input))ensureLifecycle();return prior(input,init);};wrapped.__noreyoV740=true;window.fetch=wrapped;return true;}catch(_){return false;}}
install();window.addEventListener('pageshow',install,{passive:true});
window.NOREYO_V740=Object.freeze({BUILD,inputUrl,isSearchTravel,visible,searchButton,authoritative,ensureLifecycle,install});
})();