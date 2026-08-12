/* NOREYO V9.39 — iPhone touch-target floor.
   Raises compact interactive controls to a 44px minimum hit target without
   changing the larger card/button surfaces. */
(()=>{
'use strict';
const BUILD='9.39',STYLE_ID='noreyo-v939-touch-targets';
const CSS=`
@media (pointer:coarse), (max-width:520px){
  .round,.planner-close,.close,.heart-btn,.favorite-remove,.product-mode,.tab,.ghost-btn,.gallery-close{
    min-width:44px!important;
    min-height:44px!important;
  }
  .favorite-remove{display:inline-grid!important;place-items:center!important;padding:8px!important}
  .tab{display:inline-flex!important;align-items:center!important;justify-content:center!important}
  .product-mode{height:44px!important}
  .gallery-close{width:44px!important;height:44px!important}
}`;
function install(){let style=document.getElementById(STYLE_ID);if(style)return false;style=document.createElement('style');style.id=STYLE_ID;style.textContent=CSS;document.head.appendChild(style);return true}
function remove(){document.getElementById(STYLE_ID)?.remove()}
install();window.NOREYO_V939=Object.freeze({BUILD,STYLE_ID,CSS,install,remove});
})();