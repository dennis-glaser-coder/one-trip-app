const fs=require('fs'),vm=require('vm');const code=fs.readFileSync(__dirname+'/noreyo-v1092.js','utf8');
let node=null;const document={head:{appendChild(x){node=x}},getElementById(id){return node?.id===id?node:null},createElement(){return{id:'',textContent:'',remove(){node=null}}}};
const ctx={console,document,window:{addEventListener(){}},Object};vm.createContext(ctx);vm.runInContext(code,ctx);const a=ctx.window.NOREYO_V1092;let fail=0;
let ok=a.CSS.includes('.hotel-query-row input,.dest-row input')&&a.CSS.includes('font-size:16px!important');console.log(ok?'PASS phone search inputs use Safari-safe 16px font':'FAIL css');if(!ok)fail++;
ok=a.install()===false;console.log(ok?'PASS input zoom fix is idempotent':'FAIL idempotent');if(!ok)fail++;
process.exit(fail?1:0);