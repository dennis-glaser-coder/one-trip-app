const fs=require('fs'),vm=require('vm');
const code=fs.readFileSync(__dirname+'/noreyo-v1086.js','utf8');
const ctx={console,String,window:{addEventListener(){},NOREYO_SELECTED_FLIGHT:{offerId:'A'},NOREYO_VERIFIED_FLIGHT:{offerId:'A'}},document:{body:null,addEventListener(){},removeEventListener(){}},MutationObserver:function(){this.observe=()=>{};this.disconnect=()=>{}},requestAnimationFrame(){return 1},cancelAnimationFrame(){}};
vm.createContext(ctx);vm.runInContext(code,ctx);const a=ctx.window.NOREYO_V1086;let fail=0;
let ok=a.sync()===false&&ctx.window.NOREYO_VERIFIED_FLIGHT?.offerId==='A';console.log(ok?'PASS matching selected/verified offer survives':'FAIL matching');if(!ok)fail++;
ctx.window.NOREYO_SELECTED_FLIGHT={offerId:'B'};ok=a.sync()===true&&!ctx.window.NOREYO_VERIFIED_FLIGHT;console.log(ok?'PASS selection change clears verification':'FAIL changed');if(!ok)fail++;
ctx.window.NOREYO_VERIFIED_FLIGHT={offerId:'B'};delete ctx.window.NOREYO_SELECTED_FLIGHT;ok=a.sync()===true&&!ctx.window.NOREYO_VERIFIED_FLIGHT;console.log(ok?'PASS clearing selection clears verification':'FAIL cleared');if(!ok)fail++;
ctx.window.NOREYO_VERIFIED_FLIGHT={offerId:'C'};a.onClick({target:{closest(sel){return sel.includes('noreyo-v943-back')?{}:null}}});ok=!ctx.window.NOREYO_VERIFIED_FLIGHT;console.log(ok?'PASS back/retry search clears verification synchronously':'FAIL back');if(!ok)fail++;
process.exit(fail?1:0);