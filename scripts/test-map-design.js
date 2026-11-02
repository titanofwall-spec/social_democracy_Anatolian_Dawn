const assert=require('assert');
require('../out/html/data/province-data.js');const D=require('../out/html/map-design.js');
let count=0;function test(name,run){run();count++;console.log('PASS '+name);}
function base(type){return {id:D.id(),type,x:0,y:0,rotation:0,scale:1,opacity:1,provinceId:null,clipProvince:null};}
function stroke(type='brush'){return {...base(type),color:'#123456',size:12,hardness:.5,brush:'soft',points:[[0,0,.5],[20,10,1]],pressure:true};}
function text(){return {...base('text'),text:'İstanbul\n<script>literal text</script>',font:'Georgia',size:24,color:'#123456',halo:'#ffffff',haloWidth:2,bold:true,italic:false,align:'middle',spacing:.5,leading:1.2,leader:true,provinceId:'istanbul'};}
test('Versioned design documents round-trip every supported editable object and blend mode',()=>{
 const d=D.create();d.layers[0].items=[stroke(),stroke('eraser'),text(),...['rect','ellipse','line'].map(type=>({...base(type),width:40,height:50,fill:'none',stroke:'#aabbcc',strokeWidth:2,dash:true})),{...base('wash'),color:'#ffffff',color2:'#000000',angle:90,kind:'linear',strength:.7},{...base('image'),name:'tiny.png',src:'data:image/png;base64,aGVsbG8=',width:50,height:50}];
 for(const blend of D.blends){d.layers[0].blend=blend;assert.deepEqual(JSON.parse(D.serialize(d)),d);}
});
test('Project data cannot change province geometry, inject SVG images, use external resources or select unknown provinces',()=>{
 const d=D.create();assert.throws(()=>D.validate({...d,version:99}),/version/);assert.throws(()=>D.validate({...d,geometryHash:'wrong'}),/different/);const a=D.clone(d);a.extent.width=1;assert.throws(()=>D.validate(a),/coordinate/);
 for(const src of ['https://example.com/x.png','data:image/svg+xml;base64,PHN2Zy8+','javascript:alert(1)']){const a=D.clone(d);a.layers[0].items=[{...base('image'),src,width:5,height:5,name:'bad'}];assert.throws(()=>D.validate(a),/Images must/);}
 const t=text();t.provinceId='imaginary';d.layers[0].items=[t];assert.throws(()=>D.validate(d),/Unknown province/);
});
test('Invalid coordinates, oversized text, duplicate IDs, missing settings and unknown blends fail validation',()=>{
 const d=D.create();d.layers[0].items=[stroke()];d.layers[0].items[0].x=Infinity;assert.throws(()=>D.validate(d),/position/);d.layers[0].items=[text()];d.layers[0].items[0].text='x'.repeat(4001);assert.throws(()=>D.validate(d),/Label text/);d.layers[0].items=[stroke(),stroke()];d.layers[0].items[1].id=d.layers[0].items[0].id;assert.throws(()=>D.validate(d),/unique/);d.layers[0].items=[];d.layers[0].blend='made-up';assert.throws(()=>D.validate(d),/blend/);d.layers[0].blend='normal';d.settings=null;assert.throws(()=>D.validate(d),/Missing/);
});
test('Layer merges retain every child setting and object rather than baking a bitmap',()=>{
 const d=D.create(),lower=d.layers[0],upper=D.layer('Upper');lower.blend='overlay';lower.opacity=.4;lower.items=[stroke()];upper.blend='multiply';upper.clip='land';upper.items=[text()];d.layers.push(upper);const expected=D.clone(d.layers);D.mergeDown(d,1);assert.equal(d.layers.length,1);assert.deepEqual(d.layers[0].children,expected);assert.deepEqual(D.validate(d),d);d.layers[0].locked=true;d.layers.push(D.layer());assert.throws(()=>D.mergeDown(d,1),/Unlock/);
});
test('Layer and stroke limits reject unreasonable projects before rendering',()=>{
 const d=D.create();d.layers=Array.from({length:65},()=>D.layer());assert.throws(()=>D.validate(d),/64 layers/);d.layers=[D.layer()];d.layers[0].items=[stroke()];d.layers[0].items[0].points=Array.from({length:6001},()=>[0,0,.5]);assert.throws(()=>D.validate(d),/stroke points/);
 const nested=D.create();let l=nested.layers[0];for(let i=0;i<8;i++){const next=D.layer();l.children=[next];l=next;}assert.throws(()=>D.validate(nested),/six levels/);
});
test('Province anchors resolve offsets against the existing map and leave source geography untouched',()=>{
 const raw=JSON.stringify(globalThis.AnatolianProvinceData),t=text(),p=globalThis.AnatolianProvinceData.provinces.find(p=>p.id==='istanbul');t.x=10;t.y=-20;assert.deepEqual(D.position(t),{x:p.center[0]+10,y:p.center[1]-20});t.provinceId=null;assert.deepEqual(D.position(t),{x:10,y:-20});assert.equal(JSON.stringify(globalThis.AnatolianProvinceData),raw);
});
test('Large images and optional crop/flip metadata round-trip without changing older projects',()=>{
 const d=D.create(),i={...base('image'),name:'large.png',src:'data:image/png;base64,'+'A'.repeat(9000000),width:15000,height:10000,crop:{x:.1,y:.2,width:.6,height:.7},lockAspect:true,flipX:true,flipY:false};d.layers[0].items=[i];assert.deepEqual(D.validate(d),d);assert.deepEqual(D.imageFrame(i),{x:1500,y:2000,width:9000,height:7000});assert(D.limits.imageBytes>100*1024*1024);i.crop.width=.95;assert.throws(()=>D.validate(d),/inside the original/);i.crop={x:0,y:0,width:0,height:1};assert.throws(()=>D.validate(d),/Crop width/);delete i.crop;delete i.lockAspect;delete i.flipX;delete i.flipY;assert.deepEqual(D.validate(d),d);
});
console.log('PASS '+count+' map design format suites.');
