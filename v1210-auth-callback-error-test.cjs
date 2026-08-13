const fs=require('fs'),vm=require('vm');
const code=fs.readFileSync('./noreyo-v1210.js','utf8');
function El(){this.textContent='';this.attrs={};}
El.prototype.getAttribute=function(k){return this.attrs[k]??null};
El.prototype.setAttribute=function(k,v){this.attrs[k]=String(v)};
const profile=new El(),checkout=new El();
let replaced='';
const ctx={
 console,String,Object,URLSearchParams,
 location:{hash:'#error=access_denied&error_description=raw-provider-secret-ish-text',pathname:'/app',search:'?x=1'},
 history:{replaceState(_a,_b,u){replaced=u;ctx.location.hash=''}},
 window:{addEventListener(){}},
 document:{body:null,querySelector(sel){return sel==='.noreyo-v1162-status'?profile:sel==='.noreyo-v1158-status'?checkout:null}},
 MutationObserver:function(){this.observe=()=>{};this.disconnect=()=>{}},
 requestAnimationFrame(){return 1},cancelAnimationFrame(){}
};
vm.createContext(ctx);vm.runInContext(code,ctx);const a=ctx.window.NOREYO_V1210;let fail=0;
let ok=a.message.includes('abgelaufen')&&replaced==='/app?x=1'&&!ctx.location.hash;
console.log(ok?'PASS failed Magic-Link callback is consumed and hash removed':'FAIL consume '+JSON.stringify({message:a.message,replaced,hash:ctx.location.hash}));if(!ok)fail++;
a.render();
ok=profile.textContent.includes('abgelaufen')&&checkout.textContent.includes('abgelaufen')&&!profile.textContent.includes('raw-provider')&&profile.attrs.role==='alert'&&profile.attrs['aria-live']==='assertive';
console.log(ok?'PASS safe generic auth error is announced without raw provider text':'FAIL render '+JSON.stringify({profile:profile.textContent,attrs:profile.attrs}));if(!ok)fail++;
ok=a.safeMessage('something_weird').includes('nicht abgeschlossen')&&!a.safeMessage('something_weird').includes('something_weird');
console.log(ok?'PASS unknown provider auth errors remain generic':'FAIL generic');if(!ok)fail++;
a.clear();
ok=a.message===''&&profile.attrs.role==='status'&&profile.attrs['aria-live']==='polite';
console.log(ok?'PASS auth callback alert can return to normal polite status semantics':'FAIL clear');if(!ok)fail++;
process.exit(fail?1:0);