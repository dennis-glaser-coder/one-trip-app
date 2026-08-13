const fs=require('fs'),vm=require('vm');
const code=fs.readFileSync('./noreyo-v878.js','utf8');
const searchState={adults:2,childAges:[]};
const api={plan(text,before){if(text==='wir sind 3, davon 1 Kind 5 Jahre')return{adults:2,childAges:[5]};if(text==='wir sind 4, davon 2 Kinder 3 und 7 Jahre')return{adults:2,childAges:[3,7]};return null;},apply(next){searchState.adults=next.adults;searchState.childAges=next.childAges.slice();return true}};
const ctx={console,Math,Number,Array,Object,window:{addEventListener(){},NOREYO_V798:api},document:{addEventListener(){},getElementById(){return null}},searchState,setTimeout,clearTimeout};
vm.createContext(ctx);vm.runInContext(code,ctx);const a=ctx.window.NOREYO_V878;
let fail=0;
const old=a.schedule('wir sind 3, davon 1 Kind 5 Jahre',{adults:2,childAges:[]});const latest=a.schedule('wir sind 4, davon 2 Kinder 3 und 7 Jahre',{adults:2,childAges:[]});const stale=a.applyLatest('wir sind 3, davon 1 Kind 5 Jahre',{adults:2,childAges:[]},old)===false;console.log(stale?'PASS stale traveller generation rejected':'FAIL stale');if(!stale)fail++;
setTimeout(()=>{const ok=searchState.adults===2&&JSON.stringify(searchState.childAges)==='[3,7]';console.log(ok?'PASS newest traveller intent wins after older atomic timers':'FAIL '+JSON.stringify(searchState));if(!ok)fail++;process.exit(fail?1:0);},170);