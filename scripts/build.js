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
  // Install new sidebar and demographic scripts after Dendry's make-html refresh.
  // This survives subsequent `npm run build` executions.
  let versioned=html;
  // Preserve the macro model include when Dendry regenerates index.html.
  if(!versioned.includes('src="macro-economy.js')) {
    versioned=versioned.replace(/(<script src="rules\.js(?:\?[^"]*)?"\s*><\/script>)/,
      '<script src="macro-economy.js"></script>\n    $1');
  }
  if(!versioned.includes('src="dynamic-demographics.js')) {
    versioned=versioned.replace(/(<script src="provinces\.js(?:\?[^"]*)?"\s*><\/script>)/,
      '$1\n     <script src="dynamic-demographics.js"></script>\n     <script src="mission.js"></script>');
  }
  if(!versioned.includes('id="mission_tab"')) {
    versioned=versioned.replace(/(<button[^>]*id="social_issues_tab"[^>]*>Social Issues<\/button>)/,
      '$1\n                     <button class="tab_button" id="mission_tab" onclick="window.changeTab(\'status.mission\', \'mission_tab\');">Land Reform</button>');
  }
  for(const name of ['cyprus-presentation.js','sandbox-menu.js','save-storage.js','game.js','rules.js','macro-economy.js','kurdish-event-media.js','kurdish-organizations.js','peoples-sector.js','social-issues.js','municipalities.js','national-coalition.js','card-actions.js','coalitions.js','data/coalition-actions.js','data/coalition-texts.js','cyprus-atilla1.js','cyprus-campaign.js','cyprus-roadmap.js','data.js','d3-linegraph.js','data/province-data.js','provinces.js','dynamic-demographics.js','mission.js','data/senate-data.js','senate.js','province-map.js']){
    const asset=path.join(root,'out/html',name);if(!fs.existsSync(asset))continue;
    const version=crypto.createHash('sha256').update(fs.readFileSync(asset)).digest('hex').slice(0,12);
    const escaped=name.replace(/\./g,'\\.');
    versioned=versioned.replace(new RegExp('src="'+escaped+'(?:\\?[^"]*)?"','g'),'src="'+name+'?v='+version+'"');
  }
  for(const name of ['province-map.css','game.css']){const version=crypto.createHash('sha256').update(fs.readFileSync(path.join(root,'out/html',name))).digest('hex').slice(0,12);versioned=versioned.replace(new RegExp('href="'+name.replace(/\./g,'\\.')+'(?:\\?[^"]*)?"','g'),'href="'+name+'?v='+version+'"');}
  fs.writeFileSync(indexPath,versioned);

 });
});
