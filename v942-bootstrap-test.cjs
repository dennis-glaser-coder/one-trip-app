const fs=require('fs'),vm=require('vm');
const code=fs.readFileSync('./noreyo-bootstrap-v942.js','utf8');
let appended=[];
const doc={getElementById(){return null},createElement(){return{src:'',onload:null,onerror:null,remove(){}}},head:{appendChild(s){appended.push(s.src);queueMicrotask(()=>{if(s.src.includes('v940')){ctx.window.NOREYO_V940={state:()=>({status:'ready'})};s.onload?.()}else if(s.src.includes('v941')){ctx.window.NOREYO_V941={BUILD:'9.41'};s.onload?.()}else s.onerror?.()})}}};
const ctx={console,document:doc,window:{},Promise,Object,String,Error,Date,queueMicrotask,setTimeout,clearTimeout};
vm.createContext(ctx);vm.runInContext(code,ctx);
setTimeout(async()=>{const api=ctx.window.NOREYO_V942;await api.run();const ok=appended[0]?.includes('v940')&&appended[1]?.includes('v941')&&api.state().status==='ready';console.log(ok?'PASS V9.42 delivery order/readiness':'FAIL '+JSON.stringify({appended,state:api.state()}));process.exit(ok?0:1)},500);