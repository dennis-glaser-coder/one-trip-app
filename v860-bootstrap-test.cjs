const fs=require('fs'),vm=require('vm');
const code=fs.readFileSync('noreyo-bootstrap-v860.js','utf8');
let appended=[];
const names={824:['NOREYO_BOOTSTRAP_PRELOAD','8.24-safe'],846:['NOREYO_V846','8.46'],859:['NOREYO_V859','8.59'],853:['NOREYO_V853','8.53'],851:['NOREYO_V851','8.51'],857:['NOREYO_V857','8.57'],826:['NOREYO_V826','8.26'],828:['NOREYO_V828','8.28'],848:['NOREYO_V848','8.48'],849:['NOREYO_V849','8.49'],842:['NOREYO_V842','8.42']};
const doc={getElementById(){return null},createElement(){return{src:'',onload:null,onerror:null,remove(){}}},head:{appendChild(s){appended.push(s.src);queueMicrotask(()=>{const m=s.src.match(/v(\d+)\.js/),id=m?.[1];if(id==='824'){ctx.window.NOREYO_BOOTSTRAP_PRELOAD={BUILD:'8.24-safe'};ctx.window.NOREYO_V784={BUILD:'7.84'};}else if(names[id])ctx.window[names[id][0]]={BUILD:names[id][1]};s.onload?.();});}}};
const ctx={console,document:doc,window:{},location:{reload(){}},Promise,Object,String,Error,Date,queueMicrotask,setTimeout,clearTimeout};
vm.createContext(ctx);vm.runInContext(code,ctx);
setTimeout(async()=>{const api=ctx.window.NOREYO_V860;await api.run();const i846=appended.findIndex(x=>x.includes('v846.js')),i859=appended.findIndex(x=>x.includes('v859.js')),i853=appended.findIndex(x=>x.includes('v853.js'));const once=appended.filter(x=>x.includes('v859.js')).length===1;const ok=i846>=0&&i859>i846&&i853>i859&&once&&api.state().status==='ready';console.log(ok?'PASS V8.60 loads elided range parser between full range and single-date parser':'FAIL '+JSON.stringify({appended,state:api.state()}));process.exit(ok?0:1);},600);
