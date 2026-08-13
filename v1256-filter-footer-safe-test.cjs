const fs=require('fs'),vm=require('vm');const code=fs.readFileSync('./noreyo-v1256.js','utf8');
let node=null;const document={head:{appendChild(x){node=x}},getElementById(id){return node?.id===id?node:null},createElement(){return{id:'',textContent:'',remove(){node=null}}}};
const ctx={console,document,window:{addEventListener(){}},Object};vm.createContext(ctx);vm.runInContext(code,ctx);const a=ctx.window.NOREYO_V1256;let fail=0;
let ok=a.CSS.includes('env(safe-area-inset-bottom)')&&a.CSS.includes('.sheet-foot .reset')&&a.CSS.includes('min-height:44px')&&a.CSS.includes('.sheet-scroll')&&a.CSS.includes('118px + env');
console.log(ok?'PASS filter footer reserves home-indicator space and reset touch floor':'FAIL CSS');if(!ok)fail++;
ok=a.install()===false;console.log(ok?'PASS filter-footer safe-area style is idempotent':'FAIL idempotency');if(!ok)fail++;
ok=a.remove()===true&&node===null;console.log(ok?'PASS filter-footer style removes cleanly':'FAIL remove');if(!ok)fail++;
process.exit(fail?1:0);