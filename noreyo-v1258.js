/* NOREYO V12.58 — remaining iPhone 44px touch-target completion.
   Packed mobile CSS still leaves several real controls below Apple's comfortable
   touch floor and these selectors are not covered by the earlier V9.39/V10.90
   hardening. Raise only interactive surfaces; visual icons/text stay unchanged. */
(function(){
'use strict';
const BUILD='12.58',STYLE_ID='noreyo-v1258-touch-floor';
const CSS=`
@media (max-width:520px),(pointer:coarse){
  .search-quick-links button,
  .gallery-all-btn,
  .board-section-title button,
  .seg button{
    min-height:44px!important;
  }
  .search-quick-links button,
  .gallery-all-btn,
  .board-section-title button{
    padding-top:8px!important;
    padding-bottom:8px!important;
  }
  .seg button{
    display:inline-flex;
    align-items:center;
    justify-content:center;
  }
}`;
function install(){
  if(document.getElementById(STYLE_ID))return false;
  const style=document.createElement('style');style.id=STYLE_ID;style.textContent=CSS;document.head.appendChild(style);return true;
}
function remove(){const style=document.getElementById(STYLE_ID);if(!style)return false;style.remove();return true;}
install();
window.addEventListener('pageshow',install,{passive:true});
window.NOREYO_V1258=Object.freeze({BUILD,STYLE_ID,CSS,install,remove});
})();
