/* NOREYO V9.06 — flight request single-flight + bounded timeout.
   Prevents repeated taps from duplicating provider fan-out and bounds a hanging flight request. */
(function(){
'use strict';
const BUILD='9.06',TIMEOUT_MS=25000;
const inflight=new Map();
function urlOf(input){if(typeof input==='string')return input;try{if(typeof Request!=='undefined'&&input instanceof Request)return input.url||'';}catch(_){}return String(input?.url||'');}
function rawBody(input,init){if(typeof init?.body==='string')return init.body;return'';}
function flightBody(text){try{const x=JSON.parse(text);const a=String(x?.action||'').trim().toLowerCase().replace(/[\s_-]+/g,'');return a==='flightsearch'?x:null;}catch(_){return null;}}
function key(input,init){const body=rawBody(input,init);return urlOf(input).includes('/functions/v1/search-travel')&&flightBody(body)?urlOf(input)+'|'+body:'';}
function responseFrom(snapshot){return new Response(snapshot.text,{status:snapshot.status,headers:snapshot.headers});}
function install(){
  if(typeof window.fetch!=='function'||window.fetch.__noreyoV906)return false;
  const prior=window.fetch.bind(window);
  const wrapped=async function(input,init){
    const k=key(input,init);if(!k)return prior(input,init);
    if(inflight.has(k))return responseFrom(await inflight.get(k));
    const task=(async()=>{
      const controller=typeof AbortController!=='undefined'&&!init?.signal?new AbortController():null;
      const timer=controller?setTimeout(()=>controller.abort(),TIMEOUT_MS):0;
      try{
        const res=await prior(input,{...(init||{}),...(controller?{signal:controller.signal}:{})});
        const text=await res.text();
        const headers={};try{res.headers?.forEach?.((v,n)=>headers[n]=v);}catch(_){}
        return{text,status:res.status,headers};
      }finally{if(timer)clearTimeout(timer);}
    })();
    inflight.set(k,task);
    try{return responseFrom(await task);}finally{if(inflight.get(k)===task)inflight.delete(k);}
  };
  wrapped.__noreyoV906=true;window.fetch=wrapped;return true;
}
install();window.addEventListener('pageshow',install,{passive:true});
window.NOREYO_V906=Object.freeze({BUILD,TIMEOUT_MS,inflight,urlOf,rawBody,flightBody,key,responseFrom,install});
})();
