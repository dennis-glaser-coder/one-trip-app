const fs=require('fs'),vm=require('vm');
const baseCode=fs.readFileSync('noreyo-v853.js','utf8');
const code=fs.readFileSync('noreyo-v861.js','utf8');
const ctx={console,Date,String,Number,Object,Math,window:{addEventListener(){}},document:{addEventListener(){},getElementById(){return null}},setTimeout(){}};
vm.createContext(ctx);vm.runInContext(baseCode,ctx);vm.runInContext(code,ctx);
const a=ctx.window.NOREYO_V861,now=new Date('2026-08-12T12:00:00');
let fail=0;
const cases=[['am 12. September','2026-09-12'],['am 12. Sep','2026-09-12'],['am 12. Juli','2027-07-12'],['am 29. Februar','2028-02-29'],['am 31. April',null],['am 12. September 2027',null],['12. bis 19. September',null]];
for(const [text,want] of cases){const got=a.parseAmSingle(text,now),ok=got===want;console.log((ok?'PASS ':'FAIL ')+text+' -> '+got);if(!ok)fail++;}
let p=a.repairPlan('am 12. September',{checkin:'2026-10-01',checkout:'2026-10-11'},now);const ok=p?.checkin==='2026-09-12'&&p?.nights===10&&p?.checkout==='2026-09-22';console.log(ok?'PASS existing 10-night duration preserved':'FAIL '+JSON.stringify(p));if(!ok)fail++;
if(fail)process.exit(1);
