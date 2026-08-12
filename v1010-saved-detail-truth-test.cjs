const fs=require('fs'),vm=require('vm');const code=fs.readFileSync('./noreyo-v1010.js','utf8');
let opened=null,priorCalls=0,renders=[];
const offer={key:'k',hotel:'Test Hotel',price:1234,live:true,hotelId:'h1'};
const ctx={console,Object,String,Number,
 snapshotByKey(){return offer},openDetailSnapshot(o,source){opened={o,source};ctx.window.renderDetail(o)},
 window:{addEventListener(){},showSavedDetail(){priorCalls++},renderDetail(o){renders.push(o)},showDetail(){renders.push({result:true})}},
 document:{getElementById(){return null}},MutationObserver:function(){this.observe=()=>{};this.disconnect=()=>{}},requestAnimationFrame(){return 1},cancelAnimationFrame(){}};
vm.createContext(ctx);vm.runInContext(code,ctx);const a=ctx.window.NOREYO_V1010;let fail=0;
ctx.window.showSavedDetail('k','favorites');
let ok=opened?.o?.live===false&&renders.at(-1)?.live===false&&a.state().activeSavedKey==='k'&&priorCalls===0;
console.log(ok?'PASS saved favorite opens/render as historical snapshot, not live':'FAIL favorite '+JSON.stringify({opened,renders,state:a.state()}));if(!ok)fail++;
ctx.window.renderDetail({...offer,live:true});
ok=renders.at(-1)?.live===false&&renders.at(-1)?.savedSnapshot===true;
console.log(ok?'PASS later re-render cannot resurrect LIVE badge semantics':'FAIL rerender '+JSON.stringify(renders.at(-1)));if(!ok)fail++;
ctx.window.showDetail('123');
ok=a.state().activeSavedKey===''&&renders.at(-1)?.result===true;
console.log(ok?'PASS opening a current result clears saved-detail ownership':'FAIL clear '+JSON.stringify(a.state()));if(!ok)fail++;
const clone=a.savedClone({price:0,live:true},'trips');
ok=clone.live===false&&clone.savedSnapshot===true&&clone.savedSource==='trips'&&clone.savedPrice===0&&offer.live===true;
console.log(ok?'PASS saved clone is immutable relative to persisted source':'FAIL clone '+JSON.stringify(clone));if(!ok)fail++;
process.exit(fail?1:0);