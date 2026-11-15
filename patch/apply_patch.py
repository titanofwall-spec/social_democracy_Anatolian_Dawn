# coding: utf-8
"""Safely mount a self-contained tooltip enhancement into existing HTML entrypoints."""
import argparse, datetime, json, os, pathlib, re, shutil, sys

MARKER='data-anatolian-coldwar-governments="v1"'
SKIP={'node_modules','.git','dist-backup','backup','backups','vendor','.next','coverage','build-cache'}

def main():
    arg=argparse.ArgumentParser()
    arg.add_argument('--root', required=True)
    arg.add_argument('--resource', required=True)
    a=arg.parse_args()
    root=pathlib.Path(a.root); source=pathlib.Path(a.resource)
    if not root.is_dir(): sys.exit('ERROR: Game directory not found: '+str(root))
    db=json.loads(source.read_text(encoding='utf-8'))
    assert len(db.get('countries',[]))==108, 'Unexpected country data count'
    for country in db['countries']:
        assert country['name'] and country['periods'], country
        for p in country['periods']:
            assert all(p.get(k) for k in ('head_of_state','head_of_government','government')), country['name']
    files=[]
    for dirpath, dirs, fnames in os.walk(root):
        depth=len(pathlib.Path(dirpath).relative_to(root).parts)
        dirs[:]=[d for d in dirs if d.lower() not in SKIP and not d.startswith('.') and depth<7]
        for fname in fnames:
            if fname.lower().endswith(('.html','.htm')):
                path=pathlib.Path(dirpath)/fname
                if path.stat().st_size < 3_000_000: files.append(path)
    candidates=[]
    for path in files:
        try: data=path.read_text(encoding='utf-8-sig')
        except UnicodeError: continue
        score=(len(re.findall(r'cold.?war|coldwar|soğuk.?savaş',data,re.I))*10 +
               len(re.findall(r'province|election|anatolian.dawn|social.democracy',data,re.I))*2)
        # Score html entry points by relevance, but runtime may be a dynamic JS page.
        if re.search(r'</body\s*>',data,re.I) and score: candidates.append((score,path,data))
    if not candidates:
        print('ERROR: No suitable HTML entry point identified. Files were not changed.')
        print('Searched',len(files),'HTML files under',root)
        sys.exit(2)
    candidates.sort(reverse=True,key=lambda a:a[0])
    selected=[c for c in candidates if c[0]>=10]
    if not selected: selected=candidates[:1]
    # Avoid editing a large number of docs rather than actual entrypoints.
    selected=selected[:6]
    stamp=datetime.datetime.now().strftime('%Y%m%d_%H%M%S')
    backup=root/'_cold_war_patch_backups'/stamp
    staged=[]
    for _, htmlpath, original in selected:
        relative=htmlpath.relative_to(root)
        assetdir=htmlpath.parent/'_cold_war_governments'
        src='_cold_war_governments/government_tooltips.js'
        injection=f'<script {MARKER} src="{src}" defer></script>'
        if MARKER in original: print('ALREADY PATCHED:',relative); continue
        match=list(re.finditer(r'</body\s*>',original,re.I))
        if not match: continue
        # backup and stage files before changing originals
        target_backup=backup/relative; target_backup.parent.mkdir(parents=True,exist_ok=True)
        shutil.copy2(htmlpath,target_backup)
        assets_backup=backup/(assetdir.relative_to(root))
        if assetdir.exists():
            shutil.copytree(assetdir,assets_backup,dirs_exist_ok=True)
        assetdir.mkdir(parents=True,exist_ok=True)
        bundled=pathlib.Path(__file__).resolve().parent/'government_tooltips.js'
        # Embed data within the JS to avoid needing external fetch/CORS or bundler changes.
        js=bundled.read_text(encoding='utf-8').replace('/*__DATABASE__*/', json.dumps(db,ensure_ascii=False,separators=(',',':')))
        (assetdir/'government_tooltips.js').write_text(js,encoding='utf-8')
        m=match[-1]
        updated=original[:m.start()]+injection+'\n'+original[m.start():]
        htmlpath.write_text(updated,encoding='utf-8')
        staged.append(str(relative))
    if not staged:
        print('No new files installed: entry points may already have been patched.')
        sys.exit(3)
    report=root/'_cold_war_governments_patch_install.txt'
    report.write_text('Installed '+stamp+'\nBackups: '+str(backup)+'\nEntry points:\n'+'\n'.join(staged)+'\n\nThis is a DOM compatibility enhancement. Verify tooltip UI in-game; runtime layouts cannot be proven without game sources.\n',encoding='utf-8')
    print('Installed into:',root)
    print('Modified HTML entry points:',*staged,sep='\n  - ')
    print('Backups:',backup)
    print('IMPORTANT: Verify game tooltips manually; runtime behavior is dependent on existing DOM markup.')

if __name__=='__main__': main()
