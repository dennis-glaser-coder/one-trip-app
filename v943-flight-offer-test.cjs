const fs=require('fs'),vm=require('vm');
const code=fs.readFileSync('noreyo-v943.js','utf8');
const ctx={console,String,Number,Object,Array,Date,Intl,Infinity,window:{NOREYO_V941:{requestOrigin(){}},addEventListener(){}},document:{addEventListener(){},removeEventListener(){},getElementById(){return null}},searchFlights(){},setTimeout(){}};
vm.createContext(ctx);vm.runInContext(code,ctx);const a=ctx.window.NOREYO_V943;let fail=0;
const payload={data:[{journey:{airlineName:'Air Test',duration:'2h 20m',offers:[
 {offerId:'AAA',pricing:{display:{total:199.99,currency:'EUR'}},baggage:{included:true},expiration:'2026-08-12T12:00:00Z',isCheapest:true},
 {offerId:'BBB',pricing:{display:{totalAmount:249,currency:'EUR'}},baggage:{included:false}}
]}},{offers:[{offerId:'AAA',price:999}]}]};
const rows=a.normalizedOffers('DUS','PMI',payload);
let ok=rows.length===2&&rows[0].offerId==='AAA'&&rows[0].price===199.99&&rows[0].baggageIncluded===true&&rows[0].airline==='Air Test';
console.log(ok?'PASS nested offers normalize and dedupe':'FAIL '+JSON.stringify(rows));if(!ok)fail++;
ok=a.sortOffers([{offerId:'x',price:300,isCheapest:false},{offerId:'y',price:400,isCheapest:true},{offerId:'z',price:200,isCheapest:false}]).map(x=>x.offerId).join(',')==='y,z,x';
console.log(ok?'PASS cheapest badge then price sorting':'FAIL sort');if(!ok)fail++;
ok=a.priceOf({pricing:{display:{total:0,currency:'EUR'}}})===0&&a.priceOf({pricing:{display:{total:'x'}}})===null;
console.log(ok?'PASS price parsing rejects invalid values':'FAIL price');if(!ok)fail++;
const body={innerHTML:'',__noreyoV943Offers:null};ctx.searchState={checkin:'2026-09-01',checkout:'2026-09-08'};ctx.fmtDateLong=x=>x;ctx.svg=()=>'';
a.render(body,'PMI',rows,[]);ok=/Angebot auswählen/.test(body.innerHTML)&&/Suchpreise sind live/.test(body.innerHTML)&&body.__noreyoV943Offers.length===2;
console.log(ok?'PASS selectable truthful result UI':'FAIL render');if(!ok)fail++;
const sel=a.selectionHTML(rows[0]);ok=/noch nicht verifiziert/.test(sel)&&/startet noch keine Zahlung oder Buchung/.test(sel);
console.log(ok?'PASS selection blocks false booking claim':'FAIL selection');if(!ok)fail++;
if(fail)process.exit(1);
