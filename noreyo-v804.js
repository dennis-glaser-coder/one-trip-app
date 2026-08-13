/* NOREYO V8.04 — transient-safe site.zip bootstrap fetch.
   Retries only startup package network failures and retryable 5xx/429 responses.
   Permanent 4xx and caller aborts remain authoritative. */
(function(){
'use strict';
const BUILD='8.04',MAX_ATTEMPTS=2,RETRY_DELAY_MS=250;
function urlOf(input){if(typeof input==='string')return input;try{if(typeof Request!=='undefined'&&input instanceof Request)return input.url||'';}catch(_){}return String(input?.url||'');}
function isSiteZip(input){const u=urlOf(input);return /(?:^|\/)site\.zip(?:\?|$)/i.test(u);}
function aborted(input,init){try{if(init?.signal?.aborted)return true;if(typeof Request!=='undefined'&&input instanceof Request&&input.signal?.aborted)return true;}catch(_){}return false;}
function retryStatus(status){const n=Number(status);return n===408||n===425||n===429||(n>=500&&n<=599);}
function delay(ms){return new Promise(resolve=>setTimeout(resolve,ms));}
function cloneInput(input){try{if(typeof Request!=='undefined'&&input instanceof Request)return input.clone();}catch(_){}return input;}
function install(){try{if(typeof window.fetch!=='function'||window.fetch.__noreyoV804)return false;const prior=window.fetch.bind(window);const wrapped=async function(input,init){if(!isSiteZip(input))return prior(input,init);let lastError=null,lastResponse=null;for(let attempt=1;attempt<=MAX_ATTEMPTS;attempt++){if(aborted(input,init)){if(lastError)throw lastError;return prior(input,init);}try{const req=attempt===1?input:cloneInput(input);const response=await prior(req,init);lastResponse=response;if(response?.ok||!retryStatus(response?.status)||attempt>=MAX_ATTEMPTS)return response;}catch(error){lastError=error;if(aborted(input,init)||attempt>=MAX_ATTEMPTS)throw error;}await delay(RETRY_DELAY_MS);}if(lastResponse)return lastResponse;throw lastError||new Error('site.zip konnte nicht geladen werden');};wrapped.__noreyoV804=true;window.fetch=wrapped;return true;}catch(_){return false;}}
install();
window.NOREYO_V804=Object.freeze({BUILD,MAX_ATTEMPTS,RETRY_DELAY_MS,urlOf,isSiteZip,aborted,retryStatus,install});
})();