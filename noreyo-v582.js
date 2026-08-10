/* NOREYO V5.82 — V5.41 mutation-loop guard */
(function(){
'use strict';
const BUILD='5.82';
let patchedButton=null;

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
  if(!btn||btn===patchedButton||btn.dataset.noreyoV582Innerhtml==='1')return false;
  const d=prototypeInnerHTMLDescriptor();if(!d)return false;
  Object.defineProperty(btn,'innerHTML',{
    configurable:true,
    enumerable:d.enumerable,
    get(){return d.get.call(this);},
    set(value){
      const next=String(value);
      if(d.get.call(this)===next)return;
      d.set.call(this,next);
    }
  });
  btn.dataset.noreyoV582Innerhtml='1';
  patchedButton=btn;
  return true;
}

function gridRole(el){
  if(!(el instanceof Element))return'';
  const grid=el.parentElement;
  if(!grid?.classList.contains('booking-command-grid'))return'';
  const items=[...grid.children].filter(x=>x?.classList&&(x.classList.contains('command-cell')||!!x.querySelector?.('.command-cell')));
  const index=items.indexOf(el);
  if(index<0)return'';
  return index<4?'noreyo-v541-main-cell':'noreyo-v541-extra-cell';
}

function installClassGuard(){
  if(DOMTokenList.prototype.remove.__noreyoV582)return;
  const nativeRemove=DOMTokenList.prototype.remove;
  const guarded=function(...tokens){
    const owner=this.ownerElement||this._element||null;
    if(owner instanceof Element){
      const role=gridRole(owner);
      if(role)tokens=tokens.filter(token=>token!==role);
    }
    if(tokens.length)return nativeRemove.apply(this,tokens);
  };
  Object.defineProperty(guarded,'__noreyoV582',{value:true});
  try{DOMTokenList.prototype.remove=guarded;}catch(_){}
}

function relevant(records){
  for(const r of records)for(const n of r.addedNodes||[]){
    if(n.nodeType!==1)continue;
    if(n.matches?.('.noreyo-v541-booking-cta,.booking-command-grid')||n.querySelector?.('.noreyo-v541-booking-cta,.booking-command-grid'))return true;
  }
  return false;
}

function install(){
  installClassGuard();
  patchBookingCTA();
  if(typeof MutationObserver!=='undefined'){
    const mo=new MutationObserver(records=>{if(relevant(records))patchBookingCTA();});
    mo.observe(document.body,{childList:true,subtree:true});
  }
  window.addEventListener('pageshow',patchBookingCTA,{passive:true});
}

window.NOREYO_V582=Object.freeze({BUILD,gridRole,patchBookingCTA,relevant});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();