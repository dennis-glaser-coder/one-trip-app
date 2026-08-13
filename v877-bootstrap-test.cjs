const fs=require('fs'),vm=require('vm');
const code=fs.readFileSync('./noreyo-bootstrap-v877.js','utf8');
let appended=[],innerLoads=0;const innerState={status:'loading',error:null};
const doc={getElementById(){return null},createElement(){return{src:'',onload:null,onerror:null,remove(){}}},head:{appendChild(s){appended.push(s.src);queueMicrotask(()=>{if(s.src.includes('v875')){innerLoads++;ctx.window.NOREYO_V875={state(){return innerState}};s.onload?.();setTimeout(()=>innerState.status='ready',70);}else if(s.src.includes('v876')){ctx.window.NOREYO_V876={BUILD:'8.76'};s.onload?.();}});}}};
const ctx={console,document:doc,window:{},Promise,Object,Error,Date,queueMicrotask,setTimeout,clearTimeout};
vm.createContext(ctx);vm.runInContext(code,ctx);
setTimeout(async()=>{const a=ctx.window.NOREYO_V877;await a.run();const ok=innerLoads===1&&appended.filter(x=>x.includes('v875')).length===1&&appended[1]?.includes('v876')&&a.state().status==='ready';console.log(ok?'PASS V8.77 waits for V8.75 before latest date reconciler':'FAIL '+JSON.stringify({appended,innerLoads,state:a.state()}));process.exit(ok?0:1);},650);