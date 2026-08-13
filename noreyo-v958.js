/* NOREYO V9.58 — dynamic visible runtime build label without legacy-writer races.
   Historical profile layers intentionally keep their original build marker.
   Hide that legacy marker and render an independent current-runtime label that
   older observers do not target. */
(function(){
'use strict';
const BUILD='9.58';
let observer=null,raf=0,timer=0;
function activeBuild(){let best=null;try{for(const key of Object.keys(window)){const m=/^NOREYO_V(\d+)$/.exec(key);if(!m)continue;const n=Number(m[1]);if(!Number.isInteger(n))continue;const raw=String(window[key]?.BUILD||'').trim();if(!raw)continue;if(!best||n>best.n)best={n,raw};}}catch(_){}return (best?.raw||BUILD).replace(/-safe$/i,'');}
function label(){return 'NOREYO · BUILD '+activeBuild();}
function currentNode(profile){return profile?.querySelector?.('[data-noreyo-v958-build="1"]')||null;}
function fixProfile(root=document){const profile=root.getElementById?.('profile')||root.querySelector?.('#profile');if(!profile)return false;let changed=false;const legacy=[...profile.querySelectorAll('.build-version')].find(el=>el.getAttribute?.('data-noreyo-v958-build')!=='1');if(!legacy)return false;if(legacy.getAttribute('aria-hidden')!=='true'){legacy.setAttribute('aria-hidden','true');changed=true;}if(legacy.style?.display!=='none'){legacy.style.display='none';changed=true;}let current=currentNode(profile);if(!current){current=document.createElement('div');current.className='build-version noreyo-current-build';current.setAttribute('data-noreyo-v958-build','1');current.setAttribute('aria-label','Aktuelle NOREYO Version');legacy.insertAdjacentElement('afterend',current);changed=true;}const next=label();if(current.textContent!==next){current.textContent=next;changed=true;}return changed;}
function run(){raf=0;return fixProfile();}
function schedule(){if(!raf)raf=requestAnimationFrame(run);}
function observe(){if(observer){observer.disconnect();observer=null;}if(typeof MutationObserver==='undefined'||!document.body)return false;observer=new MutationObserver(records=>{for(const r of records){if(r.type==='childList'){schedule();return;}}});observer.observe(document.body,{subtree:true,childList:true});schedule();if(timer)clearTimeout(timer);timer=setTimeout(schedule,0);return true;}
function cleanup(){if(observer){observer.disconnect();observer=null;}if(raf){cancelAnimationFrame(raf);raf=0;}if(timer){clearTimeout(timer);timer=0;}}
observe();window.addEventListener('pagehide',cleanup,{passive:true});window.addEventListener('pageshow',observe,{passive:true});window.NOREYO_V958=Object.freeze({BUILD,activeBuild,label,currentNode,fixProfile,run,schedule,observe,cleanup});
})();