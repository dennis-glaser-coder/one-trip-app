/* NOREYO V11.74 — premium/iPhone UX for checkout authentication. */
(function(){
'use strict';
const BUILD='11.74',STYLE_ID='noreyo-v1174-checkout-auth-ux';
const CSS=`
.noreyo-v1158-auth{margin:0 0 14px;padding:14px;border:1px solid rgba(255,255,255,.12);border-radius:16px;background:rgba(255,255,255,.045)}
.noreyo-v1158-auth h4{margin:0 0 5px;font-size:15px;line-height:1.3}
.noreyo-v1158-copy{margin:0;font-size:12px;line-height:1.45;opacity:.78}
.noreyo-v1158-row{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:9px;margin-top:11px}
.noreyo-v1158-email{box-sizing:border-box;width:100%;min-height:48px;border:1px solid rgba(255,255,255,.16);border-radius:12px;padding:11px 12px;background:rgba(255,255,255,.08);color:inherit;font:600 16px/1.2 -apple-system,BlinkMacSystemFont,"SF Pro Text","Segoe UI",sans-serif}
.noreyo-v1158-send{min-height:48px;border-radius:12px;padding:0 15px;font-weight:850}
.noreyo-v1158-email:focus-visible,.noreyo-v1158-send:focus-visible{outline:3px solid #1fa2a4;outline-offset:2px}
.noreyo-v1158-status{min-height:18px;margin-top:9px;font-size:12px;line-height:1.45;opacity:.82}
@media (max-width:520px),(pointer:coarse){
  .noreyo-v1158-row{grid-template-columns:1fr}
  .noreyo-v1158-email{font-size:16px!important;min-height:48px}
  .noreyo-v1158-send{width:100%;min-height:48px}
}
`;
function install(){if(document.getElementById(STYLE_ID))return false;const style=document.createElement('style');style.id=STYLE_ID;style.textContent=CSS;document.head.appendChild(style);return true;}
function remove(){const style=document.getElementById(STYLE_ID);if(!style)return false;style.remove();return true;}
install();window.addEventListener('pageshow',install,{passive:true});
window.NOREYO_V1174=Object.freeze({BUILD,STYLE_ID,CSS,install,remove});
})();