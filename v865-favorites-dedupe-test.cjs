const fs=require('fs'),vm=require('vm');
const code=fs.readFileSync('./noreyo-v865.js','utf8');
function card(k){return{removed:false,hasAttribute(n){return n==='data-v584-open'},getAttribute(){return encodeURIComponent(k)},remove(){this.removed=true;list.children=list.children.filter(x=>x!==this)}}}
const list={children:[],replaceChildren(){this.children=[]}};
const empty={style:{display:'none'}};
const ctx={console,Set,Object,Array,String,savedFavorites:[{key:'A'},{key:'A'},{key:'B'}],document:{addEventListener(){},removeEventListener(){},getElementById(id){return id==='favList'?list:id==='favEmpty'?empty:null}},window:{addEventListener(){},NOREYO_V584:{refreshFavorites(){}}},MutationObserver:function(){this.observe=()=>{};this.disconnect=()=>{}},requestAnimationFrame(){return 1},cancelAnimationFrame(){},setTimeout(){}};
vm.createContext(ctx);vm.runInContext(code,ctx);const a=ctx.window.NOREYO_V865;
let fail=0;
let got=a.uniqueKeys(ctx.savedFavorites),ok=JSON.stringify(got)==='["A","B"]';console.log(ok?'PASS duplicate saved keys canonicalized':'FAIL '+JSON.stringify(got));if(!ok)fail++;
list.children=[card('A'),card('A'),card('B')];ok=a.dedupeCards(list)&&list.children.length===2&&JSON.stringify(a.renderedUniqueKeys(list))==='["A","B"]';console.log(ok?'PASS duplicate rendered cards removed':'FAIL '+JSON.stringify(a.renderedUniqueKeys(list)));if(!ok)fail++;
ok=a.sameSet(a.uniqueKeys(ctx.savedFavorites),a.renderedUniqueKeys(list));console.log(ok?'PASS duplicate storage no longer causes stale mismatch loop':'FAIL mismatch');if(!ok)fail++;
if(fail)process.exit(1);