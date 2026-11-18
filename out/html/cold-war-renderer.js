(function () {
  'use strict';
  // Final display stack, in exported bottom-to-top order. No browser overrides.
  const layers=[
  {
    "kind": "texture",
    "opacity": 100,
    "blend": "source-over",
    "saturation": 116,
    "contrast": 39,
    "color": "#FFFFFF"
  },
  {
    "kind": "political",
    "opacity": 100,
    "blend": "multiply",
    "saturation": 100,
    "contrast": 100,
    "color": "#FFFFFF"
  },
  {
    "kind": "borders",
    "opacity": 100,
    "blend": "source-over",
    "saturation": 100,
    "contrast": 100,
    "color": "#FFFFFF"
  },
  {
    "kind": "sea",
    "opacity": 100,
    "blend": "multiply",
    "saturation": 52,
    "contrast": 100,
    "color": "#3e3e79"
  },
  {
    "kind": "heightmap",
    "opacity": 100,
    "blend": "color-dodge",
    "saturation": 100,
    "contrast": 56,
    "color": "#FFFFFF"
  },
  {
    "kind": "fill",
    "opacity": 45,
    "blend": "color",
    "saturation": 100,
    "contrast": 100,
    "color": "#393649"
  }
];
  const mapContrast='contrast(135%)'; // 35% boost to the completed map, before lighting and grid.
  const makeCanvas=(w,h)=>{const canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;return canvas;};
  function create({width:w,height:h,source,texture,political,heightmap,insideGlobe}) {
    const mask=makeCanvas(w,h),maskCtx=mask.getContext('2d'),maskPixels=maskCtx.createImageData(w,h);
    const borders=makeCanvas(w,h),borderCtx=borders.getContext('2d'),borderPixels=borderCtx.createImageData(w,h);
    const sea=makeCanvas(w,h),seaCtx=sea.getContext('2d'),seaPixels=seaCtx.createImageData(w,h);
    for(let p=0;p<w*h;p++) {
      const i=p*4,inside=insideGlobe(p%w,Math.floor(p/w));
      maskPixels.data[i]=maskPixels.data[i+1]=maskPixels.data[i+2]=255;
      maskPixels.data[i+3]=inside?255:0;
      if(!inside)continue;
      if(source.data[i]===0&&source.data[i+1]===0&&source.data[i+2]===0&&source.data[i+3]===255)borderPixels.data[i+3]=255;
      if(source.data[i]===255&&source.data[i+1]===255&&source.data[i+2]===255)seaPixels.data[i+3]=255;
    }
    maskCtx.putImageData(maskPixels,0,0);borderCtx.putImageData(borderPixels,0,0);seaCtx.putImageData(seaPixels,0,0);
    const cache=new Map();let cachedDate;
    function build(mode,when){
    const politicalSource=mode==='political'?political:window.ColdWarModes.overlay(source,mode,when,insideGlobe);
    const composite=makeCanvas(w,h),ctx=composite.getContext('2d');
    for(const layer of layers) {
      const surface=makeCanvas(w,h),cx=surface.getContext('2d');
      cx.filter='saturate('+layer.saturation+'%) contrast('+layer.contrast+'%)';
      if(layer.kind==='fill'||layer.kind==='sea'){
        cx.fillStyle=layer.color;cx.fillRect(0,0,w,h);
      }else cx.drawImage({texture,political:politicalSource,borders,heightmap}[layer.kind],0,0,w,h);
      cx.filter='none';cx.globalCompositeOperation='destination-in';cx.drawImage(layer.kind==='sea'?sea:mask,0,0);
      ctx.globalAlpha=layer.opacity/100;ctx.globalCompositeOperation=layer.blend;
      if(ctx.globalCompositeOperation!==layer.blend)throw Error('Unsupported map blend mode: '+layer.blend);
      ctx.drawImage(surface,0,0);
    }
    return composite;
    }
    return {render(target,mode='political',when=window.ColdWarModes.date()){
      if(cachedDate!==when.key){cache.clear();cachedDate=when.key;}
      if(!cache.has(mode))cache.set(mode,build(mode,when));
      const composite=cache.get(mode);target.save();target.setTransform(1,0,0,1,0,0);target.globalAlpha=1;target.filter='none';target.globalCompositeOperation='source-over';target.clearRect(0,0,w,h);target.filter=mapContrast;target.drawImage(composite,0,0);target.restore();}};
  }
  window.ColdWarRenderer={create};
}());
