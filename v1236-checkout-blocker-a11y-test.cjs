const fs=require('fs'),vm=require('vm');
const code=fs.readFileSync('./noreyo-v1236.js','utf8');
function E(){this.a={};this.id=''}
E.prototype.getAttribute=function(k){return this.a[k]??null};
E.prototype.setAttribute=function(k,v){this.a[k]=String(v)};
E.prototype.removeAttribute=function(k){delete this.a[k]};
const btn=new E(),must=new E(),auth=new E();btn.a['aria-describedby']='existing-help';
const root={must,auth,querySelector(s){if(s==='.noreyo-v1106-action')return btn;if(s==='.noreyo-v1200-must-note')return this.must;if(s==='.noreyo-v1202-auth-note')return this.auth;return null}};
let style=null;
const ctx={console,String,Set,Object,window:{addEventListener(){}},document:{body:null,head:{appendChild(x){style=x}},getElementById(){return null},createElement(){return new E()},querySelector(){return root}},MutationObserver:function(){},requestAnimationFrame(){return 1},cancelAnimationFrame(){}};
vm.createContext(ctx);vm.runInContext(code,ctx);const a=ctx.window.NOREYO_V1236;let fail=0;
let ok=a.sync()&&must.id==='noreyo-checkout-must-note'&&auth.id==='noreyo-checkout-auth-note'&&must.a.tabindex==='0'&&auth.a.tabindex==='0'&&btn.a['aria-describedby'].includes('noreyo-checkout-must-note')&&btn.a['aria-describedby'].includes('noreyo-checkout-auth-note');console.log(ok?'PASS checkout blockers are focusable and linked':'FAIL blockers');if(!ok)fail++;
root.must=null;a.sync();ok=!btn.a['aria-describedby'].includes('noreyo-checkout-must-note')&&btn.a['aria-describedby'].includes('existing-help');console.log(ok?'PASS resolved blocker token removed without losing existing help':'FAIL token cleanup');if(!ok)fail++;
ok=style.textContent.includes(':focus-visible');console.log(ok?'PASS visible blocker focus style':'FAIL style');if(!ok)fail++;
process.exit(fail?1:0);