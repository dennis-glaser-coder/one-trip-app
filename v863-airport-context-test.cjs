const fs=require('fs'),vm=require('vm');
const code=fs.readFileSync('noreyo-v863.js','utf8');
function norm(v){return String(v||'').toLowerCase().replace(/ä/g,'ae').replace(/ö/g,'oe').replace(/ü/g,'ue').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/ß/g,'ss');}
const defs=[['DUS',['duesseldorf','dusseldorf']],['FRA',['frankfurt']]];
function airportHits(text){const t=norm(text),out=[];for(const [code,names] of defs)for(const name of names){const i=t.indexOf(name);if(i>=0)out.push({code,name,index:i,end:i+name.length});}return out.sort((a,b)=>a.index-b.index);}
function suppressOverlaps(x){return x;}
function connectedToDeparture(t,hit,accepted){const before=t.slice(Math.max(0,hit.index-42),hit.index);if(/(?:^|\s)(?:ab|von)\s+$/i.test(before))return true;if(!accepted.length)return false;const prev=accepted[accepted.length-1],between=t.slice(prev.end,hit.index);return /^\s*(?:,|\/|\+|\bund\b|\boder\b)\s*$/i.test(between);}
const base={norm,airportHits,suppressOverlaps,connectedToDeparture,setAirports(){return true}};
const ctx={console,String,Object,Array,window:{NOREYO_V800:base},document:{addEventListener(){},getElementById(){return null}},setTimeout(){}};
vm.createContext(ctx);vm.runInContext(code,ctx);const a=ctx.window.NOREYO_V863;
let fail=0;
const cases=[['Hotel 10 km von Frankfurt',[]],['Hotel 2 Kilometer entfernt von Frankfurt',[]],['Hotel in der Nähe von Frankfurt',[]],['Hotel nahe von Frankfurt',[]],['ab Frankfurt',['FRA']],['von Frankfurt',['FRA']],['ab Düsseldorf, Hotel 10 km von Frankfurt',['DUS']]];
for(const [text,want] of cases){const got=a.safeDepartures(text),ok=JSON.stringify(got)===JSON.stringify(want);console.log((ok?'PASS ':'FAIL ')+text+' -> '+JSON.stringify(got));if(!ok)fail++;}
if(fail)process.exit(1);
