const fs=require('fs'),vm=require('vm');
const code=fs.readFileSync('./noreyo-bootstrap-v875.js','utf8');
let appended=[],innerLoads=0;
const innerState={status:'loading',error:null};
const doc={getElementById(){return null},createElement(){return{src:'',onload:null,onerror:null,remove(){}}},head:{appendChild(s){appended.push(s.src);queueMicrotask(()=>{if(s.src.includes('v873')){innerLoads++;ctx.window.NOREYO_V873={state(){return innerState}};s.onload?.();setTimeout(()=>innerState.status='ready',70);}else if(s.src.includes('v874')){ctx.window.NOREYO_V874={BUILD:'8.74'};s.onload?.();}});}}};
const ctx={console,document:doc,window:{},Promise,Object,Error,Date,queueMicrotask,setTimeout,clearTimeout};
vm.createContext(ctx);vm.runInContext(code,ctx);
setTimeout(async()=>{const a=ctx.window.NOREYO_V875;await a.run();const ok=innerLoads===1&&appended.filter(x=>x.includes('v873')).length===1&&appended[1]?.includes('v874')&&a.state().status==='ready';console.log(ok?'PASS V8.75 waits for V8.73 before final fetch stabilizer':'FAIL '+JSON.stringify({appended,innerLoads,state:a.state()}));process.exit(ok?0:1);},650);