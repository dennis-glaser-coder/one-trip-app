/* NOREYO V12.46 — persistent traveller-planner save footer on phones.
   Multiple child-age selects can push the packed traveller .planner-save far below
   the initial iPhone viewport. Mirror the existing transaction-aware save action in
   a fixed footer while preserving applyTravellers()/rollback behavior. */
(function(){
'use strict';
const BUILD='12.46',STYLE_ID='noreyo-v1246-traveller-footer-style';
let observer=null,raf=0,bound=false;
const CSS=`
.noreyo-v1246-traveller-footer{position:absolute;left:0;right:0;bottom:0;z-index:24;padding:24px 20px calc(10px + env(safe-area-inset-bottom));background:linear-gradient(180deg,rgba(255,255,255,0),rgba(255,255,255,.96) 24%,#fff 48%);pointer-events:none}
.noreyo-v1246-traveller-save{width:100%;min-height:52px;margin:0;pointer-events:auto;box-shadow:0 -8px 24px rgba(7,17,31,.08)}
#plannerBody.noreyo-v1246-traveller-body{padding-bottom:calc(104px + env(safe-area-inset-bottom))!important}
.planner-save.noreyo-v1246-source{position:absolute!important;width:1px!important;height:1px!important;padding:0!important;margin:0!important;overflow:hidden!important;clip:rect(0 0 0 0)!important;clip-path:inset(50%)!important;white-space:nowrap!important}
`;
function mode(){try{return typeof plannerMode!=='undefined'?String(plannerMode||''):'';}catch(_){return'';}}
function sheet(){return document.getElementById('plannerSheet');}
function body(){return document.getElementById('plannerBody');}
function source(){return body()?.querySelector('.planner-save')||null;}
function openTravellers(){const sh=sheet(),b=body();return !!sh&&!!b&&sh.classList.contains('show')&&(mode()==='travellers'||document.getElementById('plannerTitle')?.textContent?.trim()==='Reisende');}
function installStyle(){if(document.getElementById(STYLE_ID))return false;const s=document.createElement('style');s.id=STYLE_ID;s.textContent=CSS;document.head.appendChild(s);return true;}
function restoreSource(src=source()){if(!src)return false;let changed=false;if(src.classList.contains('noreyo-v1246-source')){src.classList.remove('noreyo-v1246-source');changed=true;}if(src.hasAttribute('aria-hidden')){src.removeAttribute('aria-hidden');changed=true;}if(src.getAttribute('tabindex')==='-1'){src.removeAttribute('tabindex');changed=true;}return changed;}
function removeFooter(){let changed=false,b=body(),f=sheet()?.querySelector('.noreyo-v1246-traveller-footer');if(f){f.remove();changed=true;}if(b?.classList.contains('noreyo-v1246-traveller-body')){b.classList.remove('noreyo-v1246-traveller-body');changed=true;}changed=restoreSource()||changed;return changed;}
function ensure(){
  raf=0;installStyle();if(!openTravellers())return removeFooter();
  const sh=sheet(),b=body(),src=source();if(!sh||!b||!src)return false;
  let changed=false,footer=sh.querySelector('.noreyo-v1246-traveller-footer');
  if(!footer){footer=document.createElement('div');footer.className='noreyo-v1246-traveller-footer';const btn=document.createElement('button');btn.type='button';btn.className='dark-btn noreyo-v1246-traveller-save';btn.textContent='Reisende übernehmen';btn.setAttribute('aria-label','Reisende und Kinderalter übernehmen');footer.appendChild(btn);sh.appendChild(footer);changed=true;}
  if(!b.classList.contains('noreyo-v1246-traveller-body')){b.classList.add('noreyo-v1246-traveller-body');changed=true;}
  if(!src.classList.contains('noreyo-v1246-source')){src.classList.add('noreyo-v1246-source');changed=true;}
  if(src.getAttribute('aria-hidden')!=='true'){src.setAttribute('aria-hidden','true');changed=true;}
  if(src.getAttribute('tabindex')!=='-1'){src.setAttribute('tabindex','-1');changed=true;}
  const btn=footer.querySelector('.noreyo-v1246-traveller-save');if(btn){const disabled=!!src.disabled;if(btn.disabled!==disabled){btn.disabled=disabled;changed=true;}const aria=disabled?'true':'false';if(btn.getAttribute('aria-disabled')!==aria){btn.setAttribute('aria-disabled',aria);changed=true;}}
  return changed;
}
function onClick(e){const btn=e.target?.closest?.('.noreyo-v1246-traveller-save');if(!btn)return;e.preventDefault();e.stopPropagation();const src=source();if(!src||src.disabled)return;src.click();}
function schedule(){if(!raf)raf=requestAnimationFrame(ensure);}
function install(){installStyle();if(bound)return false;bound=true;const sh=sheet();if(typeof MutationObserver!=='undefined'&&sh){observer=new MutationObserver(schedule);observer.observe(sh,{subtree:true,childList:true,attributes:true,attributeFilter:['class','disabled']});}document.addEventListener('click',onClick,true);schedule();return true;}
function cleanup(){if(observer){observer.disconnect();observer=null;}if(bound){document.removeEventListener('click',onClick,true);bound=false;}if(raf){cancelAnimationFrame(raf);raf=0;}removeFooter();}
install();window.addEventListener('pagehide',cleanup,{passive:true});window.addEventListener('pageshow',install,{passive:true});
window.NOREYO_V1246=Object.freeze({BUILD,STYLE_ID,CSS,mode,sheet,body,source,openTravellers,installStyle,restoreSource,removeFooter,ensure,onClick,schedule,install,cleanup});
})();