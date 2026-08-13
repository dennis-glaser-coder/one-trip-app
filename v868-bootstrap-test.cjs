const fs=require('fs'),vm=require('vm');
const code=fs.readFileSync('./noreyo-bootstrap-v868.js','utf8');
let appended=[];
const doc={getElementById(){return null},createElement(){return{src:'',onload:null,onerror:null,remove(){}}},head:{appendChild(s){appended.push(s.src);queueMicrotask(()=>{if(s.src.includes('v866')){ctx.window.NOREYO_V866={BUILD:'8.66-safe'};ctx.window.NOREYO_V865={BUILD:'8.65'};}else if(s.src.includes('v867'))ctx.window.NOREYO_V867={BUILD:'8.67'};s.onload?.();});}}};
const ctx={console,document:doc,window:{},Promise,Object,Error,queueMicrotask,setTimeout,clearTimeout};
vm.createContext(ctx);vm.runInContext(code,ctx);
setTimeout(async()=>{const a=ctx.window.NOREYO_V868;await a.run();const ok=appended.length===2&&appended[0].includes('v866')&&appended[1].includes('v867')&&a.state().status==='ready';console.log(ok?'PASS V8.68 loads V8.66 then ground-transport guard once':'FAIL '+JSON.stringify(appended));process.exit(ok?0:1);},500);