/* NOREYO V8.72 — canonical occupancy payload before legacy transport sanitizers.
   Converts validated child-age objects/aliases to numeric children arrays so
   older transport layers cannot turn {age:5} into NaN via Number(object). */
(function(){
'use strict';
const BUILD='8.72';
function inputUrl(input){if(typeof input==='string')return input;try{if(typeof Request!=='undefined'&&input instanceof Request)return input.url||'';}catch(_){}return String(input?.url||'');}
function isSearchTravel(input){return inputUrl(input).includes('/functions/v1/search-travel');}
function parse(text){if(typeof text!=='string'||!text.trim())return null;try{return JSON.parse(text);}catch(_){return null;}}
async function body(input,init){if(typeof init?.body==='string')return parse(init.body);try{if(typeof Request!=='undefined'&&input instanceof Request&&!input.bodyUsed)return parse(await input.clone().text());}catch(_){}return null;}
function flight(raw){return String(raw?.action||'').trim().toLowerCase()==='flight';}
function strictInt(v){if(typeof v==='number')return Number.isInteger(v)&&Number.isFinite(v)?v:null;if(typeof v!=='string')return null;const s=v.trim();if(!/^-?\d+$/.test(s))return null;const n=Number(s);return Number.isSafeInteger(n)?n:null;}
function hasOwn(o,k){return !!o&&Object.prototype.hasOwnProperty.call(o,k);}
function ageValue(v){if(v&&typeof v==='object'&&!Array.isArray(v)){if(!hasOwn(v,'age'))return null;return strictInt(v.age);}return strictInt(v);}
function ages(arr){return Array.isArray(arr)?arr.map(ageValue):null;}
function same(a,b){return Array.isArray(a)&&Array.isArray(b)&&a.length===b.length&&a.every((v,i)=>v===b[i]);}
function canonicalOccupancy(occ){if(!occ||typeof occ!=='object'||Array.isArray(occ))return null;const children=hasOwn(occ,'children')?ages(occ.children):null;const childAges=hasOwn(occ,'childAges')?ages(occ.childAges):null;if(children&&children.some(v=>v===null))return null;if(childAges&&childAges.some(v=>v===null))return null;if(children&&childAges&&!same(children,childAges))return null;const out={...occ};const adult=strictInt(occ.adults);if(adult!==null)out.adults=adult;if(children||childAges)out.children=(children||childAges).slice();delete out.childAges;return out;}
function canonical(raw){if(!raw||typeof raw!=='object'||flight(raw)||!Array.isArray(raw.occupancies))return null;const occupancies=[];for(const occ of raw.occupancies){const c=canonicalOccupancy(occ);if(!c)return null;occupancies.push(c);}return{...raw,occupancies};}
function headersFor(input,init){try{if(init?.headers)return new Headers(init.headers);if(typeof Request!=='undefined'&&input instanceof Request)return new Headers(input.headers);}catch(_){}return new Headers();}
function requestArgs(input,init,raw){const headers=headersFor(input,init);if(!headers.has('content-type'))headers.set('content-type','application/json');const options={...(init||{}),headers,body:JSON.stringify(raw)};try{if(typeof Request!=='undefined'&&input instanceof Request)return[new Request(input,options),undefined];}catch(_){}return[input,options];}
function install(){try{if(typeof window.fetch!=='function'||window.fetch.__noreyoV872)return false;const prior=window.fetch.bind(window);const wrapped=async function(input,init){if(!isSearchTravel(input))return prior(input,init);const raw=await body(input,init);if(!raw)return prior(input,init);const clean=canonical(raw);if(!clean)return prior(input,init);const [nextInput,nextInit]=requestArgs(input,init,clean);return nextInit===undefined?prior(nextInput):prior(nextInput,nextInit);};wrapped.__noreyoV872=true;window.fetch=wrapped;return true;}catch(_){return false;}}
install();window.addEventListener('pageshow',install,{passive:true});window.NOREYO_V872=Object.freeze({BUILD,inputUrl,isSearchTravel,parse,body,flight,strictInt,hasOwn,ageValue,ages,same,canonicalOccupancy,canonical,headersFor,requestArgs,install});
})();