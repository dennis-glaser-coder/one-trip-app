(function(){
'use strict';
const BUILD='5.78';
let pending=false,baseline='',observer=null,attachObserver=null,lastButton=null;
function resultsRoot(){return document.getElementById('results');}
function text(v){return String(v||'').replace(/\s+/g,' ').trim();}
function offerFingerprint(){const cards=[...document.querySelectorAll('#offers .offer')];if(!cards.length)return'0:';return cards.length+':'+cards.slice(0,2).map(card=>text(card.textContent).slice(0,220)).join('|');}
function resultSignature(){const root=resultsRoot();const match=text(root?.querySelector('.match')?.textContent).slice(0,260);return offerFingerprint()+'#'+match;}
function emptyOrErrorSettled(){const root=resultsRoot();if(!root)return false;const t=text(root.textContent).toLowerCase();return /keine (?:angebote|hotels|flüge|fluege|reisen|ergebnisse)|nichts gefunden|nicht verfügbar|nicht verfugbar|suche fehlgeschlagen|fehler bei der suche|erneut versuchen/.test(t);}
function hasNewSettledResult(){const sig=resultSignature();if(sig===baseline)return false;if(document.querySelector('#offers .offer'))return true;return emptyOrErrorSettled();}
function release(){if(!pending)return;pending=false;lastButton=null;try{window.NOREYO_V576?.releaseBusy?.();}catch(_){}const root=resultsRoot();if(root)root.setAttribute('aria-busy','false');}
function onResultMutation(){if(pending&&hasNewSettledResult())release();}
function observeResults(){const root=resultsRoot();if(!root||observer)return;observer=new MutationObserver(onResultMutation);observer.observe(root,{childList:true,subtree:true,characterData:true});root.setAttribute('aria-live','polite');root.setAttribute('aria-busy','false');const match=root.querySelector('.match');if(match)match.setAttribute('aria-live','polite');}
function waitForResultsRoot(){observeResults();if(observer||attachObserver||!document.body)return;attachObserver=new MutationObserver(()=>{if(resultsRoot()){attachObserver.disconnect();attachObserver=null;observeResults();}});attachObserver.observe(document.body,{childList:true,subtree:true});}
function begin(button){pending=true;baseline=resultSignature();lastButton=button||null;const root=resultsRoot();if(root)root.setAttribute('aria-busy','true');}
function onSearchCapture(event){const button=event.target instanceof Element?event.target.closest('.liveSearchButton'):null;if(!button)return;begin(button);}
function onLifecycleEvent(event){if(!pending)return;const detail=event?.detail||{};const status=String(detail.status||detail.phase||'').toLowerCase();if(['success','done','complete','completed','error','failed','empty'].includes(status))release();}
function pagehide(){release();}
function install(){waitForResultsRoot();document.addEventListener('click',onSearchCapture,true);document.addEventListener('noreyo:search-status',onLifecycleEvent);document.addEventListener('noreyo:search-settled',release);window.addEventListener('pagehide',pagehide,{passive:true});window.addEventListener('pageshow',()=>{release();waitForResultsRoot();},{passive:true});}
window.NOREYO_V578=Object.freeze({BUILD,resultSignature,offerFingerprint,emptyOrErrorSettled,hasNewSettledResult,begin,release,get pending(){return pending;}});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();
