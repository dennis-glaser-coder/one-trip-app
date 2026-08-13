const fs=require('fs'),vm=require('vm');const code=fs.readFileSync('./noreyo-v1224.js','utf8');
let requests=[],clears=0,listeners={};
const auth={PROJECT_URL:'https://example.supabase.co/',session(){return{access_token:'jwt-token'}},authenticated(){return true},anon(){return'anon-key'}};
const ctx={console,String,Object,AbortController,setTimeout,clearTimeout,
 fetch:async(url,init)=>{requests.push({url,init});return {ok:true,status:204}},
 window:{NOREYO_V1158:auth,NOREYO_V1160:{clear(){clears++}},NOREYO_V1148:{clear(){clears++}},NOREYO_V1210:{clear(){clears++}},addEventListener(type,fn){listeners[type]=fn},removeEventListener(type,fn){if(listeners[type]===fn)delete listeners[type]}}};
vm.createContext(ctx);vm.runInContext(code,ctx);const a=ctx.window.NOREYO_V1224;let fail=0;
(async()=>{
 let ok=a.endpoint()==='https://example.supabase.co/auth/v1/logout?scope=local'&&a.token()==='jwt-token';
 console.log(ok?'PASS logout endpoint/token snapshot':'FAIL endpoint');if(!ok)fail++;
 ok=await a.revoke()===true&&requests.length===1&&requests[0].init.method==='POST'&&requests[0].init.headers.Authorization==='Bearer jwt-token'&&requests[0].init.headers.apikey==='anon-key';
 console.log(ok?'PASS remote logout uses current JWT + public anon key only':'FAIL revoke '+JSON.stringify(requests));if(!ok)fail++;
 a.onClick({target:{closest(sel){return sel==='.noreyo-v1162-logout'?{}:null}}});await new Promise(r=>setTimeout(r,0));
 ok=clears===3&&requests.length===2;console.log(ok?'PASS profile logout snapshots/revokes and clears sensitive local checkout state':'FAIL click '+JSON.stringify({clears,requests:requests.length}));if(!ok)fail++;
 ctx.fetch=async()=>{throw new Error('offline')};ok=await a.revoke('another-token')===false;console.log(ok?'PASS network failure cannot make remote signout appear successful':'FAIL offline');if(!ok)fail++;
 auth.authenticated=()=>false;ok=a.token()==='';console.log(ok?'PASS unauthenticated state never emits a revoke token':'FAIL unauthenticated');if(!ok)fail++;
 process.exit(fail?1:0);
})().catch(e=>{console.error(e);process.exit(1)});