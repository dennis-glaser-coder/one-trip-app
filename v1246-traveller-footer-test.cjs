const fs=require('fs'),vm=require('vm');const code=fs.readFileSync('./noreyo-v1246.js','utf8');
function ClassList(items=[]){this.s=new Set(items)}
ClassList.prototype.contains=function(x){return this.s.has(x)};ClassList.prototype.add=function(x){this.s.add(x)};ClassList.prototype.remove=function(x){this.s.delete(x)};
function El(classes=[]){this.classList=new ClassList(classes);this.attrs={};this.children=[];this.disabled=false;this.textContent='';this.parent=null;this._className=classes.join(' ');}
Object.defineProperty(El.prototype,'className',{get(){return this._className},set(v){this._className=String(v);this.classList=new ClassList(String(v).split(/\s+/).filter(Boolean));}});
El.prototype.getAttribute=function(k){return this.attrs[k]??null};El.prototype.setAttribute=function(k,v){this.attrs[k]=String(v)};El.prototype.hasAttribute=function(k){return k in this.attrs};El.prototype.removeAttribute=function(k){delete this.attrs[k]};
El.prototype.appendChild=function(x){x.parent=this;this.children.push(x)};El.prototype.remove=function(){if(this.parent)this.parent.children=this.parent.children.filter(x=>x!==this)};
El.prototype.querySelector=function(sel){if(sel==='.planner-save')return this.source||null;if(sel==='.noreyo-v1246-traveller-footer')return this.children.find(x=>x.classList.contains('noreyo-v1246-traveller-footer'))||null;if(sel==='.noreyo-v1246-traveller-save')return this.children.find(x=>x.classList.contains('noreyo-v1246-traveller-save'))||null;return null;};
let sourceClicks=0;const src=new El(['planner-save']);src.click=()=>sourceClicks++;
const body=new El();body.source=src;const sheet=new El(['show']);const title={textContent:'Reisende'};let plannerMode='travellers',styleNode=null;
const document={head:{appendChild(x){styleNode=x}},getElementById(id){if(id==='plannerSheet')return sheet;if(id==='plannerBody')return body;if(id==='plannerTitle')return title;if(id==='noreyo-v1246-traveller-footer-style')return styleNode;return null},createElement(){return new El()},addEventListener(){},removeEventListener(){}};
const ctx={console,document,plannerMode,window:{addEventListener(){}},MutationObserver:function(){this.observe=()=>{};this.disconnect=()=>{}},requestAnimationFrame(){return 1},cancelAnimationFrame(){}};
vm.createContext(ctx);vm.runInContext(code,ctx);const a=ctx.window.NOREYO_V1246;let fail=0;
let ok=a.openTravellers()===true;console.log(ok?'PASS traveller planner detected':'FAIL detect');if(!ok)fail++;
a.ensure();const footer=sheet.querySelector('.noreyo-v1246-traveller-footer');
ok=!!footer&&body.classList.contains('noreyo-v1246-traveller-body')&&src.classList.contains('noreyo-v1246-source')&&src.attrs['aria-hidden']==='true'&&src.attrs.tabindex==='-1';
console.log(ok?'PASS traveller footer mirrors and hides source action accessibly':'FAIL ensure');if(!ok)fail++;
const btn=footer?.querySelector('.noreyo-v1246-traveller-save');a.onClick({target:{closest(){return btn}},preventDefault(){},stopPropagation(){}});
ok=sourceClicks===1;console.log(ok?'PASS mirrored traveller save delegates to original transaction-aware action':'FAIL delegate');if(!ok)fail++;
a.removeFooter();ok=!body.classList.contains('noreyo-v1246-traveller-body')&&!src.classList.contains('noreyo-v1246-source')&&!src.hasAttribute('aria-hidden');
console.log(ok?'PASS footer cleanup restores original save semantics':'FAIL restore');if(!ok)fail++;
process.exit(fail?1:0);