const fs=require('fs'),vm=require('vm');
const code=fs.readFileSync('noreyo-bootstrap-v911.js','utf8');
let appended=[];
const doc={getElementById(){return null},createElement(){return{src:'',onload:null,onerror:null,remove(){}}},head:{appendChild(s){appended.push(s.src);queueMicrotask(()=>{if(s.src.includes('v909')){ctx.window.NOREYO_V909={state:()=>({status:'ready'})};s.onload?.();}else if(s.src.includes('v910')){ctx.window.NOREYO_V910={BUILD:'9.10'};s.onload?.();}else s.onerror?.();});}}};
const ctx={console,document:doc,window:{},location:{reload(){}},Promise,Object,String,Error,Date,queueMicrotask,setTimeout,clearTimeout};
vm.createContext(ctx);vm.runInContext(code,ctx);
setTimeout(async()=>{const api=ctx.window.NOREYO_V911;await api.run();const ok=appended[0]?.includes('noreyo-bootstrap-v909.js?build=909')&&appended[1]?.includes('noreyo-v910.js?build=910')&&api.state().status==='ready';console.log(ok?'PASS V9.11 loads V9.10 after V9.09':'FAIL '+JSON.stringify({appended,state:api.state()}));process.exit(ok?0:1);},500);
