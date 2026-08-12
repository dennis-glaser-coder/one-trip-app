/* NOREYO V10.88 — iPhone bottom safe-area completion.
   Packed hotel-detail sticky actions use a fixed 92px footer while the nav already
   accounts for safe-area-inset-bottom. Extend sticky/detail spacing and toast offset
   so Face-ID iPhones do not place controls/feedback into the home-indicator area. */
(function(){
'use strict';
const BUILD='10.88',STYLE_ID='noreyo-v1088-safe-area';
const CSS=`
@supports (padding-bottom: env(safe-area-inset-bottom)){
  .sticky{
    min-height:calc(92px + env(safe-area-inset-bottom));
    padding-bottom:calc(12px + env(safe-area-inset-bottom));
  }
  .detail-body{padding-bottom:calc(118px + env(safe-area-inset-bottom));}
  .toast{bottom:calc(var(--nav) + env(safe-area-inset-bottom) + 20px);}
}
`;
function install(){let style=document.getElementById(STYLE_ID);if(style)return false;style=document.createElement('style');style.id=STYLE_ID;style.textContent=CSS;document.head.appendChild(style);return true;}
function remove(){const style=document.getElementById(STYLE_ID);if(!style)return false;style.remove();return true;}
install();window.addEventListener('pageshow',install,{passive:true});window.NOREYO_V1088=Object.freeze({BUILD,STYLE_ID,CSS,install,remove});
})();