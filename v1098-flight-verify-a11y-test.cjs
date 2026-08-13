const fs=require('fs'),vm=require('vm');const code=fs.readFileSync('./noreyo-v1098.js','utf8');
function El(text=''){this.attrs={};this.textContent=text;this.disabled=false;}
El.prototype.getAttribute=function(k){return this.attrs[k]??null};El.prototype.setAttribute=function(k,v){this.attrs[k]=String(v)};
const state=new El(),gate=new El(),delta=new El(),btn=new El('Flugangebot wird verifiziert …'),accept=new El();btn.disabled=true;
const ctx={console,window:{addEventListener(){}},document:{body:{},querySelectorAll(sel){return sel.includes('noreyo-v1084')?[state,gate,delta]:[]},querySelector(sel){if(sel==='.noreyo-v1084-verify')return btn;if(sel==='.noreyo-v1094-accept')return accept;return null}},MutationObserver:function(){this.observe=()=>{};this.disconnect=()=>{}},requestAnimationFrame(){return 1},cancelAnimationFrame(){}};
vm.createContext(ctx);vm.runInContext(code,ctx);const a=ctx.window.NOREYO_V1098;let fail=0;
let ok=a.sync()&&[state,gate,delta].every(x=>x.attrs.role==='status'&&x.attrs['aria-live']==='polite'&&x.attrs['aria-atomic']==='true');
console.log(ok?'PASS verify feedback surfaces become polite live regions':'FAIL live');if(!ok)fail++;
ok=btn.attrs['aria-busy']==='true'&&/Aktualisierten Flugpreis/.test(accept.attrs['aria-label']);
console.log(ok?'PASS verify busy state and acceptance label exposed':'FAIL controls');if(!ok)fail++;
ok=a.sync()===false;
console.log(ok?'PASS verify accessibility sync idempotent':'FAIL idempotency');if(!ok)fail++;
process.exit(fail?1:0);