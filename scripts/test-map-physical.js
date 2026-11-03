// Dedicated physical map document remains independent of electoral results.
const assert=require('assert');
require('../out/html/data/province-data.js');
const D=require('../out/html/map-design.js');
const doc=D.create(),physical=D.layer('Physical map');
doc.layers.push(physical);doc.physicalLayerId=physical.id;
let v=D.validate(doc);assert.equal(v.physicalLayerId,physical.id);
assert.equal(D.hasPhysical(v),false);
const image={id:D.id(),type:'image',x:0,y:0,rotation:0,scale:1,opacity:1,provinceId:null,clipProvince:null,width:1675,height:717,name:'test',src:'data:image/png;base64,iVBORw0KGgo=',crop:{x:0,y:0,width:1,height:1},lockAspect:true,flipX:false,flipY:false};
physical.items.push(image);v=D.validate(doc);
assert.equal(D.hasPhysical(v),true);
assert.equal(D.validate(JSON.parse(D.serialize(v))).physicalLayerId,physical.id);
assert.equal(D.create().physicalLayerId,null);
const legacy=D.create();delete legacy.physicalLayerId;legacy.settings.terrain=true;
assert.equal(D.validate(legacy).physicalLayerId,null);
const bad=D.create();bad.physicalLayerId='missing';assert.throws(()=>D.validate(bad),/Physical map/);
console.log('PASS: isolated physical layer, portable export, retired legacy terrain and invalid reference rejection');
