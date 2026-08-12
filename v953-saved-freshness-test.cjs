const fs=require('fs'),vm=require('vm');const code=fs.readFileSync('noreyo-v953.js','utf8');
const ctx={console,String,Object,Array,window:{addEventListener(){}},document:{body:null,getElementById(){return null},querySelectorAll(){return[]}},MutationObserver:function(){this.observe=()=>{};this.disconnect=()=>{}},requestAnimationFrame(){return 1},cancelAnimationFrame(){},detailBackView:'favorites'};
vm.createContext(ctx);vm.runInContext(code,ctx);const a=ctx.window.NOREYO_V953;let fail=0;
let ok=a.savedContext()===true;console.log(ok?'PASS favorite detail is saved context':'FAIL context');if(!ok)fail++;
ctx.detailBackView='results';ok=a.savedContext()===false;console.log(ok?'PASS live result detail is not saved context':'FAIL live context');if(!ok)fail++;
ok=a.addOnce('1.200 € · 600 € p. P.','gespeicherter Preis')==='1.200 € · 600 € p. P. · gespeicherter Preis';console.log(ok?'PASS saved-price note appended':'FAIL append');if(!ok)fail++;
ok=a.addOnce('x · gespeicherter Preis','gespeicherter Preis')==='x · gespeicherter Preis';console.log(ok?'PASS saved-price note idempotent':'FAIL idempotent');if(!ok)fail++;
ok=a.baseBoard('Frühstück inklusive · aktuelle Live-Rate')==='Frühstück inklusive';console.log(ok?'PASS stale live-rate suffix removed from board copy':'FAIL board');if(!ok)fail++;
if(fail)process.exit(1);
