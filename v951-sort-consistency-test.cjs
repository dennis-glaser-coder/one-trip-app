const fs=require('fs'),vm=require('vm');const code=fs.readFileSync('noreyo-v951.js','utf8');
const buttons=['recommended','price','rating'].map(sort=>({dataset:{sort},active:sort==='recommended',attrs:{},classList:{toggle(k,on){if(k==='active-sort')this.owner.active=on}},setAttribute(k,v){this.attrs[k]=v}}));buttons.forEach(b=>b.classList.owner=b);
const ctx={console,Number,String,Object,Array,offers:[{id:'a',price:300,rating:'8,1'},{id:'b',price:100,rating:'9,0'},{id:'c',price:'bad',rating:'—'}],recommendedOrder:['a','b','c'],renderCount:0,sortOffers(){},renderOffers(){ctx.renderCount++},document:{querySelector(sel){return sel.includes('.active-sort')?buttons.find(x=>x.active):null},querySelectorAll(){return buttons}},window:{}};
vm.createContext(ctx);vm.runInContext(code,ctx);const a=ctx.window.NOREYO_V951;let fail=0;
ctx.sortOffers('price',buttons[1]);let ok=ctx.offers.map(x=>x.id).join(',')==='b,a,c'&&buttons[1].active&&buttons[1].attrs['aria-pressed']==='true';console.log(ok?'PASS price sort matches active toolbar':'FAIL price '+JSON.stringify(ctx.offers));if(!ok)fail++;
ctx.offers.splice(0,3,{id:'a',price:300,rating:'8,1'},{id:'b',price:100,rating:'9,0'},{id:'c',price:200,rating:'7,0'});ctx.renderOffers();ok=ctx.offers.map(x=>x.id).join(',')==='b,c,a'&&buttons[1].active;console.log(ok?'PASS live rerender preserves active price sort':'FAIL rerender');if(!ok)fail++;
ctx.sortOffers('rating',buttons[2]);ok=ctx.offers.map(x=>x.id).join(',')==='b,a,c'&&buttons[2].active;console.log(ok?'PASS rating sort descending':'FAIL rating');if(!ok)fail++;
ctx.sortOffers('recommended',buttons[0]);ok=ctx.offers.map(x=>x.id).join(',')==='a,b,c'&&buttons[0].active;console.log(ok?'PASS recommended order restored':'FAIL recommended');if(!ok)fail++;
if(fail)process.exit(1);
