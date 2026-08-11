/* NOREYO V6.90 bootstrap — preserves base sorting and aligns active search request ownership. */
(()=>{
'use strict';
const BUILD='6.90-safe';
const SITE_BUILD='noreyo-690';
const HOTFIX=`
@media(max-width:600px){
  .app-head{padding-top:calc(42px + env(safe-area-inset-top))!important;padding-left:18px!important;padding-right:18px!important;padding-bottom:12px!important}
  .nav{bottom:calc(3px + env(safe-area-inset-bottom))!important;height:50px!important;width:calc(100% - 20px)!important;max-width:448px!important;padding-bottom:0!important;border:1px solid rgba(7,31,45,.08)!important;border-radius:18px!important;background:rgba(255,254,252,.90)!important;backdrop-filter:blur(24px) saturate(1.22)!important;-webkit-backdrop-filter:blur(24px) saturate(1.22)!important;box-shadow:0 10px 30px rgba(7,31,45,.10)!important}
  .nav-btn{font-size:7px!important;gap:2px!important;line-height:1!important}.nav-btn .icon{width:17px!important;height:17px!important}
  .nav-btn.active:before{top:3px!important;width:18px!important}
  .view{padding-bottom:calc(145px + env(safe-area-inset-bottom))!important;scroll-padding-bottom:155px!important}#detail.view{padding-bottom:0!important}#discover .content{padding-bottom:58px!important}
  .booking-command-grid{grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:8px!important}.command-cell{min-width:0!important;padding:10px 9px!important;gap:7px!important}.command-cell .command-copy{min-width:0!important;overflow:visible!important}
  .command-cell b{font-size:11.2px!important;line-height:1.18!important;white-space:normal!important;overflow:hidden!important;text-overflow:clip!important;display:-webkit-box!important;-webkit-box-orient:vertical!important;-webkit-line-clamp:2!important}.command-cell small{font-size:7.1px!important;letter-spacing:1px!important}.dateValue,.mealPlanValue{letter-spacing:-.1px!important}
}
@media(max-width:390px){.app-head{padding-top:calc(40px + env(safe-area-inset-top))!important}.nav{height:48px!important;width:calc(100% - 18px)!important}.nav-btn{font-size:6.8px!important}.nav-btn .icon{width:16px!important;height:16px!important}.command-cell b{font-size:10.8px!important}}
`;
const STYLE_ASSETS=[
 ['noreyo-v533.css',582],['noreyo-v534.css',582,'data-noreyo-v534="1"'],['noreyo-v541.css',582],
 ['noreyo-v544.css',657],['noreyo-v551.css',582],['noreyo-v552.css',582],['noreyo-v555.css',582],
 ['noreyo-v556.css',582],['noreyo-v557.css',582],['noreyo-v558.css',582],['noreyo-v583.css',583],
 ['noreyo-v584.css',584],['noreyo-v585.css',619]
];
const SCRIPT_ASSETS=[
 ['noreyo-v533.js',689],['noreyo-v541.js',663],['noreyo-v544.js',657],['noreyo-v546.js',666],
 ['noreyo-v547.js',650],['noreyo-v548.js',628],['noreyo-v551.js',664],['noreyo-v552.js',665],
 ['noreyo-v553.js',661],['noreyo-v559.js',676],['noreyo-v554.js',662],['noreyo-v555.js',582],
 ['noreyo-v556.js',587],['noreyo-v557.js',667],['noreyo-v558.js',658],['noreyo-v584.js',670],
 ['noreyo-v606.js',627],['noreyo-v585.js',669],['noreyo-v607.js',656],['noreyo-v612.js',630],
 ['noreyo-v591.js',635],['noreyo-v624.js',652],['noreyo-v636.js',660],['noreyo-v644.js',659],
 ['noreyo-v673.js',690],['noreyo-v677.js',677],['noreyo-v679.js',684],['noreyo-v681.js',681],['noreyo-v683.js',686],['noreyo-v688.js',688]
];
const statusEl=document.getElementById('status');
const setStatus=t=>{if(statusEl)statusEl.textContent=t;};
const mime=name=>({jpg:'image/jpeg',jpeg:'image/jpeg',png:'image/png',webp:'image/webp',gif:'image/gif',svg:'image/svg+xml'})[name.split('.').pop().toLowerCase()]||'application/octet-stream';
const escRe=v=>String(v).replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
async function inflateRaw(bytes){const ds=new DecompressionStream('deflate-raw');return new Uint8Array(await new Response(new Blob([bytes]).stream().pipeThrough(ds)).arrayBuffer());}
async function unzipNative(buffer){const u8=new Uint8Array(buffer),dv=new DataView(buffer),td=new TextDecoder(),out={};let off=0;while(off+30<=u8.length&&dv.getUint32(off,true)===0x04034b50){const flags=dv.getUint16(off+6,true),method=dv.getUint16(off+8,true),csize=dv.getUint32(off+18,true),nlen=dv.getUint16(off+26,true),xlen=dv.getUint16(off+28,true);if(flags&0x08)throw new Error('ZIP data descriptor unsupported');const name=td.decode(u8.subarray(off+30,off+30+nlen)),start=off+30+nlen+xlen,comp=u8.slice(start,start+csize);let raw;if(method===0)raw=comp;else if(method===8)raw=await inflateRaw(comp);else throw new Error('ZIP compression '+method+' unsupported');out[name]=raw;off=start+csize;}if(!out['index.html'])throw new Error('index.html fehlt im Paket');return out;}
function loadScript(src,timeoutMs=15000){return new Promise((resolve,reject)=>{const s=document.createElement('script');let done=false;const finish=(ok,error)=>{if(done)return;done=true;clearTimeout(timer);s.onload=s.onerror=null;if(ok)resolve();else{try{s.remove();}catch(_){ }reject(error||new Error('Script konnte nicht geladen werden'));}};const timer=setTimeout(()=>finish(false,new Error('Script-Timeout: '+src)),timeoutMs);s.src=src;s.onload=()=>finish(true);s.onerror=()=>finish(false,new Error('Script konnte nicht geladen werden: '+src));document.head.appendChild(s);});}
async function fetchWithTimeout(url,init={},timeoutMs=30000){if(typeof AbortController==='undefined')return fetch(url,init);const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),timeoutMs);try{return await fetch(url,{...init,signal:controller.signal});}catch(error){if(controller.signal.aborted)throw new Error('Netzwerk-Timeout: '+url);throw error;}finally{clearTimeout(timer);}}
async function unzipFallback(buffer){setStatus('Kompatibilitätsmodus wird geladen …');await loadScript('https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js');const z=await JSZip.loadAsync(buffer),out={};for(const [name,e] of Object.entries(z.files))if(!e.dir)out[name]=new Uint8Array(await e.async('uint8array'));return out;}
function brand(html){html=html.split('ONE TRIP').join('NOREYO').split('One Trip').join('NOREYO').split('one trip').join('NOREYO').split('zeigt dir zuerst die Reisen').join('zeigt dir die Reisen');html=html.replace(/<title>.*?<\/title>/i,'<title>NOREYO – Travel made for you.</title>');html=html.replace(/<meta\s+name="application-name"[^>]*>/i,'<meta name="application-name" content="NOREYO">');if(!/name="apple-mobile-web-app-title"/i.test(html))html=html.replace('</title>','</title>\n<meta name="apple-mobile-web-app-title" content="NOREYO">');if(!/name="description"/i.test(html))html=html.replace('</title>','</title>\n<meta name="description" content="NOREYO – Travel made for you. Finde Hotels und Reisen, die wirklich zu deinen Wünschen passen.">');return html;}
function stripAsset(html,kind,name){const tag=kind==='style'?'link':'script',attr=kind==='style'?'href':'src';const re=new RegExp('<'+tag+'\\b[^>]*'+attr+'=["\\\']\\./'+escRe(name)+'(?:\\?[^"\\\']*)?["\\\'][^>]*>'+(kind==='script'?'\\s*</script>':''),'gi');return html.replace(re,'');}
function styleTag([name,build,extra='']){return '<link rel="stylesheet" '+extra+' href="./'+name+'?build='+build+'">';}
function scriptTag([name,build]){return '<scr'+'ipt src="./'+name+'?build='+build+'"></scr'+'ipt>';}
function patch(html){html=html.split('V5.27').join(BUILD).split('content="5.27"').join('content="'+BUILD+'"').split('BUILD 5.27').join('BUILD '+BUILD);html=brand(html);if(!html.includes('</style>'))throw new Error('Style-Anker fehlt');html=html.replace('</style>',HOTFIX+'</style>');for(const [name] of STYLE_ASSETS)html=stripAsset(html,'style',name);for(const [name] of SCRIPT_ASSETS)html=stripAsset(html,'script',name);if(!html.includes('</head>')||!html.includes('</body>'))throw new Error('HTML-Anker fehlen');html=html.replace('</head>',STYLE_ASSETS.map(styleTag).join('')+'</head>');return html.replace('</body>',SCRIPT_ASSETS.map(scriptTag).join('')+'</body>');}
function showBootError(err){console.error(err);const bar=document.getElementById('bar');if(bar)bar.style.display='none';if(statusEl)statusEl.textContent='NOREYO konnte nicht geladen werden';const e=document.getElementById('error');if(e){e.style.display='block';e.textContent='Bitte Seite neu laden.\n\n'+(err?.message||String(err));}}
async function boot(){try{setStatus('NOREYO '+BUILD+' wird vorbereitet …');const r=await fetchWithTimeout('./site.zip?build='+SITE_BUILD,{cache:'no-store'},30000);if(!r.ok)throw new Error('site.zip konnte nicht geladen werden ('+r.status+')');const buffer=await r.arrayBuffer();let files;try{files=await unzipNative(buffer);}catch(error){console.warn(error);files=await unzipFallback(buffer);}let html=patch(new TextDecoder().decode(files['index.html']));setStatus('Bilder werden vorbereitet …');for(const [name,bytes] of Object.entries(files)){if(!name.startsWith('assets/')||name.endsWith('/'))continue;html=html.split(name).join(URL.createObjectURL(new Blob([bytes],{type:mime(name)})));}document.open();document.write(html);document.close();}catch(error){showBootError(error);}}
window.NOREYO_BOOTSTRAP=Object.freeze({BUILD,SITE_BUILD,patch,styles:STYLE_ASSETS,scripts:SCRIPT_ASSETS});
boot();
})();
