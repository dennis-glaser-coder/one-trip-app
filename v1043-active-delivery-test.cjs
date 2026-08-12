const fs=require('fs');
const path=require('path');

const root=process.cwd();
const index=fs.readFileSync(path.join(root,'index.html'),'utf8');
const activeMatch=[...index.matchAll(/noreyo-bootstrap-v(\d+)\.js\?build=(\d+)/g)].at(-1);
if(!activeMatch){
  console.error('FAIL no active bootstrap reference in index.html');
  process.exit(1);
}
const active=Number(activeMatch[1]);
if(Number(activeMatch[2])!==active){
  console.error(`FAIL active bootstrap/build mismatch: v${active} vs build=${activeMatch[2]}`);
  process.exit(1);
}

const tested=[];
for(const name of fs.readdirSync(root)){
  const m=name.match(/^noreyo-bootstrap-v(\d+)\.js$/);
  if(!m)continue;
  const version=Number(m[1]);
  if(fs.existsSync(path.join(root,`v${version}-bootstrap-test.cjs`)))tested.push(version);
}
if(!tested.length){
  console.error('FAIL no tested bootstrap deliveries found');
  process.exit(1);
}
const latest=Math.max(...tested);
if(active!==latest){
  console.error(`FAIL index activates v${active}, but latest tested delivery is v${latest}`);
  process.exit(1);
}
console.log(`PASS index activates latest tested delivery v${active}`);
