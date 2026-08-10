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
  try{
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
  }catch(_){return false;}
  btn.dataset.noreyoV582Innerhtml='1';
  patchedButton=btn;
  return true;
}

function expectedRole(item,index){
  return index<4?'noreyo-v541-main-cell':'noreyo-v541-extra-cell';
}

function patchGridItems(){
  const grid=document.querySelector('#discover .booking-command-grid');if(!grid)return 0;
  const items=[...grid.children].filter(el=>el?.classList&&(el.classList.contains('command-cell')||!!el.querySelector?.('.command-cell')));
  let changed=0;
  items.forEach((item,index)=>{
    const list=item.classList;
    if(list.__noreyoV582Remove)return;
    const nativeRemove=list.remove.bind(list);
    const role=expectedRole(item,index);
    const guarded=(...tokens)=>{
      const currentItems=item.parentElement===grid?[...grid.children].filter(el=>el?.classList&&(el.classList.contains('command-cell')||!!el.querySelector?.('.command-cell'))):[];
      const currentIndex=currentItems.indexOf(item);
      const keep=currentIndex>=0?expectedRole(item,currentIndex):role;
      const filtered=tokens.filter(token=>token!==keep);
      if(filtered.length)return nativeRemove(...filtered);
    };
    try{
      Object.defineProperty(guarded,'__noreyoV582',{value:true});
      Object.defineProperty(list,'remove',{configurable:true,value:guarded});
      Object.defineProperty(list,'__noreyoV582Remove',{configurable:true,value:true});
      changed++;
    }catch(_){}
  });
  return changed;
}

function patchAll(){patchBookingCTA();patchGridItems();}

function relevant(records){
  for(const r of records)for(const n of r.addedNodes||[]){
    if(n.nodeType!==1)continue;
    if(n.matches?.('.noreyo-v541-booking-cta,.booking-command-grid,.command-cell')||n.querySelector?.('.noreyo-v541-booking-cta,.booking-command-grid,.command-cell'))return true;
  }
  return false;
}

function install(){
  patchAll();
  if(typeof MutationObserver!=='undefined'){
    const mo=new MutationObserver(records=>{if(relevant(records))patchAll();});
    mo.observe(document.body,{childList:true,subtree:true});
  }
  window.addEventListener('pageshow',patchAll,{passive:true});
}

window.NOREYO_V582=Object.freeze({BUILD,expectedRole,patchBookingCTA,patchGridItems,relevant});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();