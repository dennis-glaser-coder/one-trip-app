const fs=require('fs'),vm=require('vm');const code=fs.readFileSync('noreyo-v970.js','utf8');
function B(classes=[],onclick=''){this.attrs={onclick};this.classList={contains:c=>classes.includes(c)}}
B.prototype.getAttribute=function(k){return this.attrs[k]??null};B.prototype.setAttribute=function(k,v){this.attrs[k]=String(v)};
const ctx={console,window:{addEventListener(){}},document:{body:null,querySelectorAll(){return[]}},MutationObserver:function(){this.observe=()=>{};this.disconnect=()=>{}},requestAnimationFrame(){return 1},cancelAnimationFrame(){}};
vm.createContext(ctx);vm.runInContext(code,ctx);const a=ctx.window.NOREYO_V970;let fail=0;
const cases=[[new B(['round'],"showToast('Keine neuen Hinweise')"),'Benachrichtigungen'],[new B(['round','avatar'],"go('profile')"),'Profil öffnen'],[new B(['ai'],"openFilter()"),'Filter öffnen'],[new B(['back'],"go('searchView')"),'Zurück zur Suche'],[new B(['close'],"closeFilter()"),'Filter schließen']];
for(const [b,want] of cases){const changed=a.enhanceButton(b),ok=changed&&b.attrs['aria-label']===want&&b.attrs.type==='button';console.log((ok?'PASS ':'FAIL ')+want+' -> '+JSON.stringify(b.attrs));if(!ok)fail++;}
const existing=new B(['ai'],"openFilter()");existing.attrs['aria-label']='Eigener Name';existing.attrs.type='button';let ok=a.enhanceButton(existing)===false&&existing.attrs['aria-label']==='Eigener Name';console.log(ok?'PASS existing accessible name preserved':'FAIL preserve');if(!ok)fail++;
process.exit(fail?1:0);