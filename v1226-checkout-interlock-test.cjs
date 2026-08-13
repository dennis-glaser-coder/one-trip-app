const fs=require('fs'),vm=require('vm');const code=fs.readFileSync('./noreyo-v1226.js','utf8');
function Btn(){this.dataset={};this.disabled=false;this.attrs={};this.textContent='Preis & Verfügbarkeit final prüfen';}
Btn.prototype.getAttribute=function(k){return this.attrs[k]??null};Btn.prototype.setAttribute=function(k,v){this.attrs[k]=String(v)};
const btn=new Btn();
const ctx={console,Object,window:{addEventListener(){}},document:{body:null,querySelector(sel){return sel.includes('.noreyo-v1106-action')?btn:null}},MutationObserver:function(){this.observe=()=>{};this.disconnect=()=>{}},requestAnimationFrame(){return 1},cancelAnimationFrame(){}};
vm.createContext(ctx);vm.runInContext(code,ctx);const a=ctx.window.NOREYO_V1226;let fail=0;
btn.dataset.noreyoV1202Auth='1';btn.disabled=false;btn.attrs['aria-disabled']='false';
let ok=a.reconcile()===true&&btn.disabled&&btn.attrs['aria-disabled']==='true'&&btn.textContent==='Für Checkout anmelden';console.log(ok?'PASS auth blocker re-disables button after MUST layer frees it':'FAIL auth race '+JSON.stringify(btn));if(!ok)fail++;
btn.dataset.noreyoV1200Must='1';btn.dataset.noreyoV1202Auth='1';btn.disabled=false;btn.textContent='Für Checkout anmelden';
ok=a.reconcile()===true&&btn.disabled&&btn.textContent==='Pflichtkriterien noch nicht verifiziert';console.log(ok?'PASS MUST blocker wins visible priority when both blockers remain':'FAIL both');if(!ok)fail++;
delete btn.dataset.noreyoV1202Auth;btn.disabled=false;btn.attrs['aria-disabled']='false';
ok=a.reconcile()===true&&btn.disabled&&btn.textContent==='Pflichtkriterien noch nicht verifiziert';console.log(ok?'PASS MUST blocker re-disables button after auth layer frees it':'FAIL must race');if(!ok)fail++;
delete btn.dataset.noreyoV1200Must;btn.disabled=true;btn.textContent='External blocker';
ok=a.reconcile()===false&&btn.disabled&&btn.textContent==='External blocker';console.log(ok?'PASS interlock never enables a button owned by another safety layer':'FAIL external');if(!ok)fail++;
process.exit(fail?1:0);