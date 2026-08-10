/* NOREYO V5.83 — provider occupancy alignment + safety bridge loaders */
(function(){
'use strict';
const BUILD='5.83';
const MAX_ADULTS=6;
const MAX_TRAVELLERS=9;
let v582Attempts=0,v582Timer=0,v583Attempts=0,v583Timer=0;
function state(){try{return typeof searchState!=='undefined'&&searchState?searchState:null;}catch(_){return null;}}
function childAges(){const s=state();return Array.isArray(s?.childAges)?s.childAges.map(Number):[];}
function occupancyError(){
 const s=state();if(!s)return'';
 const adults=Math.round(Number(s.adults)),ages=childAges();
 if(!Number.isInteger(adults)||adults<1)return'Bitte mindestens einen Erwachsenen auswählen.';
 if(adults>MAX_ADULTS)return`Aktuell sind maximal ${MAX_ADULTS} Erwachsene pro Suche möglich.`;
 if(adults+ages.length>MAX_TRAVELLERS)return`Aktuell sind maximal ${MAX_TRAVELLERS} Reisende pro Suche möglich.`;
 if(ages.some(v=>!Number.isInteger(v)||v<0||v>17))return'Bitte alle Kinderalter zwischen 0 und 17 Jahren prüfen.';
 if(ages.filter(v=>v<=1).length>adults)return'Pro Erwachsenen kann maximal ein Kleinkind unter 2 Jahren berücksichtigt werden.';
 return'';
}
function notify(msg){try{if(typeof showToast==='function')showToast(msg);else if(typeof window.toast==='function')window.toast(msg);}catch(_){} }
function openTravellers(){try{if(typeof openPlanner==='function'){openPlanner('travellers');return;}}catch(_){}for(const q of ['.travellerInput','.travelerInput','[data-planner="travellers"]','[data-field="travellers"]']){const el=document.querySelector(q);if(el){el.click();return;}}}
function onSearch(e){const btn=e.target instanceof Element?e.target.closest('.liveSearchButton,.noreyo-v541-booking-cta'):null;if(!btn)return;const error=occupancyError();if(!error)return;e.preventDefault();e.stopImmediatePropagation();notify(error);setTimeout(openTravellers,0);}
function syncBuildLabel(){const el=document.querySelector('.noreyo-v576-build');if(el&&el.textContent!=='NOREYO · BUILD '+BUILD)el.textContent='NOREYO · BUILD '+BUILD;}
function relevant(records){for(const r of records){for(const n of r.addedNodes||[]){if(n.nodeType!==1)continue;if(n.matches?.('#profile,.noreyo-v576-build')||n.querySelector?.('#profile,.noreyo-v576-build'))return true;}}return false;}
function loadGuard(key,globalName,src,attemptKey){
 const is582=attemptKey==='582';
 let attempts=is582?v582Attempts:v583Attempts;
 if(window[globalName]){if(is582){v582Attempts=0;clearTimeout(v582Timer);v582Timer=0;}else{v583Attempts=0;clearTimeout(v583Timer);v583Timer=0;}return;}
 if(document.querySelector(`script[data-noreyo-v${key}]`)||attempts>=3)return;
 attempts++;
 if(is582)v582Attempts=attempts;else v583Attempts=attempts;
 const s=document.createElement('script');s.src=src;s.dataset[`noreyoV${key}`]='1';
 s.onload=()=>{if(is582){v582Attempts=0;clearTimeout(v582Timer);v582Timer=0;}else{v583Attempts=0;clearTimeout(v583Timer);v583Timer=0;}};
 s.onerror=()=>{s.remove();const current=is582?v582Attempts:v583Attempts;if(current<3){const delay=350*Math.pow(2,current-1);if(is582){clearTimeout(v582Timer);v582Timer=setTimeout(loadV582,delay);}else{clearTimeout(v583Timer);v583Timer=setTimeout(loadV583,delay);}}};
 document.head.appendChild(s);
}
function loadV582(){loadGuard('582','NOREYO_V582','./noreyo-v582.js?build=583','582');}
function loadV583(){loadGuard('583','NOREYO_V583','./noreyo-v583.js?build=583','583');}
function cleanup(){clearTimeout(v582Timer);clearTimeout(v583Timer);v582Timer=0;v583Timer=0;}
function install(){document.addEventListener('click',onSearch,true);syncBuildLabel();loadV582();loadV583();if(typeof MutationObserver!=='undefined'){const mo=new MutationObserver(records=>{if(relevant(records))syncBuildLabel();});mo.observe(document.body,{childList:true,subtree:true});}window.addEventListener('pageshow',()=>{syncBuildLabel();loadV582();loadV583();},{passive:true});window.addEventListener('pagehide',cleanup,{passive:true});}
window.NOREYO_V581=Object.freeze({BUILD,MAX_ADULTS,MAX_TRAVELLERS,occupancyError,syncBuildLabel,loadV582,loadV583});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();