const fs=require('fs'),vm=require('vm');
const code=fs.readFileSync('noreyo-bootstrap-v883.js','utf8');
let appended=[];
const doc={getElementById(){return null},createElement(){return{src:'',onload:null,onerror:null,remove(){}}},head:{appendChild(s){appended.push(s.src);queueMicrotask(()=>{
 if(s.src.includes('v881')){ctx.window.NOREYO_V881={state(){return{status:'ready'}}};s.onload?.();}
 else if(s.src.includes('v882')){ctx.window.NOREYO_V882={BUILD:'8.82'};s.onload?.();}
 else s.onerror?.();
});}}};
const ctx={console,document:doc,window:{},location:{reload(){}},Promise,Object,String,Error,Date,queueMicrotask,setTimeout,clearTimeout};
vm.createContext(ctx);vm.runInContext(code,ctx);
setTimeout(async()=>{const a=ctx.window.NOREYO_V883;await a.run();const ok=appended[0]?.includes('v881.js?build=881')&&appended[1]?.includes('v882.js?build=882')&&a.state().status==='ready';console.log(ok?'PASS V8.83 loads brand consistency only after V8.81 is fully ready':'FAIL '+JSON.stringify({appended,state:a.state()}));process.exit(ok?0:1);},300);