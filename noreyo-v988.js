/* NOREYO V9.88 — stale-safe multi-airport flight planner.
   V9.43 rendered async multi-origin results into the shared planner even after the
   user navigated to another planner. Replace its listener/search with an ownership-
   guarded equivalent so late flight responses cannot overwrite newer UI. */
(function(){
'use strict';
const BUILD='9.88';
let installed=false,runSeq=0,prior=null;
const v943=window.NOREYO_V943;
function body(){return document.getElementById('plannerBody');}
function title(){return document.getElementById('plannerTitle');}
function sheet(){return document.getElementById('plannerSheet');}
function owns(id){const b=body(),t=title(),s=sheet();return !!b&&!!t&&!!s&&s.classList.contains('show')&&t.textContent.trim()==='Flüge'&&b.dataset.noreyoFlightRun===String(id);}
function mark(id){const b=body();if(!b)return false;b.dataset.noreyoFlightRun=String(id);return true;}
async function searchSafe(){
  const iata=destinationIata[String(dest).toLowerCase()];
  if(!iata){openPlanner('destination');showToast('Bitte zuerst ein Ziel wählen');return false;}
  const selectedOrigins=v943.origins(searchState.airports);
  if(!selectedOrigins.length){openPlanner('airports');showToast('Bitte mindestens einen Abflughafen wählen');return false;}
  const runId=++runSeq,base=flightRequestBody();
  openPlannerShell('Flüge',`<div class="loading-panel" style="margin:0"><span class="search-spinner"></span><b>${selectedOrigins.length} Abflughafen${selectedOrigins.length===1?'':'/-häfen'} werden geprüft</b><p>${selectedOrigins.map(v943.esc).join(', ')} → ${v943.esc(iata)}</p></div>`);
  mark(runId);
  const settled=await Promise.allSettled(selectedOrigins.map(async origin=>{const response=await window.NOREYO_V941.requestOrigin(origin,base);return{origin,offers:v943.normalizedOffers(origin,iata,response.payload),payload:response.payload}}));
  const offers=[],failures=[];
  settled.forEach((s,i)=>s.status==='fulfilled'?offers.push(...s.value.offers):failures.push({origin:selectedOrigins[i],error:s.reason}));
  if(!owns(runId))return false;
  v943.render(body(),iata,offers,failures);return true;
}
function onClick(e){
  const b=body();if(!b)return;
  const select=e.target?.closest?.('.noreyo-v943-select');
  if(select){const idx=Number(select.dataset.flightOfferIndex),offer=b.__noreyoV943Offers?.[idx];if(!offer)return;window.NOREYO_SELECTED_FLIGHT=Object.freeze({...offer});b.innerHTML=v943.selectionHTML(offer);return;}
  if(e.target?.closest?.('.noreyo-v943-back,.noreyo-v943-retry')){searchSafe();return;}
}
function install(){
  if(installed||!v943?.render||!window.NOREYO_V941?.requestOrigin)return false;
  try{v943.restore?.();}catch(_){}
  prior=window.searchFlights;
  window.searchFlights=searchSafe;
  document.addEventListener('click',onClick,true);
  installed=true;return true;
}
function restore(){if(!installed)return false;document.removeEventListener('click',onClick,true);if(prior)window.searchFlights=prior;installed=false;return true;}
install();
window.addEventListener('pagehide',restore,{passive:true});
window.addEventListener('pageshow',install,{passive:true});
window.NOREYO_V988=Object.freeze({BUILD,body,title,sheet,owns,mark,searchSafe,onClick,install,restore,getRun:()=>runSeq});
})();