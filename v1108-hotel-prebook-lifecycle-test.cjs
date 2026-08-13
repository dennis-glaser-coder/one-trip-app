const fs=require('fs'),vm=require('vm');const code=fs.readFileSync('./noreyo-v1108.js','utf8');
let clears=0,searches=0,views=[],style=null;
function El(){this.attrs={};}
El.prototype.getAttribute=function(k){return this.attrs[k]??null};El.prototype.setAttribute=function(k,v){this.attrs[k]=String(v)};
const status=new El(),btn=new El(),box={querySelector(sel){return sel.includes('status')?status:sel.includes('action')?btn:null}};
const ctx={console,window:{addEventListener(){},NOREYO_V1106:{clear(){clears++;return true}},searchTrips(){searches++},go(v){views.push(v)}},document:{body:{},head:{appendChild(x){style=x}},getElementById(id){return style?.id===id?style:null},createElement(){return{id:'',textContent:''}},querySelector(sel){return sel==='.noreyo-v1106-prebook'?box:null}},MutationObserver:function(){this.observe=()=>{};this.disconnect=()=>{}},requestAnimationFrame(){return 1},cancelAnimationFrame(){}};
vm.createContext(ctx);vm.runInContext(code,ctx);const a=ctx.window.NOREYO_V1108;let fail=0;
let ok=a.enhance()&&status.attrs.role==='status'&&status.attrs['aria-live']==='polite'&&status.attrs['aria-atomic']==='true'&&btn.attrs['aria-label'];
console.log(ok?'PASS hotel prebook feedback gets accessible live semantics':'FAIL a11y');if(!ok)fail++;
ctx.window.searchTrips();ok=clears===1&&searches===1;
console.log(ok?'PASS new hotel search clears old prebook first':'FAIL search');if(!ok)fail++;
ctx.window.go('detail');ok=clears===1&&views.at(-1)==='detail';
console.log(ok?'PASS staying in detail keeps current prebook':'FAIL detail');if(!ok)fail++;
ctx.window.go('searchView');ok=clears===2&&views.at(-1)==='searchView';
console.log(ok?'PASS leaving detail clears prebook':'FAIL leave');if(!ok)fail++;
ok=style?.textContent.includes('min-height:48px')&&a.installStyle()===false;
console.log(ok?'PASS hotel prebook CTA has stable touch/focus style':'FAIL style');if(!ok)fail++;
process.exit(fail?1:0);