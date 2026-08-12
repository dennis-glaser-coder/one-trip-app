const fs=require('fs'),vm=require('vm');const code=fs.readFileSync('./noreyo-v1204.js','utf8');
let node=null;const document={head:{appendChild(x){node=x}},getElementById(id){return node?.id===id?node:null},createElement(){return{id:'',textContent:'',remove(){node=null}}}};
const ctx={console,document,window:{addEventListener(){}},Object};vm.createContext(ctx);vm.runInContext(code,ctx);const a=ctx.window.NOREYO_V1204;let fail=0;
let ok=a.CSS.includes('.noreyo-v1202-login')&&a.CSS.includes('min-height:48px')&&a.CSS.includes('font-size:16px')&&a.CSS.includes(':focus-visible');
console.log(ok?'PASS V12.02 checkout login CTA has iPhone-safe touch/font/focus UX':'FAIL CSS contract');if(!ok)fail++;
ok=a.install()===false;console.log(ok?'PASS checkout-auth style install is idempotent':'FAIL idempotency');if(!ok)fail++;
ok=a.remove()===true&&node===null;console.log(ok?'PASS checkout-auth style can be removed cleanly':'FAIL remove');if(!ok)fail++;
process.exit(fail?1:0);
