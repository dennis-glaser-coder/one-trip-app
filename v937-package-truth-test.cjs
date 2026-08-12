const fs=require('fs'),vm=require('vm');
const code=fs.readFileSync('./noreyo-v937.js','utf8');
const ctx={console,Object,String,window:{addEventListener(){}},document:{body:null,querySelectorAll(){return[]},createTreeWalker(){return{nextNode(){return false}}}},NodeFilter:{SHOW_TEXT:4},MutationObserver:function(){this.observe=()=>{};this.disconnect=()=>{}},requestAnimationFrame(){return 1},cancelAnimationFrame(){}};
vm.createContext(ctx);vm.runInContext(code,ctx);const a=ctx.window.NOREYO_V937;let fail=0;
const cases=[
 ['Pauschalreise individuell finden','Hotel + Flug passend planen'],
 ['Pauschalreise','Hotel + Flug'],
 ['Urlaub finden','Hotels für die Reise finden'],
 ['Zeitraum, Verpflegung, Reisende und Wünsche werden in die Live-Suche übernommen.','Hotelpreise werden live gesucht. Flüge werden separat geprüft; ein gemeinsamer Gesamtpreis wird erst nach Tarifkombination ausgewiesen.'],
 ['Für die Pauschalreise werden beide Ergebnisse später zusammengeführt.','Hotel und Flug werden getrennt gesucht. Ein gemeinsamer Gesamtpreis wird erst nach einer echten Tarifkombination ausgewiesen.']
];
for(const [input,want] of cases){const got=a.replaceText(input),ok=got===want;console.log((ok?'PASS ':'FAIL ')+input+' -> '+got);if(!ok)fail++}
const safe=a.replaceText('Hotel & Preis live vergleichen')==='Hotel & Preis live vergleichen';console.log(safe?'PASS unrelated copy untouched':'FAIL unrelated');if(!safe)fail++;
if(fail)process.exit(1);