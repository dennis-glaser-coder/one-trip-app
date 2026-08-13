const fs=require('fs'),vm=require('vm');const code=fs.readFileSync('noreyo-v914.js','utf8');
const nodes=[{textContent:'NaN € Hotelpreis'},{textContent:'∞ € Hotelpreis'},{textContent:'1.249 € Hotelpreis'}];
const doc={body:{},querySelectorAll(){return nodes}};
const ctx={console,document:doc,window:{addEventListener(){}},MutationObserver:function(){this.observe=()=>{};this.disconnect=()=>{}},requestAnimationFrame(){return 1},cancelAnimationFrame(){}};
vm.createContext(ctx);vm.runInContext(code,ctx);const a=ctx.window.NOREYO_V914;let fail=0;
let ok=a.invalidPriceText('NaN € Hotelpreis')&&a.invalidPriceText('Infinity €')&&!a.invalidPriceText('1.249 € Hotelpreis');console.log(ok?'PASS invalid price text detection':'FAIL detect');if(!ok)fail++;
a.repair(doc);ok=nodes[0].textContent==='Preis aktuell nicht verfügbar'&&nodes[1].textContent==='Preis aktuell nicht verfügbar'&&nodes[2].textContent==='1.249 € Hotelpreis';console.log(ok?'PASS only invalid saved prices are replaced':'FAIL '+JSON.stringify(nodes));if(!ok)fail++;
process.exit(fail?1:0);
