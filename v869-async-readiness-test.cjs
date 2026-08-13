const fs=require('fs'),vm=require('vm');
const code=fs.readFileSync('./noreyo-bootstrap-v869.js','utf8');
let appended=[],innerLoads=0;
const innerState={status:'loading',error:null};
const doc={getElementById(){return null},createElement(){return{src:'',onload:null,onerror:null,remove(){}}},head:{appendChild(s){appended.push(s.src);queueMicrotask(()=>{if(s.src.includes('v864')){innerLoads++;ctx.window.NOREYO_V864={state(){return innerState}};s.onload?.();setTimeout(()=>{innerState.status='ready'},80);}else if(s.src.includes('v865')){ctx.window.NOREYO_V865={BUILD:'8.65'};s.onload?.();}else if(s.src.includes('v867')){ctx.window.NOREYO_V867={BUILD:'8.67'};s.onload?.();}});}}};
const ctx={console,document:doc,window:{},Promise,Object,Error,Date,queueMicrotask,setTimeout,clearTimeout};
vm.createContext(ctx);vm.runInContext(code,ctx);
setTimeout(async()=>{const a=ctx.window.NOREYO_V869;await a.run();const ok=innerLoads===1&&appended.filter(x=>x.includes('v864')).length===1&&appended[1]?.includes('v865')&&appended[2]?.includes('v867')&&a.state().status==='ready';console.log(ok?'PASS async inner readiness waits without replay':'FAIL '+JSON.stringify({appended,innerLoads,state:a.state()}));process.exit(ok?0:1);},700);