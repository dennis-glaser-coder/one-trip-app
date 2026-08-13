const fs=require('fs'),vm=require('vm');
const code=fs.readFileSync(require('path').join(__dirname,'noreyo-v1144.js'),'utf8');
function Box(){this.attrs={'data-checkout-ready':'true'};this.p={textContent:'Tarif ist für den nächsten sicheren Buchungsschritt vorbereitet.'};}
Box.prototype.querySelector=function(s){return s==='p'?this.p:null};
Box.prototype.prepend=function(x){this.p=x};
Box.prototype.getAttribute=function(k){return this.attrs[k]??null};
Box.prototype.setAttribute=function(k,v){this.attrs[k]=String(v)};
const box=new Box();
const ctx={console,String,Object,window:{addEventListener(){},NOREYO_HOTEL_PREBOOK:{prebookId:'P1',offerId:'O1'},NOREYO_V1128:{priceReady(){return true},termsOwned(){return true},cancellationKind(){return'refundable'},cancellationAccepted(){return true},checkoutReady(){return false}},NOREYO_V1142:{complete(){return false}}},document:{body:null,querySelector(sel){return sel==='.noreyo-v1128-ready'?box:null},createElement(){return{textContent:''}}},MutationObserver:function(){this.observe=()=>{};this.disconnect=()=>{}},requestAnimationFrame(){return 1},cancelAnimationFrame(){}};
vm.createContext(ctx);vm.runInContext(code,ctx);const a=ctx.window.NOREYO_V1144;let fail=0;
let m=a.authoritative();let ok=m.ready===false&&m.reason==='revalidation-incomplete';console.log(ok?'PASS incomplete revalidation overrides stale ready UI':'FAIL model '+JSON.stringify(m));if(!ok)fail++;
a.render();ok=box.attrs['data-checkout-ready']==='false'&&box.p.textContent.includes('noch nicht vollständig')&&box.attrs['aria-live']==='polite';console.log(ok?'PASS visible checkout status reconciled to authoritative false gate':'FAIL render '+JSON.stringify({attrs:box.attrs,text:box.p.textContent}));if(!ok)fail++;
ctx.window.NOREYO_V1142.complete=()=>true;ctx.window.NOREYO_V1128.checkoutReady=()=>true;m=a.authoritative();ok=m.ready===true&&m.reason==='ready';console.log(ok?'PASS fully revalidated authoritative gate can become ready':'FAIL ready '+JSON.stringify(m));if(!ok)fail++;
a.render();ok=box.attrs['data-checkout-ready']==='true'&&box.p.textContent.includes('nächsten sicheren Buchungsschritt');console.log(ok?'PASS visible status returns to ready only when authoritative gate is ready':'FAIL ready render');if(!ok)fail++;
ctx.window.NOREYO_V1128.cancellationKind=()=> 'nonrefundable';ctx.window.NOREYO_V1128.cancellationAccepted=()=>true;ctx.window.NOREYO_V1134={isAccepted(){return false}};ctx.window.NOREYO_V1128.checkoutReady=()=>false;m=a.authoritative();ok=m.ready===false&&m.reason==='cancel-ack';console.log(ok?'PASS exact cancellation acknowledgement wins over legacy prebook-only acceptance':'FAIL cancel '+JSON.stringify(m));if(!ok)fail++;
process.exit(fail?1:0);