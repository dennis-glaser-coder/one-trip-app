const fs=require('fs'),vm=require('vm');const code=fs.readFileSync('./noreyo-v1104.js','utf8');let status=204;
const ctx={console,String,Object,JSON,Response,Request,window:{addEventListener(){},fetch:async()=>new Response(null,{status,headers:{'X-Noreyo-Provider-Route':'hotels'}})}};
vm.createContext(ctx);vm.runInContext(code,ctx);const a=ctx.window.NOREYO_V1104;let fail=0;
(async()=>{let r=await ctx.window.fetch('https://x.test/functions/v1/search-travel');let p=await r.json();let ok=r.status===200&&p.noreyoNoAvailability===true&&Array.isArray(p.data)&&r.headers.get('X-Noreyo-Provider-Route')==='hotels';console.log(ok?'PASS search-travel 204 becomes empty JSON success':'FAIL 204');if(!ok)fail++;
status=500;r=await ctx.window.fetch('https://x.test/functions/v1/search-travel');ok=r.status===500;console.log(ok?'PASS real provider errors stay errors':'FAIL error');if(!ok)fail++;
status=204;r=await ctx.window.fetch('https://x.test/functions/v1/other');ok=r.status===204;console.log(ok?'PASS unrelated 204 remains untouched':'FAIL unrelated');if(!ok)fail++;
process.exit(fail?1:0)})().catch(e=>{console.error(e);process.exit(1)});