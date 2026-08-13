const fs=require('fs'),vm=require('vm');
const v1218=fs.readFileSync('./noreyo-v1218.js','utf8'),v1220=fs.readFileSync('./noreyo-v1220.js','utf8');
let raw='otp_expired email=private@example.test provider_trace=SECRET',clears=0;
const ctx={console,String,Object,window:{addEventListener(){},
  NOREYO_V1158:{authError(){return raw}},
  NOREYO_V1210:{clear(){clears++;return true}}
}};
vm.createContext(ctx);
vm.runInContext(v1218,ctx);
vm.runInContext(v1220,ctx);
let fail=0;
let publicValue=ctx.window.NOREYO_V1158.authError();
let ok=publicValue.includes('abgelaufen')&&!publicValue.includes('private@example')&&!publicValue.includes('SECRET');
console.log(ok?'PASS legacy profile consumer sees safe authError after V12.18+V12.20':'FAIL public '+publicValue);if(!ok)fail++;
ctx.window.NOREYO_V1210.clear();
ok=clears===1&&ctx.window.NOREYO_V1218.consumed===raw&&ctx.window.NOREYO_V1158.authError()==='';
console.log(ok?'PASS callback clear consumes raw fingerprint while public authError retires cleanly':'FAIL consumed '+JSON.stringify({clears,consumed:ctx.window.NOREYO_V1218.consumed,public:ctx.window.NOREYO_V1158.authError()}));if(!ok)fail++;
raw='different provider raw';
publicValue=ctx.window.NOREYO_V1158.authError();
ok=publicValue.includes('nicht abgeschlossen')&&!publicValue.includes('provider raw');
console.log(ok?'PASS new distinct auth error remains visible only through generic safe copy':'FAIL new '+publicValue);if(!ok)fail++;
process.exit(fail?1:0);