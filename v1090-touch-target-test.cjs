const fs=require('fs'),vm=require('vm');const code=fs.readFileSync(__dirname+'/noreyo-v1090.js','utf8');
let node=null;const document={head:{appendChild(x){node=x}},getElementById(id){return node?.id===id?node:null},createElement(){return{id:'',textContent:'',remove(){node=null}}}};
const ctx={console,document,window:{addEventListener(){}},Object};vm.createContext(ctx);vm.runInContext(code,ctx);const a=ctx.window.NOREYO_V1090;let fail=0;
let ok=a.CSS.includes('.counter button,.pill,.premium-chip')&&a.CSS.includes('min-height:44px')&&a.CSS.includes('.dest-open')&&a.CSS.includes('width:44px');console.log(ok?'PASS remaining compact controls get 44px touch floor':'FAIL css');if(!ok)fail++;
ok=a.install()===false;console.log(ok?'PASS touch-target completion is idempotent':'FAIL idempotent');if(!ok)fail++;
process.exit(fail?1:0);