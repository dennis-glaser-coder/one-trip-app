const fs=require('fs'),vm=require('vm');
const code=fs.readFileSync('noreyo-v927.js','utf8');
class El{
 constructor(){this.attrs={};this.dataset={};this.listeners={};this.children={};this.classList={contains:()=>false};this.textContent='';this.clicked=0;}
 getAttribute(k){return this.attrs[k]??null} setAttribute(k,v){this.attrs[k]=String(v)} addEventListener(k,fn){this.listeners[k]=fn} click(){this.clicked++}
 querySelector(sel){return this.children[sel]||null} closest(sel){return sel==='button'&&this.tag==='button'?this:null}
}
const open=new El(),heart=new El(),name=new El(),offer=new El();name.textContent='Hotel Test';heart.tag='button';heart.classList={contains:c=>c==='on'};offer.children['.offer-img']=open;offer.children['.heart-btn']=heart;offer.children['.hotel-name']=name;
const ctx={console,Object,String,window:{addEventListener(){}},document:{body:null,querySelectorAll(){return[]}},MutationObserver:function(){this.observe=()=>{};this.disconnect=()=>{}},requestAnimationFrame(){return 1},cancelAnimationFrame(){}};
vm.createContext(ctx);vm.runInContext(code,ctx);const a=ctx.window.NOREYO_V927;let fail=0;
let changed=a.enhanceOffer(offer);let ok=changed&&open.attrs.role==='button'&&open.attrs.tabindex==='0'&&open.attrs['aria-label']==='Hotel Test öffnen';console.log(ok?'PASS result image becomes keyboard-openable':'FAIL open attrs');if(!ok)fail++;
let prevented=0;open.listeners.keydown({key:'Enter',target:open,preventDefault(){prevented++}});ok=open.clicked===1&&prevented===1;console.log(ok?'PASS Enter opens hotel detail':'FAIL enter');if(!ok)fail++;
ok=heart.attrs.type==='button'&&heart.attrs['aria-pressed']==='true'&&heart.attrs['aria-label']==='Aus Favoriten entfernen';console.log(ok?'PASS favorite button exposes pressed state':'FAIL favorite');if(!ok)fail++;
heart.classList={contains:()=>false};a.enhanceOffer(offer);ok=heart.attrs['aria-pressed']==='false'&&heart.attrs['aria-label']==='Zu Favoriten hinzufügen';console.log(ok?'PASS favorite accessibility follows toggled state':'FAIL toggle');if(!ok)fail++;
process.exit(fail?1:0);