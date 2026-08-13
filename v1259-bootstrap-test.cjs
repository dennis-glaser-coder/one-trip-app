const fs=require('fs');
const code=fs.readFileSync('./noreyo-bootstrap-v1259.js','utf8');
const checks=[
  code.includes("BUILD='12.59-safe'"),
  code.includes("noreyo-v1258.js?build=1258"),
  code.includes("window.NOREYO_V1259"),
  code.includes("NOREYO_V1258?.BUILD==='12.58'")
];
if(checks.every(Boolean)){
  console.log('PASS V12.59 bootstrap includes tested V12.58 touch-floor delivery');
  process.exit(0);
}
console.error('FAIL V12.59 bootstrap contract');
process.exit(1);
