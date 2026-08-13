const fs=require('fs'),vm=require('vm');
const code=fs.readFileSync(require('path').join(__dirname,'noreyo-bootstrap-v895.js'),'utf8');
let appended=[];
const doc={getElementById(){return null},createElement(){return{src:'',onload:null,onerror:null,remove(){}}},head:{appendChild(s){appended.push(s.src);queueMicrotask(()=>{if(s.src.includes('v893')){ctx.window.NOREYO_V893={state:()=>({status:'ready'})};s.onload?.();}else if(s.src.includes('v894')){ctx.window.NOREYO_V894={BUILD:'8.94'};s.onload?.();}else s.onerror?.();});}}};
const ctx={console,document:doc,window:{},location:{reload(){}},Promise,Object,String,Error,Date,queueMicrotask,setTimeout,clearTimeout};
vm.createContext(ctx);vm.runInContext(code,ctx);
setTimeout(async()=>{const api=ctx.window.NOREYO_V895;await api.run();const ok=appended[0]?.includes('v893')&&appended[1]?.includes('v894')&&api.state().status==='ready';console.log(ok?'PASS V8.95 delivery order':'FAIL '+JSON.stringify({appended,state:api.state()}));process.exit(ok?0:1);},500);
