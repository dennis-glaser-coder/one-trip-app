const fs=require('fs'),vm=require('vm');
const code=fs.readFileSync('noreyo-bootstrap-v963.js','utf8');
let appended=[];
const doc={getElementById(){return null},createElement(){return{src:'',onload:null,onerror:null,remove(){}}},head:{appendChild(s){appended.push(s.src);queueMicrotask(()=>{if(s.src.includes('v961')){ctx.window.NOREYO_V961={state:()=>({status:'ready'})};s.onload?.();}else if(s.src.includes('v962')){ctx.window.NOREYO_V962={BUILD:'9.62'};s.onload?.();}else s.onerror?.();});}}};
const ctx={console,document:doc,window:{},location:{reload(){}},Promise,Object,String,Error,Date,queueMicrotask,setTimeout,clearTimeout};
vm.createContext(ctx);vm.runInContext(code,ctx);
setTimeout(async()=>{const api=ctx.window.NOREYO_V963;await api.run();const ok=appended[0]?.includes('v961')&&appended[1]?.includes('v962')&&api.state().status==='ready';console.log(ok?'PASS V9.63 delivery order/readiness':'FAIL '+JSON.stringify({appended,state:api.state()}));process.exit(ok?0:1);},500);