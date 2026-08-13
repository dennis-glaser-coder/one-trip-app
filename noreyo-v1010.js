/* NOREYO V10.10 — truthful saved-detail snapshots.
   Favorites/trips persist the original live=true search offer. Reopening a saved
   snapshot must not present that historical rate as LIVE VERFÜGBAR unless a new
   rates search has actually happened. */
(function(){
'use strict';
const BUILD='10.10';
let priorShow=null,priorRender=null,priorShowDetail=null,installed=false,observer=null,raf=0,activeSavedKey='';

function snapshotByEncoded(encoded){
  try{return typeof snapshotByKey==='function'?snapshotByKey(encoded):null;}catch(_){return null;}
}
function savedClone(o,source){
  if(!o)return null;
  return {...o,live:false,savedSnapshot:true,savedSource:String(source||'favorites'),savedPrice:Number(o.price)};
}
function keyOf(o){return String(o?.key||'');}
function install(){
  if(installed||typeof window.showSavedDetail!=='function')return false;
  priorShow=window.showSavedDetail;
  priorRender=typeof window.renderDetail==='function'?window.renderDetail:null;
  priorShowDetail=typeof window.showDetail==='function'?window.showDetail:null;

  window.showSavedDetail=function(encoded,source='favorites'){
    const o=snapshotByEncoded(encoded);
    if(!o)return priorShow.apply(this,arguments);
    activeSavedKey=keyOf(o);
    const safe=savedClone(o,source);
    if(typeof openDetailSnapshot==='function')return openDetailSnapshot(safe,source);
    return priorShow.apply(this,arguments);
  };
  window.showSavedDetail.__noreyoV1010=true;

  if(priorRender){
    window.renderDetail=function(o,...args){
      const next=activeSavedKey&&keyOf(o)===activeSavedKey?savedClone(o,o?.savedSource||'saved'):o;
      return priorRender.call(this,next,...args);
    };
    window.renderDetail.__noreyoV1010=true;
  }
  if(priorShowDetail){
    window.showDetail=function(...args){activeSavedKey='';return priorShowDetail.apply(this,args);};
    window.showDetail.__noreyoV1010=true;
  }
  installed=true;return true;
}
function restore(){
  if(!installed)return false;
  if(priorShow)window.showSavedDetail=priorShow;
  if(priorRender)window.renderDetail=priorRender;
  if(priorShowDetail)window.showDetail=priorShowDetail;
  activeSavedKey='';installed=false;return true;
}
function detail(){return document.getElementById('detailContent');}
function sync(){
  raf=0;
  const root=detail();if(!root)return false;
  if(!activeSavedKey)return false;
  const badge=root.querySelector('.local-badge');
  if(!badge)return false;
  let changed=false;
  if(badge.textContent!=='GESPEICHERTER STAND'){badge.textContent='GESPEICHERTER STAND';changed=true;}
  const body=root.querySelector('.detail-body');
  if(body&&!root.querySelector('.noreyo-v1010-saved-note')){
    const note=document.createElement('div');
    note.className='backend-note noreyo-v1010-saved-note';
    note.innerHTML='<b>Gespeicherter Preisstand</b><p>Dieser Hotelpreis stammt aus dem Zeitpunkt des Speicherns und wurde beim Öffnen nicht erneut live geprüft.</p>';
    body.insertBefore(note,body.firstElementChild||null);
    changed=true;
  }
  return changed;
}
function schedule(){if(!raf)raf=requestAnimationFrame(sync);}
function observe(){
  if(observer){observer.disconnect();observer=null;}
  const root=detail();if(typeof MutationObserver==='undefined'||!root)return false;
  observer=new MutationObserver(schedule);
  observer.observe(root,{childList:true,subtree:true});
  schedule();return true;
}
function cleanup(){if(observer){observer.disconnect();observer=null;}if(raf){cancelAnimationFrame(raf);raf=0;}}
function state(){return{activeSavedKey};}
install();observe();
window.addEventListener('pagehide',cleanup,{passive:true});
window.addEventListener('pageshow',()=>{install();observe();},{passive:true});
window.NOREYO_V1010=Object.freeze({BUILD,snapshotByEncoded,savedClone,keyOf,install,restore,detail,sync,schedule,observe,cleanup,state});
})();