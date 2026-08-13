/* NOREYO V12.38 — iPhone keyboard submit for passwordless auth.
   Profile and checkout-auth email controls are not forms, so Safari's Return key
   currently does nothing. Add enterkeyhint=send and route Enter to the existing
   tested send buttons without changing authentication or checkout gates. */
(function(){
'use strict';
const BUILD='12.38';
let observer=null,raf=0,bound=false;
const PAIRS=Object.freeze([
  {input:'.noreyo-v1162-email',button:'.noreyo-v1162-send'},
  {input:'.noreyo-v1158-email',button:'.noreyo-v1158-send'}
]);
function enhance(root=document){
  let changed=false;
  for(const pair of PAIRS){
    root.querySelectorAll?.(pair.input).forEach(input=>{
      if(input.getAttribute('enterkeyhint')!=='send'){input.setAttribute('enterkeyhint','send');changed=true;}
      if(input.getAttribute('autocapitalize')!=='none'){input.setAttribute('autocapitalize','none');changed=true;}
      if(input.getAttribute('spellcheck')!=='false'){input.setAttribute('spellcheck','false');changed=true;}
    });
  }
  return changed;
}
function pairFor(input){return PAIRS.find(p=>input?.matches?.(p.input))||null;}
function onKey(e){
  if(e.key!=='Enter'||e.isComposing)return;
  const pair=pairFor(e.target);if(!pair)return;
  const scope=e.target.closest?.('.noreyo-v1162-account,.noreyo-v1158-auth')||document;
  const button=scope.querySelector?.(pair.button);
  if(!button||button.disabled)return;
  e.preventDefault();e.stopPropagation();button.click();
}
function run(){raf=0;enhance();}
function schedule(){if(!raf)raf=requestAnimationFrame(run);}
function install(){
  if(bound)return false;bound=true;
  if(typeof MutationObserver!=='undefined'&&document.body){observer=new MutationObserver(schedule);observer.observe(document.body,{subtree:true,childList:true});}
  document.addEventListener('keydown',onKey,true);schedule();return true;
}
function cleanup(){if(observer){observer.disconnect();observer=null;}if(bound){document.removeEventListener('keydown',onKey,true);bound=false;}if(raf){cancelAnimationFrame(raf);raf=0;}}
install();window.addEventListener('pagehide',cleanup,{passive:true});window.addEventListener('pageshow',install,{passive:true});
window.NOREYO_V1238=Object.freeze({BUILD,PAIRS,enhance,pairFor,onKey,run,schedule,install,cleanup});
})();