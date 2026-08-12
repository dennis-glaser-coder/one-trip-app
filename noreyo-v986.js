/* NOREYO V9.86 — stale-safe hotel review planner.
   Packed openReviews writes its async response into the shared planner body without
   verifying that the reviews planner still owns that surface. Reimplement that flow
   with a run token so late review responses cannot overwrite another planner. */
(function(){
'use strict';
const BUILD='9.86';
let runSeq=0;
function body(){return document.getElementById('plannerBody');}
function title(){return document.getElementById('plannerTitle');}
function sheet(){return document.getElementById('plannerSheet');}
function owns(runId){const b=body(),t=title(),s=sheet();return !!b&&!!t&&!!s&&s.classList.contains('show')&&t.textContent.trim()==='Gästebewertungen'&&b.dataset.noreyoReviewRun===String(runId);}
function mark(runId){const b=body();if(!b)return false;b.dataset.noreyoReviewRun=String(runId);return true;}
function setHTML(runId,html){if(!owns(runId))return false;body().innerHTML=html;return true;}
function resolveOffer(encoded){try{return snapshotByKey(encoded)||offers.map(snapshotOffer).find(x=>encodeURIComponent(x.key)===encoded||x.key===decodeURIComponent(encoded));}catch(_){return null;}}
async function openReviewsSafe(encoded){
  const o=resolveOffer(encoded);if(!o)return false;
  const runId=++runSeq;
  try{reviewDisplayCounts.set(o.key,5);}catch(_){}
  openPlannerShell('Gästebewertungen',`<div class="loading-panel" style="margin:0"><span class="search-spinner"></span><b>Bewertungen werden geladen</b><p>Wir holen die aktuellen Gästestimmen für ${safeText(o.hotel)}.</p></div>`);
  mark(runId);
  let cached=null;try{cached=reviewCache.get(o.key)||(Array.isArray(o.reviews)&&o.reviews.length?o.reviews:null);}catch(_){}
  if(cached){try{reviewCache.set(o.key,cached);}catch(_){}setHTML(runId,renderReviews(o,cached));return true;}
  if(!o.hotelId){setHTML(runId,'<div class="backend-note"><b>Für diesen gespeicherten Eintrag fehlen Providerdaten</b><p>Einzelbewertungen können erst bei einem Live-Hotel mit Hotel-ID geladen werden.</p></div>');return true;}
  try{
    const res=await fetch(reviewsEndpoint,{method:'POST',headers:{'Content-Type':'application/json','apikey':providerAnon,'Authorization':`Bearer ${providerAnon}`},body:JSON.stringify({hotelId:o.hotelId,limit:30,language:'de'})});
    let p={};try{p=await res.json()}catch(_){}
    if(!res.ok)throw new Error(p?.message||p?.error?.message||`HTTP ${res.status}`);
    const items=Array.isArray(p?.data)?p.data:Array.isArray(p?.data?.data)?p.data.data:Array.isArray(p?.reviews)?p.reviews:Array.isArray(p)?p:[];
    try{reviewCache.set(o.key,items);o.reviews=items;savedFavorites.forEach(x=>{if(x.key===o.key)x.reviews=items});savedTrips.forEach(x=>{if(x.key===o.key)x.reviews=items});persistState();}catch(_){}
    setHTML(runId,renderReviews(o,items));return true;
  }catch(_){setHTML(runId,'<div class="backend-note"><b>Bewertungen konnten gerade nicht geladen werden</b><p>Die Hotelsuche funktioniert weiterhin. Bitte versuche die Gästebewertungen gleich noch einmal.</p></div>');return false;}
}
window.openReviews=openReviewsSafe;
window.NOREYO_V986=Object.freeze({BUILD,body,title,sheet,owns,mark,setHTML,resolveOffer,openReviewsSafe,getRun:()=>runSeq});
})();