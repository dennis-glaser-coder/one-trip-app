const fs=require('fs'),vm=require('vm');
const code=fs.readFileSync('noreyo-v968.js','utf8');
function El(){this.attrs={};this.dataset={};this.listeners={};this.clicked=0;}
El.prototype.getAttribute=function(k){return this.attrs[k]??null};
El.prototype.setAttribute=function(k,v){this.attrs[k]=String(v)};
El.prototype.addEventListener=function(k,fn){this.listeners[k]=fn};
El.prototype.click=function(){this.clicked++;};
const input=new El(),button=new El();
const row={querySelector(sel){return sel==='.destinationInput'?input:sel==='.dest-open'?button:null}};
const ctx={console,window:{addEventListener(){}},document:{body:null,querySelectorAll(){return[]}},MutationObserver:function(){this.observe=()=>{};this.disconnect=()=>{}},requestAnimationFrame(){return 1},cancelAnimationFrame(){}};
vm.createContext(ctx);vm.runInContext(code,ctx);const a=ctx.window.NOREYO_V968;let fail=0;
let ok=a.enhanceRow(row)&&input.attrs['aria-label']==='Reiseziel auswählen'&&button.attrs['aria-label']==='Reiseziel auswählen';
console.log(ok?'PASS destination controls labelled':'FAIL labels');if(!ok)fail++;
let stopped=0;input.listeners.click({stopPropagation(){stopped++}});button.listeners.click({stopPropagation(){stopped++}});
ok=stopped===2;console.log(ok?'PASS inner clicks stop row bubbling':'FAIL bubbling '+stopped);if(!ok)fail++;
let prevented=0;input.listeners.keydown({key:'Enter',preventDefault(){prevented++},stopPropagation(){stopped++}});
ok=input.clicked===1&&prevented===1;console.log(ok?'PASS Enter activates readonly destination input once':'FAIL enter');if(!ok)fail++;
ok=a.enhanceRow(row)===false;console.log(ok?'PASS destination enhancement idempotent':'FAIL idempotent');if(!ok)fail++;
process.exit(fail?1:0);