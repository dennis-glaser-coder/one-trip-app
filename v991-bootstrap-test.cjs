const fs=require('fs'),vm=require('vm');
const code=fs.readFileSync('noreyo-bootstrap-v991.js','utf8');
let appended=[];
const doc={getElementById(){return null},createElement(){return{src:'',onload:null,onerror:null,remove(){}}},head:{appendChild(s){appended.push(s.src);queueMicrotask(()=>{if(s.src.includes('v989')){ctx.window.NOREYO_V989={state:()=>({status:'ready'})};s.onload?.();}else if(s.src.includes('v990')){ctx.window.NOREYO_V990={BUILD:'9.90'};s.onload?.();}else s.onerror?.();});}}};
const ctx={console,document:doc,window:{},location:{reload(){}},Promise,Object,String,Error,Date,queueMicrotask,setTimeout,clearTimeout};
vm.createContext(ctx);vm.runInContext(code,ctx);
setTimeout(async()=>{const api=ctx.window.NOREYO_V991;await api.run();const ok=appended[0]?.includes('noreyo-bootstrap-v989.js?build=989')&&appended[1]?.includes('noreyo-v990.js?build=990')&&api.state().status==='ready';console.log(ok?'PASS V9.91 delivery order/readiness':'FAIL '+JSON.stringify({appended,state:api.state()}));process.exit(ok?0:1);},500);