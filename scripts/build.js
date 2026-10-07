// Normalize source paths for the pinned compiler on Windows and Linux.
const fs=require('fs'),path=require('path'),crypto=require('crypto'),{spawnSync}=require('child_process');
const root=path.resolve(__dirname,'..');
const compiler=require('dendrynexus/lib/parsers/compiler.js');
const files=[];
function walk(dir){for(const e of fs.readdirSync(dir,{withFileTypes:true})){
 const full=path.join(dir,e.name);
 if(e.isDirectory())walk(full);
 else if(e.name.endsWith('.dry'))files.push({name:path.relative(root,full).replace(/\\/g,'/'),contents:fs.readFileSync(full,'utf8')});
}}
walk(path.join(root,'source'));
compiler.compileGame(files,(err,game)=>{
 if(err)throw err;
 compiler.convertGameToJSON(game,2,(error,json)=>{
  if(error)throw error;
  fs.mkdirSync(path.join(root,'out'),{recursive:true});
  fs.writeFileSync(path.join(root,'out/game.json'),json);
  const result=spawnSync(process.execPath,[require.resolve('dendrynexus/lib/cli/main.js'),'make-html','--pretty'],{cwd:root,stdio:'inherit'});
  if(result.error)throw result.error;
  if(result.status!==0){process.exitCode=result.status||1;return;}
  fs.copyFileSync(path.join(root,'out/game.json'),path.join(root,'out/html/game.json'));
  // core.js embeds the compiled scenes; refresh its URL whenever the rules change.
  const coreVersion=crypto.createHash('sha256').update(fs.readFileSync(path.join(root,'out/html/core.js'))).digest('hex').slice(0,12);
  const indexPath=path.join(root,'out/html/index.html');
  const html=fs.readFileSync(indexPath,'utf8').replace(/src="core\.js(?:\?[^"]*)?"/g,'src="core.js?v='+coreVersion+'"');
  let versioned=html;
  for(const name of ['game.js','rules.js','cyprus-atilla1.js','cyprus-campaign.js','cyprus-roadmap.js','data.js']){
    const asset=path.join(root,'out/html',name);if(!fs.existsSync(asset))continue;
    const version=crypto.createHash('sha256').update(fs.readFileSync(asset)).digest('hex').slice(0,12);
    const escaped=name.replace(/\./g,'\\.');
    versioned=versioned.replace(new RegExp('src="'+escaped+'(?:\\?[^"]*)?"','g'),'src="'+name+'?v='+version+'"');
  }
  fs.writeFileSync(indexPath,versioned);

 });
});
