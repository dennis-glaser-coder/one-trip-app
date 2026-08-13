const fs=require('fs'),vm=require('vm');const code=fs.readFileSync(require('path').join(__dirname,'noreyo-v1176.js'),'utf8');
let userCalls=0,profileRenders=0,checkoutRenders=0,userShouldFail=false;
const ctx={console,String,Object,Promise,session:{access_token:'T1',expires_at:Math.floor(Date.now()/1000)+3600,user_id:'',email:''},window:{addEventListener(){},NOREYO_V1162:{render(){profileRenders++}}}};
const base={session(){return ctx.session},authenticated(){return !!ctx.session?.access_token&&ctx.session.expires_at>Math.floor(Date.now()/1000)+30},async user(s){userCalls++;if(userShouldFail)return null;ctx.session={...ctx.session,user_id:'U1',email:'u@example.de'};return{id:'U1',email:'u@example.de'}},render(){checkoutRenders++}};
ctx.window.NOREYO_V1158=base;
vm.createContext(ctx);vm.runInContext(code,ctx);const a=ctx.window.NOREYO_V1176;let fail=0;
(async()=>{
 let ok=ctx.window.NOREYO_V1158.authenticated()===false;console.log(ok?'PASS token-only Magic Link session is not trusted before /auth/v1/user validation':'FAIL prevalidation');if(!ok)fail++;
 const u=await a.hydrate();ok=u?.id==='U1'&&userCalls===1&&ctx.window.NOREYO_V1158.authenticated()===true&&ctx.session.user_id==='U1';console.log(ok?'PASS Magic Link session hydrates real Supabase user identity':'FAIL hydrate '+JSON.stringify({u,userCalls,session:ctx.session,validated:a.validated()}));if(!ok)fail++;
 ok=profileRenders>=1&&checkoutRenders>=1;console.log(ok?'PASS profile/checkout surfaces rerender after identity hydration':'FAIL rerender '+JSON.stringify({profileRenders,checkoutRenders}));if(!ok)fail++;
 await a.hydrate();ok=userCalls===1;console.log(ok?'PASS already validated token does not repeat /auth/v1/user request':'FAIL dedupe '+userCalls);if(!ok)fail++;
 ctx.session={access_token:'T2',expires_at:Math.floor(Date.now()/1000)+3600,user_id:'',email:''};ok=ctx.window.NOREYO_V1158.authenticated()===false;console.log(ok?'PASS changed access token loses previous validation ownership':'FAIL changed token');if(!ok)fail++;
 userShouldFail=true;await a.hydrate();ok=ctx.window.NOREYO_V1158.authenticated()===false&&a.validated()===false;console.log(ok?'PASS failed server identity validation stays fail-closed':'FAIL failclosed');if(!ok)fail++;
 process.exit(fail?1:0);
})().catch(e=>{console.error(e);process.exit(1)});