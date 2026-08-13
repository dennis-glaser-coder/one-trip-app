const fs=require('fs'),vm=require('vm');
const code=fs.readFileSync('./noreyo-bootstrap-v866.js','utf8');
let appended=[];
const doc={getElementById(){return null},createElement(){return{src:'',onload:null,onerror:null,remove(){}}},head:{appendChild(s){appended.push(s.src);queueMicrotask(()=>{if(s.src.includes('v864')){ctx.window.NOREYO_V864={BUILD:'8.64-safe'};ctx.window.NOREYO_V863={BUILD:'8.63'};}else if(s.src.includes('v865'))ctx.window.NOREYO_V865={BUILD:'8.65'};s.onload?.();});}}};
const ctx={console,document:doc,window:{},Promise,Object,Error,queueMicrotask,setTimeout,clearTimeout};
vm.createContext(ctx);vm.runInContext(code,ctx);
setTimeout(async()=>{const a=ctx.window.NOREYO_V866;await a.run();const ok=appended.length===2&&appended[0].includes('v864')&&appended[1].includes('v865')&&a.state().status==='ready';console.log(ok?'PASS V8.66 loads V8.64 then duplicate-safe favorites once':'FAIL '+JSON.stringify(appended));process.exit(ok?0:1);},500);