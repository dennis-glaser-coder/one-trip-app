/* NOREYO V9.58 — dynamic visible runtime build label without legacy observer ping-pong.
   V9.32 hard-coded a historic profile build label and observed characterData.
   Disable that legacy observer, preserve its truthful profile affordances here,
   and render the numerically newest active runtime build. */
(function(){
'use strict';
const BUILD='9.58';
let observer=null,raf=0,timer=0,legacyDisabled=false;
function disableLegacyWriter(){if(legacyDisabled)return false;const legacy=window.NOREYO_V932;if(!legacy)return false;try{window.removeEventListener('pageshow',legacy.observe);}catch(_){}try{window.removeEventListener('pagehide',legacy.cleanup);}catch(_){}try{legacy.cleanup?.();}catch(_){}legacyDisabled=true;return true;}
function activeBuild(){let best=null;try{for(const key of Object.keys(window)){const m=/^NOREYO_V(\d+)$/.exec(key);if(!m)continue;const n=Number(m[1]);if(!Number.isInteger(n))continue;const raw=String(window[key]?.BUILD||'').trim();if(!raw)continue;if(!best||n>best.n)best={n,raw};}}catch(_){}return (best?.raw||BUILD).replace(/-safe$/i,'');}
function label(){return 'NOREYO · BUILD '+activeBuild();}
function neutralize(el,label){if(!el)return false;let changed=false;for(const attr of ['onclick','role','tabindex']){if(el.hasAttribute?.(attr)){el.removeAttribute(attr);changed=true;}}if(el.dataset?.noreyoKeyboardButton){delete el.dataset.noreyoKeyboardButton;changed=true;}if(label&&el.getAttribute?.('aria-label')!==label){el.setAttribute('aria-label',label);changed=true;}return changed;}
function fixProfile(root=document){const profile=root.getElementById?.('profile')||root.querySelector?.('#profile');if(!profile)return false;let changed=false;const hero=profile.querySelector('.profile-hero');changed=neutralize(hero,'Profilstatus – lokal auf diesem Gerät gespeichert')||changed;const loyalty=[...profile.querySelectorAll('.menu-row')].find(r=>/Treueprogramme/i.test(r.textContent||''));if(loyalty){changed=neutralize(loyalty,'Treueprogramme – noch nicht verfügbar')||changed;if(loyalty.getAttribute('aria-disabled')!=='true'){loyalty.setAttribute('aria-disabled','true');changed=true;}const small=loyalty.querySelector('small');if(small&&small.textContent!=='Noch nicht verfügbar · keine Daten hinterlegt'){small.textContent='Noch nicht verfügbar · keine Daten hinterlegt';changed=true;}const chev=loyalty.querySelector('svg.icon.mini');if(chev&&chev.getAttribute('aria-hidden')!=='true'){chev.setAttribute('aria-hidden','true');changed=true;}}
const build=profile.querySelector('.build-version');if(build){const next=label();if(build.textContent!==next){build.textContent=next;changed=true;}}return changed;}
function run(){raf=0;disableLegacyWriter();return fixProfile();}
function schedule(){if(!raf)raf=requestAnimationFrame(run);}
function observe(){disableLegacyWriter();if(observer){observer.disconnect();observer=null;}if(typeof MutationObserver==='undefined'||!document.body)return false;observer=new MutationObserver(schedule);observer.observe(document.body,{subtree:true,childList:true,characterData:true});schedule();if(timer)clearTimeout(timer);timer=setTimeout(schedule,0);return true;}
function cleanup(){if(observer){observer.disconnect();observer=null;}if(raf){cancelAnimationFrame(raf);raf=0;}if(timer){clearTimeout(timer);timer=0;}}
observe();window.addEventListener('pagehide',cleanup,{passive:true});window.addEventListener('pageshow',observe,{passive:true});window.NOREYO_V958=Object.freeze({BUILD,disableLegacyWriter,activeBuild,label,neutralize,fixProfile,run,schedule,observe,cleanup});
})();