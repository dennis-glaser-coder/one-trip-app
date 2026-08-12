const fs=require('fs'),vm=require('vm');
const code=fs.readFileSync('noreyo-v962.js','utf8');

const ctx={console,Promise,Object,String,Number,Array,window:{}};
vm.createContext(ctx);
vm.runInContext(`
  const searchState={checkin:'2026-09-10',checkout:'2026-09-17',adults:2,childAges:[5]};
  let mealPlanFilter='BB';
  let persisted=0,updated=0;
  function updateSearchUI(){updated++}
  function persistState(){persisted++}
  function openDetailPlanner(){
    searchState.checkin='2026-10-01';searchState.checkout='2026-10-08';
    searchState.adults=3;searchState.childAges=[7,9];persistState();
  }
  function closePlanner(){}
  async function applyDetailEdit(){
    closePlanner();
    searchState.checkin='2026-11-01';
    searchState.checkout='2026-11-10';
    persistState();
  }
  window.openDetailPlanner=openDetailPlanner;
  window.closePlanner=closePlanner;
  window.applyDetailEdit=applyDetailEdit;
`,ctx);
vm.runInContext(code,ctx);

(async()=>{
 let fail=0,a=ctx.window.NOREYO_V962;
 ctx.window.openDetailPlanner('travellers','x');
 let st=vm.runInContext(`({checkin:searchState.checkin,adults:searchState.adults,childAges:[...searchState.childAges]})`,ctx);
 let ok=st.checkin==='2026-10-01'&&st.adults===3&&a.active();
 console.log(ok?'PASS detail planner starts transactional edit':'FAIL start '+JSON.stringify(st));if(!ok)fail++;

 ctx.window.closePlanner();
 st=vm.runInContext(`({checkin:searchState.checkin,checkout:searchState.checkout,adults:searchState.adults,childAges:[...searchState.childAges],mealPlanFilter})`,ctx);
 ok=st.checkin==='2026-09-10'&&st.checkout==='2026-09-17'&&st.adults===2&&JSON.stringify(st.childAges)==='[5]'&&st.mealPlanFilter==='BB'&&!a.active();
 console.log(ok?'PASS cancel restores original global search':'FAIL cancel '+JSON.stringify(st));if(!ok)fail++;

 ctx.window.openDetailPlanner('dates','x');
 await ctx.window.applyDetailEdit('Zeitraum');
 st=vm.runInContext(`({checkin:searchState.checkin,checkout:searchState.checkout})`,ctx);
 ok=st.checkin==='2026-11-01'&&st.checkout==='2026-11-10'&&!a.active();
 console.log(ok?'PASS apply commits changed detail search':'FAIL commit '+JSON.stringify(st));if(!ok)fail++;

 ctx.window.closePlanner();
 st=vm.runInContext(`searchState.checkin`,ctx);
 ok=st==='2026-11-01';
 console.log(ok?'PASS close after commit does not restore stale snapshot':'FAIL stale '+st);if(!ok)fail++;

 process.exit(fail?1:0);
})().catch(e=>{console.error(e);process.exit(1)});