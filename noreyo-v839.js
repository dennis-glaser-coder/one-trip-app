/* NOREYO V8.39 — strict occupancy payload schema for hotel/package live search.
   Supersedes V8.30: malformed/ambiguous children arrays are rejected instead of
   being silently interpreted as no children. */
(function(){
'use strict';
const BUILD='8.39',MAX_ADULTS=6,MAX_CHILDREN=4,MAX_TRAVELLERS=9;
function inputUrl(input){if(typeof input==='string')return input;try{if(typeof Request!=='undefined'&&input instanceof Request)return input.url||'';}catch(_){}return String(input?.url||'');}
function isSearchTravel(input){return inputUrl(input).includes('/functions/v1/search-travel');}
function parse(text){if(typeof text!=='string'||!text.trim())return null;try{return JSON.parse(text);}catch(_){return null;}}
async function body(input,init){if(typeof init?.body==='string')return parse(init.body);try{if(typeof Request!=='undefined'&&input instanceof Request&&!input.bodyUsed)return parse(await input.clone().text());}catch(_){}return null;}
function flight(raw){return String(raw?.action||'').trim().toLowerCase()==='flight';}
function int(v){const n=Number(v);return Number.isInteger(n)?n:null;}
function hasOwn(o,k){return !!o&&Object.prototype.hasOwnProperty.call(o,k);}
function ageList(arr,objectMode){if(!Array.isArray(arr))return null;return arr.map(x=>objectMode?int(x?.age):int(x?.age??x));}
function sameAges(a,b){return Array.isArray(a)&&Array.isArray(b)&&a.length===b.length&&a.every((v,i)=>v===b[i]);}
function childAgesStrict(occ){const hasChildren=hasOwn(occ,'children'),hasChildAges=hasOwn(occ,'childAges');if(hasChildren&&!Array.isArray(occ.children))return{error:'children'};if(hasChildAges&&!Array.isArray(occ.childAges))return{error:'childAges'};const children=hasChildren?ageList(occ.children,false):null;const childAges=hasChildAges?ageList(occ.childAges,false):null;if(children&&childAges&&!sameAges(children,childAges))return{error:'conflict'};return{ages:children||childAges||[]};}
function occupancyProblem(raw){if(!raw||typeof raw!=='object'||flight(raw))return null;if(!Array.isArray(raw.occupancies)||raw.occupancies.length<1)return null;let total=0;for(let i=0;i<raw.occupancies.length;i++){const occ=raw.occupancies[i];if(!occ||typeof occ!=='object'||Array.isArray(occ))return`Bitte die Reisendenangaben in Zimmer ${i+1} prüfen.`;const adults=int(occ.adults),child=childAgesStrict(occ);if(child.error==='children'||child.error==='childAges')return`Bitte die Kinderangaben in Zimmer ${i+1} prüfen.`;if(child.error==='conflict')return`Die Kinderangaben in Zimmer ${i+1} sind widersprüchlich. Bitte einmal neu auswählen.`;const ages=child.ages;if(adults===null||adults<1||adults>MAX_ADULTS)return`Bitte die Erwachsenenanzahl in Zimmer ${i+1} prüfen.`;if(ages.length>MAX_CHILDREN)return`Aktuell sind maximal ${MAX_CHILDREN} Kinder pro Zimmer möglich.`;if(ages.some(age=>age===null||age<0||age>17))return`Bitte alle Kinderalter in Zimmer ${i+1} zwischen 0 und 17 Jahren prüfen.`;if(ages.filter(age=>age<=1).length>adults)return`Pro Erwachsenen kann maximal ein Kleinkind unter 2 Jahren berücksichtigt werden.`;total+=adults+ages.length;}if(total>MAX_TRAVELLERS)return`Aktuell sind maximal ${MAX_TRAVELLERS} Reisende pro Suche möglich.`;return null;}
function local422(message){return new Response(JSON.stringify({error:{code:'INVALID_OCCUPANCY',message}}),{status:422,headers:{'content-type':'application/json'}});}
function release(){try{window.NOREYO_V607?.releaseGuard?.('occupancy-schema');}catch(_){}try{window.NOREYO_V585?.releaseBusy?.();}catch(_){} }
function block(message){release();try{if(typeof showToast==='function')showToast(message);else window.toast?.(message);}catch(_){}setTimeout(()=>{try{if(typeof openPlanner==='function')openPlanner('travellers');}catch(_){}},0);return local422(message);}
function install(){try{if(typeof window.fetch!=='function'||window.fetch.__noreyoV839)return false;const prior=window.fetch.bind(window);const wrapped=async function(input,init){if(!isSearchTravel(input))return prior(input,init);const raw=await body(input,init);if(!raw)return prior(input,init);const problem=occupancyProblem(raw);return problem?block(problem):prior(input,init);};wrapped.__noreyoV839=true;window.fetch=wrapped;return true;}catch(_){return false;}}
install();window.addEventListener('pageshow',install,{passive:true});
window.NOREYO_V839=Object.freeze({BUILD,MAX_ADULTS,MAX_CHILDREN,MAX_TRAVELLERS,inputUrl,isSearchTravel,parse,body,flight,int,hasOwn,ageList,sameAges,childAgesStrict,occupancyProblem,local422,install});
})();