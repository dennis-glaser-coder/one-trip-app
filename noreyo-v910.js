/* NOREYO V9.10 — Request-aware flight timeout/single-flight supplement.
   Covers Request-object flight searches and preserves the bounded timeout even
   when the caller already supplies an AbortSignal. Non-flight requests are untouched. */
(function(){
'use strict';
const BUILD='9.10',TIMEOUT_MS=25000;
const inflight=new Map();
function urlOf(input){if(typeof input==='string')return input;try{if(typeof Request!=='undefined'&&input instanceof Request)return input.url||'';}catch(_){}return String(input?.url||'');}
function action(raw){return String(raw?.action||'').trim().toLowerCase().replace(/[\s_-]+/g,'');}
function flightBody(text){try{const x=JSON.parse(String(text||''));return action(x)==='flightsearch'?x:null;}catch(_){return null;}}
async function rawBody(input,init){if(typeof init?.body==='string')return init.body;try{if(typeof Request!=='undefined'&&input instanceof Request&&!input.bodyUsed)return await input.clone().text();}catch(_){}return'';}
function stable(value){if(Array.isArray(value))return'['+value.map(stable).join(',')+']';if(value&&typeof value==='object'){return'{'+Object.keys(value).sort().map(k=>JSON.stringify(k)+':'+stable(value[k])).join(',')+'}';}return JSON.stringify(value);}
function keyFor(url,raw){return raw&&url.includes('/functions/v1/search-travel')?url+'|'+stable(raw):'';}
function snapshotHeaders(headers){const out={};try{headers?.forEach?.((v,k)=>out[k]=v);}catch(_){}return out;}
function responseFrom(s){return new Response(s.text,{status:s.status,statusText:s.statusText||'',headers:s.headers});}
function timeoutSignal(callerSignal){
  if(typeof AbortController==='undefined')return{signal:callerSignal||undefined,cleanup(){}};
  const controller=new AbortController();let timer=0,off=()=>{};
  const abortFromCaller=()=>{try{controller.abort(callerSignal?.reason);}catch(_){controller.abort();}};
  if(callerSignal){if(callerSignal.aborted)abortFromCaller();else{callerSignal.addEventListener('abort',abortFromCaller,{once:true});off=()=>callerSignal.removeEventListener('abort',abortFromCaller);}}
  if(!controller.signal.aborted)timer=setTimeout(()=>{try{controller.abort(new DOMException('Flight request timed out','TimeoutError'));}catch(_){controller.abort();}},TIMEOUT_MS);
  return{signal:controller.signal,cleanup(){if(timer)clearTimeout(timer);off();}};
}
function requestInit(input,init,body,signal){
  const next={...(init||{}),body,signal};
  try{if(typeof Request!=='undefined'&&input instanceof Request){if(next.method==null)next.method=input.method;if(next.headers==null)next.headers=input.headers;if(next.credentials==null)next.credentials=input.credentials;if(next.mode==null)next.mode=input.mode;if(next.cache==null)next.cache=input.cache;if(next.redirect==null)next.redirect=input.redirect;if(next.referrer==null)next.referrer=input.referrer;if(next.referrerPolicy==null)next.referrerPolicy=input.referrerPolicy;if(next.integrity==null)next.integrity=input.integrity;}}
  catch(_){}
  return next;
}
function install(){
  if(typeof window.fetch!=='function'||window.fetch.__noreyoV910)return false;
  const prior=window.fetch.bind(window);
  const wrapped=async function(input,init){
    const text=await rawBody(input,init),raw=flightBody(text),url=urlOf(input);
    if(!raw||!url.includes('/functions/v1/search-travel'))return prior(input,init);
    const key=keyFor(url,raw);if(inflight.has(key))return responseFrom(await inflight.get(key));
    const callerSignal=init?.signal||(typeof Request!=='undefined'&&input instanceof Request?input.signal:null);
    const bounded=timeoutSignal(callerSignal);
    const task=(async()=>{try{const res=await prior(url,requestInit(input,init,text,bounded.signal));return{text:await res.text(),status:res.status,statusText:res.statusText,headers:snapshotHeaders(res.headers)};}finally{bounded.cleanup();}})();
    inflight.set(key,task);
    try{return responseFrom(await task);}finally{if(inflight.get(key)===task)inflight.delete(key);}
  };
  wrapped.__noreyoV910=true;window.fetch=wrapped;return true;
}
install();window.addEventListener('pageshow',install,{passive:true});
window.NOREYO_V910=Object.freeze({BUILD,TIMEOUT_MS,inflight,urlOf,action,flightBody,rawBody,stable,keyFor,snapshotHeaders,responseFrom,timeoutSignal,requestInit,install});
})();
