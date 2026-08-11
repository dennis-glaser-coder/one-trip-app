const fs=require('fs'),vm=require('vm');
const code=fs.readFileSync('./noreyo-bootstrap-v871.js','utf8');
let appended=[],innerLoads=0;
const innerState={status:'loading',error:null};
const doc={getElementById(){return null},createElement(){return{src:'',onload:null,onerror:null,remove(){}}},head:{appendChild(s){appended.push(s.src);queueMicrotask(()=>{if(s.src.includes('v869')){innerLoads++;ctx.window.NOREYO_V869={state(){return innerState}};s.onload?.();setTimeout(()=>innerState.status='ready',70);}else if(s.src.includes('v870')){ctx.window.NOREYO_V870={BUILD:'8.70'};s.onload?.();}});}}};
const ctx={console,document:doc,window:{},Promise,Object,Error,Date,queueMicrotask,setTimeout,clearTimeout};
vm.createContext(ctx);vm.runInContext(code,ctx);
setTimeout(async()=>{const a=ctx.window.NOREYO_V871;await a.run();const ok=innerLoads===1&&appended.filter(x=>x.includes('v869')).length===1&&appended[1]?.includes('v870')&&a.state().status==='ready';console.log(ok?'PASS V8.71 waits for V8.69 before final departure reconciler':'FAIL '+JSON.stringify({appended,innerLoads,state:a.state()}));process.exit(ok?0:1);},650);