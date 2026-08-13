const fs=require('fs'),vm=require('vm');
const code=fs.readFileSync('./noreyo-v922.js','utf8');
let network=0;
const ctx={console,JSON,String,Object,Promise,AbortController,AbortSignal,DOMException,Request,setTimeout,clearTimeout,window:{addEventListener(){},fetch:async()=>{network++;return new Response('{}',{status:200})}},Response};
vm.createContext(ctx);vm.runInContext(code,ctx);const a=ctx.window.NOREYO_V922;let fail=0;
const cases=[['https://x/functions/v1/hotel-reviews',{},'reviews'],['https://x/functions/v1/search-travel',{body:JSON.stringify({boardType:'BB'})},'board'],['https://x/functions/v1/search-travel',{body:JSON.stringify({sessionId:'flex-123'})},'flex'],['https://x/functions/v1/search-travel',{body:JSON.stringify({action:'flightSearch',sessionId:'flex-x'})},''],['https://x/functions/v1/search-travel',{body:JSON.stringify({sessionId:'main'})},'']];
for(const [u,init,want] of cases){const got=a.kind(u,init),ok=got===want;console.log((ok?'PASS ':'FAIL ')+got);if(!ok)fail++;}
(async()=>{const r=await ctx.window.fetch('https://x/functions/v1/hotel-reviews',{});const ok=network===1&&r.status===200;console.log(ok?'PASS scoped helper request reaches network':'FAIL network');if(!ok)fail++;if(fail)process.exit(1);})().catch(e=>{console.error(e);process.exit(1)});