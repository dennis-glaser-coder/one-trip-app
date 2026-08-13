const fs=require('fs'),vm=require('vm');
const code=fs.readFileSync('noreyo-v882.js','utf8');
function parent(tag){return{tagName:tag}}
function text(value,tag='DIV'){return{nodeType:3,nodeValue:value,parentElement:parent(tag)}}
const metas=new Map([
 ['meta[name="application-name"]',{content:'ONE TRIP V5.27'}],
 ['meta[property="og:title"]',{content:'ONE TRIP Select'}]
]);
const document={
 title:'ONE TRIP V5.27 – Mobile Premium Travel App',
 documentElement:{},
 body:{},
 querySelector(sel){const data=metas.get(sel);if(!data)return null;return{getAttribute(){return data.content},setAttribute(k,v){data.content=v}}},
 createTreeWalker(){return{nextNode(){return null}}}
};
const ctx={console,String,Object,globalThis:null,document,window:{addEventListener(){}},NodeFilter:{SHOW_TEXT:4},
 MutationObserver:function(){this.observe=()=>{};this.disconnect=()=>{}},
 requestAnimationFrame(){return 1},cancelAnimationFrame(){}};
ctx.globalThis=ctx;
vm.createContext(ctx);vm.runInContext(code,ctx);
const a=ctx.window.NOREYO_V882;let fail=0;
const cases=[
 ['ONE TRIP','NOREYO'],
 ['ONE TRIP SELECT','NOREYO SELECT'],
 ['Flugsuche ist in ONE TRIP jetzt separat vorbereitet.','Flugsuche ist in NOREYO jetzt separat vorbereitet.'],
 ['NOREYO bleibt NOREYO','NOREYO bleibt NOREYO']
];
for(const [input,want] of cases){const got=a.rebrandText(input),ok=got===want;console.log((ok?'PASS ':'FAIL ')+input+' -> '+got);if(!ok)fail++;}
let n=text('ONE TRIP prüft dieses Hotel neu.');
let ok=a.rebrandTextNode(n)&&n.nodeValue==='NOREYO prüft dieses Hotel neu.';
console.log(ok?'PASS visible text node rebranded':'FAIL '+n.nodeValue);if(!ok)fail++;
n=text('ONE TRIP','SCRIPT');
ok=!a.rebrandTextNode(n)&&n.nodeValue==='ONE TRIP';
console.log(ok?'PASS script text is never rewritten':'FAIL script');if(!ok)fail++;
a.metadata();
ok=document.title==='NOREYO V5.27 – Mobile Premium Travel App'&&metas.get('meta[name="application-name"]').content==='NOREYO V5.27';
console.log(ok?'PASS document metadata remains NOREYO':'FAIL metadata');if(!ok)fail++;
if(fail)process.exit(1);