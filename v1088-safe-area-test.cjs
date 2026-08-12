const fs=require('fs'),vm=require('vm');const code=fs.readFileSync(__dirname+'/noreyo-v1088.js','utf8');
let node=null;const head={appendChild(x){node=x}};const document={head,getElementById(id){return node?.id===id?node:null},createElement(){return{id:'',textContent:'',remove(){node=null}}}};
const ctx={console,document,window:{addEventListener(){}},Object};vm.createContext(ctx);vm.runInContext(code,ctx);const a=ctx.window.NOREYO_V1088;let fail=0;
let ok=node?.id==='noreyo-v1088-safe-area'&&node.textContent.includes('.sticky')&&node.textContent.includes('env(safe-area-inset-bottom)')&&node.textContent.includes('.detail-body')&&node.textContent.includes('.toast');console.log(ok?'PASS iPhone bottom safe-area CSS installed':'FAIL css');if(!ok)fail++;
ok=a.install()===false;console.log(ok?'PASS safe-area style install is idempotent':'FAIL idempotency');if(!ok)fail++;
ok=a.CSS.includes('min-height:calc(92px + env(safe-area-inset-bottom))')&&a.CSS.includes('padding-bottom:calc(118px + env(safe-area-inset-bottom))');console.log(ok?'PASS sticky and detail reserve matching home-indicator space':'FAIL contract');if(!ok)fail++;
process.exit(fail?1:0);