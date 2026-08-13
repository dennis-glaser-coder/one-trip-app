const fs=require('fs'),vm=require('vm'),path=require('path');
const code=fs.readFileSync(path.join(__dirname,'noreyo-v900.js'),'utf8');
const ctx={console,Object,String,window:{addEventListener(){}},document:{body:null,querySelectorAll(){return[]}},MutationObserver:function(){this.observe=()=>{};this.disconnect=()=>{}},requestAnimationFrame(){return 1},cancelAnimationFrame(){},NodeFilter:{SHOW_TEXT:4}};
vm.createContext(ctx);vm.runInContext(code,ctx);const a=ctx.window.NOREYO_V900;let fail=0;
const cases=[
 ['Separate Flugsuche; Live-Flugtarife folgen nach Provider-Anbindung.','serverseitigen Provider-Pfad'],
 ['Flug-Schnittstelle wird geprüft','Live-Flugangebote werden geladen'],
 ['Wir versuchen die vorbereitete Sandbox-Suche.','serverseitig beim Flugprovider'],
 ['Die detaillierte Flugkarten-Darstellung folgt als nächster Ausbauschritt. Sandbox-Daten können unvollständig sein.','Angebots-Verifizierung'],
 ['Flugsuche ist in ONE TRIP jetzt separat vorbereitet.','Live-Flugsuche derzeit nicht verfügbar.'],
 ['Für Live-Ergebnisse muss die bestehende Supabase-Funktion einmal auf den LiteAPI-Flug-Endpunkt routen. Das machen wir anschließend gemeinsam.','Suchangaben bleiben erhalten']
];
for(const [old,needle] of cases){const out=a.rewriteText(old),ok=out.includes(needle)&&!out.includes('Provider-Anbindung')&&!out.includes('anschließend gemeinsam');console.log((ok?'PASS ':'FAIL ')+old+' -> '+out);if(!ok)fail++;}
const unchanged=a.rewriteText('Flüge finden')==='Flüge finden';console.log(unchanged?'PASS unrelated copy unchanged':'FAIL unrelated copy');if(!unchanged)fail++;
process.exit(fail?1:0);
