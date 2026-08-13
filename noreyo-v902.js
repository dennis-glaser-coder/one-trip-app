/* NOREYO V9.02 — flight passenger normalization + multi-airport fan-out.
   LiteAPI Flights treats 12+ as adults, 2–11 as children and <2 as infants.
   Multiple selected departure airports are separate alternative searches, not extra itinerary legs. */
(function(){
'use strict';
const BUILD='9.02',MAX_AIRPORTS=6;
function urlOf(input){if(typeof input==='string')return input;try{if(typeof Request!=='undefined'&&input instanceof Request)return input.url||'';}catch(_){}return String(input?.url||'');}
function parse(v){if(typeof v!=='string')return null;try{return JSON.parse(v);}catch(_){return null;}}
async function bodyOf(input,init){if(typeof init?.body==='string')return parse(init.body);try{if(typeof Request!=='undefined'&&input instanceof Request&&!input.bodyUsed)return parse(await input.clone().text());}catch(_){}return null;}
function action(raw){return String(raw?.action||'').trim().toLowerCase().replace(/[\s_-]+/g,'');}
function isFlightSearch(input,raw){return urlOf(input).includes('/functions/v1/search-travel')&&action(raw)==='flightsearch';}
function age(v){const n=Number(v);return Number.isFinite(n)?Math.max(0,Math.floor(n)):null;}
function normalizePassengers(raw){
  const out={...raw};
  const childAges=(Array.isArray(raw?.childrenAges)?raw.childrenAges:[]).map(age).filter(x=>x!==null);
  const infantAges=(Array.isArray(raw?.infantAges)?raw.infantAges:[]).map(age).filter(x=>x!==null&&x<2);
  const olderMinors=childAges.filter(x=>x>=12&&x<=17);
  const kids=childAges.filter(x=>x>=2&&x<=11);
  out.adults=Math.max(1,Number(raw?.adults)||1)+olderMinors.length;
  out.children=kids.length;out.childrenAges=kids;
  out.infants=infantAges.length;out.infantAges=infantAges;
  return out;
}
function iata(v){const s=String(v||'').trim().toUpperCase();return /^[A-Z]{3}$/.test(s)?s:'';}
function selectedAirports(raw){
  let arr=[];try{if(typeof searchState!=='undefined'&&Array.isArray(searchState?.airports))arr=searchState.airports;}catch(_){}
  const first=iata(raw?.legs?.[0]?.origin);
  const out=[];for(const v of [first,...arr]){const code=iata(v);if(code&&!out.includes(code))out.push(code);if(out.length>=MAX_AIRPORTS)break;}
  return out.length?out:first?[first]:[];
}
function forOrigin(raw,origin){
  const copy=normalizePassengers(JSON.parse(JSON.stringify(raw||{}))),legs=Array.isArray(copy.legs)?copy.legs:[];
  if(!legs.length)return copy;
  const old=iata(legs[0]?.origin),next=iata(origin)||old;
  legs.forEach((leg,index)=>{
    const dir=String(leg?.direction||'').toUpperCase();
    if(index===0||dir==='OUTBOUND'){if(!old||iata(leg.origin)===old)leg.origin=next;}
    if(dir==='INBOUND'||index===legs.length-1){if(!old||iata(leg.destination)===old)leg.destination=next;}
  });
  copy.legs=legs;return copy;
}
function extract(payload){if(Array.isArray(payload?.data))return payload.data;if(Array.isArray(payload?.data?.data))return payload.data.data;if(Array.isArray(payload?.offers))return payload.offers;return null;}
function response(text,status=200,headers){return new Response(text,{status,headers:headers||{'content-type':'application/json'}});}
async function fanOut(prior,input,init,raw){
  const origins=selectedAirports(raw);
  if(origins.length<=1){const normalized=forOrigin(raw,origins[0]||raw?.legs?.[0]?.origin);return prior(input,{...(init||{}),body:JSON.stringify(normalized)});}
  const url=urlOf(input),calls=origins.map(origin=>prior(url,{...(init||{}),body:JSON.stringify(forOrigin(raw,origin))}).then(async res=>({origin,status:res.status,ok:res.ok,headers:res.headers,text:await res.text()})).catch(error=>({origin,status:0,ok:false,error,text:''})));
  const results=await Promise.all(calls),ok=results.filter(x=>x.ok);
  if(!ok.length){const first=results[0];if(first?.text)return response(first.text,first.status||502,first.headers);throw first?.error||new Error('Flugsuche für die gewählten Abflughäfen fehlgeschlagen');}
  const merged=[];let recognized=false;
  for(const item of ok){const payload=parse(item.text),offers=extract(payload);if(Array.isArray(offers)){recognized=true;for(const offer of offers)merged.push(offer&&typeof offer==='object'?{...offer,noreyoDeparture:offer.noreyoDeparture||item.origin}:offer);}}
  if(recognized)return response(JSON.stringify({data:merged,noreyoDepartures:origins}),200,{'content-type':'application/json'});
  const first=ok[0];return response(first.text,first.status,first.headers);
}
function install(){
  if(typeof window.fetch!=='function'||window.fetch.__noreyoV902)return false;
  const prior=window.fetch.bind(window);
  const wrapped=async function(input,init){const raw=await bodyOf(input,init);if(!raw||!isFlightSearch(input,raw))return prior(input,init);return fanOut(prior,input,init,raw);};
  wrapped.__noreyoV902=true;window.fetch=wrapped;return true;
}
install();window.addEventListener('pageshow',install,{passive:true});
window.NOREYO_V902=Object.freeze({BUILD,MAX_AIRPORTS,urlOf,parse,bodyOf,action,isFlightSearch,age,normalizePassengers,iata,selectedAirports,forOrigin,extract,fanOut,install});
})();
