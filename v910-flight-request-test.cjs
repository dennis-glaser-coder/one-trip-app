const fs=require('fs'),vm=require('vm');
const code=fs.readFileSync('noreyo-v910.js','utf8');
let calls=0,lastInit=null;
const ctx={console,Request,Response,Headers,AbortController,DOMException,JSON,Object,String,Array,setTimeout,clearTimeout,
 window:{addEventListener(){},fetch:async(input,init)=>{calls++;lastInit=init;return new Response(JSON.stringify({ok:true}),{status:200,headers:{'x-test':'1'}})}}};
vm.createContext(ctx);vm.runInContext(code,ctx);const a=ctx.window.NOREYO_V910;
let fail=0;
(async()=>{
 const body=JSON.stringify({legs:[{origin:'DUS',destination:'PMI'}],action:'flightSearch',adults:2});
 const req=new Request('https://x.test/functions/v1/search-travel',{method:'POST',headers:{authorization:'Bearer anon','content-type':'application/json'},body});
 calls=0;const [r1,r2]=await Promise.all([ctx.window.fetch(req),ctx.window.fetch(req.clone())]);
 let ok=calls===1&&(await r1.json()).ok&&(await r2.json()).ok&&lastInit.method==='POST'&&String(lastInit.headers.get?.('authorization')||'').includes('Bearer');
 console.log(ok?'PASS Request-object flight searches dedupe and preserve request metadata':'FAIL '+JSON.stringify({calls,method:lastInit?.method}));if(!ok)fail++;
 const k1=a.keyFor('https://x/functions/v1/search-travel',{action:'flightSearch',b:2,a:1});
 const k2=a.keyFor('https://x/functions/v1/search-travel',{a:1,b:2,action:'flightSearch'});
 ok=k1===k2;console.log(ok?'PASS semantic JSON key order dedupes':'FAIL key');if(!ok)fail++;
 const ac=new AbortController();const bounded=a.timeoutSignal(ac.signal);ok=bounded.signal!==ac.signal&&!bounded.signal.aborted;ac.abort();await Promise.resolve();ok=ok&&bounded.signal.aborted;bounded.cleanup();
 console.log(ok?'PASS caller AbortSignal is preserved through bounded composite signal':'FAIL signal');if(!ok)fail++;
 calls=0;await ctx.window.fetch('https://x.test/functions/v1/search-travel',{method:'POST',body:JSON.stringify({action:'hotelSearch'})});ok=calls===1;console.log(ok?'PASS non-flight requests untouched':'FAIL nonflight');if(!ok)fail++;
 process.exit(fail?1:0);
})().catch(e=>{console.error(e);process.exit(1)});
