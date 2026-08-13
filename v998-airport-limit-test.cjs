const fs=require('fs'),vm=require('vm');
const code=fs.readFileSync('./noreyo-v998.js','utf8');
let toggles=[],toasts=[];
function Btn(code){this.code=code;this.disabled=false;this.attrs={};this.dataset={noreyoV996Airport:code};}
Btn.prototype.getAttribute=function(k){return this.attrs[k]??null};
Btn.prototype.setAttribute=function(k,v){this.attrs[k]=String(v)};
Btn.prototype.querySelector=function(){return null};
const buttons=['DUS','CGN','PAD','FMO','FRA','HAJ','BER'].map(x=>new Btn(x));
const body={
 querySelectorAll(sel){return sel==='.choice'?buttons:[]},
 querySelector(sel){if(sel==='.noreyo-v998-limit')return this.note||null;if(sel==='.planner-save')return {tag:'save'};return null},
 insertBefore(el){this.note=el},appendChild(el){this.note=el}
};
const ctx={console,Object,Array,String,Set,searchState:{airports:['DUS','CGN','PAD','FMO','FRA','HAJ']},plannerMode:'airports',showToast(m){toasts.push(m)},window:{addEventListener(){},toggleAirport(code){toggles.push(code);const i=ctx.searchState.airports.indexOf(code);if(i>=0)ctx.searchState.airports.splice(i,1);else ctx.searchState.airports.push(code);}},document:{getElementById(id){return id==='plannerBody'?body:null},createElement(){return{textContent:'',className:''}}},MutationObserver:function(){this.observe=()=>{};this.disconnect=()=>{}},requestAnimationFrame(){return 1},cancelAnimationFrame(){}};
vm.createContext(ctx);vm.runInContext(code,ctx);const a=ctx.window.NOREYO_V998;let fail=0;
let result=ctx.window.toggleAirport('BER');
let ok=result===false&&toggles.length===0&&toasts.length===1&&ctx.searchState.airports.length===6;
console.log(ok?'PASS seventh airport is blocked before search state changes':'FAIL block');if(!ok)fail++;
result=ctx.window.toggleAirport('HAJ');
ok=toggles.length===1&&ctx.searchState.airports.length===5&&!ctx.searchState.airports.includes('HAJ');
console.log(ok?'PASS selected airport can still be removed at limit':'FAIL remove');if(!ok)fail++;
ctx.window.toggleAirport('BER');
ok=toggles.length===2&&ctx.searchState.airports.includes('BER')&&ctx.searchState.airports.length===6;
console.log(ok?'PASS new airport can be added after freeing one slot':'FAIL add');if(!ok)fail++;
a.sync();
const ber=buttons.find(x=>x.code==='BER'),haj=buttons.find(x=>x.code==='HAJ');
ok=ber.disabled===false&&haj.disabled===true&&haj.attrs['aria-disabled']==='true'&&body.note?.textContent==='6 von maximal 6 Abflughäfen ausgewählt.';
console.log(ok?'PASS picker visibly mirrors six-airport cap':'FAIL sync');if(!ok)fail++;
process.exit(fail?1:0);