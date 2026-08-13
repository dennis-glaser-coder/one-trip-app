/* NOREYO V11.00 — mobile-safe styling for live flight verification controls.
   New verify/change controls must not rely on packed-core incidental selectors.
   Give them explicit readable spacing and a >=44px coarse-pointer touch target. */
(function(){
'use strict';
const BUILD='11.00',STYLE_ID='noreyo-v1100-flight-verify-style';
const CSS=`
.noreyo-v1094-gate,.noreyo-v1096-price-delta{margin-top:10px}
.noreyo-v1094-accept{appearance:none;border:0;border-radius:13px;background:var(--teal,#0d756d);color:#fff;font:750 11px/1 -apple-system,BlinkMacSystemFont,"SF Pro Display","Segoe UI",sans-serif;padding:0 16px;min-height:44px;margin-top:10px;cursor:pointer}
.noreyo-v1094-accept:focus-visible,.noreyo-v1084-verify:focus-visible{outline:3px solid rgba(13,117,109,.3);outline-offset:2px}
.noreyo-v1096-price-delta .checkout-line{font-size:10px}
@media (pointer:coarse), (max-width:520px){
  .noreyo-v1094-accept,.noreyo-v1084-verify{min-height:44px!important}
}`;
function install(){if(document.getElementById(STYLE_ID))return false;const style=document.createElement('style');style.id=STYLE_ID;style.textContent=CSS;document.head.appendChild(style);return true;}
function remove(){const style=document.getElementById(STYLE_ID);if(!style)return false;style.remove();return true;}
install();window.addEventListener('pageshow',install,{passive:true});window.NOREYO_V1100=Object.freeze({BUILD,STYLE_ID,CSS,install,remove});
})();