const fs=require('fs'),vm=require('vm');const code=fs.readFileSync('noreyo-v1124.js','utf8');
let resolveFetch,calls=0;
const ctx={console,JSON,String,Number,Array,Object,Date,Response,Request,
 searchState:{checkin:'2026-09-10',checkout:'2026-09-17',adults:2,childAges:[5]},
 window:{addEventListener(){},fetch:async()=>{calls++;return new Promise(r=>{resolveFetch=r})},NOREYO_V1106:{clear(){delete ctx.window.NOREYO_HOTEL_PREBOOK;return true;}}},
 document:{body:null},MutationObserver:function(){this.observe=()=>{};this.disconnect=()=>{}},requestAnimationFrame(){return 1},cancelAnimationFrame(){}};
vm.createContext(ctx);vm.runInContext(code,ctx);const a=ctx.window.NOREYO_V1124;let fail=0;
(async()=>{
 const p=ctx.window.fetch('https://x.test/functions/v1/hotel-prebook',{method:'POST',body:JSON.stringify({offerId:'O1'})});
 ctx.searchState.adults=3;
 resolveFetch(new Response('{}',{status:200}));
 const res=await p;
 let body={};try{body=await res.json()}catch(_){}
 let ok=res.status===409&&body.error?.code==='PREBOOK_CONTEXT_CHANGED'&&calls===1;
 console.log(ok?'PASS PREBOOK response is rejected when traveller context changes in flight':'FAIL network '+JSON.stringify({status:res.status,body,calls}));if(!ok)fail++;
 ctx.searchState.adults=2;
 a.remember('O2',a.context());
 ctx.window.NOREYO_HOTEL_PREBOOK={offerId:'O2',context:{checkin:'2026-09-10',checkout:'2026-09-17',adults:4,childAges:[5]}};
 ctx.window.NOREYO_HOTEL_PREBOOK_TERMS={offerId:'O2'};ctx.window.NOREYO_HOTEL_PREBOOK_ACCEPTED={prebookId:'P2'};
 ok=a.sync()===true&&!ctx.window.NOREYO_HOTEL_PREBOOK&&!ctx.window.NOREYO_HOTEL_PREBOOK_TERMS&&!ctx.window.NOREYO_HOTEL_PREBOOK_ACCEPTED;
 console.log(ok?'PASS stale committed PREBOOK snapshot and dependent state are retired':'FAIL snapshot');if(!ok)fail++;
 ok=a.same({checkin:'a',checkout:'b',adults:2,childAges:[5,7]},{checkin:'a',checkout:'b',adults:2,childAges:[5,7]})===true&&a.same({checkin:'a',checkout:'b',adults:2,childAges:[5]},{checkin:'a',checkout:'b',adults:2,childAges:[7]})===false;
 console.log(ok?'PASS PREBOOK request-context equality includes child ages':'FAIL equality');if(!ok)fail++;
 process.exit(fail?1:0);
})().catch(e=>{console.error(e);process.exit(1)});