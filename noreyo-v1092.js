/* NOREYO V10.92 — prevent iOS Safari input auto-zoom.
   Packed responsive CSS overrides hotel/destination inputs to 15px. Safari may
   auto-zoom controls below 16px; keep the existing layout and raise only these
   input font sizes on phone/coarse-pointer layouts. */
(function(){
'use strict';
const BUILD='10.92',STYLE_ID='noreyo-v1092-input-zoom';
const CSS=`
@media (pointer:coarse), (max-width:520px){
  .hotel-query-row input,.dest-row input{font-size:16px!important;}
}`;
function install(){if(document.getElementById(STYLE_ID))return false;const style=document.createElement('style');style.id=STYLE_ID;style.textContent=CSS;document.head.appendChild(style);return true;}
function remove(){const style=document.getElementById(STYLE_ID);if(!style)return false;style.remove();return true;}
install();window.addEventListener('pageshow',install,{passive:true});window.NOREYO_V1092=Object.freeze({BUILD,STYLE_ID,CSS,install,remove});
})();