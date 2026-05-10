#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Convert chapter_outlines.md to volume_map.json."""

import json
import re
import sys

# Chinese chars as variables to avoid regex encoding issues
VOL = '\u5377'            # 卷
SEC = '\u7ae2'            # ###
CHI = '\u7b2c'            # 第
ZHANG = '\u7ae0'          # 章
HOOK = '\u2192\u7ae0\u672b\u94a9\u5b50\uff1a'  # →章末钩子：
SKIP_SECTIONS = [
    '\u5251\u5810\u5bb9\u91cf\u8fdb\u5ea6\u8868',
    '\u4e0d\u53ef\u9006\u4e8b\u4ef6\u8ffd\u8e2a',
    '\u8282\u594f\u68c0\u67e5',
]

cn_map = {
    '\u4e00': 1, '\u4e8c': 2, '\u4e09': 3, '\u56db': 4,
    '\u4e94': 5, '\u516d': 6, '\u4e03': 7, '\u516b': 8,
    '\u4e5d': 9, '\u5341': 10,
}

def infer_beat(event):
    if any(k in event for k in ['\u70cz\u70b9', '\u5b9e\u8d28', '\u9ad8\u6f6e', '\u60c5\u611f']):
        return '\u5173\u952e\u8f6c6298'
    if any(k in event for k in ['\u7f13\u51b2', '\u559c\u606f', '\u4f59\u6e29']):
        return '\u7f13\u51b2'
    return '\u4e00\u822c\u63a8\u8fdb'

def main():
    md_path = sys.argv[1] if len(sys.argv) > 1 else "chapter_outlines.md"
    with open(md_path, encoding="utf-8") as f:
        content = f.read()

    lines = content.split("\n")

    volumes = []
    current_vol = None
    chapters = []
    section_chapters = []
    in_skip = False

    for i, raw_line in enumerate(lines):
        line = raw_line.strip()
        if not line:
            continue

        # Skip metadata tables
        if any(line.startswith(s) for s in SKIP_SECTIONS):
            in_skip = True
            continue
        if in_skip:
            if line.startswith(VOL) and SEC not in line:
                in_skip = False
            else:
                continue

        # Volume header: ## 卷X：标题（chN-N）
        # Pattern: ## 卷<chinese>[：:] <title> （ch<num>-<num>）
        vol_m = re.match(rf'^{SEC}{VOL}([{chr(0x4e00)}-]{1,5})[：:]\s*(.+?)\s*（ch(\d+)-(\d+)）', line)
        if vol_m:
            if current_vol is not None:
                if section_chapters:
                    chapters.extend(section_chapters)
                if chapters:
                    current_vol['chapters'] = chapters
                volumes.append(current_vol)

            vol_cn = vol_m.group(1)
            vol_title = vol_m.group(2)
            ch_start = int(vol_m.group(3))
            ch_end = int(vol_m.group(4))
            vol_id = cn_map.get(vol_cn[0], 1)

            current_vol = {
                'volumeId': vol_id,
                'volumeTitle': f'{VOL}{vol_cn}：{vol_title}',
                'chapterRange': [ch_start, ch_end],
                'coreConflict': '',
                'keyTurnChapter': ch_end,
                'keyTurnEvent': '',
                'harvestGoals': [],
                'chapters': []
            }
            chapters = []
            section_chapters = []
            continue

        # Section heading: ### 第N-M章：标题
        sec_m = re.match(rf'^{SEC}{SEC}{CHI}(\d+)-(\d+){ZHANG}[：:](.+)', line)
        if sec_m:
            if section_chapters:
                chapters.extend(section_chapters)
            section_chapters = []
            continue

        # Individual chapter: **第N章：标题**
        ch_m = re.search(rf'\*{CHI}(\d+){ZHANG}[：:](.+?)\*\*', line)
        if ch_m:
            ch_num = int(ch_m.group(1))
            ch_title = ch_m.group(2).strip()

            # Collect description from following lines
            desc_parts = []
            hook = ''
            for j in range(i + 1, len(lines)):
                nl = lines[j].strip()
                if not nl:
                    continue
                if re.search(rf'\*{CHI}\d+{ZHANG}', nl) or nl.startswith('#'):
                    break
                if nl.startswith(HOOK):
                    hook = nl[len(HOOK):].strip()
                    break
                if nl and not nl.startswith('\u2192'):
                    desc_parts.append(nl)
                if len(desc_parts) > 6:
                    break

            full_desc = ' '.join(desc_parts)
            if hook:
                full_desc = f'{full_desc} {HOOK}{hook}'

            beat = infer_beat(ch_title)
            section_chapters.append({
                'chapter': ch_num,
                'event': ch_title,
                'beat': beat,
                'description': full_desc
            })
            continue

        # Range chapters: **第N-M章：标题**
        rng_m = re.search(rf'\*{CHI}(\d+)-(\d+){ZHANG}[：:](.+?)\*\*', line)
        if rng_m:
            start = int(rng_m.group(1))
            end = int(rng_m.group(2))
            title = rng_m.group(3).strip()
            hook_m = re.search(rf'{HOOK}(.+)$', line)
            hook = hook_m.group(1).strip() if hook_m else ''

            if section_chapters:
                chapters.extend(section_chapters)
            section_chapters = []

            for ch in range(start, end + 1):
                desc = f'{CHI}{ch}{ZHANG}推进剧情'
                if ch == end and hook:
                    desc = f'{CHI}{ch}{ZHANG}推进剧情 {HOOK}{hook}'
                section_chapters.append({
                    'chapter': ch,
                    'event': f'{title}（{CHI}{ch}{ZHANG}）',
                    'beat': '\u7f13\u51b2' if ch == end else '\u4e00\u822c\u63a8\u8fdb',
                    'description': desc
                })
            continue

    # Save last volume
    if current_vol is not None:
        if section_chapters:
            chapters.extend(section_chapters)
        if chapters:
            current_vol['chapters'] = chapters
        volumes.append(current_vol)

    total_chapters = max(
        (vol['chapters'][-1]['chapter'] for vol in volumes if vol.get('chapters')),
        default=360
    )

    result = {
        'schemaVersion': 1,
        'meta': {
            'bookTitle': '\u4e00\u5251\u4e00\u5806\u4e00\u82cd\u751f',
            'sourceFile': 'story/chapter_outlines.md',
            'generatedAt': '2026-04-29T00:00:00.000Z',
            'totalChapters': total_chapters,
            'totalVolumes': len(volumes)
        },
        'volumes': volumes
    }

    out_path = sys.argv[2] if len(sys.argv) > 2 else "volume_map.json"
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(result, f, ensure_ascii=False, indent=2)

    total = sum(len(v.get('chapters', [])) for v in volumes)
    print(f'Generated {out_path}: {len(volumes)} volumes, {total} chapters')

if __name__ == '__main__':
    main()