/* NOREYO V7.75 — child-age completeness gate using natural shorthand parser. */
(function(){
'use strict';
const BUILD='7.75';
function explicitChildCount(text){try{return window.NOREYO_V774?.explicitChildCount?.(text)??null;}catch(_){return null;}}
function parsedAges(text){try{return window.NOREYO_V774?.groupedChildAges?.(text)??null;}catch(_){return null;}}
function currentAges(){try{return Array.isArray(searchState?.childAges)?searchState.childAges.map(Number):[];}catch(_){return[];}}
function status(text){const count=explicitChildCount(text),ages=parsedAges(text),selected=currentAges();if(count===null||count===0)return{count,ages,selected,missing:false,source:'none'};if(Array.isArray(ages)&&ages.length===count)return{count,ages,selected,missing:false,source:'text'};if(selected.length===count)return{count,ages,selected,missing:false,source:'selected'};return{count,ages,selected,missing:true,source:'missing'};}
function resultNode(){return document.getElementById('noreyoAi556Result');}
function removeWarning(){const w=resultNode()?.querySelector('.noreyo-v775-child-warning');if(w){w.remove();return true;}return false;}
function showWarning(text){const s=status(text),root=resultNode();if(!root)return false;removeWarning();if(!s.missing)return false;const box=document.createElement('div');box.className='noreyo-v775-child-warning';box.setAttribute('role','alert');box.style.cssText='margin:12px 0 0;padding:12px 14px;border-radius:14px;background:rgba(255,180,70,.12);border:1px solid rgba(255,180,70,.35);font-size:13px;line-height:1.4';box.innerHTML='<b>Kinderalter fehlt</b><br>Bitte nenne für '+s.count+' '+(s.count===1?'Kind':'Kinder')+' auch '+(s.count===1?'das Alter':'die Alter')+', z. B. „'+s.count+' Kinder, 5 und 8“.';root.appendChild(box);return true;}
function notify(s){const msg='Bitte '+(s.count===1?'das Alter des Kindes':'die Alter der Kinder')+' angeben oder vorher bei Reisende auswählen.';try{if(typeof showToast==='function')showToast(msg);else window.toast?.(msg);}catch(_){}}
function onAnalyze(e){if(!e.target?.closest?.('.noreyo-v556-analyze'))return;const text=document.getElementById('noreyoAi556Text')?.value||'';setTimeout(()=>showWarning(text),140);}
function onApply(e){if(!e.target?.closest?.('.noreyo-v556-apply'))return;const text=document.getElementById('noreyoAi556Text')?.value||'',s=status(text);if(!s.missing)return;e.preventDefault();e.stopImmediatePropagation();showWarning(text);notify(s);}
document.addEventListener('click',onAnalyze,true);document.addEventListener('click',onApply,true);
window.NOREYO_V775=Object.freeze({BUILD,explicitChildCount,parsedAges,currentAges,status,removeWarning,showWarning,onAnalyze,onApply});
})();