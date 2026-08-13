const fs=require('fs'),vm=require('vm');const code=fs.readFileSync('noreyo-v1126.js','utf8');
const ctx={console,String,Number,Array,Object,Date,window:{addEventListener(){}},document:{body:null},MutationObserver:function(){this.observe=()=>{};this.disconnect=()=>{}},requestAnimationFrame(){return 1},cancelAnimationFrame(){}};
vm.createContext(ctx);vm.runInContext(code,ctx);const a=ctx.window.NOREYO_V1126;let fail=0;
const cases=[
 [[{refundableTag:'RFN'}],'unknown','rules-missing'],
 [[{refundableTag:'RFN',cancelPolicyInfos:[{amount:100,cancelTime:''}]}],'unknown','positive-without-time'],
 [[{refundableTag:'RFN',cancelPolicyInfos:[{amount:0,cancelTime:''}]}],'refundable','all-free'],
 [[{refundableTag:'RFN',cancelPolicyInfos:[{amount:100,cancelTime:'2026-09-10T00:00:00Z'}]}],'refundable','dated-positive'],
 [[{refundableTag:'NRFN',cancelPolicyInfos:[]}],'nonrefundable','non-refundable']
];
for(const [list,kind,label] of cases){const got=a.safeSummary(list),ok=got.kind===kind;console.log((ok?'PASS ':'FAIL ')+label+' -> '+JSON.stringify(got));if(!ok)fail++;}
let s=a.safeSummary([{refundableTag:'RFN',cancelPolicyInfos:[{amount:100,cancelTime:'not-a-date'}]}]);
let ok=s.kind==='unknown'&&s.text.includes('Beginn');console.log(ok?'PASS invalid positive-fee timestamp is never presented as free':'FAIL invalid-time '+JSON.stringify(s));if(!ok)fail++;
ctx.window.NOREYO_HOTEL_PREBOOK_TERMS={offerId:'O1',prebookId:'P1',policies:[{refundableTag:'RFN'}],summary:{kind:'refundable',text:'old optimistic'}};
ok=a.reconcile()===true&&ctx.window.NOREYO_HOTEL_PREBOOK_TERMS.summary.kind==='unknown'&&ctx.window.NOREYO_HOTEL_PREBOOK_TERMS.prebookId==='P1';
console.log(ok?'PASS captured PREBOOK summary is corrected without losing session ownership':'FAIL reconcile');if(!ok)fail++;
process.exit(fail?1:0);