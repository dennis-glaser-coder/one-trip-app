/* NOREYO V10.54 — persistent result sorting across live-search refreshes.
   Packed sortOffers sorts the current array once, but a subsequent provider search
   replaces offers and calls renderOffers directly while the toolbar still shows the
   previous sort as active. Re-apply the active toolbar sort before every render. */
(function(){
'use strict';
const BUILD='10.54';let installed=false,priorRender=null;
function activeMode(){const btn=document.querySelector('.toolbar [data-sort].active-sort');return String(btn?.dataset?.sort||btn?.getAttribute?.('data-sort')||'recommended');}
function ratingValue(v){const n=Number(String(v??'').replace(',','.'));return Number.isFinite(n)?n:-Infinity;}
function apply(mode=activeMode()){try{if(!Array.isArray(offers))return false;if(mode==='price'){offers.sort((a,b)=>(Number(a?.price)||Infinity)-(Number(b?.price)||Infinity));return true;}if(mode==='rating'){offers.sort((a,b)=>ratingValue(b?.rating)-ratingValue(a?.rating));return true;}if(Array.isArray(recommendedOrder)&&recommendedOrder.length){const rank=new Map(recommendedOrder.map((id,i)=>[id,i]));offers.sort((a,b)=>(rank.get(a?.id)??Number.MAX_SAFE_INTEGER)-(rank.get(b?.id)??Number.MAX_SAFE_INTEGER));return true;}}catch(_){}return false;}
function install(){if(installed||typeof window.renderOffers!=='function'||window.renderOffers.__noreyoV1054)return false;priorRender=window.renderOffers;const wrapped=function(...args){apply(activeMode());return priorRender.apply(this,args);};wrapped.__noreyoV1054=true;wrapped.__noreyoV1054Prior=priorRender;window.renderOffers=wrapped;installed=true;return true;}
function restore(){if(!installed)return false;if(window.renderOffers?.__noreyoV1054&&priorRender)window.renderOffers=priorRender;installed=false;priorRender=null;return true;}
install();window.addEventListener('pagehide',restore,{passive:true});window.addEventListener('pageshow',install,{passive:true});
window.NOREYO_V1054=Object.freeze({BUILD,activeMode,ratingValue,apply,install,restore});
})();