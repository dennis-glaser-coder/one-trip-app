/* NOREYO V10.62 — truthful hotel-detail refresh outcome.
   Packed applyDetailEdit uses one generic “Hotel nicht verfügbar” toast whenever
   the refreshed offer is absent. Distinguish provider failure, filter exclusion and
   real no-rate outcomes so network errors are never misreported as unavailability. */
(function(){
'use strict';
const BUILD='10.62';
const LEGACY='Dieses Hotel ist mit der neuen Auswahl nicht verfügbar';
let installed=false,prior=null;
function resultText(){const offers=document.getElementById('offers');const match=document.querySelector('#results .match');return `${offers?.textContent||''} ${match?.textContent||''}`.replace(/\s+/g,' ').trim();}
function replacement(text=resultText()){const t=String(text||'');if(/Live-Suche konnte nicht geladen werden|Live-Suche unterbrochen/i.test(t))return'Dieses Hotel konnte wegen eines Suchfehlers gerade nicht neu geprüft werden. Deine Auswahl bleibt erhalten.';if(/Keine vollständige Übereinstimmung|Pflichtkriterien zu streng/i.test(t))return'Dieses Hotel erfüllt die aktuellen Pflicht- oder Filterkriterien nicht vollständig.';if(/Keine Verfügbarkeit gefunden|Keine Rate für diesen Zeitraum/i.test(t))return'Für diese Auswahl wurde aktuell keine verfügbare Rate für dieses Hotel gefunden.';return LEGACY;}
function translate(message){const raw=String(message??'');return raw===LEGACY?replacement():raw;}
function install(){if(installed||typeof window.showToast!=='function'||window.showToast.__noreyoV1062)return false;prior=window.showToast;const wrapped=function(message,...args){return prior.call(this,translate(message),...args);};wrapped.__noreyoV1062=true;wrapped.__noreyoV1062Prior=prior;window.showToast=wrapped;installed=true;return true;}
function restore(){if(!installed)return false;if(window.showToast?.__noreyoV1062&&prior)window.showToast=prior;installed=false;prior=null;return true;}
install();window.addEventListener('pagehide',restore,{passive:true});window.addEventListener('pageshow',install,{passive:true});
window.NOREYO_V1062=Object.freeze({BUILD,LEGACY,resultText,replacement,translate,install,restore});
})();