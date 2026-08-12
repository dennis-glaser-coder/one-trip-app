const fs=require('fs'),vm=require('vm');const code=fs.readFileSync('noreyo-v947.js','utf8');
const ctx={console,String,Object,window:{addEventListener(){}},document:{body:null},NodeFilter:{SHOW_TEXT:4},MutationObserver:function(){this.observe=()=>{};this.disconnect=()=>{}},requestAnimationFrame(){return 1},cancelAnimationFrame(){}};vm.createContext(ctx);vm.runInContext(code,ctx);const a=ctx.window.NOREYO_V947;let fail=0;
const cases=[['Preis beobachten','Preis merken'],['Preis wird beobachtet','Preis vorgemerkt'],['Preisbeobachtung','Preis-Merkliste'],['Keine aktive Beobachtung','Keine gemerkten Preise'],['Andere Nachricht','Andere Nachricht']];
for(const [input,want] of cases){const got=a.replaceText(input),ok=got===want;console.log((ok?'PASS ':'FAIL ')+input+' -> '+got);if(!ok)fail++}
let shown='';ctx.showToast=(m)=>{shown=m};a.installToast();ctx.showToast('Preisbeobachtung beendet');let ok=shown==='Preis-Merker entfernt';console.log(ok?'PASS toast language is truthful':'FAIL '+shown);if(!ok)fail++;
if(fail)process.exit(1);
