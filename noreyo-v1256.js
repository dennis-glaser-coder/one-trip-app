/* NOREYO V12.56 — iPhone-safe filter action footer.
   The packed filter footer sits at bottom:0 without safe-area padding and its reset
   action is only text-sized. Keep both actions above the home indicator and give
   Reset a 44px touch floor while retaining the existing apply transaction. */
(function(){
'use strict';
const BUILD='12.56',STYLE_ID='noreyo-v1256-filter-footer-safe';
const CSS=`
.sheet-foot{
  padding:12px 18px calc(12px + env(safe-area-inset-bottom))!important;
}
.sheet-scroll{
  padding-bottom:calc(118px + env(safe-area-inset-bottom))!important;
}
.sheet-foot .reset{
  min-height:44px;min-width:72px;padding:8px 10px;border-radius:12px;
  display:inline-flex;align-items:center;justify-content:center;
}
.sheet-foot .apply{min-height:49px}
@media (max-width:520px),(pointer:coarse){
  .sheet-foot .reset{min-height:44px}
  .sheet-foot .apply{min-height:49px}
}
`;
function install(){
  if(document.getElementById(STYLE_ID))return false;
  const style=document.createElement('style');style.id=STYLE_ID;style.textContent=CSS;document.head.appendChild(style);return true;
}
function remove(){const style=document.getElementById(STYLE_ID);if(!style)return false;style.remove();return true;}
install();
window.addEventListener('pageshow',install,{passive:true});
window.NOREYO_V1256=Object.freeze({BUILD,STYLE_ID,CSS,install,remove});
})();