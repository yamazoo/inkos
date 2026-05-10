#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Sync chapter_outlines.md → volume_map.json description fields.

Reads the existing volume_map.json, matches each chapter number with
the detailed description from chapter_outlines.md, then writes the
updated volume_map.json and optionally deletes chapter_outlines.md.

Usage:
    python sync-chapter-outlines-to-volume-map.py <book-id> [--delete]
"""

import json
import re
import sys
import os
from pathlib import Path


def parse_chapter_outline(content: str) -> dict[int, str]:
    """
    Parse chapter_outlines.md and return {chapter_number: description_text}.

    Each chapter section looks like:
        ## 第 N 章
        ### 章节概述
        <one-line overview>

        ### 情节点列表
        1. **【类型】标题：描述**

        ### 情节点详情
        #### N. 【类型】标题
        <multi-line detail paragraphs>

        ### 关键设定提醒
        <bullet points>

    The description is built from:
        - 章节概述 (first line)
        - 情节点列表 items (bullet text after **)
        - 情节点详情 section titles (#### N. lines)
    """
    chapters: dict[int, str] = {}

    # Split into sections by ## 第 N 章 / ## 第N章-标题
    # Matches: ## 第 1 章  OR  ## 第 2章-xxxx  OR  ## 第21章
    chapter_blocks = re.split(
        r'\n##\s*第\s*(\d+)\s*章[^\n]*\n',
        content
    )

    # chapter_blocks[0] is before first chapter (usually empty/whitespace)
    # After that: [chapter_num, block_content, chapter_num, block_content, ...]
    i = 1
    while i < len(chapter_blocks):
        chapter_num = int(chapter_blocks[i])
        block = chapter_blocks[i + 1] if i + 1 < len(chapter_blocks) else ""

        desc_parts: list[str] = []

        # 1. Extract "章节概述" (first line after heading)
        overview_m = re.search(r'### 章节概述\s*\n(.+?)(?=\n---|\n###)', block, re.DOTALL)
        if overview_m:
            overview_text = overview_m.group(1).strip()
            desc_parts.append(overview_text)

        # 2. Extract "情节点列表" items
        # Pattern: N. **【类型】标题：描述**  OR  N. **【类型】标题**
        plot_list_m = re.search(r'### 情节点列表\s*\n(.*?)(?=\n### 情节点详情)', block, re.DOTALL)
        if plot_list_m:
            plot_lines = plot_list_m.group(1)
            # Extract bullet items, stripping the leading number and ** markers
            for bullet_m in re.finditer(r'^\d+\.\s*\*\*(.+?)\*\*', plot_lines, re.MULTILINE):
                item_text = bullet_m.group(1).strip()
                # Remove 【类型】 prefix and content up to the title
                # e.g. "【日常】回春堂坐诊：交代主角身份..." → "回春堂坐诊：交代主角身份..."
                item_text = re.sub(r'^【[^】]+】', '', item_text)
                if item_text:
                    desc_parts.append(item_text)

        # 3. Extract "情节点详情" sub-section titles (#### N. 【类型】标题)
        # These give the structure/flow of scenes
        plot_detail_m = re.search(
            r'### 情节点详情\s*\n(.*?)(?=\n### 关键设定提醒|\Z)',
            block, re.DOTALL
        )
        if plot_detail_m:
            detail_text = plot_detail_m.group(1)
            # Extract all #### N. 【类型】标题 lines
            for scene_m in re.finditer(r'^####\s*\d+\.\s*【([^】]+)】(.+?)$', detail_text, re.MULTILINE):
                scene_type = scene_m.group(1)
                scene_title = scene_m.group(2).strip()
                # Include as a scene marker + brief description (up to first 。)
                # e.g. "【日常】回春堂坐诊" → "◆ 日常：回春堂坐诊"
                if scene_title:
                    desc_parts.append(f"◆ {scene_type}：{scene_title}")

        # Join all parts into one description
        description = '\n'.join(desc_parts)
        chapters[chapter_num] = description
        i += 2

    return chapters


def main():
    args = sys.argv[1:]
    if len(args) < 1:
        print("Usage: python sync-chapter-outlines-to-volume-map.py <book-id> [--delete]")
        sys.exit(1)

    book_id = args[0]
    delete_after = '--delete' in args

    # Resolve paths
    book_dir = Path.cwd() / 'books' / book_id
    outline_dir = book_dir / 'story' / 'outline'
    chapter_md = book_dir / 'story' / 'chapter_outlines.md'
    volume_json = outline_dir / 'volume_map.json'

    if not book_dir.exists():
        print(f"Error: Book directory not found: {book_dir}")
        sys.exit(1)
    if not chapter_md.exists():
        print(f"Error: chapter_outlines.md not found: {chapter_md}")
        sys.exit(1)
    if not volume_json.exists():
        print(f"Error: volume_map.json not found: {volume_json}")
        sys.exit(1)

    # Load volume_map.json
    with open(volume_json, encoding='utf-8') as f:
        volume_data = json.load(f)

    # Parse chapter_outlines.md
    with open(chapter_md, encoding='utf-8') as f:
        md_content = f.read()

    parsed = parse_chapter_outline(md_content)
    print(f"Parsed {len(parsed)} chapters from chapter_outlines.md")

    # Build flat index of all chapters
    total_chapters = 0
    filled = 0
    empty_before = 0
    empty_after = 0

    for vol in volume_data.get('volumes', []):
        for ch_node in vol.get('chapters', []):
            ch_num = ch_node.get('chapter')
            total_chapters += 1

            had_desc = bool(ch_node.get('description', '').strip())
            if not had_desc:
                empty_before += 1

            if ch_num in parsed:
                # Only fill if description is empty (preserve existing richer descriptions)
                if not had_desc:
                    ch_node['description'] = parsed[ch_num]
                    filled += 1

            now_empty = not bool(ch_node.get('description', '').strip())
            if now_empty:
                empty_after += 1

    # Update meta timestamp
    volume_data['meta']['generatedAt'] = volume_data['meta'].get('generatedAt', '')
    # Keep original generatedAt as it was already set during initial migration

    # Write updated volume_map.json
    with open(volume_json, 'w', encoding='utf-8') as f:
        json.dump(volume_data, f, ensure_ascii=False, indent=2)

    print(f"Summary:")
    print(f"  Total chapters: {total_chapters}")
    print(f"  Chapters with description before: {total_chapters - empty_before}")
    print(f"  Chapters filled (previously empty): {filled}")
    print(f"  Chapters still missing description: {empty_after}")
    print(f"  Updated volume_map.json at: {volume_json}")

    if delete_after:
        bak_path = chapter_md.with_suffix('.md.bak')
        os.rename(chapter_md, bak_path)
        print(f"  Renamed chapter_outlines.md → chapter_outlines.md.bak")


if __name__ == '__main__':
    main()