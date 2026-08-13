const fs=require('fs'),vm=require('vm');const code=fs.readFileSync('./noreyo-v1212.js','utf8');
let clears=0,authed=false;
const ctx={console,window:{addEventListener(){},removeEventListener(){},NOREYO_V1210:{clear(){clears++;return true}},NOREYO_V1176:{authenticated(){return authed}}},
 document:{body:null,addEventListener(){},removeEventListener(){}},
 MutationObserver:function(){this.observe=()=>{};this.disconnect=()=>{}},requestAnimationFrame(){return 1},cancelAnimationFrame(){}};
vm.createContext(ctx);vm.runInContext(code,ctx);const a=ctx.window.NOREYO_V1212;let fail=0;
let ok=a.sync()===false&&clears===0;
console.log(ok?'PASS failed callback remains visible while still signed out':'FAIL signed out');if(!ok)fail++;
a.onClick({target:{closest(sel){return sel.includes('.noreyo-v1162-send')?{}:null}}});
ok=clears===1;
console.log(ok?'PASS requesting a new Magic Link clears stale callback error first':'FAIL retry clear');if(!ok)fail++;
authed=true;
ok=a.sync()===true&&clears===2;
console.log(ok?'PASS successful validated authentication clears stale callback error':'FAIL auth clear');if(!ok)fail++;
ctx.window.NOREYO_V1176.authenticated=()=>false;
ctx.window.NOREYO_V1178={identity(){return{userId:'U1'}}};
ok=a.authenticated()===true;
console.log(ok?'PASS server-ownership identity also counts as authenticated':'FAIL identity');if(!ok)fail++;
process.exit(fail?1:0);