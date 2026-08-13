const fs=require('fs'),vm=require('vm');const code=fs.readFileSync('./noreyo-v1238.js','utf8');
function E(sel){this.sel=sel;this.a={};this.clicked=0;this.disabled=false;this.scope=null;}
E.prototype.getAttribute=function(k){return this.a[k]??null};E.prototype.setAttribute=function(k,v){this.a[k]=String(v)};E.prototype.matches=function(s){return s===this.sel};E.prototype.closest=function(){return this.scope};E.prototype.click=function(){this.clicked++};
const input=new E('.noreyo-v1162-email'),button=new E('.noreyo-v1162-send');const scope={querySelector(s){return s==='.noreyo-v1162-send'?button:null}};input.scope=scope;
const document={body:null,querySelectorAll(s){return s==='.noreyo-v1162-email'?[input]:[]},addEventListener(){},removeEventListener(){}};
const ctx={console,Object,window:{addEventListener(){}},document,MutationObserver:function(){this.observe=()=>{};this.disconnect=()=>{}},requestAnimationFrame(){return 1},cancelAnimationFrame(){}};
vm.createContext(ctx);vm.runInContext(code,ctx);const a=ctx.window.NOREYO_V1238;let fail=0;
let ok=a.enhance()&&input.a.enterkeyhint==='send'&&input.a.autocapitalize==='none'&&input.a.spellcheck==='false';console.log(ok?'PASS auth email gets iPhone send keyboard hints':'FAIL hints');if(!ok)fail++;
let prevented=0,stopped=0;a.onKey({key:'Enter',isComposing:false,target:input,preventDefault(){prevented++},stopPropagation(){stopped++}});ok=button.clicked===1&&prevented===1&&stopped===1;console.log(ok?'PASS Enter activates existing profile magic-link send button once':'FAIL enter');if(!ok)fail++;
button.disabled=true;a.onKey({key:'Enter',isComposing:false,target:input,preventDefault(){prevented++},stopPropagation(){stopped++}});ok=button.clicked===1;console.log(ok?'PASS disabled send button cannot be re-triggered from keyboard':'FAIL disabled');if(!ok)fail++;
button.disabled=false;a.onKey({key:'Enter',isComposing:true,target:input,preventDefault(){},stopPropagation(){}});ok=button.clicked===1;console.log(ok?'PASS IME composition Enter is ignored':'FAIL composition');if(!ok)fail++;
process.exit(fail?1:0);