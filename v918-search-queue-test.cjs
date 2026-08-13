const fs=require('fs'),vm=require('vm');
const code=fs.readFileSync('./noreyo-v918.js','utf8');
let calls=0,resolveFirst;
const ctx={console,JSON,Object,String,Date,Promise,queueMicrotask,setTimeout,clearTimeout,productMode:'hotel',dest:'Mallorca',hotelQuery:'',mealPlanFilter:'ANY',states:{A:'any'},searchState:{airports:['DUS'],checkin:'2026-09-01',checkout:'2026-09-08',adults:2,childAges:[]},window:{addEventListener(){},searchTrips(){calls++;return new Promise(r=>{resolveFirst=r})}}};
vm.createContext(ctx);vm.runInContext(code,ctx);
const p1=ctx.window.searchTrips();const p2=ctx.window.searchTrips();
if(calls!==1||p1!==p2){console.error('FAIL same-search single-flight');process.exit(1)}
console.log('PASS same-search single-flight');resolveFirst();setTimeout(()=>process.exit(0),0);