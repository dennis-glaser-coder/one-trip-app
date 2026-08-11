const fs=require('fs'),vm=require('vm');
const code=fs.readFileSync('./noreyo-bootstrap-v873.js','utf8');
let appended=[],innerLoads=0;
const innerState={status:'loading',error:null};
const doc={getElementById(){return null},createElement(){return{src:'',onload:null,onerror:null,remove(){}}},head:{appendChild(s){appended.push(s.src);queueMicrotask(()=>{if(s.src.includes('v871')){innerLoads++;ctx.window.NOREYO_V871={state(){return innerState}};s.onload?.();setTimeout(()=>innerState.status='ready',70);}else if(s.src.includes('v872')){ctx.window.NOREYO_V872={BUILD:'8.72'};s.onload?.();}});}}};
const ctx={console,document:doc,window:{},Promise,Object,Error,Date,queueMicrotask,setTimeout,clearTimeout};
vm.createContext(ctx);vm.runInContext(code,ctx);
setTimeout(async()=>{const a=ctx.window.NOREYO_V873;await a.run();const ok=innerLoads===1&&appended.filter(x=>x.includes('v871')).length===1&&appended[1]?.includes('v872')&&a.state().status==='ready';console.log(ok?'PASS V8.73 waits for V8.71 before family payload normalizer':'FAIL '+JSON.stringify({appended,innerLoads,state:a.state()}));process.exit(ok?0:1);},650);