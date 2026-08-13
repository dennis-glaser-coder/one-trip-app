const fs=require('fs'),vm=require('vm');
const code=fs.readFileSync('./noreyo-bootstrap-v1133.js','utf8');let appended=[];
const doc={getElementById(){return null},createElement(){return{src:'',onload:null,onerror:null,remove(){}}},head:{appendChild(s){appended.push(s.src);queueMicrotask(()=>{if(s.src.includes('v1131')){ctx.window.NOREYO_V1131={state:()=>({status:'ready'})};s.onload?.();}else if(s.src.includes('v1132')){ctx.window.NOREYO_V1132={BUILD:'11.32'};s.onload?.();}else s.onerror?.();});}}};
const ctx={console,document:doc,window:{},location:{reload(){}},Promise,Object,String,Error,Date,queueMicrotask,setTimeout,clearTimeout};
vm.createContext(ctx);vm.runInContext(code,ctx);
setTimeout(async()=>{const api=ctx.window.NOREYO_V1133;await api.run();const ok=appended[0]?.includes('v1131')&&appended[1]?.includes('v1132')&&api.state().status==='ready';console.log(ok?'PASS V11.33 delivery/readiness':'FAIL '+JSON.stringify({appended,state:api.state()}));process.exit(ok?0:1)},500);