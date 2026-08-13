const fs=require('fs'),vm=require('vm');
const code=fs.readFileSync('noreyo-v859.js','utf8');
const ctx={console,Date,String,Number,Object,Math,window:{},document:{addEventListener(){},getElementById(){return null}},setTimeout(){}};
vm.createContext(ctx);vm.runInContext(code,ctx);
const a=ctx.window.NOREYO_V859,now=new Date('2026-08-12T12:00:00');
let fail=0;
const cases=[['12. bis 19. September','2026-09-12','2026-09-19'],['12.–19. Sep','2026-09-12','2026-09-19'],['12-19 Sep','2026-09-12','2026-09-19'],['12. bis 19. Juli','2027-07-12','2027-07-19'],['29. bis 31. Februar',null,null],['19. bis 12. September',null,null],['12. Sep bis 19. Sep',null,null],['12. bis 19. September 2027',null,null]];
for(const [text,ci,co] of cases){const got=a.parseElidedRange(text,now);const ok=ci===null?got===null:got?.checkin===ci&&got?.checkout===co;console.log((ok?'PASS ':'FAIL ')+text+' -> '+JSON.stringify(got));if(!ok)fail++;}
if(fail)process.exit(1);
