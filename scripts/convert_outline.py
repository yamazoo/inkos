# -*- coding: utf-8 -*-
import json, re

SKIP = ['剑冢容量进度表', '不可逆事件追踪', '节奏检查']
CN = {'一':1,'二':2,'三':3,'四':4,'五':5,'六':6,'七':7,'八':8,'九':9,'十':10}

def beat(e):
    for kw in ['爽点','实质','高潮','情感']:
        if kw in e: return '关键转折'
    for kw in ['缓冲','喘息','余温']:
        if kw in e: return '缓冲'
    return '一般推进'

md = open('books/一剑一冢一苍生/story/chapter_outlines.md', encoding='utf-8').read()
lines = md.split('\n')
vols, cur, chs, sec_chs, skip = [], None, [], [], False

SECTION_RE = re.compile(r'^(#{2,3})\s*第(\d+)-(\d+)章[：:](.+)')
CHAPTER_RE = re.compile(r'第(\d+)章[：:](.+)')

for i, l in enumerate(lines):
    line = l.strip()
    if not line: continue

    if any(line.startswith(s) for s in SKIP):
        skip = True; continue

    sec_m = SECTION_RE.match(line)
    if sec_m:
        if sec_chs: chs.extend(sec_chs)
        sec_chs = []
        skip = False
        continue

    if skip: continue

    vm = re.match(r'^## 卷([一二三四五六七八九十]+)[：:]\s*(.+?)\s*（ch(\d+)-(\d+)）', line)
    if vm:
        if cur:
            if sec_chs: chs.extend(sec_chs)
            if chs: cur['chapters'] = chs
            vols.append(cur)
        vc=vm.group(1); vt=vm.group(2); cs=int(vm.group(3)); ce=int(vm.group(4))
        cur={'volumeId':CN.get(vc,1),'volumeTitle':'卷'+vc+'：'+vt,'chapterRange':[cs,ce],'coreConflict':'','keyTurnChapter':ce,'keyTurnEvent':'','harvestGoals':[],'chapters':[]}
        chs=[]; sec_chs=[]
        continue

    stripped = line.strip()
    if stripped.startswith('**'): stripped = stripped[2:]
    if stripped.endswith('**'): stripped = stripped[:-2]
    cm = CHAPTER_RE.search(stripped)
    if cm:
        cn=int(cm.group(1)); ct=cm.group(2).strip()
        d=[]; hk=''
        for j in range(i+1, len(lines)):
            nl=lines[j].strip()
            if not nl: continue
            if re.search(r'第\d+章', nl): break
            if nl.startswith('→章末钩子：'):
                hk=nl[6:].strip(); break
            if nl and not nl.startswith('→'): d.append(nl)
            if len(d)>6: break
        full=' '.join(d)
        if hk: full=full+' →章末钩子：'+hk
        sec_chs.append({'chapter':cn,'event':ct,'beat':beat(ct),'description':full})
        continue

    rm = re.match(r'^第(\d+)-(\d+)章[：:](.+)', stripped)
    if rm:
        s=int(rm.group(1)); e=int(rm.group(2)); t=rm.group(3).strip()
        hkm=re.search(r'→章末钩子：(.+)$', stripped)
        hk=hkm.group(1).strip() if hkm else ''
        if sec_chs: chs.extend(sec_chs)
        sec_chs=[]
        for ch in range(s, e+1):
            d='第'+str(ch)+'章推进剧情'
            if ch==e and hk: d=d+' →章末钩子：'+hk
            sec_chs.append({'chapter':ch,'event':t+'（第'+str(ch)+'章）','beat':'缓冲' if ch==e else '一般推进','description':d})
        continue

if cur:
    if sec_chs: chs.extend(sec_chs)
    if chs: cur['chapters']=chs
    vols.append(cur)

# Post-process: fill missing chapters by looking at the section they belong to
# For any gap in a volume's chapter sequence, create a placeholder
for v in vols:
    existing = {c['chapter'] for c in v['chapters']}
    [cs, ce] = v['chapterRange']
    for ch_num in range(cs, ce+1):
        if ch_num not in existing:
            v['chapters'].append({
                'chapter': ch_num,
                'event': '（待补）',
                'beat': '一般推进',
                'description': f'第{ch_num}章内容待补充'
            })
    v['chapters'].sort(key=lambda c: c['chapter'])

tc=max((v['chapters'][-1]['chapter'] for v in vols if v.get('chapters')), default=360)
result={'schemaVersion':1,'meta':{'bookTitle':'一剑一冢一苍生','sourceFile':'story/chapter_outlines.md','generatedAt':'2026-04-29T00:00:00.000Z','totalChapters':tc,'totalVolumes':len(vols)},'volumes':vols}
with open('books/一剑一冢一苍生/story/outline/volume_map.json', 'w', encoding='utf-8') as f:
    json.dump(result, f, ensure_ascii=False, indent=2)
total=sum(len(v.get('chapters',[])) for v in vols)
print(str(len(vols))+' volumes, '+str(total)+' chapters')
for v in vols:
    chs=v['chapters']
    print('  vol'+str(v['volumeId'])+': ch '+str(chs[0]['chapter'])+'-'+str(chs[-1]['chapter'])+' = '+str(len(chs))+' chs')