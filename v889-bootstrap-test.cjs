const fs=require('fs'),vm=require('vm');
const code=fs.readFileSync('./noreyo-bootstrap-v889.js','utf8');
let appended=[];
const doc={getElementById(){return null},createElement(){return{src:'',onload:null,onerror:null,remove(){}}},head:{appendChild(s){appended.push(s.src);queueMicrotask(()=>{if(s.src.includes('noreyo-v888.js')){ctx.window.NOREYO_V888={BUILD:'8.88'};ctx.window.NOREYO_V826={BUILD:'8.26'};ctx.window.NOREYO_V828={BUILD:'8.28'};s.onload?.();}else if(s.src.includes('noreyo-bootstrap-v887.js')){ctx.window.NOREYO_V887={state:()=>({status:'ready'})};s.onload?.();}else s.onerror?.();});}}};
const ctx={console,document:doc,window:{},location:{reload(){}},Promise,Object,String,Error,Date,queueMicrotask,setTimeout,clearTimeout};
vm.createContext(ctx);vm.runInContext(code,ctx);
setTimeout(async()=>{const api=ctx.window.NOREYO_V889;await api.run();const pre=appended[0]?.includes('noreyo-v888.js?build=888');const inner=appended[1]?.includes('noreyo-bootstrap-v887.js?build=887');const ok=pre&&inner&&api.state().status==='ready';console.log(ok?'PASS V8.88 compatibility preload runs before V8.87':'FAIL '+JSON.stringify({appended,state:api.state()}));process.exit(ok?0:1);},500);