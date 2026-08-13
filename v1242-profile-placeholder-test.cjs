const fs=require('fs'),vm=require('vm');const code=fs.readFileSync('./noreyo-v1242.js','utf8');
let node=null;const document={head:{appendChild(x){node=x}},getElementById(id){return node?.id===id?node:null},createElement(){return{id:'',textContent:'',remove(){node=null}}}};
const ctx={console,document,window:{addEventListener(){}},Object};vm.createContext(ctx);vm.runInContext(code,ctx);const a=ctx.window.NOREYO_V1242;let fail=0;
let ok=a.CSS.includes('.noreyo-v1162-email::placeholder')&&a.CSS.includes('rgba(11,39,55,.52)')&&a.CSS.includes('opacity:1');
console.log(ok?'PASS profile Magic-Link placeholder uses readable dark contrast':'FAIL CSS');if(!ok)fail++;
ok=a.install()===false;console.log(ok?'PASS placeholder fix is idempotent':'FAIL idempotent');if(!ok)fail++;
ok=a.remove()===true&&node===null;console.log(ok?'PASS placeholder style can be removed cleanly':'FAIL remove');if(!ok)fail++;
process.exit(fail?1:0);