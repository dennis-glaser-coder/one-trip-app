const fs=require('fs'),vm=require('vm');
const code=fs.readFileSync('./noreyo-bootstrap-v893.js','utf8');
let appended=[];
const doc={getElementById(){return null},createElement(){return{src:'',onload:null,onerror:null,remove(){}}},head:{appendChild(s){appended.push(s.src);queueMicrotask(()=>{if(s.src.includes('v889')){ctx.window.NOREYO_V889={state:()=>({status:'ready'})};s.onload?.();}else if(s.src.includes('v890')){ctx.window.NOREYO_V890={BUILD:'8.90'};s.onload?.();}else if(s.src.includes('v892')){ctx.window.NOREYO_V892={BUILD:'8.92'};s.onload?.();}else s.onerror?.();});}}};
const ctx={console,document:doc,window:{},location:{reload(){}},Promise,Object,String,Error,Date,queueMicrotask,setTimeout,clearTimeout};
vm.createContext(ctx);vm.runInContext(code,ctx);
setTimeout(async()=>{const api=ctx.window.NOREYO_V893;await api.run();const ok=appended[0]?.includes('v889')&&appended[1]?.includes('v890')&&appended[2]?.includes('v892')&&api.state().status==='ready';console.log(ok?'PASS V8.93 cancellation layer delivered after profile layer':'FAIL '+JSON.stringify({appended,state:api.state()}));process.exit(ok?0:1);},600);