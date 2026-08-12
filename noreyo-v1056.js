/* NOREYO V10.56 — direct-hotel resolver confidence gate.
   The packed resolver ranks returned candidates but accepts the top hotel even when
   its name has no meaningful overlap with the user's query. Never price an unrelated
   hotel silently: validate the chosen candidate before the rate search continues. */
(function(){
'use strict';
const BUILD='10.56';
const STOPWORDS=Object.freeze(new Set(['hotel','hotels','resort','resorts','spa','the','and','und','am','an','der','die','das','de','del','la','le','el','by','at','in','beach','club']));
let installed=false,prior=null;
function norm(value){return String(value||'').toLowerCase().replace(/ä/g,'ae').replace(/ö/g,'oe').replace(/ü/g,'ue').replace(/ß/g,'ss').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/&/g,' and ').replace(/[^a-z0-9]+/g,' ').replace(/\s+/g,' ').trim();}
function tokens(value){return norm(value).split(' ').filter(t=>t.length>=3&&!STOPWORDS.has(t));}
function metrics(query,name){const q=norm(query),n=norm(name),qt=tokens(query),nt=tokens(name),ns=new Set(nt);const overlap=qt.filter(t=>ns.has(t));const prefix=!!q&&!!n&&(n.startsWith(q)||q.startsWith(n));const contains=!!q&&!!n&&(n.includes(q)||q.includes(n));const ratio=qt.length?overlap.length/qt.length:0;return{q,n,qt,nt,overlap,prefix,contains,ratio};}
function confident(query,name){const m=metrics(query,name);if(!m.q||!m.n)return false;if(m.q===m.n||m.prefix||m.contains)return true;if(!m.qt.length)return false;if(m.qt.length===1)return m.overlap.length===1;if(m.qt.length===2)return m.overlap.length===2;if(m.overlap.length>=2&&m.ratio>=0.5)return true;return false;}
function resultName(result){return String(result?.hotelName||result?.hotel?.name||result?.hotel?.hotelName||result?.hotel?.hotel_name||'').trim();}
function validate(query,result){const name=resultName(result);if(confident(query,name))return result;const err=new Error(`„${String(query||'').trim()}“ wurde nicht eindeutig genug zugeordnet. Bitte ergänze den vollständigen Hotelnamen oder den Ort.`);err.code='NOREYO_HOTEL_RESOLVE_LOW_CONFIDENCE';err.query=String(query||'').trim();err.candidate=name;throw err;}
function install(){if(installed||typeof window.resolveDirectHotel!=='function'||window.resolveDirectHotel.__noreyoV1056)return false;prior=window.resolveDirectHotel;const wrapped=async function(query,...args){const result=await prior.call(this,query,...args);return validate(query,result);};wrapped.__noreyoV1056=true;wrapped.__noreyoV1056Prior=prior;window.resolveDirectHotel=wrapped;installed=true;return true;}
function restore(){if(!installed)return false;if(window.resolveDirectHotel?.__noreyoV1056&&prior)window.resolveDirectHotel=prior;installed=false;prior=null;return true;}
install();window.addEventListener('pagehide',restore,{passive:true});window.addEventListener('pageshow',install,{passive:true});
window.NOREYO_V1056=Object.freeze({BUILD,STOPWORDS,norm,tokens,metrics,confident,resultName,validate,install,restore});
})();