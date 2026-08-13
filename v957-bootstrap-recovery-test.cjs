const fs=require('fs'),vm=require('vm');
const code=fs.readFileSync('./noreyo-bootstrap-v957.js','utf8');
let reloads=0,focused=0;
function mk(){return{style:{},attrs:{},children:[],textContent:'',onload:null,onerror:null,setAttribute(k,v){this.attrs[k]=String(v)},querySelector(){return this.children.find(x=>x.attrs?.['data-noreyo-v957-retry']==='1')||null},appendChild(x){this.children.push(x)},addEventListener(type,fn){if(type==='click')this.onclick=fn},focus(){focused++},remove(){}}}
const status=mk(),bar=mk(),box=mk();
const document={getElementById(id){return id==='status'?status:id==='bar'?bar:id==='error'?box:null},createElement(){return mk()},head:{appendChild(s){queueMicrotask(()=>s.onerror?.())}}};
const ctx={console,document,window:{},location:{reload(){reloads++}},Promise,Object,String,Error,Date,queueMicrotask,setTimeout,clearTimeout};
vm.createContext(ctx);vm.runInContext(code,ctx);
setTimeout(()=>{const api=ctx.window.NOREYO_V957,button=box.children.find(x=>x.attrs?.['data-noreyo-v957-retry']==='1');let fail=0;const checks=[[api?.BUILD==='9.57-safe'&&api.state().status==='failed','inner failure reaches failed state'],[box.style.display==='block'&&box.attrs.role==='alert'&&box.attrs['aria-live']==='assertive','failure is accessible'],[button?.textContent==='Erneut versuchen'&&focused===1,'retry CTA is rendered and focused']];for(const[c,n]of checks){console.log((c?'PASS ':'FAIL ')+n);if(!c)fail++}button?.onclick?.();const reloadOk=reloads===1;console.log((reloadOk?'PASS ':'FAIL ')+'retry CTA reloads app');if(!reloadOk)fail++;process.exit(fail?1:0)},900);