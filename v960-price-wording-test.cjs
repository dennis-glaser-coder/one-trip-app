const fs=require('fs'),vm=require('vm');
const code=fs.readFileSync('./noreyo-v960.js','utf8');
const ctx={console,String,Number,Object,window:{addEventListener(){}},document:{body:null},NodeFilter:{SHOW_TEXT:4},MutationObserver:function(){this.observe=()=>{};this.disconnect=()=>{}},requestAnimationFrame(){return 1},cancelAnimationFrame(){}};
vm.createContext(ctx);vm.runInContext(code,ctx);
const a=ctx.window.NOREYO_V960;let fail=0;
const cases=[['Preisbeobachtung','Gemerkte Preise'],['Preis beobachten','Preis merken'],['Preis wird beobachtet','Preis gemerkt'],['Preisbeobachtung beendet','Preisvormerkung entfernt'],['Noch keine Preisbeobachtung','Noch kein Preis gemerkt'],['Keine aktive Beobachtung','Kein gemerkter Preis'],['1 aktive Beobachtung · lokal','1 gemerkter Preis · lokal'],['3 aktive Beobachtungen · lokal','3 gemerkte Preise · lokal'],['Diese Vormerkungen sind aktuell nur lokal gespeichert.','Diese Vormerkungen sind aktuell nur lokal gespeichert.']];
for(const [input,want] of cases){const got=a.replaceText(input),ok=got===want;console.log((ok?'PASS ':'FAIL ')+input+' -> '+got);if(!ok)fail++;}
if(fail)process.exit(1);