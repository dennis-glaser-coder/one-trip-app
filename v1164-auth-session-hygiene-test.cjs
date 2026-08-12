const fs=require('fs'),vm=require('vm');
const code=fs.readFileSync(require('path').join(__dirname,'noreyo-v1164.js'),'utf8');
let removed=0,remote=0,replaced='',bookingClears=0,baseClears=0;
let now=Math.floor(Date.now()/1000);
const ctx={
 console,Date,Math,Number,String,Object,URLSearchParams,AbortController,
 session:{access_token:'secret',expires_at:now+3600,user_id:'U1'},
 fetch:async(url,init)=>{if(url.endsWith('/auth/v1/logout'))remote++;return new Response('{}',{status:204})},
 Response,setTimeout,clearTimeout,
 location:{hash:'#error=access_denied&error_description=Expired+link',pathname:'/app',search:'?x=1'},
 history:{replaceState(a,b,url){replaced=url}},
 window:{NOREYO_V1160:{clear(){baseClears++;return true}},NOREYO_V1148:{clear(){bookingClears++;return true}},addEventListener(){}}
};
const base={
  BUILD:'11.58',PROJECT_URL:'https://project.test',
  anon(){return'anon-public'},
  session(){return ctx.session},
  clear(){removed++;ctx.session=null;return true},
  authenticated(){return !!ctx.session?.access_token&&ctx.session.expires_at>Math.floor(Date.now()/1000)+30}
};
ctx.window.NOREYO_V1158=base;
vm.createContext(ctx);vm.runInContext(code,ctx);const a=ctx.window.NOREYO_V1164;let fail=0;
let ok=replaced==='/app?x=1';
console.log(ok?'PASS auth error/token hash is scrubbed from browser URL':'FAIL hash '+replaced);if(!ok)fail++;
ok=ctx.window.NOREYO_V1158.__noreyoV1164===true&&typeof ctx.window.NOREYO_V1158.signOut==='function';
console.log(ok?'PASS V11.58 public auth API patched with secure signOut':'FAIL patch');if(!ok)fail++;
(async()=>{
 await ctx.window.NOREYO_V1158.signOut();
 ok=remote===1&&removed===1&&baseClears===1&&bookingClears===1&&!ctx.session;
 console.log(ok?'PASS signOut attempts server revocation then clears local checkout/auth state':'FAIL logout '+JSON.stringify({remote,removed,baseClears,bookingClears,session:ctx.session}));if(!ok)fail++;
 ctx.session={access_token:'expired',expires_at:now-5,user_id:'U1'};
 const before=removed;
 ok=a.purgeExpired()===true&&removed===before+1&&!ctx.session;
 console.log(ok?'PASS expired auth session is purged before reuse':'FAIL expiry');if(!ok)fail++;
 ctx.session={access_token:'fresh',expires_at:now+3600,user_id:'U1'};
 ok=a.expired()===false&&ctx.window.NOREYO_V1158.authenticated()===true;
 console.log(ok?'PASS fresh session still uses original authenticated contract without recursion':'FAIL fresh');if(!ok)fail++;
 process.exit(fail?1:0);
})().catch(e=>{console.error(e);process.exit(1)});