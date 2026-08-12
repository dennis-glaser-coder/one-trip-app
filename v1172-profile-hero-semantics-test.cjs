const fs=require('fs'),vm=require('vm');const code=fs.readFileSync(require('path').join(__dirname,'noreyo-v1172.js'),'utf8');
function H(){this.a={role:'button',tabindex:'0','aria-label':'Mein Konto, u@example.de'};}H.prototype.getAttribute=function(k){return this.a[k]??null};H.prototype.setAttribute=function(k,v){this.a[k]=String(v)};H.prototype.hasAttribute=function(k){return k in this.a};H.prototype.removeAttribute=function(k){delete this.a[k]};
const h=new H();let model={authenticated:true,email:'u@example.de'};
const ctx={console,String,window:{addEventListener(){},NOREYO_V1162:{model(){return model}}},document:{body:null,querySelector(){return h}},MutationObserver:function(){this.observe=()=>{};this.disconnect=()=>{}},requestAnimationFrame(){return 1},cancelAnimationFrame(){}};
vm.createContext(ctx);vm.runInContext(code,ctx);const a=ctx.window.NOREYO_V1172;let fail=0;
let ok=a.sync()===true&&!h.hasAttribute('role')&&!h.hasAttribute('tabindex')&&h.a['aria-disabled']==='true';console.log(ok?'PASS authenticated account summary is no longer announced as dead button':'FAIL auth '+JSON.stringify(h.a));if(!ok)fail++;
model={authenticated:false,email:''};ok=a.sync()===true&&h.a.role==='button'&&h.a.tabindex==='0'&&h.a['aria-label']==='Bei NOREYO anmelden'&&!h.hasAttribute('aria-disabled');console.log(ok?'PASS signed-out hero remains keyboard-operable login entry':'FAIL signedout '+JSON.stringify(h.a));if(!ok)fail++;
ok=a.sync()===false;console.log(ok?'PASS profile hero semantic reconciliation is idempotent':'FAIL idempotent');if(!ok)fail++;
process.exit(fail?1:0);