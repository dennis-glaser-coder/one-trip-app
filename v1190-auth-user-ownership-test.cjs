const fs=require('fs'),vm=require('vm');
const code=fs.readFileSync('./noreyo-v1190.js','utf8');
let session={access_token:'OLD',expires_at:999,user_id:'',email:''};
let saves=[],clears=0,requests=[];
let resolvers={};
function response(status,payload){return {ok:status>=200&&status<300,status,async json(){return payload}}}
const ctx={
 console,Object,String,Map,Promise,AbortController,setTimeout,clearTimeout,
 fetch(url,init){
   const token=String(init.headers.Authorization).replace('Bearer ','');
   requests.push(token);
   return new Promise(resolve=>{resolvers[token]=resolve});
 },
 window:{addEventListener(){},NOREYO_V1158:{
   PROJECT_URL:'https://x.supabase.co',
   anon(){return'anon'},
   session(){return session},
   save(next){session={...next,access_token:String(next.access_token)};saves.push(session.access_token);return true},
   clear(){session=null;clears++;return true},
   async user(){return null}
 }}
};
vm.createContext(ctx);vm.runInContext(code,ctx);const a=ctx.window.NOREYO_V1190;
(async()=>{
 let fail=0;
 const oldPromise=a.user({...session});
 session={access_token:'NEW',expires_at:999,user_id:'',email:''};
 const newPromise=a.user({...session});
 let ok=requests.length===2&&requests.includes('OLD')&&requests.includes('NEW')&&a.inflightCount===2;
 console.log(ok?'PASS user validation is token-scoped':'FAIL token scope '+JSON.stringify({requests,count:a.inflightCount}));if(!ok)fail++;
 resolvers.NEW(response(200,{id:'user-new',email:'new@example.com'}));
 const newUser=await newPromise;
 ok=newUser?.id==='user-new'&&session.access_token==='NEW'&&saves.includes('NEW');
 console.log(ok?'PASS current token response hydrates current identity':'FAIL new '+JSON.stringify({newUser,session,saves}));if(!ok)fail++;
 resolvers.OLD(response(200,{id:'user-old',email:'old@example.com'}));
 const oldUser=await oldPromise;
 ok=oldUser===null&&session.access_token==='NEW'&&!saves.includes('OLD');
 console.log(ok?'PASS stale old-token success cannot roll back refreshed session':'FAIL stale success '+JSON.stringify({oldUser,session,saves}));if(!ok)fail++;
 const old401=a.user({access_token:'STALE'});
 session={access_token:'FRESH',expires_at:999};
 resolvers.STALE(response(401,{message:'expired'}));
 await old401;
 ok=session.access_token==='FRESH'&&clears===0;
 console.log(ok?'PASS stale token rejection cannot clear newer session':'FAIL stale reject '+JSON.stringify({session,clears}));if(!ok)fail++;
 const fresh401=a.user({...session});
 resolvers.FRESH(response(401,{message:'expired'}));
 await fresh401;
 ok=session===null&&clears===1;
 console.log(ok?'PASS current token rejection clears invalid current session':'FAIL current reject '+JSON.stringify({session,clears}));if(!ok)fail++;
 process.exit(fail?1:0);
})().catch(e=>{console.error(e);process.exit(1)});