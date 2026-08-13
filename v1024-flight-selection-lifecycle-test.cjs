const fs=require('fs'),vm=require('vm');
const code=fs.readFileSync('noreyo-v1024.js','utf8');
let searches=0,listeners={};
function target(selector,onclick=''){
  return {closest(sel){return sel.includes(selector)?{getAttribute(){return onclick}}:null}};
}
const ctx={
 console,window:{addEventListener(){},NOREYO_SELECTED_FLIGHT:{offerId:'A'},searchFlights(){searches++;return 'ok'}},
 document:{addEventListener(k,fn){listeners[k]=fn},removeEventListener(k){delete listeners[k]}},
};
vm.createContext(ctx);vm.runInContext(code,ctx);
const a=ctx.window.NOREYO_V1024;let fail=0;
let ok=a.selected()?.offerId==='A';
console.log(ok?'PASS selection starts present':'FAIL initial');if(!ok)fail++;
ctx.window.searchFlights();
ok=searches===1&&!ctx.window.NOREYO_SELECTED_FLIGHT;
console.log(ok?'PASS new global flight search clears stale selection':'FAIL global');if(!ok)fail++;
ctx.window.NOREYO_SELECTED_FLIGHT={offerId:'B'};
listeners.click({target:target('.noreyo-v943-back')});
ok=!ctx.window.NOREYO_SELECTED_FLIGHT;
console.log(ok?'PASS Andere Flüge ansehen clears selection before V9.88 searchSafe':'FAIL back');if(!ok)fail++;
ctx.window.NOREYO_SELECTED_FLIGHT={offerId:'C'};
listeners.click({target:target('.noreyo-v943-retry')});
ok=!ctx.window.NOREYO_SELECTED_FLIGHT;
console.log(ok?'PASS flight retry clears selection':'FAIL retry');if(!ok)fail++;
ctx.window.NOREYO_SELECTED_FLIGHT={offerId:'D'};
listeners.click({target:target('.product-mode',"setProductMode('hotel')")});
ok=!ctx.window.NOREYO_SELECTED_FLIGHT;
console.log(ok?'PASS leaving flight mode clears selection':'FAIL product');if(!ok)fail++;
ctx.window.NOREYO_SELECTED_FLIGHT={offerId:'E'};
listeners.click({target:target('.product-mode',"setProductMode('flight')")});
ok=ctx.window.NOREYO_SELECTED_FLIGHT?.offerId==='E';
console.log(ok?'PASS staying in flight mode preserves current selection':'FAIL flight mode');if(!ok)fail++;
process.exit(fail?1:0);
