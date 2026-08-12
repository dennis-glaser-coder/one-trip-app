const fs=require('fs'),vm=require('vm');const code=fs.readFileSync('./noreyo-v1110.js','utf8');
let mode='good',calls=0;
const ctx={console,Response,Request,JSON,String,window:{addEventListener(){},fetch:async()=>{calls++;if(mode==='good')return new Response('{}',{status:200,headers:{'X-Noreyo-Provider-Route':'hotels/prebook'}});if(mode==='missing')return new Response('{}',{status:200});return new Response('{}',{status:409})}}};
vm.createContext(ctx);vm.runInContext(code,ctx);const a=ctx.window.NOREYO_V1110;let fail=0;
(async()=>{
 let r=await ctx.window.fetch('https://x/functions/v1/hotel-prebook');let ok=r.status===200;
 console.log(ok?'PASS expected hotel PREBOOK route passes':'FAIL good');if(!ok)fail++;
 mode='missing';r=await ctx.window.fetch('https://x/functions/v1/hotel-prebook');let p=await r.json();ok=r.status===502&&p.error?.code==='PREBOOK_ROUTE_MISMATCH';
 console.log(ok?'PASS missing route marker is blocked':'FAIL missing '+JSON.stringify(p));if(!ok)fail++;
 mode='error';r=await ctx.window.fetch('https://x/functions/v1/hotel-prebook');ok=r.status===409;
 console.log(ok?'PASS provider/server error responses remain unchanged':'FAIL error');if(!ok)fail++;
 mode='missing';r=await ctx.window.fetch('https://x/functions/v1/search-travel');ok=r.status===200;
 console.log(ok?'PASS unrelated successful requests remain untouched':'FAIL unrelated');if(!ok)fail++;
 process.exit(fail?1:0);
})().catch(e=>{console.error(e);process.exit(1)});