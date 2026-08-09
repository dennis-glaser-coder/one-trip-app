(function(){
'use strict';
const BUILD='5.79';
const known=['Zimmer0','Zimmer1','Zimmer2','Hotel0','Hotel1','Hotel4','Hotel5','Hotel6','Hotel7','Lage0','Lage1','Lage2','Lage3','Lage4','Preis2','Flug0','Flug1'];
const allowed={package:new Set(['Zimmer0','Zimmer1','Zimmer2','Hotel0','Hotel1','Hotel4','Hotel5','Lage0','Lage1','Lage2','Lage3','Lage4','Preis2','Flug0','Flug1']),hotel:new Set(['Zimmer0','Zimmer1','Zimmer2','Hotel0','Hotel1','Hotel4','Hotel5','Lage0','Lage1','Lage2','Lage3','Lage4','Preis2']),flight:new Set(['Flug0','Flug1'])};
let lastMode='',raf=0;
function mode(){const active=document.querySelector('#discover .product-mode.on');const t=String(active?.textContent||'').toLowerCase();if(t.includes('kreuzfahrt'))return'cruise';if(t.includes('flug'))return'flight';if(t.includes('hotel'))return'hotel';try{if(typeof productMode==='string'&&['package','hotel','flight'].includes(productMode))return productMode;}catch(_){}return'package';}
function store(){try{return typeof states!=='undefined'&&states?states:null;}catch(_){return null;}}
function syncUi(){try{if(typeof refreshQuickStates==='function')refreshQuickStates();}catch(_){}try{if(typeof updateCounts==='function')updateCounts();}catch(_){}try{if(typeof updateSearchUI==='function')updateSearchUI();}catch(_){}try{if(typeof persistState==='function')persistState();}catch(_){} }
function cleanup(force=false){const m=mode();syncModeAria();if(m==='cruise'){lastMode=m;return 0;}if(!force&&m===lastMode)return 0;lastMode=m;const s=store(),set=allowed[m]||allowed.package;if(!s)return 0;let changed=0;for(const key of known){if(!set.has(key)&&s[key]&&s[key]!=='any'){s[key]='any';changed++;}}if(changed)syncUi();return changed;}
function syncModeAria(){document.querySelectorAll('#discover .product-mode').forEach(el=>{const active=el.classList.contains('on');el.setAttribute('aria-pressed',active?'true':'false');if(el.tagName!=='BUTTON'&&!el.hasAttribute('role')){el.setAttribute('role','button');if(!el.hasAttribute('tabindex'))el.tabIndex=0;}});}
function schedule(force=false){if(raf)return;raf=requestAnimationFrame(()=>{raf=0;cleanup(force);});}
function onModeClick(e){const el=e.target instanceof Element?e.target.closest('#discover .product-mode'):null;if(el)setTimeout(()=>cleanup(true),0);}
function onModeKey(e){const el=e.target instanceof Element?e.target.closest('#discover .product-mode'):null;if(!el||el.tagName==='BUTTON')return;if(e.key!=='Enter'&&e.key!==' ')return;e.preventDefault();el.click();}
function install(){cleanup(true);document.addEventListener('click',onModeClick,true);document.addEventListener('keydown',onModeKey,true);const root=document.querySelector('#discover');if(root&&typeof MutationObserver!=='undefined')new MutationObserver(()=>schedule(false)).observe(root,{subtree:true,attributes:true,attributeFilter:['class']});window.addEventListener('pageshow',()=>cleanup(true),{passive:true});}
window.NOREYO_V579=Object.freeze({BUILD,mode,cleanup,syncModeAria,allowed});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();
