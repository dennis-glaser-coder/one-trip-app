const fs=require('fs'),vm=require('vm');const code=fs.readFileSync('./noreyo-v1228.js','utf8');
function Btn(){this.dataset={};this.disabled=false;this.attrs={};this.root=null;}
Btn.prototype.closest=function(sel){return sel.includes('.noreyo-v1106-action')?this:sel.includes('.noreyo-v1106-prebook')?this.root:null};Btn.prototype.setAttribute=function(k,v){this.attrs[k]=String(v)};
const btn=new Btn(),note={textContent:'',hidden:false,setAttribute(){}};const root={querySelector(sel){return sel==='.noreyo-v1228-block-status'?this.note:null},appendChild(x){this.note=x}};btn.root=root;
let prevented=0,stopped=0,immediate=0,listeners={};
const ctx={
  console,Object,
  window:{addEventListener(){}},
  document:{
    addEventListener(type,fn){listeners[type]=fn},
    removeEventListener(){},
    createElement(){return{textContent:'',hidden:false,setAttribute(){}}}
  }
};
vm.createContext(ctx);vm.runInContext(code,ctx);const a=ctx.window.NOREYO_V1228;let fail=0;
function evt(){return{target:btn,preventDefault(){prevented++},stopPropagation(){stopped++},stopImmediatePropagation(){immediate++}}}
btn.dataset.noreyoV1202Auth='1';a.onClick(evt());let ok=prevented===1&&stopped===1&&immediate===1&&btn.disabled===true&&btn.attrs['aria-disabled']==='true'&&root.note?.textContent.includes('melde dich');console.log(ok?'PASS auth marker synchronously blocks PREBOOK click':'FAIL auth');if(!ok)fail++;
delete btn.dataset.noreyoV1202Auth;btn.dataset.noreyoV1200Must='1';btn.disabled=false;a.onClick(evt());ok=prevented===2&&btn.disabled&&root.note.textContent.includes('Pflichtkriterien');console.log(ok?'PASS MUST marker synchronously blocks PREBOOK click':'FAIL must');if(!ok)fail++;
delete btn.dataset.noreyoV1200Must;btn.disabled=false;a.onClick(evt());ok=prevented===2&&btn.disabled===false;console.log(ok?'PASS unblocked PREBOOK click passes untouched':'FAIL open');if(!ok)fail++;
process.exit(fail?1:0);