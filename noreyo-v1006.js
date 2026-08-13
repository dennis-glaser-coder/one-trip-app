/* NOREYO V10.06 — flight passenger age contract.
   LiteAPI flight passengers classify children as 2–11 and infants as <2.
   The packed core previously sent all childAges >=2 as children, so ages 12–17
   could generate invalid provider requests. Promote those travellers to adults
   for the flight request only; hotel occupancy and UI state remain unchanged. */
(function(){
'use strict';
const BUILD='10.06';
let installed=false,priorGroups=null,priorBody=null;
function ages(){try{return Array.isArray(searchState?.childAges)?searchState.childAges.map(Number).filter(Number.isFinite):[];}catch(_){return[];}}
function groups(values=ages()){const infants=values.filter(a=>a>=0&&a<2);const children=values.filter(a=>a>=2&&a<=11);const promotedAdults=values.filter(a=>a>=12).length;return{children:children.length,childrenAges:children,infants:infants.length,infantAges:infants,promotedAdults};}
function install(){if(installed)return false;priorGroups=window.flightChildGroups;priorBody=window.flightRequestBody;if(typeof priorBody!=='function')return false;window.flightChildGroups=function(){return groups();};window.flightRequestBody=function(...args){const raw=priorBody.apply(this,args)||{};const g=groups();const baseAdults=Number(searchState?.adults)||1;return{...raw,adults:baseAdults+g.promotedAdults,children:g.children,childrenAges:[...g.childrenAges],infants:g.infants,infantAges:[...g.infantAges]};};window.flightChildGroups.__noreyoV1006=true;window.flightRequestBody.__noreyoV1006=true;installed=true;return true;}
function restore(){if(!installed)return false;if(priorGroups)window.flightChildGroups=priorGroups;if(priorBody)window.flightRequestBody=priorBody;installed=false;return true;}
install();window.addEventListener('pagehide',restore,{passive:true});window.addEventListener('pageshow',install,{passive:true});window.NOREYO_V1006=Object.freeze({BUILD,ages,groups,install,restore});
})();