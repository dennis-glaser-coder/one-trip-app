/* NOREYO V7.32 — AI adult-count disambiguation.
   Prevents duration wording such as "für zwei Wochen" from being interpreted
   as two adults while preserving explicit traveller phrases like "zu zweit"
   or "für zwei Personen". */
(function(){
'use strict';
const BUILD='7.32';
const words={eins:1,eine:1,einer:1,einem:1,zwei:2,drei:3,vier:4,fuenf:5,funf:5,sechs:6,sieben:7,acht:8,neun:9};
function norm(v){return String(v||'').toLowerCase().replace(/ä/g,'ae').replace(/ö/g,'oe').replace(/ü/g,'ue').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/ß/g,'ss').replace(/\s+/g,' ').trim();}
function wordNumber(v){const s=norm(v);if(/^\d+$/.test(s))return Number(s);return words[s]??null;}
function explicitAdults(text){const t=norm(text);let m;m=t.match(/\b([1-9])\s*(?:erwachsene|personen|person)\b/);if(m)return Number(m[1]);m=t.match(/\b(eins|eine|einer|einem|zwei|drei|vier|fuenf|funf|sechs|sieben|acht|neun)\s+(?:erwachsene|personen|person)\b/);if(m)return wordNumber(m[1]);if(/\bzu zweit\b/.test(t))return 2;if(/\ballein(?:e|er)?\b|\bsolo\b/.test(t))return 1;m=t.match(/\bwir\s+(?:sind\s+)?(?:zu\s+)?([1-9]|eins|zwei|drei|vier|fuenf|funf|sechs|sieben|acht|neun)\b/);if(m)return wordNumber(m[1]);m=t.match(/\bwir\s+([1-9]|eins|zwei|drei|vier|fuenf|funf|sechs|sieben|acht|neun)\b/);if(m)return wordNumber(m[1]);m=t.match(/\bfuer\s+([1-9]|eins|zwei|drei|vier|fuenf|funf|sechs|sieben|acht|neun)(?!\s*(?:tage?|naechte?|nachte|wochen?|zimmer|sterne|euro|€|stunden?))(?=\s*(?:[,.;]|$|nach\b|in\b|im\b|am\b))/);if(m)return wordNumber(m[1]);return null;}
function snapshotAdults(){try{return Number.isInteger(Number(searchState?.adults))?Number(searchState.adults):2;}catch(_){return 2;}}
function refresh(){try{updateSearchUI?.();}catch(_){}try{updateCounts?.();}catch(_){}try{persistState?.();}catch(_){} }
function reconcile(text,before){try{if(typeof searchState==='undefined'||!searchState)return false;const explicit=explicitAdults(text),wanted=explicit&&explicit>=1&&explicit<=6?explicit:before;if(!Number.isInteger(wanted)||searchState.adults===wanted)return false;searchState.adults=wanted;refresh();return true;}catch(_){return false;}}
function onApply(e){if(!e.target?.closest?.('.noreyo-v556-apply'))return;const text=document.getElementById('noreyoAi556Text')?.value||'',before=snapshotAdults();setTimeout(()=>setTimeout(()=>reconcile(text,before),0),0);}
document.addEventListener('click',onApply,true);
window.NOREYO_V732=Object.freeze({BUILD,norm,wordNumber,explicitAdults,snapshotAdults,reconcile});
})();