const fs=require('fs'),vm=require('vm');
const code=fs.readFileSync('./noreyo-bootstrap-v880.js','utf8');
let appended=[],innerLoads=0;
const innerState={status:'loading',error:null};
const builds={'865':['NOREYO_V865','8.65'],'867':['NOREYO_V867','8.67'],'870':['NOREYO_V870','8.70'],'872':['NOREYO_V872','8.72'],'874':['NOREYO_V874','8.74'],'876':['NOREYO_V876','8.76'],'878':['NOREYO_V878','8.78']};
const doc={getElementById(){return null},createElement(){return{src:'',onload:null,onerror:null,remove(){}}},head:{appendChild(s){appended.push(s.src);queueMicrotask(()=>{const id=s.src.match(/v(\d+)\.js/)?.[1];if(id==='864'){innerLoads++;ctx.window.NOREYO_V864={state(){return innerState}};s.onload?.();setTimeout(()=>innerState.status='ready',70);}else if(builds[id]){ctx.window[builds[id][0]]={BUILD:builds[id][1]};s.onload?.();}});}}};
const ctx={console,document:doc,window:{},Promise,Object,Error,Date,queueMicrotask,setTimeout,clearTimeout};
vm.createContext(ctx);vm.runInContext(code,ctx);
setTimeout(async()=>{const a=ctx.window.NOREYO_V880;await a.run();const expected=['v864','v865','v867','v870','v872','v874','v876','v878'];const order=expected.every((x,i)=>appended[i]?.includes(x));const noLegacyWrappers=!appended.some(x=>/v(866|868|869|871|873|875|877|879)\.js/.test(x));const ok=innerLoads===1&&order&&noLegacyWrappers&&a.state().status==='ready';console.log(ok?'PASS V8.80 consolidated active chain removes intermediate wrapper hops':'FAIL '+JSON.stringify({appended,innerLoads,state:a.state()}));process.exit(ok?0:1);},900);