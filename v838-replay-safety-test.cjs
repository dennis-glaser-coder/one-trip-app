const fs=require('fs'),vm=require('vm');
const code=fs.readFileSync('./noreyo-bootstrap-v838.js','utf8');
let appends=[], removes=0;
const doc={getElementById(){return null},createElement(){return{src:'',onload:null,onerror:null,remove(){removes++}}},head:{appendChild(s){appends.push(s.src);queueMicrotask(()=>s.onload?.());}}};
const ctx={console,document:doc,window:{},location:{reload(){}},Promise,Object,String,Date,Error,queueMicrotask,setTimeout,clearTimeout};
vm.createContext(ctx);vm.runInContext(code,ctx);
setTimeout(async()=>{
 const api=ctx.window.NOREYO_V838;
 const component={name:'guard',src:'./guard.js?build=1',ready:()=>false};
 let err=null;try{await api.loadComponent(component,{component:null,attempt:0});}catch(e){err=e;}
 const noReplay=appends.filter(x=>x.includes('guard.js')).length===1;
 const replayUnsafe=err?.replaySafe===false;
 console.log(noReplay&&replayUnsafe?'PASS loaded-but-unready guard is not replayed':'FAIL '+JSON.stringify({appends,replaySafe:err?.replaySafe}));
 if(!(noReplay&&replayUnsafe))process.exit(1);
 appends=[];let n=0;
 doc.head.appendChild=s=>{appends.push(s.src);n++;queueMicrotask(()=>{if(n===1)s.onerror?.();else{component.ready=()=>true;s.onload?.();}});};
 component.ready=()=>false;
 try{await api.loadComponent(component,{component:null,attempt:0});}catch(e){console.error(e);process.exit(1);}
 const retried=appends.length===2&&appends[1].includes('noreyo_v838_retry=2');
 console.log(retried?'PASS pure script/network failure still retries once':'FAIL '+JSON.stringify(appends));
 process.exit(retried?0:1);
},50);