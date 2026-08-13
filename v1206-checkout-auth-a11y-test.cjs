const fs=require('fs'),vm=require('vm');const code=fs.readFileSync('./noreyo-v1206.js','utf8');
function El(){this.attrs={};this.id='';}
El.prototype.getAttribute=function(k){return this.attrs[k]??null};El.prototype.setAttribute=function(k,v){this.attrs[k]=String(v)};El.prototype.removeAttribute=function(k){delete this.attrs[k]};
const note=new El(),action=new El();action.attrs['aria-describedby']='existing-help';const root={querySelector(sel){return sel==='.noreyo-v1202-auth-note'?this.note:sel==='.noreyo-v1106-action'?action:null},note};
const ctx={console,String,Set,Object,window:{addEventListener(){}},document:{body:null,querySelector(sel){return sel==='.noreyo-v1106-prebook'?root:null}},MutationObserver:function(){this.observe=()=>{};this.disconnect=()=>{}},requestAnimationFrame(){return 1},cancelAnimationFrame(){}};
vm.createContext(ctx);vm.runInContext(code,ctx);const a=ctx.window.NOREYO_V1206;let fail=0;
let ok=a.sync()===true&&note.id==='noreyo-checkout-auth-note'&&note.attrs.role==='status'&&note.attrs['aria-live']==='polite'&&action.attrs['aria-describedby']==='existing-help noreyo-checkout-auth-note';
console.log(ok?'PASS signed-out checkout action is linked to polite auth explanation':'FAIL locked '+JSON.stringify({note:note.attrs,describedby:action.attrs['aria-describedby']}));if(!ok)fail++;
ok=a.sync()===false;console.log(ok?'PASS checkout-auth semantics are idempotent':'FAIL idempotency');if(!ok)fail++;
root.note=null;ok=a.sync()===true&&action.attrs['aria-describedby']==='existing-help';
console.log(ok?'PASS sign-in removes only NOREYO auth description token':'FAIL unlock '+JSON.stringify(action.attrs));if(!ok)fail++;
process.exit(fail?1:0);
