/* NOREYO V5.89 — minimal V5.41 CTA mutation-loop guard */
(function(){
'use strict';
const BUILD='5.89';
let patchedButton=null,rootObserver=null;

function prototypeInnerHTMLDescriptor(){
  let p=Element.prototype;
  while(p){
    const d=Object.getOwnPropertyDescriptor(p,'innerHTML');
    if(d?.get&&d?.set)return d;
    p=Object.getPrototypeOf(p);
  }
  return null;
}
function patchBookingCTA(){
  const btn=document.querySelector('#discover .noreyo-v541-booking-cta[data-noreyo-native="1"]');
  if(!btn||btn===patchedButton||btn.dataset.noreyoV589Innerhtml==='1')return false;
  const d=prototypeInnerHTMLDescriptor();if(!d)return false;
  try{
    Object.defineProperty(btn,'innerHTML',{
      configurable:true,
      enumerable:d.enumerable,
      get(){return d.get.call(this);},
      set(value){const next=String(value);if(d.get.call(this)===next)return;d.set.call(this,next);}
    });
  }catch(_){return false;}
  btn.dataset.noreyoV589Innerhtml='1';patchedButton=btn;return true;
}
function relevant(records){
  for(const r of records)for(const n of r.addedNodes||[]){
    if(n.nodeType!==1)continue;
    if(n.matches?.('.noreyo-v541-booking-cta')||n.querySelector?.('.noreyo-v541-booking-cta'))return true;
  }
  return false;
}
function attach(){
  patchBookingCTA();
  if(rootObserver||typeof MutationObserver==='undefined'||!document.body)return;
  rootObserver=new MutationObserver(records=>{if(relevant(records))patchBookingCTA();});
  rootObserver.observe(document.body,{childList:true,subtree:true});
}
function cleanup(){if(rootObserver){rootObserver.disconnect();rootObserver=null;}patchedButton=null;}
function restore(){attach();}
function install(){attach();window.addEventListener('pagehide',cleanup,{passive:true});window.addEventListener('pageshow',restore,{passive:true});}
window.NOREYO_V582=Object.freeze({BUILD,patchBookingCTA,relevant});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();