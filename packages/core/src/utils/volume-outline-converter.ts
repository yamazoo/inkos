/**
 * volume-outline-converter.ts
 *
 * Unidirectional conversion: volume_outline.md → story/outline/volume_map.json
 *
 * Migration strategy:
 *   - If volume_map.json already exists → skip (incremental safety)
 *   - Parse the Markdown → validate against VolumeOutlineSchema → write JSON
 *   - Existing calls to readVolumeMap() in outline-paths.ts transparently
 *     fall back to Markdown when JSON is absent (backward-compatible)
 */

import { readFile, writeFile, mkdir, access } from "node:fs/promises";
import { join } from "node:path";
import { z } from "zod";
import {
  ChapterNodeSchema,
  VolumePhaseSchema,
  VolumeNodeSchema,
  VolumeOutlineSchema,
  type ChapterNode,
  type VolumeNode,
  type VolumeOutline,
} from "../models/volume-outline.js";
import { readVolumeMap } from "./outline-paths.js";
import { writeVolumeChapters } from "./chapter-outline-store.js";

// ---------------------------------------------------------------------------
// Markdown parsing helpers
// ---------------------------------------------------------------------------

/** Parse a single Markdown table row (| a | b | c |) into cell strings. */
export function parseTableRow(row: string): string[] {
  return row
    .split("|")
    .slice(1, -1)
    .map((cell) => cell.trim())
    .filter(Boolean);
}

/** Check whether a line is a Markdown table separator (|---|---|). */
export function isTableSep(line: string): boolean {
  return /^\|[-:| ]+\|$/.test(line.trim());
}

/**
 * Split Markdown text into sections.
 *
 * Priority:
 *   1. Horizontal rules (---) — standard InkOS format
 *   2. H3 volume headings — e.g. "### 第一卷：县城风云（第1-60章）"
 *   3. H2 volume headings — e.g. "## 第一卷：剑冢觉醒（ch1-50）"
 *
 * Handles CRLF line endings on Windows.
 */

export function stripThinkingBlocks(text: string): string {
  // Remove /** ... */ thinking blocks (including across multiple lines)
  let cleaned = text.replace(/\/\*\*[\s\S]*?\*\//g, "");
  // Remove HTML-style comments
  cleaned = cleaned.replace(/<!--[\s\S]*?-->/g, "");
  // Remove XML-style observation/thinking blocks (<think> ... &#124854;)
  cleaned = cleaned.replace(/<\/?(?:thought|思考|thinking)(?:\s[^>]*)?>[\s\S]*?<\/?(?:thought|思考|thinking)>/gi, "");
  // Remove <think> ... &#124854; blocks
  cleaned = cleaned.replace(/<think>(?:(?!<think>)(?!<\/think>)[\s\S])*?<\/think>/gi, "");
  cleaned = cleaned.replace(/<thought>(?:(?!<thought>)(?!<\/thought>)[\s\S])*?<\/thought>/gi, "");
  cleaned = cleaned.replace(/<think>[\s\S]*?&#124854;/g, "");
  cleaned = cleaned.replace(/<think>[\s\S]*?<\/think>/gi, "");
  return cleaned;
}

export function splitSections(text: string): string[] {
  // Normalize line endings first
  const normalized = text.replace(/\r\n/g, "\n");

  // Attempt 1: standard horizontal rule splits
  const hrSections = normalized
    .split(/\n---|\n---(?=\n)/)
    .map((s) => s.trim())
    .filter(Boolean);
  if (hrSections.length >= 2) return hrSections;

  // Attempt 2: split by H3 volume headings (### 第N卷)
  const h3Sections: string[] = [];
  const h3Pattern =
    /^#{1,3}\s*第[一二三四五六七八九十零]+卷[：:]/gm;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  h3Pattern.lastIndex = 0;
  while ((match = h3Pattern.exec(normalized)) !== null) {
    const slice = normalized.slice(lastIndex, match.index).trim();
    // Only push non-empty pre-heading content (skip the leading empty slice
    // that appears when the file starts with a volume heading)
    if (slice) h3Sections.push(slice);
    lastIndex = match.index;
  }
  // Capture remaining content after the last heading
  const afterLast = normalized.slice(lastIndex).trim();
  if (afterLast) h3Sections.push(afterLast);
  if (h3Sections.length >= 2) return h3Sections;

  // Attempt 3: split by H2 volume headings
  const h2Sections: string[] = [];
  const h2Pattern = /^#{1,2}\s*第[一二三四五六七八九十零]+卷[：:]/gm;
  let lastIndex2 = 0;
  let match2: RegExpExecArray | null;
  h2Pattern.lastIndex = 0;
  while ((match2 = h2Pattern.exec(normalized)) !== null) {
    if (match2.index > lastIndex2) {
      h2Sections.push(
        normalized.slice(lastIndex2, match2.index).trim(),
      );
    }
    lastIndex2 = match2.index;
  }
  if (h2Sections.length >= 2) return h2Sections;

  // Attempt 4: split by alternate heading formats
  // e.g. "### 卷一·觉醒（Ch.1–70）" (no Chinese numeral, uses · and Ch.)
  const altSections: string[] = [];
  const altPattern =
    /^#{1,3}\s*卷[一二三四五六七八九十零]+\s*[·.]\s*[^\n（]+（[^）]+）/gm;
  let lastIdxAlt = 0;
  let matchAlt: RegExpExecArray | null;
  altPattern.lastIndex = 0;
  while ((matchAlt = altPattern.exec(normalized)) !== null) {
    if (matchAlt.index > lastIdxAlt) {
      altSections.push(normalized.slice(lastIdxAlt, matchAlt.index).trim());
    }
    lastIdxAlt = matchAlt.index;
  }
  if (altSections.length >= 2) return altSections;

  // Attempt 5: split by bold **卷N：** or **第N卷：** or **卷N·name**：format (no # heading prefix)
  // e.g. "**第一卷：青茅重梦（第1-25章）**" or "**卷一·铁与血**：主题是..."
  const boldVolSections: string[] = [];
  const boldVolPattern =
    /(^|\n)\*\*((第|卷)[零一二三四五六七八九十0-9]+(·[^*]+)?\*\*[：:]|(第|卷)[零一二三四五六七八九十0-9]+[：:])/gm;
  let lastIdx = 0;
  let m: RegExpExecArray | null;
  boldVolPattern.lastIndex = 0;
  while ((m = boldVolPattern.exec(normalized)) !== null) {
    if (m.index > lastIdx) {
      boldVolSections.push(normalized.slice(lastIdx, m.index).trim());
    }
    lastIdx = m.index;
  }
  // Capture remaining content after the last bold heading
  const afterLastBold = normalized.slice(lastIdx).trim();
  if (afterLastBold) boldVolSections.push(afterLastBold);
  if (boldVolSections.length >= 2) return boldVolSections;

  // Attempt 6: split by ## 卷N：... or **卷N：... headings (no Chinese numeral after 第)
  // e.g. "## 卷一：剑冢觉醒" or "### 卷一·觉醒" (Arabic numeral in volume name)
  const arabicVolSections: string[] = [];
  const arabicVolPattern =
    /(^|\n)(#{1,3}\s*卷[零一二三四五六七八九十0-9]+[：:\s·]|\*\*卷[零一二三四五六七八九十0-9]+[：:\s·])/gm;
  let lastIdx2 = 0;
  let m2: RegExpExecArray | null;
  arabicVolPattern.lastIndex = 0;
  while ((m2 = arabicVolPattern.exec(normalized)) !== null) {
    if (m2.index > lastIdx2) {
      arabicVolSections.push(normalized.slice(lastIdx2, m2.index).trim());
    }
    lastIdx2 = m2.index;
  }
  if (arabicVolSections.length >= 2) return arabicVolSections;

  // Fallback: treat the entire file as one section
  return [normalized.trim()];
}

// ---------------------------------------------------------------------------
// Overview table parser (总览)
// ---------------------------------------------------------------------------

export interface VolumeSummary {
  volumeId: number;
  volumeTitle: string;
  chapterRange: [number, number];
  coreConflict: string;
  keyTurnEvent: string;
  harvestGoals: string[];
}

/** Volume-heading line patterns — if the first non-empty line matches one of these, this section is a per-volume section, NOT an overview table. */
const VOLUME_HEADING_PATTERNS = [
  // H1-H3 heading containing "卷" + Chinese numeral: "### 第一卷：..." or "## 第1卷：..."
  /^#{1,3}\s*第[零一二三四五六七八九十0-9]+卷[：:\s·]/,
  // Bold volume heading: "**第一卷：...**" or "**卷一：...**"
  /^\*\*第?[零一二三四五六七八九十0-9]+卷?[：:\s·]/,
  // H1-H3 heading with "卷" followed by numeral + separator: "## 卷一·觉醒..."
  /^#{1,3}\s*卷[零一二三四五六七八九十0-9]+[·.\s：:]/,
];

/** Returns true if `line` looks like a volume-section heading rather than table content. */
function isVolumeHeadingLine(line: string): boolean {
  return VOLUME_HEADING_PATTERNS.some((p) => p.test(line.trim()));
}

/**
 * Parse the overview table (总览) from the first section of volume_outline.md.
 *
 * Supports multiple table formats:
 *   Standard:   | 卷名 | 章节 | 核心冲突 | 关键转折 | 收益目标 |
 *   3-4 cols:   | 卷名 | 章节 | 核心冲突 | ...
 *   Non-tabular prose with chapter ranges
 *
 * Also handles books that have NO overview table at all — in that case the
 * volume summaries are derived from the per-volume section headers.
 */
export function parseOverviewTable(text: string): VolumeSummary[] {
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  const summaries: VolumeSummary[] = [];

  // ------------------------------------------------------------------
  // Guard: if the first non-empty line is a volume heading, this is a
  // per-volume section (no overview table).  parseVolumeHeadings will be
  // called as the fallback instead.
  // ------------------------------------------------------------------
  const firstContentLine = lines.find(
    (l) => !l.startsWith("|---") && !l.startsWith("|"),
  );
  if (firstContentLine && isVolumeHeadingLine(firstContentLine)) {
    return [];
  }

  // ------------------------------------------------------------------
  // Attempt A: structured table
  // ------------------------------------------------------------------
  let inTable = false;
  let headerCols = 0;

  for (const line of lines) {
    if (!inTable) {
      // Detect table start by looking for a pipe-separated row where at least
      // one cell contains "卷", "章节", "Volume" or "chapter" (case-insensitive)
      if (
        line.startsWith("|") &&
        /\|[^|]*(?:卷|章节|Volume|chapter)/i.test(line)
      ) {
        inTable = true;
        const cells = parseTableRow(line);
        headerCols = cells.length;
        // Skip rows without enough columns (e.g. separator lines that pass as data)
        if (headerCols < 4) { inTable = false; }
        continue; // skip header row — don't parse as data
      }
    }
    if (isTableSep(line)) continue;
    if (!line.startsWith("|")) break; // End of table

    const cells = parseTableRow(line);
    // Skip separator rows and malformed rows
    if (cells.length < headerCols) {
      if (headerCols > 0) break;
      continue;
    }

    // Determine column roles by inspecting header cells
    let titleCell = "";
    let rangeCell = "";
    let conflictCell = "";
    let keyTurnCell = "";
    let goalsCell = "";

    if (headerCols >= 4) {
      // Map by header position
      titleCell = cells[0] ?? "";
      rangeCell = cells[1] ?? "";
      conflictCell = cells[2] ?? "";
      keyTurnCell = cells[3] ?? "";
      if (cells[4]) goalsCell = cells[4];
    } else if (cells.length >= 2) {
      // Heuristic: title, range, conflict in whatever order
      titleCell = cells[0] ?? "";
      rangeCell = cells.find((c) => /\d+\s*[-–~至]\s*\d+/.test(c)) ?? "";
      conflictCell = cells.find(
        (c) =>
          c !== titleCell &&
          c !== rangeCell &&
          !/[,，、;；]/.test(c) &&
          c.length < 80,
      ) ?? "";
    }

    const rangeMatch = rangeCell.match(/(\d+)\s*[-–~至]\s*(\d+)/);
    let rangeStart = rangeMatch ? Number.parseInt(rangeMatch[1], 10) : 0;
    let rangeEnd = rangeMatch ? Number.parseInt(rangeMatch[2], 10) : 0;

    if (rangeStart === 0 || rangeEnd === 0) {
      const nums = rangeCell.match(/\d+/g);
      if (nums && nums.length >= 2) {
        rangeStart = Number.parseInt(nums[nums.length - 2], 10);
        rangeEnd = Number.parseInt(nums[nums.length - 1], 10);
      }
    }

    const chineseNums = [
      "零", "一", "二", "三", "四", "五",
      "六", "七", "八", "九", "十",
    ];
    let volId = summaries.length + 1;
    const volIdMatch = titleCell.match(/第([一二三四五六七八九十零]+)卷/);
    if (volIdMatch) {
      const idx = chineseNums.indexOf(volIdMatch[1]);
      if (idx > 0) volId = idx;
    }

    const goals = goalsCell
      ? goalsCell
          .split(/[,，、;；]/)
          .map((g) => g.trim())
          .filter(Boolean)
      : [];

    summaries.push({
      volumeId: volId,
      volumeTitle: titleCell.replace(/\*\*/g, "").replace(/\s+/g, ""),
      chapterRange: [rangeStart, rangeEnd],
      coreConflict: conflictCell.replace(/\*\*/g, "").trim(),
      keyTurnEvent: keyTurnCell.replace(/\*\*/g, "").trim(),
      harvestGoals: goals,
    });
  }

  return summaries;
}

/**
 * Extract volume summaries from section headings (for books with no overview table).
 * Handles multiple heading formats:
 *   "### 第一卷：县城风云（第1-60章）"          — H3 with Chinese numeral
 *   "**第一卷：青茅重梦（第1-25章）**"          — Bold with Chinese numeral (no #)
 *   "### 卷一·觉醒（Ch.1–70）"                 — H3 with · separator
 *   "**卷一：剑冢觉醒（ch1-50）**"              — Bold, numeral in title position
 *   "- **卷名**：绝境求生，恶女觉醒"            — Appends to previous volume
 */
export function parseVolumeHeadings(text: string): VolumeSummary[] {
  const chineseNums = [
    "零", "一", "二", "三", "四", "五",
    "六", "七", "八", "九", "十",
  ];
  const summaries: VolumeSummary[] = [];
  const lines = text.split("\n");

  for (const line of lines) {
    const trimmed = line.trim();

    // Pattern A: H3/H2 heading with Chinese numeral and chapter range
    // e.g. "### 第一卷：县城风云（第1-60章）"
    const headingA = trimmed.match(
      /^#{1,3}\s*第([一二三四五六七八九十零]+)卷[：:]([^\n（]+?)\uff08([^\uff09]+)\uff09$/,
    );
    if (headingA) {
      const chineseIdx = chineseNums.indexOf(headingA[1]);
      const rangeStr = headingA[3] ?? "";
      const rangeMatch = rangeStr.match(/(\d+)\s*[-–~至]\s*(\d+)/);
      summaries.push({
        volumeId: chineseIdx > 0 ? chineseIdx : summaries.length + 1,
        volumeTitle: `第${headingA[1]}卷：${headingA[2].trim()}`,
        chapterRange: rangeMatch
          ? [Number.parseInt(rangeMatch[1], 10), Number.parseInt(rangeMatch[2], 10)]
          : [0, 0],
        coreConflict: "",
        keyTurnEvent: "",
        harvestGoals: [],
      });
      continue;
    }

    // Pattern H: ASCII parens — "### 第一卷：暗流 (ch1-20)"
    // Fullwidth parens (uff08/uff09) are handled by Pattern A; this handles ASCII parens.
    const headingH = trimmed.match(
      /^#{1,3}\s*第([一二三四五六七八九十零]+)卷[：:]([^\n（]+?)\s*\(([^)]+)\)$/,
    );
    if (headingH) {
      const chineseIdx = chineseNums.indexOf(headingH[1]);
      const rangeStr = headingH[3] ?? "";
      const rangeMatch = rangeStr.match(/(\d+)\s*[-–~至]\s*(\d+)/);
      summaries.push({
        volumeId: chineseIdx > 0 ? chineseIdx : summaries.length + 1,
        volumeTitle: `第${headingH[1]}卷：${headingH[2].trim()}`,
        chapterRange: rangeMatch
          ? [Number.parseInt(rangeMatch[1], 10), Number.parseInt(rangeMatch[2], 10)]
          : [0, 0],
        coreConflict: "",
        keyTurnEvent: "",
        harvestGoals: [],
      });
      continue;
    }

    // Pattern G: Range-first format — heading ends with title after the closing paren
    // e.g. "### 第一卷（1-20章）：暗流" or "## 第二卷（21-60章）：破局"
    // Here the colon comes AFTER the range, not before it
    const headingG = trimmed.match(
      /^#{1,3}\s*第([一二三四五六七八九十零]+)卷\uff08(\d+)\s*[-–~至]\s*(\d+)[^\uff09]*\uff09[：:]\s*(.+)$/,
    );
    if (headingG) {
      const chineseIdx = chineseNums.indexOf(headingG[1]);
      const rangeStart = Number.parseInt(headingG[2], 10);
      const rangeEnd = Number.parseInt(headingG[3], 10);
      summaries.push({
        volumeId: chineseIdx > 0 ? chineseIdx : summaries.length + 1,
        volumeTitle: `第${headingG[1]}卷：${headingG[4].trim()}`,
        chapterRange: [rangeStart, rangeEnd],
        coreConflict: "",
        keyTurnEvent: "",
        harvestGoals: [],
      });
      continue;
    }

    // Pattern B: Bold **第一卷：...** (Chinese numeral immediately after **)
    // e.g. "**第一卷：青茅重梦（第1-25章）**"
    const headingB = trimmed.match(
      /^\*\*第([一二三四五六七八九十零]+)卷[：:]([^\n（]+?)\uff08([^\uff09]+)\uff09\*\*$/,
    );
    if (headingB) {
      const chineseIdx = chineseNums.indexOf(headingB[1]);
      const title = headingB[2].trim();
      const rangeStr = headingB[3];
      const rangeMatch = rangeStr.match(/(\d+)\s*[-–~至]\s*(\d+)/);
      summaries.push({
        volumeId: chineseIdx > 0 ? chineseIdx : summaries.length + 1,
        volumeTitle: `第${headingB[1]}卷：${title}`,
        chapterRange: rangeMatch
          ? [Number.parseInt(rangeMatch[1], 10), Number.parseInt(rangeMatch[2], 10)]
          : [0, 0],
        coreConflict: "",
        keyTurnEvent: "",
        harvestGoals: [],
      });
      continue;
    }

// Pattern C: Heading with · or . separator and chapter range
    // e.g. "### 卷一·觉醒（Ch.1–70）" or "## 卷一：寒渊剑醒（1-50章）"
    // Handles both Chinese and Arabic numerals
    // Handles both standard (U+00B7) and fullwidth (U+B7) middle dots
    const headingC = trimmed.match(
      /^#{1,3}\s*卷([零一二三四五六七八九十0-9]+)[\u00B7\u2022.\s：:]([^\n（]+?)\uff08([^\uff09]+)\uff09/,
    );
    if (headingC) {
      const volIdStr = headingC[1];
      const arabicVolId = Number.parseInt(volIdStr, 10);
      const volId = Number.isFinite(arabicVolId)
        ? arabicVolId
        : (chineseNums.indexOf(volIdStr) || summaries.length + 1);
      const title = headingC[2].trim();
      const rangeStr = headingC[3];
      // e.g. "Ch.1–70" or "ch51-150" or "1-70章"
      const rangeMatch = rangeStr.match(
        /(?:ch|Ch\.?|章节)?\.?\s*(\d+)\s*[-–—~至]\s*(\d+)/,
      );
      summaries.push({
        volumeId: volId > 0 ? volId : summaries.length + 1,
        volumeTitle: `卷${volIdStr}：${title}`,
        chapterRange: rangeMatch
          ? [Number.parseInt(rangeMatch[1], 10), Number.parseInt(rangeMatch[2], 10)]
          : [0, 0],
        coreConflict: "",
        keyTurnEvent: "",
        harvestGoals: [],
      });
      continue;
    }

    // Pattern D: Bold **卷N：...** (numeral in title position, no Chinese 第)
    // e.g. "**卷一：剑冢觉醒（ch1-50）**"
    const headingD = trimmed.match(
      /^\*\*卷([零一二三四五六七八九十0-9]+)[：:\s·]([^\n（]+?)\uff08([^\uff09]+)\uff09\*\*$/,
    );
    if (headingD) {
      const volIdStr = headingD[1];
      const arabicVolId = Number.parseInt(volIdStr, 10);
      const volId = Number.isFinite(arabicVolId)
        ? arabicVolId
        : (chineseNums.indexOf(volIdStr) || summaries.length + 1);
      const title = headingD[2].trim();
      const rangeStr = headingD[3];
      const rangeMatch = rangeStr.match(
        /(?:ch|Ch\.?|章节)?\.?\s*(\d+)\s*[-–—~至]\s*(\d+)/,
      );
      summaries.push({
        volumeId: volId > 0 ? volId : summaries.length + 1,
        volumeTitle: `卷${volIdStr}：${title}`,
        chapterRange: rangeMatch
          ? [Number.parseInt(rangeMatch[1], 10), Number.parseInt(rangeMatch[2], 10)]
          : [0, 0],
        coreConflict: "",
        keyTurnEvent: "",
        harvestGoals: [],
      });
      continue;
    }

    // Pattern D2: Bold **卷N·name**： (middle-dot separator, colon OUTSIDE bold, no range)
    // e.g. "**卷一·铁与血**：主题是**活过今天**。"
    const headingD2 = trimmed.match(
      /^\*\*卷([零一二三四五六七八九十0-9]+)[·.]\s*([^*]+)\*\*[：:]/,
    );
    if (headingD2) {
      const volIdStr = headingD2[1];
      const arabicVolId = Number.parseInt(volIdStr, 10);
      const volId = Number.isFinite(arabicVolId)
        ? arabicVolId
        : (chineseNums.indexOf(volIdStr) || summaries.length + 1);
      const title = headingD2[2].trim();
      summaries.push({
        volumeId: volId > 0 ? volId : summaries.length + 1,
        volumeTitle: `卷${volIdStr}·${title}`,
        chapterRange: [0, 0],
        coreConflict: "",
        keyTurnEvent: "",
        harvestGoals: [],
      });
      continue;
    }

    // Pattern F: Bold **第N卷：title** without chapter range
    // e.g. "**第一卷：孤坟**" or "**第二卷：燃灯**"
    const headingF = trimmed.match(
      /^\*\*第([一二三四五六七八九十零]+)卷[：:](.+?)\*\*$/,
    );
    if (headingF) {
      const chineseIdx = chineseNums.indexOf(headingF[1]);
      summaries.push({
        volumeId: chineseIdx > 0 ? chineseIdx : summaries.length + 1,
        volumeTitle: `第${headingF[1]}卷：${headingF[2].trim()}`,
        chapterRange: [0, 0],
        coreConflict: "",
        keyTurnEvent: "",
        harvestGoals: [],
      });
      continue;
    }

    // Pattern E: Prose heading — e.g. "**卷名**：绝境求生，恶女觉醒" or "**卷名**：觉醒——末日降临的第一天"
    // Appends subtitle to the last volume title. Handles optional closing **.
    const headingE = trimmed.match(/^\*\*卷名[）]*\*\*?[：:]\s*(.+)$/);
    if (headingE && summaries.length > 0) {
      summaries[summaries.length - 1].volumeTitle += "——" + headingE[1];
    }
  }

  return summaries;
}

// ---------------------------------------------------------------------------
// Chapter table parser (细纲)
// ---------------------------------------------------------------------------

/**
 * Parse a per-volume chapter table:
 *   | 章节 | 事件 | 节奏点 |
 * Returns ChapterNode[].  Bold prefixes like **【威胁1】** are stripped.
 */
export function parseChapterTable(text: string): ChapterNode[] {
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  const chapters: ChapterNode[] = [];

  let inTable = false;
  for (const line of lines) {
    if (!inTable) {
      if (line.startsWith("| 章节")) {
        inTable = true;
      }
      continue;
    }
    if (isTableSep(line)) continue;
    if (!line.startsWith("|")) break;

    const cells = parseTableRow(line);
    if (cells.length < 3) continue;

    const chNum = Number.parseInt(cells[0], 10);
    // Support both plain integers ("1") and Chinese chapter notation ("第10章")
    const chineseNumMatch = cells[0].match(/^第([0-9]+)章$/);
    const parsedChNum = chineseNumMatch
      ? Number.parseInt(chineseNumMatch[1]!, 10)
      : Number.parseInt(cells[0], 10);
    if (!Number.isFinite(parsedChNum)) continue;

    // Strip bold markers used to mark key events: **【威胁1】灵气复苏…
    const event = cells[1].replace(/\*\*/g, "").trim();
    const beat = cells[2].replace(/\*\*/g, "").trim();

    chapters.push(
      ChapterNodeSchema.parse({
        chapter: parsedChNum,
        event,
        beat,
      }),
    );
  }

return chapters;
}

/**
 * Parse bullet list chapters used by books like 骨刀行:
 *   "* 第1章：面临黑虎帮收保护费并威胁生命的困境。"
 *   "*   第3章：发现剁骨刀法可以实战，击杀混混，确立离开县城去野狼岭的目标。"
 *
 * Each bullet becomes a ChapterNode with event=bullet text and beat="bullet".
 * When both tables and bullets are present, parseChapterTable takes precedence.
 */
export function parseBulletChapters(text: string): ChapterNode[] {
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  const chapters: ChapterNode[] = [];

  const chineseNums = [
    "零", "一", "二", "三", "四", "五",
    "六", "七", "八", "九", "十",
  ];

  for (const line of lines) {
    // Format A: "* 第N章：..." or "*   第N章：..." with optional bold marker
    // e.g. "*   第3章：发现剁骨刀法可以实战，击杀混混..."
    const bulletMatch = line.match(/^\*\s*第([零一二三四五六七八九十0-9]+)章[：:]\s*(.+)$/);
    if (bulletMatch) {
      const numStr = bulletMatch[1];
      const chNum = Number.parseInt(numStr, 10);
      const chapter = Number.isFinite(chNum)
        ? chNum
        : chineseNums.indexOf(numStr);
      const event = bulletMatch[2].replace(/\*\*/g, "").trim();
      chapters.push(ChapterNodeSchema.parse({ chapter, event, beat: "关键转折" }));
      continue;
    }

    // Format B: "- Ch.N：..." or "- 第N章：..." bullet (系统降临 style)
    // e.g. "- Ch.1：打脸名场面——用办公椅腿捅死王德发BOSS，掉落名牌嘲讽"
    const chMatch = line.match(/^[-–]\s*(?:Ch[.]?\s*|第([零一二三四五六七八九十0-9]+)章[：:]\s*)(.+)$/);
    if (chMatch) {
      let chapter: number;
      if (chMatch[1] !== undefined) {
        // Chinese numeral
        const idx = chineseNums.indexOf(chMatch[1]);
        chapter = idx >= 0 ? idx : 0;
      } else {
        // "Ch.N" format — extract Arabic number
        const numStr = line.match(/Ch[.]?\s*(\d+)/)?.[1] ?? "0";
        chapter = Number.parseInt(numStr, 10);
      }
      const event = chMatch[2].replace(/\*\*/g, "").trim();
      chapters.push(ChapterNodeSchema.parse({ chapter, event, beat: "关键转折" }));
      continue;
    }
  }

  return chapters;
}

// ---------------------------------------------------------------------------
// Phase detection (Volume 3 multi-phase structure)
// ---------------------------------------------------------------------------

export interface DetectedPhase {
  label: string;
  range: [number, number];
  lines: string[];
}

/**
 * Detect sub-phases within a volume section by scanning for
 * bold section headers like:
 *   **【第一阶段：第61-70章】威胁初显**
 *   **【第101-110章】阶段收束**
 */
export function detectPhases(lines: string[]): DetectedPhase[] {
  const phases: DetectedPhase[] = [];
  let current: DetectedPhase | null = null;

  for (const line of lines) {
    // Phase header: **【…】…**  or  **【第N-N章】…**
    const phaseMatch = line.match(/^\*\*【([^】]+)】([^\*]*)\*\*/);
    if (phaseMatch) {
      if (current) phases.push(current);
      const rangePart = phaseMatch[1];
      // e.g. "第一阶段：第61-70章" or "第61-70章"
      const rangeNumMatch = rangePart.match(/(\d+)\s*-\s*(\d+)\s*章/);
      const s = rangeNumMatch ? Number.parseInt(rangeNumMatch[1], 10) : NaN;
      const e = rangeNumMatch ? Number.parseInt(rangeNumMatch[2], 10) : NaN;
      current = {
        label: line.replace(/\*\*/g, "").trim(),
        range: [Number.isFinite(s) ? s : 0, Number.isFinite(e) ? e : 0],
        lines: [],
      };
      continue;
    }
    current?.lines.push(line);
  }

  if (current) phases.push(current);
  return phases;
}

// ---------------------------------------------------------------------------
// Per-volume section parser
// ---------------------------------------------------------------------------

/** Parse a single volume section (from ### heading to next ---). */
export function parseVolumeSection(
  sectionText: string,
  summary: VolumeSummary,
): VolumeNode {
  const lines = sectionText.split("\n");

// Collect all table rows + bold phase headers + bullet chapter items
  // Bullet pattern: "* 第1章：..." or "*   第3章：..." (with leading spaces)
  const relevantLines: string[] = [];
  for (const line of lines) {
    const t = line.trim();
    if (
      t.startsWith("|") ||
      /^\*\*【/.test(t) ||
      /^\*\s*第[零一二三四五六七八九十0-9]+章/.test(t)
    ) {
      relevantLines.push(t);
    }
  }

  const detectedPhases = detectPhases(relevantLines);

  if (detectedPhases.length > 0) {
    // Multi-phase volume (e.g. Volume 3)
    const phases = detectedPhases.map((dp) =>
      VolumePhaseSchema.parse({
        label: dp.label,
        range: dp.range,
        chapters: parseChapterTable(dp.lines.join("\n")),
      }),
    );

    const flatChapters: ChapterNode[] = phases.flatMap((p) => p.chapters);

    return VolumeNodeSchema.parse({
      volumeId: summary.volumeId,
      volumeTitle: summary.volumeTitle,
      chapterRange: summary.chapterRange,
      coreConflict: summary.coreConflict,
      keyTurnChapter:
        flatChapters.find(
          (ch) =>
            ch.event.includes("关键转折") || ch.event.includes("关键"),
        )?.chapter ?? summary.chapterRange[0],
      keyTurnEvent: summary.keyTurnEvent,
      harvestGoals: summary.harvestGoals,
      phases,
      chapters: flatChapters,
    });
  }

  // Single-phase volume — try table first, fall back to bullet list
  let chapters = parseChapterTable(relevantLines.join("\n"));
  if (chapters.length === 0) {
    chapters = parseBulletChapters(sectionText);
  }

  return VolumeNodeSchema.parse({
    volumeId: summary.volumeId,
    volumeTitle: summary.volumeTitle,
    chapterRange: summary.chapterRange,
    coreConflict: summary.coreConflict,
    keyTurnChapter:
      chapters.find(
        (ch) =>
          ch.event.includes("关键转折") || ch.event.includes("关键"),
      )?.chapter ?? summary.chapterRange[0],
    keyTurnEvent: summary.keyTurnEvent,
    harvestGoals: summary.harvestGoals,
    chapters,
  });
}

// ---------------------------------------------------------------------------
// Main converter
// ---------------------------------------------------------------------------

const OUTLINE_DIR = "outline";

/**
 * Parse a dedicated OKR section from volume_map.md text.
 * Matches patterns like "**第一卷 OKR：**" and extracts KR items as harvest goals.
 * Returns a map from volumeId (1-based) to goals array.
 */
export function parseOkrSection(text: string): Map<number, string[]> {
  const result = new Map<number, string[]>();
  const okrSectionMatch = text.match(
    /##\s*各卷\s*OKR[\s\S]*?(?=\n---|\n##\s|$)/i,
  );
  if (!okrSectionMatch) return result;

  const okrText = okrSectionMatch[0];
  const chineseNums = [
    "零", "一", "二", "三", "四", "五",
    "六", "七", "八", "九", "十",
  ];

  const volBlocks = okrText.split(/(?=\*\*第[一二三四五六七八九十零]+卷\s*OKR)/);
  for (const block of volBlocks) {
    const volMatch = block.match(/\*\*第([一二三四五六七八九十零]+)卷\s*OKR/);
    if (!volMatch) continue;
    const volId = chineseNums.indexOf(volMatch[1]);
    if (volId <= 0) continue;

    const goals: string[] = [];
    const krMatches = block.matchAll(/(?:^|\n)\s*(?:-|[-–])\s*\*{0,2}(KR\d+)\*{0,2}[：:]\s*(.+)/gm);
    for (const m of krMatches) {
      const text = `${m[1]}：${m[2]}`.trim().replace(/\*\*/g, "");
      if (text) goals.push(text);
    }
    if (goals.length > 0) {
      result.set(volId, goals.slice(0, 5));
    }
  }
  return result;
}

/**
 * Convert volume_outline.md → story/outline/volume_map.json for a given book.
 *
 * @param bookDir  Path to a book root (contains `story/` subdirectory)
 * @returns Path to the generated JSON, or null if the source MD was not found
 */
export async function convertVolumeOutlineToJson(
  bookDir: string,
): Promise<string | null> {
  const storyDir = join(bookDir, "story");
  const outlineDir = join(storyDir, OUTLINE_DIR);
  const jsonPath = join(outlineDir, "volume_map.json");

  // 1. Read source Markdown — resolve from new or legacy path
  const newMdPath = join(storyDir, "outline", "volume_map.md");
  const legacyMdPath = join(storyDir, "volume_outline.md");
  let mdText: string;
  let mdPath: string;
  try {
    mdText = stripThinkingBlocks(await readVolumeMap(bookDir, ""));
    if (!mdText.trim()) return null;
    // Resolve actual path for meta.sourceFile
    try { await access(newMdPath); mdPath = newMdPath; } catch { mdPath = legacyMdPath; }
  } catch {
    return null;
  }

  // 2. Check for existing JSON (incremental safety)
  try {
    await access(jsonPath);
    return jsonPath;
  } catch {
    // Continue
  }

  // 3. Ensure output directory exists
  await mkdir(outlineDir, { recursive: true });

  // 3a. Read book.json once for title and targetChapters
  let bookTitle = "未知书名";
  let targetChapters = 200;
  try {
    const bookJson = JSON.parse(await readFile(join(bookDir, "book.json"), "utf-8"));
    if (bookJson.title) bookTitle = bookJson.title;
    if (bookJson.targetChapters > 0) targetChapters = bookJson.targetChapters;
  } catch { /* use defaults */ }

  // 4. Split into sections
  const sections = splitSections(mdText);

  // If only 1 section but it starts with a volume heading, treat it as the first
  // volume section (no overview table — the LLM only output a single volume).
  // Duplicate so sections = [first-volume-as-overview, first-volume-chapters]
  // to maintain the HR-layout contract: section0 = overview, volumeSections[0] = vol1.
  const section0IsVolumeHeading = isVolumeHeadingLine(
    sections[0].split("\n").find((l) => l.trim()) ?? "",
  );
  if (sections.length === 1 && section0IsVolumeHeading) {
    // Duplicate the single section so that sections[0] serves as the "overview placeholder"
    // and sections[1] is the real volume content. Both reference the same string object.
    sections.push(sections[0]);
  } else if (sections.length < 2) {
    throw new Error(
      `volume_outline.md has unexpected structure (expected overview + volume sections, got ${sections.length} sections)`,
    );
  }

  const overviewSection = sections[0];
  const volumeSections = sections.slice(1);

  // 5. Derive volume summaries from overview table or section headings
  let summaries = parseOverviewTable(overviewSection);

// A note on sections[] vs volumeSections[]:
  // - splitSections() may use HR splitting (---), producing sections = [overview, vol1, vol2, ...]
  //   OR H3 Attempt-2 (骨刀行), producing sections = [vol1, vol2, ...] with no overview.
  // - When sections[0] is itself a volume heading (no intro), the chapter table for summaries[0]
  //   lives in sections[0] (not volumeSections[0]).  We detect this by checking whether
  //   sections[0] starts with a volume heading — if so, it IS the first volume section.
  const firstSectionIsVolume =
    section0IsVolumeHeading && !parseOverviewTable(sections[0]).length;

  // If no structured table, parse headings one section at a time.
  // Call parseVolumeHeadings on EACH section individually — not on all sections at once —
  // so that the 1:1 correspondence between volumeSections[i] and summaries[i] holds.
  if (summaries.length === 0) {
    // Determine the correct array to iterate over:
    // When splitSections uses H3 Attempt-2 (e.g. 骨刀行), sections = [vol1, vol2, ...] with no overview.
    // When splitSections uses HR splitting (e.g. 系统降临), sections = [overview, vol1, vol2, ...].
    const headingSourceSections = firstSectionIsVolume ? sections : volumeSections;
    for (const volSection of headingSourceSections) {
      const headingSummaries = parseVolumeHeadings(volSection);
      // Only take the first valid summary from this section (skip reference sections)
      if (headingSummaries.length > 0) {
        summaries.push(headingSummaries[0]);
      }
    }
  }

  // Fallback: if still no summaries, scan ALL sections for volume headings.
  // This handles "段" prose format where volumes are described within the
  // overview section (e.g. **卷一·残剑**：...) without chapter ranges.
  let allVolumesInSingleSection = false;
  let allVolumesSourceIdx = 0;
  if (summaries.length === 0) {
    let sourceSectionIdx = -1;
    let allFromSame = true;
    for (let si = 0; si < sections.length; si++) {
      const headingSummaries = parseVolumeHeadings(sections[si]);
      for (const s of headingSummaries) {
        if (!summaries.some((existing) => existing.volumeId === s.volumeId)) {
          summaries.push(s);
          if (sourceSectionIdx === -1) sourceSectionIdx = si;
          else if (si !== sourceSectionIdx) allFromSame = false;
        }
      }
    }
    if (summaries.length > 0 && allFromSame) {
      allVolumesInSingleSection = true;
      allVolumesSourceIdx = sourceSectionIdx;
    }
  }

  // 5b. Detect duplicate mode (single-volume file split into 2 identical sections):
  //    sections.length === 2 AND both sections reference the SAME string (sections[0] === sections[1]).
  //    In this case, there is only 1 real volume — cap summaries to 1.
  const isDuplicateMode =
    sections.length === 2 && sections[0] === sections[1];
  if (isDuplicateMode && summaries.length > 1) {
    summaries = summaries.slice(0, 1);
  }

  // Pre-parse OKR section to distribute harvestGoals correctly by volume.
  // When volume_map.md has a dedicated "各卷 OKR" section containing all volumes' goals,
  // the per-section enrichment below would pick up wrong goals. Parse centrally instead.
  const okrGoalsByVolume = parseOkrSection(mdText);

  // Enrich summaries with coreConflict / keyTurnEvent / harvestGoals from section prose.
  // The chapter table for summaries[0] lives in sections[0] when section0IsVolumeHeading,
  // and in volumeSections[i] otherwise.
  for (let i = 0; i < summaries.length; i++) {
    // When sections[0] is the overview (firstSectionIsVolume=false): volumes map to volumeSections[i]
    //   where volumeSections = sections.slice(1) = [vol1, vol2, ...].
    // When sections[0] IS the first volume (firstSectionIsVolume=true): volumes map to sections[i].
    const dataSection =
      firstSectionIsVolume ? sections[i] : volumeSections[i];
    if (!dataSection) continue;
    const sum = summaries[i];
    if (!sum.coreConflict) {
      const conflictMatch = dataSection.match(/\*\*核心冲突[）]*\*\*[：:]\s*([^\n\-*]+)/);
      if (conflictMatch) sum.coreConflict = conflictMatch[1].replace(/\*\*/g, "").trim();
    }
    if (!sum.keyTurnEvent) {
      // Extract first key-turn item: "- Ch.N：..." or "1. ...（Ch.N：...）"
      const ktMatch = dataSection.match(/(?:^|\n)\s*(?:-|[-–])\s*(?:Ch?[.]?\s*)?\d+[：:]\s*([^\n-]+)/m);
      if (ktMatch) sum.keyTurnEvent = ktMatch[1].trim();
    }
    // Prose fallback for coreConflict: first meaningful sentence ≥10 chars
    if (!sum.coreConflict) {
      const CONFLICT_KEYWORDS = /冲突|矛盾|对抗|危机|抉择|背叛|阴谋|困境|对立/;
      const sentences = dataSection
        .split(/[。\n]/)
        .map((s) => s.replace(/\*\*/g, "").trim())
        .filter((s) => s.length >= 10 && CONFLICT_KEYWORDS.test(s));
      if (sentences[0]) sum.coreConflict = sentences[0];
    }
    // Prose fallback for keyTurnEvent: first bullet line with content
    if (!sum.keyTurnEvent) {
      const bulletMatch = dataSection.match(/(?:^|\n)\s*(?:-|[-–])\s*([^\n-]{5,})/m);
      if (bulletMatch) sum.keyTurnEvent = bulletMatch[1].trim();
    }
    if (!sum.harvestGoals.length && okrGoalsByVolume.has(sum.volumeId)) {
      sum.harvestGoals = okrGoalsByVolume.get(sum.volumeId)!;
    }
    if (!sum.harvestGoals.length) {
      const goalMatches = dataSection.matchAll(/(?:^|\n)\s*(?:-|[-–])\s*(.+)/gm);
      const goals: string[] = [];
      for (const g of goalMatches) {
        const text = g[1].trim().replace(/\*\*/g, "");
        if (text && !/^(Ch|章节|第)/.test(text)) goals.push(text);
      }
      // Filter out key-turn items (contain "：")
      const filtered = goals.filter((g) => g.includes("：") || !g.includes("关键"));
      sum.harvestGoals = filtered.slice(0, 5);
    }
    // Prose fallback: scan for keyword-bearing sentences when bullets are empty
    if (!sum.harvestGoals.length) {
      const GOAL_KEYWORDS = /目标|收获|推进|揭示|探索|揭露|铺垫|引入|建立|打破|完成|收束/;
      const sentences = dataSection
        .split(/[。\n]/)
        .map((s) => s.replace(/\*\*/g, "").trim())
        .filter((s) => s.length >= 8 && GOAL_KEYWORDS.test(s));
      sum.harvestGoals = sentences.slice(0, 3);
    }
  }

  if (summaries.length === 0) {
    throw new Error("Could not parse overview table in volume_outline.md");
  }

  // 5a-fill: Infer missing chapter ranges ([0,0]) by distributing evenly.
  // MUST run before 5c (parseVolumeSection) because VolumeNodeSchema requires
  // chapterRange ≥ [1,1] and keyTurnChapter falls back to chapterRange[0].
  const missingRange = summaries.filter((s) => s.chapterRange[0] === 0);
  if (missingRange.length > 0) {
    const volCount = summaries.length;
    const perVol = Math.floor(targetChapters / volCount);
    for (let i = 0; i < summaries.length; i++) {
      const s = summaries[i];
      if (s.chapterRange[0] === 0) {
        const start = i * perVol + 1;
        const end = i === volCount - 1 ? targetChapters : (i + 1) * perVol;
        s.chapterRange = [start, end];
      }
    }
  }

  // 5c. Parse each volume section.
  // In duplicate mode (single-volume file, sections[0] === sections[1]):
  //   Only 1 real volume content — modulo to sections[0].
  // In normal firstSectionIsVolume mode (e.g. 骨刀行, sections = [vol1, vol2, vol3]):
  //   summaries[i] maps to sections[i].
  // In normal HR mode (sections = [overview, vol1, vol2]):
  //   summaries[i] maps to volumeSections[i] = sections[i+1].
  const volumes: VolumeNode[] = [];
  for (let i = 0; i < summaries.length; i++) {
    const summary = summaries[i];
    if (!summary) continue;
    const sectionIdx = allVolumesInSingleSection
      ? allVolumesSourceIdx
      : isDuplicateMode ? i % sections.length : (firstSectionIsVolume ? i : i + 1);
    const sectionForChapter = sections[sectionIdx];
    if (!sectionForChapter) continue;
    volumes.push(parseVolumeSection(sectionForChapter, summary));
  }

  // 6. Book title — prefer book.json title; fallback to regex extraction.
  if (bookTitle === "未知书名") {
    const rawSection0 = sections[0];
    const bookTitleMatch =
      rawSection0.match(/^#{1,2}\s*(?!第[一二三四五六七八九十零卷])([一-鿿][^\n（#]*)/m) ??
      mdText.match(/^#+\s*(.+?)\s*$/m);
    if (bookTitleMatch) {
      bookTitle = bookTitleMatch[1].trim().replace(/\*\*/g, "");
    }
  }

  // totalChapters: take the larger of inline chapter count and declared range.
  const inlineChapterCount = volumes.reduce(
    (acc, vol) => acc + vol.chapters.length,
    0,
  );
  const declaredRangeEnd = volumes.reduce(
    (max, vol) => Math.max(max, vol.chapterRange[1]),
    0,
  );
  const totalChapters = Math.max(inlineChapterCount, declaredRangeEnd);

  const schemaObj = VolumeOutlineSchema.parse({
    schemaVersion: 1,
    meta: {
      bookTitle,
      sourceFile: mdPath,
      generatedAt: new Date().toISOString(),
      totalChapters,
      totalVolumes: volumes.length,
    },
    volumes,
  });

  await writeFile(jsonPath, JSON.stringify(schemaObj, null, 2), "utf-8");

  // Also write per-volume chapter files for lazy loading
  await writePerVolumeChapters(bookDir, schemaObj);

  return jsonPath;
}

/**
 * Convenience wrapper: convert all books under `booksRoot`.
 */
export async function convertAllBooks(
  booksRoot: string,
): Promise<Record<string, string | null>> {
  const { readdir } = await import("node:fs/promises");
  const entries = await readdir(booksRoot, { withFileTypes: true });
  const results: Record<string, string | null> = {};

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    try {
      const result = await convertVolumeOutlineToJson(
        join(booksRoot, entry.name),
      );
      results[entry.name] = result;
    } catch (err) {
      console.error(`[converter] ${entry.name}:`, err);
      results[entry.name] = null;
    }
  }

  return results;
}

/**
 * Split a VolumeOutline into per-volume JSON files.
 *
 * Each volume's chapters are written to `story/outline/vol-{N}-chapters.json`.
 * This enables lazy loading — the writing pipeline only reads the volume it needs.
 */
export async function writePerVolumeChapters(
  bookDir: string,
  outline: VolumeOutline,
): Promise<void> {
  for (const vol of outline.volumes) {
    await writeVolumeChapters(bookDir, {
      schemaVersion: 1,
      volumeId: vol.volumeId,
      volumeTitle: vol.volumeTitle,
      chapterRange: vol.chapterRange,
      chapters: vol.chapters,
    });
  }
}
