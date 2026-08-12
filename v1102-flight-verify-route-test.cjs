const fs=require('fs'),vm=require('vm');const code=fs.readFileSync('./noreyo-v1102.js','utf8');let mode='good';
const ctx={console,String,Object,JSON,Response,Request,window:{addEventListener(){},fetch:async()=>new Response('{}',{status:200,headers:{'X-Noreyo-Provider-Route':mode==='good'?'flights/verify':mode==='wrong'?'hotels':' '}})}};
vm.createContext(ctx);vm.runInContext(code,ctx);const a=ctx.window.NOREYO_V1102;let fail=0;
(async()=>{let r=await ctx.window.fetch('https://x.test/functions/v1/flight-verify');let ok=r.status===200;console.log(ok?'PASS correct verify route is accepted':'FAIL good');if(!ok)fail++;
mode='wrong';r=await ctx.window.fetch('https://x.test/functions/v1/flight-verify');ok=r.status===502&&r.headers.get('x-noreyo-actual-route')==='hotels';console.log(ok?'PASS wrong verify route is blocked':'FAIL wrong');if(!ok)fail++;
mode='missing';r=await ctx.window.fetch('https://x.test/functions/v1/flight-verify');ok=r.status===502&&r.headers.get('x-noreyo-actual-route')==='missing';console.log(ok?'PASS missing verify route marker is blocked':'FAIL missing');if(!ok)fail++;
mode='wrong';r=await ctx.window.fetch('https://x.test/other-endpoint');ok=r.status===200;console.log(ok?'PASS unrelated fetch remains untouched':'FAIL unrelated');if(!ok)fail++;
process.exit(fail?1:0)})().catch(e=>{console.error(e);process.exit(1)});