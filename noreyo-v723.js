/* NOREYO V7.23 — retry generation ownership.
   Prevents an old retryable response from launching a fallback after the user
   has left search or started a newer search while the retry decision is pending. */
(function(){
'use strict';
const BUILD='7.23';
let intentEpoch=0,bound=false;
function bump(){intentEpoch++;return intentEpoch;}
function currentEpoch(){return intentEpoch;}
function isSearchButton(target){if(!(target instanceof Element))return false;return !!target.closest('.noreyo-v541-booking-cta,.liveSearchButton,#searchView .search-card .primary');}
function onSearchCapture(e){if(isSearchButton(e.target))bump();}
function navigationAway(view){return ['favorites','trips','profile','discover'].includes(String(view||''));}
function installGoHook(){try{if(typeof go!=='function'||go.__noreyoV723)return false;const prior=go;const wrapped=function(view){if(navigationAway(view))bump();return prior.apply(this,arguments);};wrapped.__noreyoV723=true;go=wrapped;return true;}catch(_){return false;}}
function bind(){if(bound)return false;bound=true;window.addEventListener('click',onSearchCapture,true);return true;}
function unbind(){if(!bound)return false;bound=false;window.removeEventListener('click',onSearchCapture,true);return true;}
function owned(epoch){return epoch===intentEpoch;}
function install(){bind();installGoHook();return true;}
function cleanup(){bump();unbind();}
install();
window.addEventListener('pagehide',cleanup,{passive:true});
window.addEventListener('pageshow',install,{passive:true});
window.NOREYO_V723=Object.freeze({BUILD,bump,currentEpoch,isSearchButton,navigationAway,installGoHook,bind,unbind,owned,install,cleanup});
})();