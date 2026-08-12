const fs=require('fs'),vm=require('vm');
const code=fs.readFileSync('./noreyo-v920.js','utf8');
let calls=0,planner='',toast='';
const future=n=>{const d=new Date();d.setDate(d.getDate()+n);return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')};
const ctx={console,Date,String,Number,Object,Promise,searchState:{checkin:'bad',checkout:'bad'},openPlanner(x){planner=x},showToast(x){toast=x},window:{addEventListener(){},searchFlights(){calls++;return Promise.resolve('ok')}}};
vm.createContext(ctx);vm.runInContext(code,ctx);const a=ctx.window.NOREYO_V920;let fail=0;
let ok=!!a.problem({checkin:'bad',checkout:'bad'});console.log(ok?'PASS invalid flight dates rejected':'FAIL invalid');if(!ok)fail++;
ok=!!a.problem({checkin:future(2),checkout:future(1)});console.log(ok?'PASS reverse flight dates rejected':'FAIL reverse');if(!ok)fail++;
ctx.window.searchFlights().then(()=>{ok=calls===0&&planner==='dates'&&toast;console.log(ok?'PASS invalid flight search reopens date planner':'FAIL block');if(!ok)fail++;ctx.searchState.checkin=future(2);ctx.searchState.checkout=future(9);planner='';toast='';ctx.window.searchFlights().then(()=>{ok=calls===1&&planner==='';console.log(ok?'PASS valid future flight dates reach original search':'FAIL pass');if(!ok)fail++;process.exit(fail?1:0);});});