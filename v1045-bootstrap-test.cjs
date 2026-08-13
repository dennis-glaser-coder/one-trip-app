const fs=require('fs'),vm=require('vm');
const code=fs.readFileSync('./noreyo-bootstrap-v1045.js','utf8');let appended=[];
const doc={getElementById(){return null},createElement(){return{src:'',onload:null,onerror:null,remove(){}}},head:{appendChild(s){appended.push(s.src);queueMicrotask(()=>{if(s.src.includes('v1043')){ctx.window.NOREYO_V1043={state:()=>({status:'ready'})};s.onload?.();}else if(s.src.includes('v1044')){ctx.window.NOREYO_V1044={BUILD:'10.44'};s.onload?.();}else s.onerror?.();});}}};
const ctx={console,document:doc,window:{},location:{reload(){}},Promise,Object,String,Error,Date,queueMicrotask,setTimeout,clearTimeout};
vm.createContext(ctx);vm.runInContext(code,ctx);
setTimeout(async()=>{const api=ctx.window.NOREYO_V1045;await api.run();const ok=appended[0]?.includes('v1043')&&appended[1]?.includes('v1044')&&api.state().status==='ready';console.log(ok?'PASS V10.45 delivery/readiness':'FAIL '+JSON.stringify({appended,state:api.state()}));process.exit(ok?0:1);},500);