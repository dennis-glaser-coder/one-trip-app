/* NOREYO V11.42 — collision-free PREBOOK refresh + final-data reconciliation.
   V11.18's legacy URL matcher treats /hotel-prebook-status as /hotel-prebook.
   Route status calls through /hotel-checkout-status (same server contract), then
   reconcile the returned final price/cancellation policies into the active PREBOOK.
   Checkout remains locked unless the refreshed payload is complete for this prebookId. */
(function(){
'use strict';
const BUILD='11.42';
const LEGACY='/functions/v1/hotel-prebook-status',SAFE='/functions/v1/hotel-checkout-status';
let installed=false,priorFetch=null,observer=null,raf=0;
function inputUrl(input){if(typeof input==='string')return input;try{if(typeof Request!=='undefined'&&input instanceof Request)return input.url||'';}catch(_){}return String(input?.url||'');}
function isLegacyStatus(input){return inputUrl(input).includes(LEGACY);}
function rewrite(input){if(typeof input==='string')return input.replace(LEGACY,SAFE);try{if(typeof Request!=='undefined'&&input instanceof Request){const url=input.url.replace(LEGACY,SAFE);return new Request(url,input);}}catch(_){}return input;}
function finite(v){if(v===null||v===undefined||v==='')return null;const n=Number(v);return Number.isFinite(n)&&n>=0?n:null;}
function currency(v){const s=String(v||'').trim().toUpperCase();return /^[A-Z]{3}$/.test(s)?s:null;}
function policies(payload){const rooms=Array.isArray(payload?.data?.roomTypes)?payload.data.roomTypes:[];const out=[];for(const room of rooms)for(const rate of Array.isArray(room?.rates)?room.rates:[]){const p=rate?.cancellationPolicies;if(p&&typeof p==='object')out.push(p);}return out;}
function summary(list){try{return window.NOREYO_V1126?.safeSummary?.(list)||window.NOREYO_V1118?.summary?.(list)||{kind:'unknown',text:'Finale Stornierungsbedingungen nicht eindeutig bestätigt.'};}catch(_){return{kind:'unknown',text:'Finale Stornierungsbedingungen nicht eindeutig bestätigt.'};}}
function detailState(){return window.NOREYO_HOTEL_REVALIDATED_DETAILS||null;}
function clearDetailState(){if(!detailState())return false;try{delete window.NOREYO_HOTEL_REVALIDATED_DETAILS;}catch(_){window.NOREYO_HOTEL_REVALIDATED_DETAILS=undefined;}return true;}
function complete(){const s=window.NOREYO_HOTEL_PREBOOK,d=detailState();return !!s&&!!d&&d.complete===true&&String(d.prebookId||'')===String(s.prebookId||'');}
function capture(payload){const data=payload?.data,snap=window.NOREYO_HOTEL_PREBOOK;if(!data||!snap)return false;const pid=String(data.prebookId||'').trim();if(!pid||pid!==String(snap.prebookId||'').trim())return false;const p=finite(data.price),cur=currency(data.currency),list=policies(payload),terms=summary(list);const hasPrice=p!==null&&!!cur,hasTerms=list.length>0&&terms.kind!=='unknown';if(hasPrice)window.NOREYO_HOTEL_PREBOOK=Object.freeze({...snap,price:p,currency:cur});window.NOREYO_HOTEL_PREBOOK_TERMS=Object.freeze({offerId:String(snap.offerId||''),prebookId:pid,capturedAt:new Date().toISOString(),policies:list,summary:Object.freeze(terms)});window.NOREYO_HOTEL_REVALIDATED_DETAILS=Object.freeze({prebookId:pid,complete:hasPrice&&hasTerms,price:p,currency:cur,termsKind:String(terms.kind||'unknown'),capturedAt:new Date().toISOString()});try{window.NOREYO_V1118?.schedule?.();}catch(_){}try{window.NOREYO_V1132?.schedule?.();}catch(_){}try{window.NOREYO_V1134?.schedule?.();}catch(_){}return true;}
function patchGate(){const gate=window.NOREYO_V1128;if(!gate||gate.__noreyoV1142)return false;const priorReady=gate.checkoutReady;window.NOREYO_V1128=Object.freeze({...gate,__noreyoV1142:true,checkoutReady(){return !!priorReady?.()&&complete();}});return true;}
function installFetch(){if(installed||typeof window.fetch!=='function'||window.fetch.__noreyoV1142)return false;priorFetch=window.fetch.bind(window);const wrapped=async function(input,init){if(!isLegacyStatus(input))return priorFetch(input,init);const response=await priorFetch(rewrite(input),init);if(response?.ok){try{capture(await response.clone().json());}catch(_){}}else clearDetailState();return response;};wrapped.__noreyoV1142=true;wrapped.__noreyoV1142Prior=priorFetch;window.fetch=wrapped;installed=true;return true;}
function sync(){raf=0;patchGate();const s=window.NOREYO_HOTEL_PREBOOK,d=detailState();if(d&&(!s||String(d.prebookId||'')!==String(s.prebookId||'')))clearDetailState();}
function schedule(){if(!raf)raf=requestAnimationFrame(sync);}
function install(){installFetch();patchGate();if(observer||typeof MutationObserver==='undefined'||!document.body)return false;observer=new MutationObserver(schedule);observer.observe(document.body,{subtree:true,childList:true,characterData:true});schedule();return true;}
function cleanup(){if(observer){observer.disconnect();observer=null;}if(raf){cancelAnimationFrame(raf);raf=0;}if(installed&&window.fetch?.__noreyoV1142&&priorFetch)window.fetch=priorFetch;installed=false;priorFetch=null;}
install();window.addEventListener('pagehide',cleanup,{passive:true});window.addEventListener('pageshow',install,{passive:true});
window.NOREYO_V1142=Object.freeze({BUILD,LEGACY,SAFE,inputUrl,isLegacyStatus,rewrite,finite,currency,policies,summary,detailState,clearDetailState,complete,capture,patchGate,installFetch,sync,schedule,install,cleanup});
})();