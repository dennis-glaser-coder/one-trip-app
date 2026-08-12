const fs=require('fs');
const guard=fs.readFileSync('./noreyo-v1198.js','utf8');
const listed=new Set([...guard.matchAll(/'NOREYO_V(\d+)'/g)].map(m=>`noreyo-v${m[1]}.js`));
const offenders=[];
const destructiveCleanup=(s)=>{
  const mutatesFetch=/window\.fetch\s*=/.test(s);
  const registersCleanup=/addEventListener\(\s*['"]pagehide['"]\s*,\s*cleanup(?:\s*[,)]|\s*\))/m.test(s);
  const cleanupNullsPrior=/function\s+cleanup\s*\([^)]*\)\s*\{[\s\S]{0,1200}?priorFetch\s*=\s*null\s*;/m.test(s);
  return mutatesFetch&&registersCleanup&&cleanupNullsPrior;
};
for(const name of fs.readdirSync('.').filter(n=>/^noreyo-v\d+\.js$/.test(n))){
  if(name==='noreyo-v1198.js')continue;
  const s=fs.readFileSync(name,'utf8');
  if(destructiveCleanup(s)&&!listed.has(name))offenders.push(name);
}
const ok=offenders.length===0;
console.log(ok?'PASS V11.98 covers every legacy fetch wrapper with destructive pagehide cleanup':'FAIL uncovered BFCache fetch cleanup wrappers: '+offenders.join(', '));
process.exit(ok?0:1);