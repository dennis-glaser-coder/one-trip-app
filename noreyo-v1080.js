/* NOREYO V10.80 — semantic hotel/package search serialization.
   V10.50 compares airports and child ages in UI order. Reordering the same selected
   airports or the same child-age multiset can therefore enqueue a redundant provider
   search even though the hotel/package intent is identical. Replace only the serializer
   wrapper with a canonical signature while preserving manual refresh after completion. */
(function(){
'use strict';
const BUILD='10.80';
let active=null,activeSig='',pending=null,installed=false;
const current=window.searchTrips;
const prior=(current&&current.__noreyoV1050Prior)||(current&&current.__noreyoV982Prior)||(current&&current.__noreyoV918Prior)||current;
function stableObject(value){if(!value||typeof value!=='object')return value;if(Array.isArray(value))return value.map(stableObject);const out={};for(const key of Object.keys(value).sort())out[key]=stableObject(value[key]);return out;}
function canonicalAirports(values){return [...new Set((Array.isArray(values)?values:[]).map(x=>String(x||'').trim().toUpperCase()).filter(x=>/^[A-Z]{3}$/.test(x)))].sort();}
function canonicalChildren(values){return (Array.isArray(values)?values:[]).map(Number).filter(Number.isFinite).sort((a,b)=>a-b);}
function snapshot(){try{const s=typeof searchState!=='undefined'?searchState:{},st=typeof states!=='undefined'?states:{},lim=typeof limits!=='undefined'?limits:{},ex=typeof excluded!=='undefined'?excluded:null;return{mode:typeof productMode!=='undefined'?productMode:'',dest:typeof dest!=='undefined'?String(dest||'').trim():'',hotel:typeof hotelQuery!=='undefined'?String(hotelQuery||'').trim():'',airports:canonicalAirports(s?.airports),checkin:String(s?.checkin||''),checkout:String(s?.checkout||''),adults:Number(s?.adults)||0,children:canonicalChildren(s?.childAges),meal:typeof mealPlanFilter!=='undefined'?mealPlanFilter:'',states:stableObject(st||{}),limits:stableObject(lim||{}),excluded:ex?.values?[...ex.values()].map(String).sort():[],confirmedOnly:typeof confirmedOnly!=='undefined'?!!confirmedOnly:false};}catch(_){return{fallback:String(Date.now())};}}
function signature(){return JSON.stringify(snapshot());}
function isFlightMode(){try{return String(productMode||'')==='flight';}catch(_){return false;}}
function settle(job,ok,value){if(!job||job.settled)return;job.settled=true;try{ok?job.resolve(value):job.reject(value);}catch(_){} }
function supersede(job){if(!job||job.settled)return false;settle(job,true,undefined);return true;}
function makeJob(thisArg,args,sig){let resolve,reject;const promise=new Promise((res,rej)=>{resolve=res;reject=rej;});return{thisArg,args,sig,promise,resolve,reject,settled:false};}
function drain(){active=null;activeSig='';const next=pending;pending=null;if(next)queueMicrotask(()=>launch(next));}
function launch(job){if(typeof prior!=='function'){const error=new Error('searchTrips unavailable');settle(job,false,error);return job?.promise||Promise.reject(error);}activeSig=job.sig;let result;try{result=Promise.resolve(prior.apply(job.thisArg,job.args));}catch(error){result=Promise.reject(error);}active=result.then(value=>{settle(job,true,value);return value;},error=>{settle(job,false,error);throw error;}).finally(drain);active.catch(()=>{});return job.promise||active;}
function install(){if(installed||typeof prior!=='function')return false;const wrapped=function(...args){if(isFlightMode())return prior.apply(this,args);const sig=signature();if(!active){const job=makeJob(this,args,sig);launch(job);return job.promise;}if(sig===activeSig)return active;if(pending&&pending.sig===sig)return pending.promise;if(pending)supersede(pending);pending=makeJob(this,args,sig);return pending.promise;};wrapped.__noreyoV1080=true;wrapped.__noreyoV1080Prior=prior;wrapped.__noreyoV1050Prior=prior;window.searchTrips=wrapped;installed=true;return true;}
install();window.addEventListener('pageshow',install,{passive:true});window.NOREYO_V1080=Object.freeze({BUILD,stableObject,canonicalAirports,canonicalChildren,snapshot,signature,isFlightMode,settle,supersede,makeJob,drain,launch,install,getState:()=>({active:!!active,activeSig,pendingSig:pending?.sig||''})});
})();