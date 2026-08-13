/* NOREYO V11.50 — phone-safe hotel booking-data form UX.
   Style the session-only booking-data preparation added in V11.46 without changing
   provider/PII behavior: 16px inputs avoid Safari auto-zoom, 48px controls provide
   a comfortable touch target, and the grid collapses cleanly on narrow iPhones. */
(function(){
'use strict';
const BUILD='11.50',STYLE_ID='noreyo-v1150-booking-data-ux';
const CSS=`
.noreyo-v1146-booking-data{margin-top:14px;padding-top:14px;border-top:1px solid rgba(255,255,255,.12)}
.noreyo-v1146-booking-data h3{margin:0 0 6px;font-size:17px;line-height:1.25}
.noreyo-v1146-booking-data>p{margin:0 0 12px;opacity:.78;font-size:13px;line-height:1.45}
.noreyo-v1146-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}
.noreyo-v1146-grid label{display:grid;gap:6px;font-size:12px;font-weight:800}
.noreyo-v1146-grid input{width:100%;box-sizing:border-box;min-height:48px;border:1px solid rgba(255,255,255,.16);border-radius:12px;padding:11px 12px;background:rgba(255,255,255,.08);color:inherit;font:600 16px/1.2 -apple-system,BlinkMacSystemFont,"SF Pro Text","Segoe UI",sans-serif}
.noreyo-v1146-grid input:focus-visible{outline:3px solid #1fa2a4;outline-offset:2px;border-color:transparent}
.noreyo-v1146-feedback{min-height:20px;margin-top:10px;font-size:13px;line-height:1.4}
.noreyo-v1146-prepare{width:100%;min-height:48px;margin-top:8px}
@media (max-width:520px),(pointer:coarse){
  .noreyo-v1146-grid{grid-template-columns:1fr}
  .noreyo-v1146-grid input{font-size:16px!important;min-height:48px}
  .noreyo-v1146-prepare{min-height:48px}
}
`;
function install(){if(document.getElementById(STYLE_ID))return false;const style=document.createElement('style');style.id=STYLE_ID;style.textContent=CSS;document.head.appendChild(style);return true;}
function remove(){const style=document.getElementById(STYLE_ID);if(!style)return false;style.remove();return true;}
install();window.addEventListener('pageshow',install,{passive:true});window.NOREYO_V1150=Object.freeze({BUILD,STYLE_ID,CSS,install,remove});
})();