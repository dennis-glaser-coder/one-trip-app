/* NOREYO V7.16 — URL-object fetch bridge.
   Browser fetch accepts string, Request and URL inputs. Current safety layers cover
   strings and Requests; this bridge canonicalizes search-travel URL objects to strings
   so they enter the same validation + multi-occupancy transport stack. */
(function(){
'use strict';
const BUILD='7.16';
function urlString(input){
  if(typeof input==='string')return input;
  if(typeof Request!=='undefined'&&input instanceof Request)return input.url||'';
  try{if(typeof URL!=='undefined'&&input instanceof URL)return input.href||String(input);}catch(_){}
  if(input&&typeof input==='object'&&typeof input.href==='string')return input.href;
  return'';
}
function isSearchTravel(input){return urlString(input).includes('/functions/v1/search-travel');}
function isUrlLike(input){
  if(!input||typeof input==='string')return false;
  if(typeof Request!=='undefined'&&input instanceof Request)return false;
  try{if(typeof URL!=='undefined'&&input instanceof URL)return true;}catch(_){}
  return typeof input==='object'&&typeof input.href==='string';
}
function install(){
  try{
    if(typeof window.fetch!=='function'||window.fetch.__noreyoV716)return false;
    const prior=window.fetch.bind(window);
    const wrapped=function(input,init){
      if(!isUrlLike(input)||!isSearchTravel(input))return prior(input,init);
      return prior(urlString(input),init);
    };
    wrapped.__noreyoV716=true;
    window.fetch=wrapped;
    return true;
  }catch(_){return false;}
}
install();window.addEventListener('pageshow',install,{passive:true});
window.NOREYO_V716=Object.freeze({BUILD,urlString,isSearchTravel,isUrlLike,install});
})();