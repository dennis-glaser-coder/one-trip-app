/* NOREYO V10.90 — remaining iPhone 44px touch-target floor.
   Complete the earlier V9.39 hardening for packed controls it did not cover:
   traveller +/- buttons, toolbar pills, premium chips and destination chevrons. */
(function(){
'use strict';
const BUILD='10.90',STYLE_ID='noreyo-v1090-touch-targets';
const CSS=`
@media (pointer:coarse), (max-width:520px){
  .counter button,.pill,.premium-chip{
    min-height:44px!important;
  }
  .counter button{min-width:44px!important;width:44px!important;height:44px!important;}
  .dest-open{width:44px!important;height:44px!important;min-width:44px!important;min-height:44px!important;margin:-9px!important;}
}`;
function install(){if(document.getElementById(STYLE_ID))return false;const style=document.createElement('style');style.id=STYLE_ID;style.textContent=CSS;document.head.appendChild(style);return true;}
function remove(){const s=document.getElementById(STYLE_ID);if(!s)return false;s.remove();return true;}
install();window.addEventListener('pageshow',install,{passive:true});window.NOREYO_V1090=Object.freeze({BUILD,STYLE_ID,CSS,install,remove});
})();