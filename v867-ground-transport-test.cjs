const fs=require('fs'),vm=require('vm');
const code=fs.readFileSync('./noreyo-v867.js','utf8');
function norm(v){return String(v||'').toLowerCase().replace(/ä/g,'ae').replace(/ö/g,'oe').replace(/ü/g,'ue').replace(/ß/g,'ss');}
const defs=[['FRA','frankfurt'],['DUS','duesseldorf']];
function airportHits(text){const t=norm(text),out=[];for(const [code,name] of defs){let i=t.indexOf(name);if(i>=0)out.push({code,name,index:i,end:i+name.length});}return out.sort((a,b)=>a.index-b.index);}
function connectedToDeparture(t,hit,accepted){const before=t.slice(Math.max(0,hit.index-45),hit.index);if(/\b(?:ab|von)\s*$/.test(before))return true;if(!accepted.length)return false;const prev=accepted[accepted.length-1],between=t.slice(prev.end,hit.index);return /^\s*(?:,|\/|\+|\bund\b|\boder\b)\s*$/.test(between);}
const base={norm,airportHits,suppressOverlaps:x=>x,connectedToDeparture,setAirports(){return true}};
const ctx={console,String,Object,Array,window:{NOREYO_V800:base},document:{addEventListener(){},getElementById(){return null}},setTimeout(){}};
vm.createContext(ctx);vm.runInContext(code,ctx);const a=ctx.window.NOREYO_V867;
let fail=0;
const cases=[['Transfer von Frankfurt zum Hotel',[]],['Shuttle von Düsseldorf ins Hotel',[]],['Taxi von Frankfurt zur Unterkunft',[]],['Abholung von Frankfurt zum Resort',[]],['Flug von Frankfurt nach Mallorca',['FRA']],['ab Frankfurt',['FRA']],['Transfer von Frankfurt zum Hotel, Flug ab Düsseldorf',['DUS']]];
for(const [text,want] of cases){const got=a.safeDepartures(text),ok=JSON.stringify(got)===JSON.stringify(want);console.log((ok?'PASS ':'FAIL ')+text+' -> '+JSON.stringify(got));if(!ok)fail++;}
if(fail)process.exit(1);