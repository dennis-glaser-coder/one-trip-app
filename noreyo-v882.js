/* NOREYO V8.82 — runtime brand consistency for the packed V5.27 core.
   The packed site still contains legacy ONE TRIP copy and resets document.title.
   This layer keeps all user-visible text and metadata on the NOREYO brand,
   including UI rendered later by planners, loading states and hotel details. */
(function(){
'use strict';
const BUILD='8.82', LEGACY=/\bONE\s+TRIP\b/gi;
let observer=null,raf=0;

function rebrandText(value){
  return String(value??'').replace(LEGACY,'NOREYO');
}
function skippable(node){
  const tag=String(node?.parentElement?.tagName||'').toUpperCase();
  return tag==='SCRIPT'||tag==='STYLE'||tag==='NOSCRIPT'||tag==='TEMPLATE';
}
function rebrandTextNode(node){
  if(!node||node.nodeType!==3||skippable(node))return false;
  const before=String(node.nodeValue||''),after=rebrandText(before);
  if(after===before)return false;
  node.nodeValue=after;return true;
}
function walk(root=document.body){
  if(!root||typeof document.createTreeWalker!=='function')return 0;
  const showText=globalThis.NodeFilter?.SHOW_TEXT||4;
  const walker=document.createTreeWalker(root,showText);
  let node,count=0;
  while((node=walker.nextNode()))if(rebrandTextNode(node))count++;
  return count;
}
function metadata(){
  let changed=0;
  const title=rebrandText(document.title);
  if(title!==document.title){document.title=title;changed++;}
  const pairs=[
    ['meta[name="application-name"]','content'],
    ['meta[name="apple-mobile-web-app-title"]','content'],
    ['meta[property="og:title"]','content'],
    ['meta[property="og:description"]','content'],
    ['meta[name="description"]','content']
  ];
  for(const [sel,attr] of pairs){
    const el=document.querySelector(sel);if(!el)continue;
    const before=String(el.getAttribute(attr)||''),after=rebrandText(before);
    if(after!==before){el.setAttribute(attr,after);changed++;}
  }
  return changed;
}
function fix(){
  raf=0;
  let changed=metadata();
  changed+=walk(document.body);
  return changed;
}
function schedule(){if(raf)return;raf=requestAnimationFrame(fix);}
function observe(){
  if(observer){observer.disconnect();observer=null;}
  if(typeof MutationObserver==='undefined'||!document.documentElement)return false;
  observer=new MutationObserver(records=>{
    for(const r of records){
      if(r.type==='characterData'){schedule();return;}
      if(r.type==='childList'&&r.addedNodes?.length){schedule();return;}
      if(r.type==='attributes'){schedule();return;}
    }
  });
  observer.observe(document.documentElement,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['content']});
  schedule();return true;
}
function cleanup(){
  if(observer){observer.disconnect();observer=null;}
  if(raf){cancelAnimationFrame(raf);raf=0;}
}
observe();
window.addEventListener('pagehide',cleanup,{passive:true});
window.addEventListener('pageshow',observe,{passive:true});
window.NOREYO_V882=Object.freeze({BUILD,rebrandText,skippable,rebrandTextNode,walk,metadata,fix,schedule,observe,cleanup});
})();