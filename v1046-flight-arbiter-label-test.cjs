const fs=require('fs'),vm=require('vm');
const code=fs.readFileSync('./noreyo-v1046.js','utf8');
function Btn(text){this.textContent=text;this.disabled=false;this.dataset={};}
const ctx={console,Object,String,Array,window:{addEventListener(){}},document:{getElementById(){return null}},MutationObserver:function(){this.observe=()=>{};this.disconnect=()=>{}},requestAnimationFrame(){return 1},cancelAnimationFrame(){}};
vm.createContext(ctx);vm.runInContext(code,ctx);const api=ctx.window.NOREYO_V1046;let fail=0;
let btn=new Btn('Harte Fluggrenze nicht verifiziert');btn.dataset.noreyoV1042Arbiter='1';btn.dataset.noreyoV1042Original='Harte Fluggrenze nicht verifiziert';let ok=api.repairButton(btn)===true&&btn.dataset.noreyoV1042Original==='Angebot auswählen'&&btn.textContent==='Harte Fluggrenze nicht verifiziert';console.log(ok?'PASS arbiter snapshot is normalized without clearing active blocker':'FAIL active snapshot');if(!ok)fail++;
btn=new Btn('Pflichtkriterium nicht verifiziert');btn.disabled=false;ok=api.repairButton(btn)===true&&btn.textContent==='Angebot auswählen';console.log(ok?'PASS enabled button cannot retain stale blocker copy':'FAIL unlocked copy');if(!ok)fail++;
btn=new Btn('Pflichtkriterium Gepäck nicht bestätigt');btn.disabled=true;btn.dataset.noreyoV1004Bag='1';ok=api.repairButton(btn)===false&&btn.textContent==='Pflichtkriterium Gepäck nicht bestätigt';console.log(ok?'PASS active baggage blocker copy is preserved':'FAIL baggage');if(!ok)fail++;
btn=new Btn('Angebot auswählen');ok=api.repairButton(btn)===false;console.log(ok?'PASS normal selectable button remains untouched':'FAIL normal');if(!ok)fail++;
process.exit(fail?1:0);