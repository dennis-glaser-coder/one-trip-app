const fs=require('fs'),vm=require('vm');const code=fs.readFileSync('./noreyo-v1230.js','utf8');let cleaned=0;
const ctx={console,window:{addEventListener(){},NOREYO_V1164:{signOut(){}},NOREYO_V1166:{logout(){}},NOREYO_V1224:{cleanup(){cleaned++;return true}}},Object};
vm.createContext(ctx);vm.runInContext(code,ctx);const a=ctx.window.NOREYO_V1230;let fail=0;
let ok=a.retired===true&&cleaned===1&&a.secureOwner()===true;console.log(ok?'PASS redundant V12.24 listener retired when V11.64/V11.66 secure owner exists':'FAIL retire '+JSON.stringify({cleaned,retired:a.retired}));if(!ok)fail++;
ok=a.retire()===false&&cleaned===1;console.log(ok?'PASS logout retirement is idempotent':'FAIL idempotent');if(!ok)fail++;
const ctx2={console,window:{addEventListener(){},NOREYO_V1224:{cleanup(){throw new Error('must not run')}}},Object};vm.createContext(ctx2);vm.runInContext(code,ctx2);ok=ctx2.window.NOREYO_V1230.retired===false;console.log(ok?'PASS V12.24 is not retired without authoritative secure owner':'FAIL owner guard');if(!ok)fail++;
process.exit(fail?1:0);