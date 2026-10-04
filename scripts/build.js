// Normalize source paths for the pinned compiler on Windows and Linux.
const fs=require('fs'),path=require('path'),{spawnSync}=require('child_process');
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
 });
});
