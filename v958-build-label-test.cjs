const fs=require('fs'),vm=require('vm');
const code=fs.readFileSync('./noreyo-v958.js','utf8');
function El(text=''){this.textContent=text;this.attrs={};this.style={};this.className='';this.after=null;}
El.prototype.getAttribute=function(k){return this.attrs[k]??null};
El.prototype.setAttribute=function(k,v){this.attrs[k]=String(v)};
El.prototype.insertAdjacentElement=function(pos,el){this.after=el;profile.current=el};
const legacy=new El('NOREYO · BUILD 9.32');
const profile={current:null,querySelector(sel){if(sel==='[data-noreyo-v958-build="1"]')return this.current;return null},querySelectorAll(sel){return sel==='.build-version'?[legacy,...(this.current?[this.current]:[])]:[]}};
const document={body:{},getElementById(id){return id==='profile'?profile:null},createElement(){return new El()}};
const ctx={console,Object,String,Number,window:{addEventListener(){},NOREYO_V932:{BUILD:'9.32'},NOREYO_V957:{BUILD:'9.57-safe'},NOREYO_V955:{BUILD:'9.55'}},document,MutationObserver:function(){this.observe=()=>{};this.disconnect=()=>{}},requestAnimationFrame(){return 1},cancelAnimationFrame(){},setTimeout(fn){fn();return 1},clearTimeout(){}};
vm.createContext(ctx);vm.runInContext(code,ctx);
const a=ctx.window.NOREYO_V958;let fail=0;
ctx.window.NOREYO_V959={BUILD:'9.59-safe'};a.fixProfile();
let ok=legacy.style.display==='none'&&legacy.getAttribute('aria-hidden')==='true';console.log(ok?'PASS legacy hard-coded build marker is hidden from users':'FAIL legacy visibility');if(!ok)fail++;
ok=profile.current?.textContent==='NOREYO · BUILD 9.59';console.log(ok?'PASS independent visible current build label is rendered':'FAIL '+profile.current?.textContent);if(!ok)fail++;
legacy.textContent='NOREYO · BUILD 9.32';ok=profile.current.textContent==='NOREYO · BUILD 9.59';console.log(ok?'PASS legacy writer can no longer overwrite visible current build':'FAIL race');if(!ok)fail++;
ok=a.fixProfile()===false;console.log(ok?'PASS repair is idempotent':'FAIL idempotency');if(!ok)fail++;
if(fail)process.exit(1);