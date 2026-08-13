const fs=require('fs'),vm=require('vm');
const code=fs.readFileSync('./noreyo-v1208.js','utf8');
let calls=[],mode='ok';
const realSetTimeout=setTimeout,realClearTimeout=clearTimeout;
const ctx={
 console,String,Object,Error,DOMException,AbortController,AbortSignal,
 Request:global.Request,
 setTimeout(fn,ms){return realSetTimeout(fn,ms===12000?5:ms)},clearTimeout:realClearTimeout,
 window:{addEventListener(){},fetch:async(input,init)=>{
   calls.push({input,init});
   if(mode==='hang')return await new Promise((resolve,reject)=>{
     init?.signal?.addEventListener('abort',()=>reject(init.signal.reason||new DOMException('Abort','AbortError')),{once:true});
   });
   return {ok:true,status:200};
 }}
};
vm.createContext(ctx);vm.runInContext(code,ctx);const a=ctx.window.NOREYO_V1208;let fail=0;
(async()=>{
 let r=await ctx.window.fetch('https://x.supabase.co/rest/v1/foo',{method:'GET'});
 let ok=r.ok&&calls.length===1&&calls[0].init.method==='GET'&&!calls[0].init.signal;
 console.log(ok?'PASS non-auth fetch remains untouched':'FAIL passthrough');if(!ok)fail++;

 calls=[];r=await ctx.window.fetch('https://x.supabase.co/auth/v1/user',{headers:{x:'y'}});
 ok=r.ok&&calls.length===1&&calls[0].init.signal instanceof AbortSignal&&calls[0].init.headers.x==='y';
 console.log(ok?'PASS auth user fetch gets bounded signal and preserves init':'FAIL user');if(!ok)fail++;

 mode='hang';calls=[];
 const parent=new AbortController();const p=ctx.window.fetch('https://x.supabase.co/auth/v1/user',{signal:parent.signal});parent.abort();
 try{await p;ok=false}catch(e){ok=true}
 console.log(ok?'PASS caller abort still propagates':'FAIL caller abort');if(!ok)fail++;

 mode='hang';calls=[];
 try{await ctx.window.fetch('https://x.supabase.co/auth/v1/otp',{});ok=false}
 catch(e){ok=String(e.message).includes('dauert gerade zu lange')}
 console.log(ok?'PASS OTP timeout returns actionable German error':'FAIL otp timeout');if(!ok)fail++;

 mode='hang';calls=[];
 try{await ctx.window.fetch('https://x.supabase.co/auth/v1/user',{});ok=false}
 catch(e){ok=String(e.message).includes('nicht bestätigt')}
 console.log(ok?'PASS identity timeout returns actionable German error':'FAIL user timeout');if(!ok)fail++;

 ok=a.install()===false;
 console.log(ok?'PASS auth fetch wrapper install is idempotent':'FAIL idempotent');if(!ok)fail++;
 process.exit(fail?1:0);
})().catch(e=>{console.error(e);process.exit(1)});