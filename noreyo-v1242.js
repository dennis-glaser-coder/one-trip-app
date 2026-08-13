/* NOREYO V12.42 — readable profile-auth email placeholder.
   V11.70 explicitly paints the profile email placeholder translucent white while
   the current profile card is light. Keep typed text unchanged and only restore
   sufficient placeholder contrast on the real light account surface. */
(function(){
'use strict';
const BUILD='12.42',STYLE_ID='noreyo-v1242-profile-placeholder';
const CSS=`
.noreyo-v1162-email::placeholder{color:rgba(11,39,55,.52)!important;opacity:1!important}
`;
function install(){
  if(document.getElementById(STYLE_ID))return false;
  const style=document.createElement('style');style.id=STYLE_ID;style.textContent=CSS;document.head.appendChild(style);return true;
}
function remove(){const style=document.getElementById(STYLE_ID);if(!style)return false;style.remove();return true;}
install();window.addEventListener('pageshow',install,{passive:true});
window.NOREYO_V1242=Object.freeze({BUILD,STYLE_ID,CSS,install,remove});
})();