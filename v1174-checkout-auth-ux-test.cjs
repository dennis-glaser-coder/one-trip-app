const fs=require('fs'),vm=require('vm');const code=fs.readFileSync(require('path').join(__dirname,'noreyo-v1174.js'),'utf8');
let node=null;const document={head:{appendChild(x){node=x}},getElementById(id){return node?.id===id?node:null},createElement(){return{id:'',textContent:'',remove(){node=null}}}};
const ctx={console,document,window:{addEventListener(){}},Object};vm.createContext(ctx);vm.runInContext(code,ctx);const a=ctx.window.NOREYO_V1174;let fail=0;
let ok=a.CSS.includes('.noreyo-v1158-auth')&&a.CSS.includes('font:600 16px')&&a.CSS.includes('min-height:48px')&&a.CSS.includes('grid-template-columns:1fr')&&a.CSS.includes(':focus-visible');
console.log(ok?'PASS checkout auth surface has Safari-safe premium phone UX':'FAIL css');if(!ok)fail++;
ok=a.install()===false;console.log(ok?'PASS checkout auth style install is idempotent':'FAIL idempotent');if(!ok)fail++;
a.remove();ok=node===null;console.log(ok?'PASS checkout auth style can be cleanly removed':'FAIL remove');if(!ok)fail++;
process.exit(fail?1:0);