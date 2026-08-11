const fs=require('fs'),vm=require('vm');
const code=fs.readFileSync('noreyo-bootstrap-v864.js','utf8');
let appended=[];
const names={824:['NOREYO_BOOTSTRAP_PRELOAD','8.24-safe'],846:['NOREYO_V846','8.46'],859:['NOREYO_V859','8.59'],853:['NOREYO_V853','8.53'],861:['NOREYO_V861','8.61'],851:['NOREYO_V851','8.51'],863:['NOREYO_V863','8.63'],857:['NOREYO_V857','8.57'],826:['NOREYO_V826','8.26'],828:['NOREYO_V828','8.28'],848:['NOREYO_V848','8.48'],849:['NOREYO_V849','8.49'],842:['NOREYO_V842','8.42']};
const doc={getElementById(){return null},createElement(){return{src:'',onload:null,onerror:null,remove(){}}},head:{appendChild(s){appended.push(s.src);queueMicrotask(()=>{const id=s.src.match(/v(\d+)\.js/)?.[1];if(id==='824'){ctx.window.NOREYO_BOOTSTRAP_PRELOAD={BUILD:'8.24-safe'};ctx.window.NOREYO_V784={BUILD:'7.84'};}else if(names[id])ctx.window[names[id][0]]={BUILD:names[id][1]};s.onload?.();});}}};
const ctx={console,document:doc,window:{},location:{reload(){}},Promise,Object,String,Error,Date,queueMicrotask,setTimeout,clearTimeout};
vm.createContext(ctx);vm.runInContext(code,ctx);
setTimeout(async()=>{const api=ctx.window.NOREYO_V864;await api.run();const a=appended.findIndex(x=>x.includes('v851.js')),b=appended.findIndex(x=>x.includes('v863.js')),c=appended.findIndex(x=>x.includes('v857.js'));const ok=a>=0&&b>a&&c>b&&api.state().status==='ready';console.log(ok?'PASS V8.64 loads airport-context guard after natural airport parser':'FAIL '+JSON.stringify({appended,state:api.state()}));process.exit(ok?0:1);},700);
