const fs=require('fs'),vm=require('vm');
const code=fs.readFileSync('noreyo-v966.js','utf8');
function El(text='',classes=[]){this.textContent=text;this.attrs={};this.classList={contains:c=>classes.includes(c)};}
El.prototype.getAttribute=function(k){return this.attrs[k]??null};El.prototype.setAttribute=function(k,v){this.attrs[k]=String(v)};El.prototype.querySelector=function(){return null};
const sortA=new El('Empfohlen',['active-sort']),sortB=new El('Preis',[]);const prodA=new El('Hotel + Flug',['on']),prodB=new El('Hotel',[]);
const root={querySelectorAll(sel){if(sel==='.toolbar [data-sort]')return[sortA,sortB];if(sel==='.product-mode')return[prodA,prodB];if(sel==='[data-pref-key]')return[];if(sel.includes('.premium-filter-row'))return[];return[];}};
const ctx={console,window:{addEventListener(){}},document:{body:{},querySelectorAll(){return[]}},MutationObserver:function(){this.observe=()=>{};this.disconnect=()=>{}},requestAnimationFrame(){return 1},cancelAnimationFrame(){}};
vm.createContext(ctx);vm.runInContext(code,ctx);const a=ctx.window.NOREYO_V966;let fail=0;
let ok=a.syncSort(root)&&sortA.attrs['aria-pressed']==='true'&&sortB.attrs['aria-pressed']==='false'&&/ausgewählt/.test(sortA.attrs['aria-label']);console.log(ok?'PASS sort selection mirrored to ARIA':'FAIL sort '+JSON.stringify([sortA.attrs,sortB.attrs]));if(!ok)fail++;
ok=a.syncProduct(root)&&prodA.attrs['aria-pressed']==='true'&&prodB.attrs['aria-pressed']==='false';console.log(ok?'PASS product selection mirrored to ARIA':'FAIL product '+JSON.stringify([prodA.attrs,prodB.attrs]));if(!ok)fail++;
ok=a.syncSort(root)===false&&a.syncProduct(root)===false;console.log(ok?'PASS selection sync is idempotent':'FAIL idempotency');if(!ok)fail++;
process.exit(fail?1:0);