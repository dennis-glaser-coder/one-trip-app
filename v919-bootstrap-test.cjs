const fs=require('fs'),vm=require('vm');
const code=fs.readFileSync('./noreyo-bootstrap-v919.js','utf8');
let appended=[];
const doc={getElementById(){return null},createElement(){return{src:'',onload:null,onerror:null,remove(){}}},head:{appendChild(s){appended.push(s.src);queueMicrotask(()=>{if(s.src.includes('v915')){ctx.window.NOREYO_V915={state:()=>({status:'ready'})};s.onload?.();}else if(s.src.includes('v916')){ctx.window.NOREYO_V916={BUILD:'9.16'};s.onload?.();}else if(s.src.includes('v918')){ctx.window.NOREYO_V918={BUILD:'9.18'};s.onload?.();}else s.onerror?.();});}}};
const ctx={console,document:doc,window:{},location:{reload(){}},Promise,Object,String,Error,Date,queueMicrotask,setTimeout,clearTimeout};
vm.createContext(ctx);vm.runInContext(code,ctx);
setTimeout(async()=>{const api=ctx.window.NOREYO_V919;await api.run();const ok=appended[0]?.includes('v915')&&appended[1]?.includes('v916')&&appended[2]?.includes('v918')&&api.state().status==='ready';console.log(ok?'PASS V9.19 delivery order':'FAIL');process.exit(ok?0:1);},600);