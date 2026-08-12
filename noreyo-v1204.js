/* NOREYO V12.04 — iPhone-safe visible checkout-auth boundary.
   V12.02 introduced a new checkout login note/button after the older V11.74 auth
   styles were written. Give the new surface its own premium phone-safe layout,
   48px touch target and keyboard focus state without changing auth behavior. */
(function(){
'use strict';
const BUILD='12.04',STYLE_ID='noreyo-v1204-checkout-auth-ux';
const CSS=`
.noreyo-v1202-auth-note{
  margin:0 0 14px;padding:14px;border:1px solid rgba(255,255,255,.12);
  border-radius:16px;background:rgba(255,255,255,.045);line-height:1.45
}
.noreyo-v1202-auth-note b{display:block;margin:0 0 5px;font-size:15px;line-height:1.3}
.noreyo-v1202-auth-note p{margin:0;font-size:12px;line-height:1.45;opacity:.78}
.noreyo-v1202-login{
  width:100%;min-height:48px;margin-top:11px;border:0;border-radius:12px;padding:11px 14px;
  background:#111;color:#fff;font:850 14px/1.2 -apple-system,BlinkMacSystemFont,"SF Pro Text","Segoe UI",sans-serif;
  cursor:pointer
}
.noreyo-v1202-login:focus-visible{outline:3px solid #1fa2a4;outline-offset:2px}
.noreyo-v1202-login:active{transform:translateY(1px)}
@media (max-width:520px),(pointer:coarse){
  .noreyo-v1202-auth-note{padding:14px 12px}
  .noreyo-v1202-login{min-height:48px;font-size:16px}
}
`;
function install(){
  if(document.getElementById(STYLE_ID))return false;
  const style=document.createElement('style');
  style.id=STYLE_ID;style.textContent=CSS;document.head.appendChild(style);return true;
}
function remove(){const style=document.getElementById(STYLE_ID);if(!style)return false;style.remove();return true;}
install();
window.addEventListener('pageshow',install,{passive:true});
window.NOREYO_V1204=Object.freeze({BUILD,STYLE_ID,CSS,install,remove});
})();