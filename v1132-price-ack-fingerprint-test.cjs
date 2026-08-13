const fs=require('fs'),vm=require('vm');
const code=fs.readFileSync('./noreyo-v1132.js','utf8');
const ctx={
 console,Number,String,Object,Date,
 window:{
   addEventListener(){},
   NOREYO_HOTEL_PREBOOK:{prebookId:'pb1',price:120,currency:'EUR'},
   NOREYO_V1112:{model(){return{changed:true,after:120,currency:'EUR'}}},
   NOREYO_V1106:{sameOffer(){return true}},
   NOREYO_V1114:{BUILD:'11.14',render(){},isAccepted(){return false},checkoutReady(){return false}}
 },
 document:{body:null,addEventListener(){},removeEventListener(){}},
 MutationObserver:function(){this.observe=()=>{};this.disconnect=()=>{}},
 requestAnimationFrame(){return 1},cancelAnimationFrame(){},setTimeout(fn){fn();}
};
vm.createContext(ctx);vm.runInContext(code,ctx);const a=ctx.window.NOREYO_V1132;let fail=0;
let f=a.fingerprint();
let ok=f.prebookId==='pb1'&&f.priceCents===12000&&f.currency==='EUR';
console.log(ok?'PASS exact PREBOOK price fingerprint':'FAIL fingerprint '+JSON.stringify(f));if(!ok)fail++;
ctx.window.NOREYO_HOTEL_PREBOOK_ACCEPTED={prebookId:'pb1',priceCents:12000,currency:'EUR'};
ok=a.isAccepted()===true&&ctx.window.NOREYO_V1114.checkoutReady()===true;
console.log(ok?'PASS matching price acknowledgement is checkout-ready':'FAIL matching');if(!ok)fail++;
ctx.window.NOREYO_HOTEL_PREBOOK={prebookId:'pb1',price:130,currency:'EUR'};
ctx.window.NOREYO_V1112.model=()=>({changed:true,after:130,currency:'EUR'});
ok=a.isAccepted()===false&&ctx.window.NOREYO_V1114.checkoutReady()===false;
console.log(ok?'PASS same prebookId with new price invalidates old acknowledgement':'FAIL changed-price');if(!ok)fail++;
a.sync();
ok=!ctx.window.NOREYO_HOTEL_PREBOOK_ACCEPTED;
console.log(ok?'PASS stale price acknowledgement is cleared':'FAIL clear');if(!ok)fail++;
ctx.window.NOREYO_HOTEL_PREBOOK={prebookId:'pb2',price:130,currency:'USD'};
ctx.window.NOREYO_V1112.model=()=>({changed:true,after:130,currency:'USD'});
f=a.fingerprint();
ok=f.prebookId==='pb2'&&f.priceCents===13000&&f.currency==='USD';
console.log(ok?'PASS fingerprint includes currency and session':'FAIL currency');if(!ok)fail++;
process.exit(fail?1:0);