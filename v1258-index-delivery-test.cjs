const fs=require('fs');
const html=fs.readFileSync('./index.html','utf8');
const ok=html.includes('<script src="./noreyo-v1258.js?build=1258"></script>')&&html.includes("const SRC='./noreyo-bootstrap-v1257.js?build=1257'");
console.log(ok?'PASS V12.58 touch layer is explicitly delivered alongside verified V12.57 bootstrap':'FAIL V12.58 index delivery');
process.exit(ok?0:1);
