/* NOREYO V10.00 — persisted airport-limit hygiene. */
(function(){
'use strict';
const BUILD='10.00',MAX_AIRPORTS=6;
let repaired=false;
function normalized(values){const out=[];for(const raw of Array.isArray(values)?values:[]){const code=String(raw||'').trim().toUpperCase();if(!/^[A-Z]{3}$/.test(code)||out.includes(code))continue;out.push(code);if(out.length>=MAX_AIRPORTS)break;}return out;}
function equal(a,b){return Array.isArray(a)&&Array.isArray(b)&&a.length===b.length&&a.every((x,i)=>x===b[i]);}
function repair(){let s=null;try{s=typeof searchState!=='undefined'?searchState:null;}catch(_){}if(!s)return false;const before=Array.isArray(s.airports)?s.airports.map(x=>String(x||'').trim().toUpperCase()):[];const next=normalized(before);if(equal(before,next))return false;s.airports=next;repaired=true;try{persistState?.();}catch(_){}try{updateSearchUI?.();}catch(_){}try{window.NOREYO_V998?.sync?.();}catch(_){}return true;}
function status(){return{repaired,airports:(()=>{try{return [...(searchState?.airports||[])];}catch(_){return[];}})()};}
repair();window.addEventListener('pageshow',repair,{passive:true});window.NOREYO_V1000=Object.freeze({BUILD,MAX_AIRPORTS,normalized,equal,repair,status});
})();