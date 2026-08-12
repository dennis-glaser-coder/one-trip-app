/* NOREYO V10.32 — dynamic viewport foundation for iPhone/Safari.
   Packed core still uses min-height:100vh for .app and .view. On iPhone Safari,
   100vh can exceed the currently visible viewport while browser chrome changes.
   Prefer 100dvh where supported, with the packed 100vh rules remaining fallback. */
(function(){
'use strict';
const BUILD='10.32',STYLE_ID='noreyo-v1032-dvh';
function css(){
  return `@supports (height:100dvh){
    html,body{min-height:100dvh}
    .app{min-height:100dvh!important}
    .view{min-height:100dvh!important}
  }
  @supports (height:100svh){
    @media (max-width:600px){
      .view{min-height:max(100svh,100dvh)!important}
    }
  }`;
}
function install(){
  if(document.getElementById(STYLE_ID))return false;
  const style=document.createElement('style');
  style.id=STYLE_ID;
  style.textContent=css();
  (document.head||document.documentElement).appendChild(style);
  return true;
}
function verify(){
  const style=document.getElementById(STYLE_ID);
  return !!style&&style.textContent.includes('.app')&&style.textContent.includes('100dvh');
}
install();
window.addEventListener('pageshow',install,{passive:true});
window.NOREYO_V1032=Object.freeze({BUILD,STYLE_ID,css,install,verify});
})();