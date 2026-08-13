/* NOREYO V12.30 — retire redundant V12.24 logout listener.
   Self-review found V11.64/V11.66 already own the real secure profile sign-out,
   including server revocation and the renamed .noreyo-v1166-logout control.
   V12.24 listened to the superseded .noreyo-v1162-logout class and adds no value.
   Retire its listener so there is one authoritative logout lifecycle. */
(function(){
'use strict';
const BUILD='12.30';
let retired=false;
function secureOwner(){return !!window.NOREYO_V1164?.signOut&&!!window.NOREYO_V1166?.logout;}
function retire(){
  if(retired)return false;
  if(!secureOwner())return false;
  try{window.NOREYO_V1224?.cleanup?.();}catch(_){}
  retired=true;
  return true;
}
function install(){return retire();}
install();
window.addEventListener('pageshow',install,{passive:true});
window.NOREYO_V1230=Object.freeze({BUILD,secureOwner,retire,install,get retired(){return retired;}});
})();