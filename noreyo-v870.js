/* NOREYO V8.70 — latest-intent departure reconciliation.
   Debounces final AI departure application so delayed callbacks from older
   parser layers cannot overwrite a newer user intent. */
(function(){
'use strict';
const BUILD='8.70',DEBOUNCE_MS=90;
let timer=0,generation=0;
function base(){return window.NOREYO_V800||null;}
function snapshot(){try{return Array.isArray(searchState?.airports)?searchState.airports.map(String):[];}catch(_){return[];}}
function setAirports(codes){try{return base()?.setAirports?.(codes)||false;}catch(_){return false;}}
function inputText(){return document.getElementById('noreyoAi556Text')?.value||'';}
function resolve(text,before=[]){const b=base();if(!b)return{codes:Array.isArray(before)?before.slice():[],reason:'no-base'};try{if(window.NOREYO_V867?.hasTransportHit?.(text)){const safe=window.NOREYO_V867.safeDepartures?.(text)||[];return{codes:safe.length?safe:(Array.isArray(before)?before.slice():[]),reason:'ground-transport'};}}catch(_){}try{if(window.NOREYO_V863?.hasSuppressedHit?.(text)){const safe=window.NOREYO_V863.safeDepartures?.(text)||[];return{codes:safe.length?safe:(Array.isArray(before)?before.slice():[]),reason:'location-context'};}}catch(_){}try{const keyword=window.NOREYO_V851?.parseAirportKeyword?.(text)||[];if(keyword.length)return{codes:keyword.slice(),reason:'airport-keyword'};}catch(_){}try{const parsed=b.parseDepartures?.(text)||[];if(parsed.length)return{codes:parsed.slice(),reason:'departure'};const hits=b.airportHits?.(text)||[];if(hits.length&&!b.mentionsDeparture?.(text))return{codes:Array.isArray(before)?before.slice():[],reason:'destination-only'};}catch(_){}return{codes:Array.isArray(before)?before.slice():[],reason:'unchanged'};}
function applyLatest(text,before,token){if(token!==generation)return false;const decision=resolve(text,before);return setAirports(decision.codes);}
function schedule(text=inputText(),before=snapshot()){generation+=1;const token=generation;if(timer){clearTimeout(timer);timer=0;}timer=setTimeout(()=>{timer=0;applyLatest(text,before,token);},DEBOUNCE_MS);return token;}
function onApply(e){if(!e.target?.closest?.('.noreyo-v556-apply'))return;schedule(inputText(),snapshot());}
function cleanup(){generation+=1;if(timer){clearTimeout(timer);timer=0;}}
document.addEventListener('click',onApply,true);window.addEventListener('pagehide',cleanup,{passive:true});window.NOREYO_V870=Object.freeze({BUILD,DEBOUNCE_MS,base,snapshot,setAirports,inputText,resolve,applyLatest,schedule,cleanup,get generation(){return generation;},get pending(){return !!timer;}});
})();