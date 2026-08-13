/* NOREYO V11.70 — premium/iPhone UX for the real profile auth surface. */
(function(){
'use strict';
const BUILD='11.70',STYLE_ID='noreyo-v1170-profile-auth-ux';
const CSS=`
.noreyo-v1162-account{margin:12px 16px 0;padding:16px;border:1px solid rgba(255,255,255,.12);border-radius:18px;background:linear-gradient(180deg,rgba(255,255,255,.075),rgba(255,255,255,.035));box-shadow:0 14px 34px rgba(0,0,0,.18)}
.noreyo-v1162-copy{font-size:13px;line-height:1.5;opacity:.82}
.noreyo-v1162-login{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:10px;margin-top:12px;align-items:center}
.noreyo-v1162-email{box-sizing:border-box;width:100%;min-height:48px;border:1px solid rgba(255,255,255,.16);border-radius:13px;padding:11px 12px;background:rgba(255,255,255,.08);color:inherit;font:600 16px/1.2 -apple-system,BlinkMacSystemFont,"SF Pro Text","Segoe UI",sans-serif}
.noreyo-v1162-email::placeholder{color:rgba(255,255,255,.55)}
.noreyo-v1162-email:focus-visible,.noreyo-v1162-send:focus-visible,.noreyo-v1166-logout:focus-visible{outline:3px solid #1fa2a4;outline-offset:2px}
.noreyo-v1162-send,.noreyo-v1166-logout{min-height:48px;border-radius:13px;padding:0 16px;font-weight:850}
.noreyo-v1166-logout{margin-top:12px;border:1px solid rgba(255,255,255,.16);background:transparent;color:inherit}
.noreyo-v1162-status{min-height:19px;margin-top:10px;font-size:12px;line-height:1.45;opacity:.82}
@media (max-width:520px),(pointer:coarse){
  .noreyo-v1162-account{margin-left:12px;margin-right:12px;padding:14px}
  .noreyo-v1162-login{grid-template-columns:1fr}
  .noreyo-v1162-email{font-size:16px!important;min-height:48px}
  .noreyo-v1162-send,.noreyo-v1166-logout{width:100%;min-height:48px}
}
`;
function install(){if(document.getElementById(STYLE_ID))return false;const style=document.createElement('style');style.id=STYLE_ID;style.textContent=CSS;document.head.appendChild(style);return true;}
function remove(){const style=document.getElementById(STYLE_ID);if(!style)return false;style.remove();return true;}
install();window.addEventListener('pageshow',install,{passive:true});
window.NOREYO_V1170=Object.freeze({BUILD,STYLE_ID,CSS,install,remove});
})();