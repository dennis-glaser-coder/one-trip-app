const fs=require('fs'),vm=require('vm');const code=fs.readFileSync('./noreyo-v1034.js','utf8');
function El(){this.attrs={};this.dataset={};this.disabled=false;this.textContent='Angebot auswählen';this.map={};}
El.prototype.setAttribute=function(k,v){this.attrs[k]=String(v)};El.prototype.querySelector=function(s){return this.map[s]||null};El.prototype.querySelectorAll=function(s){return s==='.noreyo-v943-offer'?(this.cards||[]):[]};El.prototype.insertBefore=function(x){this.note=x};El.prototype.appendChild=function(x){this.note=x};El.prototype.remove=function(){this.removed=true};
const btn=new El(),card=new El();card.dataset.flightOfferIndex='0';card.map['.noreyo-v943-select']=btn;
const body=new El();body.cards=[card];body.__noreyoV943Offers=[{expiration:'2099-01-01'}];body.firstElementChild={};body.map['.noreyo-v1034-note']=null;
const sheet={classList:{contains(){return true}}},title={textContent:'Flüge'};
const ctx={console,Object,Array,String,Number,Set,excluded:new Set(['Nachtflug']),limits:{maxFlightMinutes:480},window:{addEventListener(){},NOREYO_V994:{expired(){return false}}},document:{getElementById(id){return id==='plannerBody'?body:id==='plannerSheet'?sheet:id==='plannerTitle'?title:null},createElement(){return new El()}},MutationObserver:function(){this.observe=()=>{};this.disconnect=()=>{}},requestAnimationFrame(){return 1},cancelAnimationFrame(){}};
vm.createContext(ctx);vm.runInContext(code,ctx);const a=ctx.window.NOREYO_V1034;let fail=0;
let items=a.activeConstraints(),ok=JSON.stringify(items)==='["Nachtflug"]';console.log(ok?'PASS flight exclusion recognized as hard constraint':'FAIL '+JSON.stringify(items));if(!ok)fail++;
a.sync();ok=btn.disabled===true&&btn.textContent==='Harte Fluggrenze nicht verifiziert';console.log(ok?'PASS unverified hard exclusion blocks selection':'FAIL block');if(!ok)fail++;
ctx.excluded.clear();ctx.limits.maxFlightMinutes=240;items=a.activeConstraints();ok=items.length===1&&/4:00/.test(items[0]);console.log(ok?'PASS max-flight-time limit recognized':'FAIL max '+JSON.stringify(items));if(!ok)fail++;
ctx.limits.maxFlightMinutes=480;a.sync();ok=btn.disabled===false&&btn.textContent==='Angebot auswählen';console.log(ok?'PASS clearing hard constraint restores own-disabled button':'FAIL restore');if(!ok)fail++;
ctx.excluded.add('Getrennte Tickets');a.sync();btn.dataset.noreyoV1008Must='1';ctx.excluded.clear();a.sync();ok=btn.disabled===true;console.log(ok?'PASS restore preserves other flight blockers':'FAIL preserve');if(!ok)fail++;
process.exit(fail?1:0);