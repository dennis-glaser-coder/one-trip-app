const fs=require('fs'),vm=require('vm');const code=fs.readFileSync('./noreyo-v1244.js','utf8');
function E(text=''){this.textContent=text;this.map={};}
E.prototype.querySelector=function(s){return this.map[s]||null};
const score=new E('undefined'),label=new E('Bewertet'),top=new E();top.map={'.rating':score,'.detail-rating-copy b':label};
const reviewScore=new E('NaN'),reviewLabel=new E('Bewertet'),reviews=new E();reviews.map={'.review-detail-score':reviewScore,'.copy b':reviewLabel};
const root={querySelector(s){if(s.includes('saved-note'))return{};if(s==='.detail-rating')return top;if(s==='.review-detail-cta')return reviews;return null}};
const ctx={console,String,Number,Object,window:{addEventListener(){}},document:{body:null,getElementById(){return null}},MutationObserver:function(){this.observe=()=>{};this.disconnect=()=>{}},requestAnimationFrame(){return 1},cancelAnimationFrame(){},setTimeout(fn){fn()}};
vm.createContext(ctx);vm.runInContext(code,ctx);const a=ctx.window.NOREYO_V1244;let fail=0;
let ok=a.sync(root)&&score.textContent==='–'&&reviewScore.textContent==='–'&&label.textContent==='Bewertung nicht gespeichert'&&reviewLabel.textContent==='Bewertung nicht gespeichert';
console.log(ok?'PASS missing saved-snapshot ratings become explicit unknown state':'FAIL saved '+JSON.stringify({score:score.textContent,label:label.textContent,reviewScore:reviewScore.textContent,reviewLabel:reviewLabel.textContent}));if(!ok)fail++;
ok=a.sync(root)===false;console.log(ok?'PASS rating reconciliation is idempotent':'FAIL idempotent');if(!ok)fail++;
const valid=new E('8,7'),validLabel=new E('Sehr gut');ok=a.fixScore(valid,validLabel,false)===false&&valid.textContent==='8,7'&&validLabel.textContent==='Sehr gut';
console.log(ok?'PASS valid provider rating remains untouched':'FAIL valid');if(!ok)fail++;
const missing=new E(''),missingLabel=new E('Bewertet');a.fixScore(missing,missingLabel,false);ok=missing.textContent==='–'&&missingLabel.textContent==='Bewertung offen';
console.log(ok?'PASS live missing rating is not misrepresented as rated':'FAIL live missing');if(!ok)fail++;
process.exit(fail?1:0);