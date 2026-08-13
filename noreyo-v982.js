/* NOREYO V9.82 — settle superseded queued hotel/package searches.
   V9.18 correctly keeps only the latest queued intent, but replacing an older
   pending intent leaves that older promise unresolved forever. Replace the V9.18
   wrapper with equivalent serialization that explicitly resolves superseded jobs. */
(function(){
'use strict';
const BUILD='9.82';
let installed=false,active=null,activeSig='',pending=null;
const legacy=window.NOREYO_V918;
const prior=(window.searchTrips&&window.searchTrips.__noreyoV918Prior)||window.searchTrips;
function signature(){try{return legacy?.signature?.()||JSON.stringify({mode:typeof productMode!=='undefined'?productMode:'',dest:typeof dest!=='undefined'?dest:'',hotel:typeof hotelQuery!=='undefined'?hotelQuery:'',search:typeof searchState!=='undefined'?searchState:null});}catch(_){return String(Date.now());}}
function isFlightMode(){try{return legacy?.isFlightMode?.()??(String(productMode||'')==='flight');}catch(_){return false;}}
function supersede(job){if(!job||job.settled)return false;job.settled=true;try{job.resolve?.(undefined);}catch(_){}return true;}
function settle(job,ok,value){if(!job||job.settled)return;job.settled=true;try{ok?job.resolve?.(value):job.reject?.(value);}catch(_){}}
function drain(){active=null;activeSig='';const next=pending;pending=null;if(next)queueMicrotask(()=>launch(next));}
function launch(job){if(typeof prior!=='function'){const error=new Error('searchTrips unavailable');settle(job,false,error);return job?.promise||Promise.reject(error);}activeSig=job.sig;let result;try{result=Promise.resolve(prior.apply(job.thisArg,job.args));}catch(error){result=Promise.reject(error);}active=result.then(value=>{settle(job,true,value);return value;},error=>{settle(job,false,error);throw error;}).finally(drain);active.catch(()=>{});return job.promise||active;}
function makeJob(thisArg,args,sig){let resolve,reject;const promise=new Promise((res,rej)=>{resolve=res;reject=rej});return{thisArg,args,sig,promise,resolve,reject,settled:false};}
function install(){if(installed||typeof prior!=='function')return false;const wrapped=function(...args){if(isFlightMode())return prior.apply(this,args);const sig=signature();if(!active){const job=makeJob(this,args,sig);launch(job);return job.promise;}if(sig===activeSig)return active;if(pending&&pending.sig===sig)return pending.promise;if(pending)supersede(pending);pending=makeJob(this,args,sig);return pending.promise;};wrapped.__noreyoV982=true;wrapped.__noreyoV982Prior=prior;window.searchTrips=wrapped;installed=true;return true;}
install();window.addEventListener('pageshow',install,{passive:true});window.NOREYO_V982=Object.freeze({BUILD,signature,isFlightMode,supersede,settle,drain,launch,makeJob,install,getState:()=>({active:!!active,activeSig,pendingSig:pending?.sig||'',pendingSettled:pending?.settled??null})});
})();