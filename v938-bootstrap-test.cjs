const fs=require('fs'),vm=require('vm');
const code=fs.readFileSync('./noreyo-bootstrap-v938.js','utf8');
let appended=[];
const doc={getElementById(){return null},createElement(){return{src:'',onload:null,onerror:null,remove(){}}},head:{appendChild(s){appended.push(s.src);queueMicrotask(()=>{if(s.src.includes('v935')){ctx.window.NOREYO_V935={state:()=>({status:'ready'})};s.onload?.()}else if(s.src.includes('v936')){ctx.window.NOREYO_V936={BUILD:'9.36'};s.onload?.()}else if(s.src.includes('v937')){ctx.window.NOREYO_V937={BUILD:'9.37'};s.onload?.()}else s.onerror?.()})}}};
const ctx={console,document:doc,window:{},Promise,Object,String,Error,Date,queueMicrotask,setTimeout,clearTimeout};
vm.createContext(ctx);vm.runInContext(code,ctx);
setTimeout(async()=>{const api=ctx.window.NOREYO_V938;await api.run();const ok=appended[0]?.includes('v935')&&appended[1]?.includes('v936')&&appended[2]?.includes('v937')&&api.state().status==='ready';console.log(ok?'PASS V9.38 delivery order/readiness':'FAIL '+JSON.stringify({appended,state:api.state()}));process.exit(ok?0:1)},600);