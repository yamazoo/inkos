/**
 * outline-auditor.ts
 *
 * Pure audit functions for volume_map.json description completeness.
 * No I/O — takes a VolumeOutline, returns structured audit results.
 *
 * Also provides I/O-based auditChapterOutlines() for per-volume JSON files.
 */

import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import {
  VolumeOutlineSchema,
  type VolumeOutline as VolumeOutlineType,
  type VolumeNode,
  type ChapterNode,
} from "../models/volume-outline.js";
import { readVolumeChapters } from "./chapter-outline-store.js";

// ---------------------------------------------------------------------------
// Placeholder detection
// ---------------------------------------------------------------------------

/**
 * Regex matching generic chapter-range placeholder nodes that encode a span
 * as a single ChapterNode rather than individual chapter entries.
 *
 * Examples matched:
 *   "第171-200章推进剧情"   → range-placeholder
 *   "第81-90章内容待补充"  → gap-placeholder
 *
 * Examples NOT matched:
 *   "第42章：绝境逢生"      → real description
 *   "暗流涌动"              → real description
 *   undefined               → null-description
 */
const RANGE_PLACEHOLDER_PATTERN = /^第\d+\s*[-–~]\s*\d+\s*章.*(?:内容待补充|推进剧情)$/u;

/** Match "第N章" bare-chapter placeholder (no range). */
const BARE_PLACEHOLDER_PATTERN = /^第\d+章.*(?:内容待补充|推进剧情)$/u;

export type GapType = "range-placeholder" | "gap-placeholder" | "null-description" | null;

// NOTE: CLI has a duplicate classifyGap that checks event/beat fields
// and includes a "short-description" type. Consolidate that logic here,
// then have the CLI import from core. See packages/cli/src/commands/outline.ts.
/** Classify a single chapter node's description. */
export function classifyGap(node: ChapterNode): GapType {
  if (node.description === undefined || node.description === null) {
    return "null-description";
  }
  if (RANGE_PLACEHOLDER_PATTERN.test(node.description)) {
    return "range-placeholder";
  }
  if (BARE_PLACEHOLDER_PATTERN.test(node.description)) {
    return "gap-placeholder";
  }
  return null;
}

// ---------------------------------------------------------------------------
// Audit result types
// ---------------------------------------------------------------------------

export interface ChapterAuditEntry {
  chapter: number;
  volumeId: number;
  volumeTitle: string;
  hasRealDescription: boolean;
  gapType: GapType;
  descriptionRaw: string | undefined;
}

export interface VolumeAuditSummary {
  volumeId: number;
  volumeTitle: string;
  chapterRange: [number, number];
  total: number;
  complete: number;
  missing: number;
  missingChapters: number[];
  gapTypes: Record<string, number>;
  status: "complete" | "partial" | "empty";
}

export interface OutlineAuditResult {
  bookTitle: string;
  totalChapters: number;
  totalComplete: number;
  totalMissing: number;
  completenessPercent: number;
  volumeSummaries: VolumeAuditSummary[];
  missingChapters: ChapterAuditEntry[];
}

// ---------------------------------------------------------------------------
// Core audit function
// ---------------------------------------------------------------------------

/**
 * Audit a VolumeOutline for description completeness.
 * Returns per-chapter gap classification and per-volume summaries.
 */
export function auditOutline(outline: VolumeOutlineType): OutlineAuditResult {
  const missingChapters: ChapterAuditEntry[] = [];
  const volumeSummaries: VolumeAuditSummary[] = [];
  let totalComplete = 0;
  let totalMissing = 0;

  for (const vol of outline.volumes) {
    const volMissing: ChapterAuditEntry[] = [];
    const gapTypeCount: Record<string, number> = {};

    for (const node of vol.chapters) {
      const gapType = classifyGap(node);
      if (gapType !== null) {
        totalMissing++;
        volMissing.push({
          chapter: node.chapter,
          volumeId: vol.volumeId,
          volumeTitle: vol.volumeTitle,
          hasRealDescription: false,
          gapType,
          descriptionRaw: node.description,
        });
        gapTypeCount[gapType] = (gapTypeCount[gapType] ?? 0) + 1;
      } else {
        totalComplete++;
      }
    }

    missingChapters.push(...volMissing);

    const total = vol.chapters.length;
    const missing = volMissing.length;
    volumeSummaries.push({
      volumeId: vol.volumeId,
      volumeTitle: vol.volumeTitle,
      chapterRange: vol.chapterRange,
      total,
      complete: total - missing,
      missing,
      missingChapters: volMissing.map((e) => e.chapter),
      gapTypes: gapTypeCount,
      status: missing === 0 ? "complete" : missing === total ? "empty" : "partial",
    });
  }

  const totalChapters = outline.meta.totalChapters;
  const completenessPercent =
    totalChapters > 0
      ? Math.round((totalComplete / totalChapters) * 1000) / 10
      : 0;

  return {
    bookTitle: outline.meta.bookTitle,
    totalChapters,
    totalComplete,
    totalMissing,
    completenessPercent,
    volumeSummaries,
    missingChapters,
  };
}

// ---------------------------------------------------------------------------
// Range-placeholder expansion
// ---------------------------------------------------------------------------

/**
 * Expand range-placeholder nodes (e.g. "第171-200章推进剧情") into individual
 * ChapterNode entries with `description: undefined`.
 *
 * The original node is replaced with one chapter entry per number in the range.
 * The range-placeholder node itself is removed; its chapter number is the range start.
 */
export function expandRangePlaceholders(
  outline: VolumeOutlineType,
): VolumeOutlineType {
  const newVolumes: VolumeNode[] = outline.volumes.map((vol) => {
    const newChapters: ChapterNode[] = [];

    for (const node of vol.chapters) {
      const gapType = classifyGap(node);
      if (gapType === "range-placeholder") {
        // Extract chapter range from description, e.g. "第171-200章推进剧情"
        const rangeMatch = node.description?.match(
          /第(\d+)\s*[-–~]\s*(\d+)\s*章/,
        );
        if (rangeMatch) {
          const start = Number.parseInt(rangeMatch[1], 10);
          const end = Number.parseInt(rangeMatch[2], 10);
          for (let ch = start; ch <= end; ch++) {
            newChapters.push({
              chapter: ch,
              event: node.event,
              beat: node.beat,
              description: undefined,
            });
          }
          continue;
        }
      }
      newChapters.push(node);
    }

    return { ...vol, chapters: newChapters };
  });

  const totalChapters = newVolumes.reduce(
    (acc, vol) => acc + vol.chapters.length,
    0,
  );

  return {
    ...outline,
    meta: { ...outline.meta, totalChapters },
    volumes: newVolumes,
  };
}

// ---------------------------------------------------------------------------
// ASCII progress bar
// ---------------------------------------------------------------------------

/** Render a Unicode block-character progress bar. */
export function renderProgressBar(
  filled: number,
  total: number,
  width = 20,
): string {
  if (total === 0) return " ".repeat(width) + "  0%";
  const ratio = Math.min(filled / total, 1);
  const filledWidth = Math.round(ratio * width);
  const emptyWidth = width - filledWidth;
  const pct = Math.round(ratio * 100);
  return "█".repeat(filledWidth) + "░".repeat(emptyWidth) + `  ${pct}%`;
}

// ---------------------------------------------------------------------------
// Skeleton markdown generator
// ---------------------------------------------------------------------------

/** Language label set used in skeleton output. */
type Lang = "zh" | "en";

const STATUS_LABEL: Record<Lang, Record<VolumeAuditSummary["status"], string>> = {
  zh: { complete: "✓", partial: "⚠", empty: "✗" },
  en: { complete: "[OK]", partial: "[WARN]", empty: "[EMPTY]" },
};

/**
 * Group consecutive chapter numbers into readable ranges.
 * e.g. [171, 172, 173, 175, 176] → ["171-173", "175-176"]
 */
function groupChapterRanges(chapters: number[]): string[] {
  if (chapters.length === 0) return [];
  const sorted = [...chapters].sort((a, b) => a - b);
  const ranges: string[] = [];
  let rangeStart = sorted[0];
  let prev = sorted[0];

  for (let i = 1; i <= sorted.length; i++) {
    const cur = sorted[i];
    if (cur !== prev + 1) {
      ranges.push(
        rangeStart === prev
          ? String(rangeStart)
          : `${rangeStart}-${prev}`,
      );
      rangeStart = cur;
    }
    prev = cur;
  }

  return ranges;
}

/**
 * Generate a skeleton Markdown file for manual outline filling.
 *
 * Groups missing chapters by consecutive ranges and outputs a template where
 * each chapter has a placeholder block for the user to fill in.
 */
export function generateSkeletonMarkdown(
  result: OutlineAuditResult,
  lang: Lang = "zh",
): string {
  const lines: string[] = [];

  lines.push(`# ${lang === "zh" ? "细纲骨架" : "Outline Skeleton"}: ${result.bookTitle}`);
  lines.push(
    lang === "zh"
      ? `> 自动生成于 ${new Date().toLocaleString()}`
      : `> Auto-generated at ${new Date().toISOString()}`,
  );
  lines.push("");
  lines.push(
    lang === "zh"
      ? `**整体完整度：${result.completenessPercent}%**（${result.totalComplete}/${result.totalChapters}）`
      : `**Completeness: ${result.completenessPercent}%** (${result.totalComplete}/${result.totalChapters})`,
  );
  lines.push("");

  for (const vol of result.volumeSummaries) {
    lines.push(`## ${vol.volumeTitle}`);
    lines.push(
      lang === "zh"
        ? `${STATUS_LABEL[lang][vol.status]} 完整度：${renderProgressBar(vol.complete, vol.total, 16)} — ${vol.complete}/${vol.total}`
        : `${STATUS_LABEL[lang][vol.status]} Completeness: ${renderProgressBar(vol.complete, vol.total, 16)} — ${vol.complete}/${vol.total}`,
    );
    lines.push("");

    if (vol.missingChapters.length === 0) {
      lines.push(lang === "zh" ? "_此卷已完整_" : "_This volume is complete._");
      lines.push("");
      continue;
    }

    // Group consecutive chapters into ranges
    const ranges = groupChapterRanges(vol.missingChapters);

    if (vol.missing === vol.total) {
      // Entire volume is missing — show big range blocks
      lines.push(
        lang === "zh"
          ? `> **此卷全部 ${vol.total} 章待补充，请逐章填写下方细纲。**`
          : `> **All ${vol.total} chapters in this volume need details. Fill in the outline below.**`,
      );
      lines.push("");
    }

    // Show a fixed-width placeholder block per range group
    // We show up to 10 ranges inline, then continue
    const RANGE_BLOCK_SIZE = 10;
    for (let i = 0; i < ranges.length; i += RANGE_BLOCK_SIZE) {
      const slice = ranges.slice(i, i + RANGE_BLOCK_SIZE);
      lines.push(
        lang === "zh"
          ? `### ${vol.chapterRange[0] + i * 5 + 1}-${vol.chapterRange[0] + (i + RANGE_BLOCK_SIZE) * 5} 章范围`
          : `### Chapters ${vol.chapterRange[0] + i * 5 + 1}-${vol.chapterRange[0] + (i + RANGE_BLOCK_SIZE) * 5}`,
      );
      lines.push("");

      for (const rangeStr of slice) {
        if (rangeStr.includes("-")) {
          const [s, e] = rangeStr.split("-").map(Number);
          for (let ch = s; ch <= e; ch++) {
            lines.push(`**第${ch}章：**`);
            lines.push(
              lang === "zh"
                ? `> [需要补充本章细纲，包括：核心事件、章末钩子、POV角色（如有）]`
                : `> [Fill in chapter outline: core event, chapter-end hook, POV character (if applicable)]`,
            );
            lines.push("");
          }
        } else {
          const ch = Number(rangeStr);
          lines.push(`**第${ch}章：**`);
          lines.push(
            lang === "zh"
              ? `> [需要补充本章细纲，包括：核心事件、章末钩子、POV角色（如有）]`
              : `> [Fill in chapter outline: core event, chapter-end hook, POV character (if applicable)]`,
          );
          lines.push("");
        }
      }
    }

    lines.push("");
  }

  lines.push("---");
  lines.push(
    lang === "zh"
      ? `> 共 ${result.totalMissing} 章待补充。填写后请运行：`
      : `> ${result.totalMissing} chapters pending. After filling in, run:`,
  );
  lines.push(
    `\`\`\`bash`,
  );
  lines.push(
    lang === "zh"
      ? `# inkos outline import <此文件路径> <book-id> --dry-run  # 先预览`
      : `# inkos outline import <this-file-path> <book-id> --dry-run  # preview first`,
  );
  lines.push(
    lang === "zh"
      ? `# inkos outline import <此文件路径> <book-id>            # 确认后写入`
      : `# inkos outline import <this-file-path> <book-id>            # confirm and write`,
  );
  lines.push(`\`\`\``);

  return lines.join("\n");
}

// ---------------------------------------------------------------------------
// Per-volume chapter file audit (I/O)
// ---------------------------------------------------------------------------

/**
 * Audit per-volume chapter JSON files (vol-N-chapters.json).
 *
 * Reads all vol-*-chapters.json files and checks:
 * - Chapter count vs declared chapterRange
 * - Sequential numbering within each volume
 * - Non-empty event/beat fields
 *
 * Returns an OutlineAuditResult compatible with the existing audit system.
 */
export async function auditChapterOutlines(
  bookDir: string,
): Promise<OutlineAuditResult> {
  const dir = join(bookDir, "story", "outline");
  let entries: string[];
  try {
    entries = await readdir(dir);
  } catch {
    return {
      bookTitle: "",
      totalChapters: 0,
      totalComplete: 0,
      totalMissing: 0,
      completenessPercent: 0,
      volumeSummaries: [],
      missingChapters: [],
    };
  }

  const volFiles = entries
    .filter((e) => /^vol-\d+-chapters\.json$/.test(e))
    .sort();

  const volumeSummaries: VolumeAuditSummary[] = [];
  const allMissing: ChapterAuditEntry[] = [];
  let totalComplete = 0;
  let totalChapters = 0;

  for (const file of volFiles) {
    const volIdMatch = file.match(/^vol-(\d+)-chapters\.json$/);
    if (!volIdMatch) continue;
    const volId = Number(volIdMatch[1]);

    const vol = await readVolumeChapters(bookDir, volId);
    if (!vol) continue;

    // Expected chapters from chapterRange
    const [rangeStart, rangeEnd] = vol.chapterRange;
    const expectedChapters = rangeEnd - rangeStart + 1;
    totalChapters += expectedChapters;

    const volMissing: ChapterAuditEntry[] = [];
    const chapterMap = new Map(vol.chapters.map((ch) => [ch.chapter, ch]));

    for (let ch = rangeStart; ch <= rangeEnd; ch++) {
      const node = chapterMap.get(ch);
      if (!node || !node.event.trim() || !node.beat.trim()) {
        volMissing.push({
          chapter: ch,
          volumeId: volId,
          volumeTitle: vol.volumeTitle,
          hasRealDescription: false,
          gapType: node ? "null-description" : "null-description",
          descriptionRaw: node?.event,
        });
      } else {
        totalComplete++;
      }
    }

    allMissing.push(...volMissing);
    const missing = volMissing.length;
    volumeSummaries.push({
      volumeId: volId,
      volumeTitle: vol.volumeTitle,
      chapterRange: vol.chapterRange,
      total: expectedChapters,
      complete: expectedChapters - missing,
      missing,
      missingChapters: volMissing.map((e) => e.chapter),
      gapTypes: { "null-description": missing },
      status: missing === 0 ? "complete" : missing === expectedChapters ? "empty" : "partial",
    });
  }

  const completenessPercent =
    totalChapters > 0
      ? Math.round((totalComplete / totalChapters) * 1000) / 10
      : 0;

  return {
    bookTitle: "",
    totalChapters,
    totalComplete,
    totalMissing: totalChapters - totalComplete,
    completenessPercent,
    volumeSummaries,
    missingChapters: allMissing,
  };
}

// ---------------------------------------------------------------------------
// Cross-audit: volume_map.json ↔ vol-N-chapters.json
// ---------------------------------------------------------------------------

export interface CrossAuditEntry {
  volumeId: number;
  volumeTitle: string;
  issueType: "range-mismatch" | "missing-in-chapters" | "missing-in-volume-map" | "empty-event" | "empty-beat";
  chapter: number | null;
  detail: string;
}

export interface CrossAuditVolumeSummary {
  volumeId: number;
  volumeTitle: string;
  rangeAligned: boolean;
  missingInChapters: number[];
  missingInVolumeMap: number[];
  incompleteFields: number[];
  status: "aligned" | "diverged" | "missing-file";
}

export interface CrossAuditResult {
  bookTitle: string;
  totalVolumes: number;
  volumesAligned: number;
  volumesDiverged: number;
  volumesMissingFile: number;
  volumeSummaries: CrossAuditVolumeSummary[];
  entries: CrossAuditEntry[];
}

/**
 * Cross-audit per-chapter outlines against volume-level outlines.
 *
 * For each volume in volume_map.json, compares the declared chapterRange and
 * chapter entries against the corresponding vol-N-chapters.json file. Flags
 * range mismatches, missing chapters in either direction, and empty event/beat
 * fields.
 */
export async function auditOutlineCross(
  bookDir: string,
): Promise<CrossAuditResult> {
  const outlinePath = join(bookDir, "story", "outline", "volume_map.json");
  let raw: string;
  try {
    raw = await readFile(outlinePath, "utf-8");
  } catch {
    return {
      bookTitle: "",
      totalVolumes: 0,
      volumesAligned: 0,
      volumesDiverged: 0,
      volumesMissingFile: 0,
      volumeSummaries: [],
      entries: [],
    };
  }

  const outline = VolumeOutlineSchema.parse(JSON.parse(raw));
  const entries: CrossAuditEntry[] = [];
  const volumeSummaries: CrossAuditVolumeSummary[] = [];
  let volumesAligned = 0;
  let volumesDiverged = 0;
  let volumesMissingFile = 0;

  for (const vol of outline.volumes) {
    const volChapters = await readVolumeChapters(bookDir, vol.volumeId);

    if (!volChapters) {
      volumesMissingFile++;
      volumeSummaries.push({
        volumeId: vol.volumeId,
        volumeTitle: vol.volumeTitle,
        rangeAligned: false,
        missingInChapters: [],
        missingInVolumeMap: [],
        incompleteFields: [],
        status: "missing-file",
      });
      entries.push({
        volumeId: vol.volumeId,
        volumeTitle: vol.volumeTitle,
        issueType: "range-mismatch",
        chapter: null,
        detail: `vol-${vol.volumeId}-chapters.json not found`,
      });
      continue;
    }

    const volEntries: CrossAuditEntry[] = [];
    let rangeAligned = true;

    // Check chapterRange alignment
    const vmRange = vol.chapterRange;
    const chRange = volChapters.chapterRange;
    if (vmRange[0] !== chRange[0] || vmRange[1] !== chRange[1]) {
      rangeAligned = false;
      volEntries.push({
        volumeId: vol.volumeId,
        volumeTitle: vol.volumeTitle,
        issueType: "range-mismatch",
        chapter: null,
        detail: `volume_map: [${vmRange[0]},${vmRange[1]}] vs vol-chapters: [${chRange[0]},${chRange[1]}]`,
      });
    }

    // Build chapter number sets from actual arrays
    const vmChapterNums = new Set(vol.chapters.map((ch) => ch.chapter));
    const chChapterNums = new Set(volChapters.chapters.map((ch) => ch.chapter));

    // Iterate over the union of actual chapter numbers (not just declared
    // ranges) so chapters that exist outside their declared range are caught.
    const allChapterNums = new Set([...vmChapterNums, ...chChapterNums]);
    const rangeStart = Math.min(vmRange[0], chRange[0]);
    const rangeEnd = Math.max(vmRange[1], chRange[1]);
    for (let ch = rangeStart; ch <= rangeEnd; ch++) allChapterNums.add(ch);

    const missingInChapters: number[] = [];
    const missingInVolumeMap: number[] = [];
    const incompleteFields: number[] = [];

    for (const ch of [...allChapterNums].sort((a, b) => a - b)) {
      const inVolMap = vmChapterNums.has(ch);
      const inChapters = chChapterNums.has(ch);
      const inVolRange = ch >= vmRange[0] && ch <= vmRange[1];
      const inChRange = ch >= chRange[0] && ch <= chRange[1];

      if (inVolMap && !inChapters) {
        missingInChapters.push(ch);
        volEntries.push({
          volumeId: vol.volumeId,
          volumeTitle: vol.volumeTitle,
          issueType: "missing-in-chapters",
          chapter: ch,
          detail: `Chapter ${ch} exists in volume_map.json but missing from vol-${vol.volumeId}-chapters.json`,
        });
      }

      if (!inVolMap && inChapters) {
        missingInVolumeMap.push(ch);
        volEntries.push({
          volumeId: vol.volumeId,
          volumeTitle: vol.volumeTitle,
          issueType: "missing-in-volume-map",
          chapter: ch,
          detail: `Chapter ${ch} exists in vol-${vol.volumeId}-chapters.json but missing from volume_map.json`,
        });
      }

      // Flag chapters that exist outside their declared range
      if (inVolMap && !inVolRange) {
        volEntries.push({
          volumeId: vol.volumeId,
          volumeTitle: vol.volumeTitle,
          issueType: "range-mismatch",
          chapter: ch,
          detail: `Chapter ${ch} in volume_map.json is outside declared range [${vmRange[0]},${vmRange[1]}]`,
        });
      }
      if (inChapters && !inChRange) {
        volEntries.push({
          volumeId: vol.volumeId,
          volumeTitle: vol.volumeTitle,
          issueType: "range-mismatch",
          chapter: ch,
          detail: `Chapter ${ch} in vol-${vol.volumeId}-chapters.json is outside declared range [${chRange[0]},${chRange[1]}]`,
        });
      }

      // Check event/beat completeness for chapters in vol-N-chapters.json
      if (inChapters) {
        const node = volChapters.chapters.find((c) => c.chapter === ch);
        if (node) {
          if (!node.event.trim()) {
            incompleteFields.push(ch);
            volEntries.push({
              volumeId: vol.volumeId,
              volumeTitle: vol.volumeTitle,
              issueType: "empty-event",
              chapter: ch,
              detail: `Chapter ${ch} has empty event field`,
            });
          } else if (!node.beat.trim()) {
            incompleteFields.push(ch);
            volEntries.push({
              volumeId: vol.volumeId,
              volumeTitle: vol.volumeTitle,
              issueType: "empty-beat",
              chapter: ch,
              detail: `Chapter ${ch} has empty beat field`,
            });
          }
        }
      }
    }

    const isDiverged = volEntries.length > 0;
    if (isDiverged) volumesDiverged++;
    else volumesAligned++;

    entries.push(...volEntries);
    volumeSummaries.push({
      volumeId: vol.volumeId,
      volumeTitle: vol.volumeTitle,
      rangeAligned,
      missingInChapters,
      missingInVolumeMap,
      incompleteFields,
      status: isDiverged ? "diverged" : "aligned",
    });
  }

  return {
    bookTitle: outline.meta.bookTitle,
    totalVolumes: outline.volumes.length,
    volumesAligned,
    volumesDiverged,
    volumesMissingFile,
    volumeSummaries,
    entries,
  };
}
