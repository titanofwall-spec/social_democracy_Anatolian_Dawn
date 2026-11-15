# coding: utf-8
"""Upgrade previous Anatolian Dawn government tooltip installation in-place."""
import argparse, datetime, json, pathlib, re, shutil, sys
MARKER='data-anatolian-coldwar-governments="v1"'

def main():
    ap=argparse.ArgumentParser()
    ap.add_argument('--root',required=True)
    ap.add_argument('--resource',required=True)
    args=ap.parse_args()
    root=pathlib.Path(args.root)
    if not root.is_dir(): sys.exit('ERROR: Repository not found: '+str(root))
    db=json.loads(pathlib.Path(args.resource).read_text(encoding='utf-8'))
    assert len(db.get('countries',[]))==108,'Unexpected government country count'
    for c in db['countries']:
        assert c.get('periods'),c['name']
        assert all(all(p.get(k) for k in ('head_of_state','head_of_government','government')) for p in c['periods']),c['name']
    js_template=(pathlib.Path(__file__).parent/'government_tooltips.js').read_text(encoding='utf-8')
    assert js_template.count('/*__DATABASE__*/')==1
    payload=js_template.replace('/*__DATABASE__*/',json.dumps(db,ensure_ascii=False,separators=(',',':')))
    # Only modify the adapter previously installed by our old installer. No source guessing.
    targets=[]
    for html in root.rglob('*.html'):
        if any(x.lower() in {'node_modules','.git','_cold_war_patch_backups'} for x in html.relative_to(root).parts):continue
        try:
            if html.stat().st_size>3_000_000:continue
            content=html.read_text(encoding='utf-8-sig')
        except (OSError,UnicodeError):continue
        if MARKER in content or re.search(r'<script\b[^>]+_cold_war_governments/government_tooltips\.js',content,re.I):
            targets.append((html,content))
    if not targets:
        print('ERROR: Prior government-tooltip adapter was not found. No files changed.')
        print('This is the fix for the previously installed patch, not an untested replacement of game source.')
        return 2
    modified=[]
    stamp=datetime.datetime.now().strftime('%Y%m%d_%H%M%S')
    backup=root/'_cold_war_patch_backups'/('tooltip_fix_'+stamp)
    for html,content in targets:
        dest=html.parent/'_cold_war_governments'/'government_tooltips.js'
        if not dest.exists():
            print('ERROR: Expected installed adapter missing:',dest)
            return 3
        old=dest.read_text(encoding='utf-8-sig')
        if 'AD_COLD_WAR_GOV_V1__' not in old and 'AD_COLD_WAR_GOV_V2__' not in old:
            print('ERROR: Existing script not recognized; refusing to overwrite:',dest)
            return 4
        modified.append((dest,old))
    # All targets validated before writing to disk.
    for dest,old in modified:
        backupfile=backup/dest.relative_to(root)
        backupfile.parent.mkdir(parents=True,exist_ok=True)
        shutil.copy2(dest,backupfile)
        dest.write_text(payload,encoding='utf-8')
        print('UPDATED:',dest.relative_to(root))
    print('Backups:',backup)
    print('Updated',len(modified),'script(s). The existing tooltip rows now receive historical values; no additional block is appended.')
    return 0
if __name__=='__main__':sys.exit(main())
