const fs=require('fs'),vm=require('vm');
const code=fs.readFileSync('./noreyo-v978.js','utf8');
let commits=0,listener=null,removed=0;
const save={closest(sel){return sel==='#plannerBody .planner-save'?this:null}};
const other={closest(){return null}};
const ctx={
 console,
 window:{NOREYO_V974:{active(){return'airports'},commit(mode){if(mode==='airports'){commits++;return true}return false}},addEventListener(){}},
 document:{addEventListener(type,fn,capture){if(type==='click'&&capture===true)listener=fn},removeEventListener(type,fn,capture){if(type==='click'&&fn===listener&&capture===true)removed++}}
};
vm.createContext(ctx);vm.runInContext(code,ctx);
const a=ctx.window.NOREYO_V978;let fail=0;
let ok=typeof listener==='function';
console.log(ok?'PASS capture listener binds immediately':'FAIL bind');if(!ok)fail++;
ok=a.commitFromEvent({target:save})===true&&commits===1;
console.log(ok?'PASS airport Save commits synchronously':'FAIL commit '+commits);if(!ok)fail++;
ok=a.commitFromEvent({target:other})===false&&commits===1;
console.log(ok?'PASS unrelated click ignored':'FAIL unrelated');if(!ok)fail++;
ctx.window.NOREYO_V974.active=()=> 'travellers';
ok=a.commitFromEvent({target:save})===false&&commits===1;
console.log(ok?'PASS traveller Save not intercepted':'FAIL traveller');if(!ok)fail++;
a.cleanup();
ok=removed===1;
console.log(ok?'PASS capture listener cleaned for BFCache':'FAIL cleanup');if(!ok)fail++;
process.exit(fail?1:0);