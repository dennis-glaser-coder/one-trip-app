const fs=require('fs'),vm=require('vm');const code=fs.readFileSync('./noreyo-v1222.js','utf8');
let mode='rate';
const raw={sendMagicLink:async()=>{if(mode==='ok')return true;if(mode==='invalid')throw new Error('Bitte gib eine gültige E-Mail-Adresse ein.');if(mode==='rate')throw new Error('For security purposes, you can only request this after 60 seconds provider_id=SECRET');if(mode==='network')throw new Error('TypeError: Failed to fetch api.supabase.internal');throw new Error('unexpected provider trace SECRET');}};
const ctx={console,String,Object,Error,window:{addEventListener(){},NOREYO_V1158:raw}};vm.createContext(ctx);vm.runInContext(code,ctx);const a=ctx.window.NOREYO_V1222;let fail=0;
(async()=>{
 let ok=await ctx.window.NOREYO_V1158.sendMagicLink().catch(e=>e.message.includes('bereits einen Anmeldelink')&&!e.message.includes('SECRET'));
 console.log(ok?'PASS Supabase OTP rate limit maps to safe German guidance':'FAIL rate');if(!ok)fail++;
 mode='network';ok=await ctx.window.NOREYO_V1158.sendMagicLink().catch(e=>e.message.includes('nicht erreichbar')&&!e.message.includes('supabase'));
 console.log(ok?'PASS OTP network failure maps to safe German guidance':'FAIL network');if(!ok)fail++;
 mode='invalid';ok=await ctx.window.NOREYO_V1158.sendMagicLink().catch(e=>e.message==='Bitte gib eine gültige E-Mail-Adresse ein.');
 console.log(ok?'PASS local validation copy is preserved':'FAIL invalid');if(!ok)fail++;
 mode='other';ok=await ctx.window.NOREYO_V1158.sendMagicLink().catch(e=>e.message.includes('konnte gerade nicht gesendet')&&!e.message.includes('SECRET'));
 console.log(ok?'PASS unknown OTP provider error never reaches profile raw':'FAIL generic');if(!ok)fail++;
 mode='ok';ok=await ctx.window.NOREYO_V1158.sendMagicLink();
 console.log(ok?'PASS successful Magic-Link request remains unchanged':'FAIL success');if(!ok)fail++;
 ok=a.patch()===false;console.log(ok?'PASS Magic-Link error wrapper is idempotent':'FAIL idempotent');if(!ok)fail++;
 process.exit(fail?1:0);
})().catch(e=>{console.error(e);process.exit(1)});