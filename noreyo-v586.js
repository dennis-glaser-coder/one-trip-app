/* NOREYO V5.86 — AI adult-count intent guard */
(function(){
'use strict';
const BUILD='5.86';
function norm(v){return String(v||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/ß/g,'ss');}
function explicitAdultIntent(text){const t=norm(text);if(/\bzu zweit\b/.test(t))return true;return /\b(?:[1-9]|ein(?:e|en|em|er)?|zwei|drei|vier|fuenf|funf|sechs|sieben|acht|neun)\s+(?:erwachsen(?:e|er|en)?|personen?|reisende)\b/.test(t);}
function state(){try{return typeof searchState!=='undefined'&&searchState?searchState:null;}catch(_){return null;}}
function refresh(){try{if(typeof updateSearchUI==='function')updateSearchUI();}catch(_){}try{if(typeof persistState==='function')persistState();}catch(_){}}
function restoreAdults(expected){const s=state();if(!s||!Number.isInteger(expected)||expected<1||expected>9)return false;const current=Math.round(Number(s.adults));if(current===expected)return false;s.adults=expected;refresh();return true;}
function onApplyCapture(event){const button=event.target instanceof Element?event.target.closest('.noreyo-v556-apply'):null;if(!button)return;const text=document.getElementById('noreyoAi556Text')?.value||'';if(explicitAdultIntent(text))return;const before=Math.round(Number(state()?.adults));if(!Number.isInteger(before)||before<1||before>9)return;setTimeout(()=>restoreAdults(before),0);}
function install(){document.addEventListener('click',onApplyCapture,true);}
window.NOREYO_V586=Object.freeze({BUILD,explicitAdultIntent,restoreAdults});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();