const fs=require('fs'),vm=require('vm');
const code=fs.readFileSync('noreyo-v964.js','utf8');
const el={attrs:{},getAttribute(k){return this.attrs[k]??null},setAttribute(k,v){this.attrs[k]=String(v)}};
const ctx={
 console,window:{addEventListener(){}},
 document:{body:{},getElementById(id){return id==='toast'?el:null}},
 MutationObserver:function(){this.observe=()=>{};this.disconnect=()=>{}},
 requestAnimationFrame(){return 1},cancelAnimationFrame(){}
};
vm.createContext(ctx);vm.runInContext(code,ctx);
const a=ctx.window.NOREYO_V964;let fail=0;
let changed=a.enhance();
let ok=changed&&el.attrs.role==='status'&&el.attrs['aria-live']==='polite'&&el.attrs['aria-atomic']==='true';
console.log(ok?'PASS toast gets polite atomic status semantics':'FAIL '+JSON.stringify(el.attrs));if(!ok)fail++;
changed=a.enhance();
ok=changed===false;
console.log(ok?'PASS toast enhancement is idempotent':'FAIL idempotency');if(!ok)fail++;
process.exit(fail?1:0);