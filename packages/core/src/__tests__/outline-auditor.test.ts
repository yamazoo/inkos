import { describe, expect, it, beforeEach, afterEach } from "vitest";
import {
  auditOutline,
  classifyGap,
  expandRangePlaceholders,
  generateSkeletonMarkdown,
  renderProgressBar,
} from "../utils/outline-auditor.js";
import type { VolumeOutline } from "../models/volume-outline.js";

/** Fully-typed VolumeOutline factory — avoids helper type mismatches. */
function makeOutline(
  meta: VolumeOutline["meta"],
  volumes: VolumeOutline["volumes"],
): VolumeOutline {
  return { schemaVersion: 1, meta, volumes };
}

// ---------------------------------------------------------------------------
// classifyGap
// ---------------------------------------------------------------------------

describe("classifyGap", () => {
  it("returns null for real descriptions", () => {
    expect(classifyGap({ chapter: 1, event: "a", beat: "b", description: "第1章：绝境逢生" })).toBeNull();
    expect(classifyGap({ chapter: 2, event: "a", beat: "b", description: "暗流涌动" })).toBeNull();
    expect(classifyGap({ chapter: 3, event: "a", beat: "b", description: "第42章：关键转折" })).toBeNull();
  });

  it("returns null-description when description is undefined", () => {
    expect(classifyGap({ chapter: 1, event: "a", beat: "b" })).toBe("null-description");
  });

  it("returns range-placeholder for range-with-placeholder text", () => {
    expect(classifyGap({ chapter: 1, event: "a", beat: "b", description: "第171-200章推进剧情" })).toBe("range-placeholder");
    expect(classifyGap({ chapter: 5, event: "a", beat: "b", description: "第81-90章内容待补充" })).toBe("range-placeholder");
  });

  it("returns gap-placeholder for bare-chapter placeholder text", () => {
    expect(classifyGap({ chapter: 1, event: "a", beat: "b", description: "第42章内容待补充" })).toBe("gap-placeholder");
    expect(classifyGap({ chapter: 7, event: "a", beat: "b", description: "第7章推进剧情" })).toBe("gap-placeholder");
  });
});

// ---------------------------------------------------------------------------
// auditOutline
// ---------------------------------------------------------------------------

describe("auditOutline", () => {
  it("returns complete status when all chapters have descriptions", () => {
    const outline: VolumeOutline = makeOutline(
      { bookTitle: "测试书", sourceFile: "test.md", generatedAt: "2024-01-01T00:00:00Z", totalChapters: 3, totalVolumes: 1 },
      [{
        volumeId: 1,
        volumeTitle: "第一卷",
        chapterRange: [1, 3],
        coreConflict: "",
        keyTurnChapter: 1,
        keyTurnEvent: "",
        harvestGoals: [],
        chapters: [
          { chapter: 1, event: "事件", beat: "节奏", description: "第1章：好" },
          { chapter: 2, event: "事件", beat: "节奏", description: "第2章：也好" },
          { chapter: 3, event: "事件", beat: "节奏", description: "第3章：更好" },
        ],
      }],
    );

    const result = auditOutline(outline);
    expect(result.totalMissing).toBe(0);
    expect(result.totalComplete).toBe(3);
    expect(result.totalChapters).toBe(3);
    expect(result.completenessPercent).toBe(100);
    expect(result.volumeSummaries[0].status).toBe("complete");
  });

  it("counts null-description, range-placeholder, and gap-placeholder separately", () => {
    const outline: VolumeOutline = makeOutline(
      { bookTitle: "测试书", sourceFile: "test.md", generatedAt: "2024-01-01T00:00:00Z", totalChapters: 4, totalVolumes: 1 },
      [{
        volumeId: 1,
        volumeTitle: "第一卷",
        chapterRange: [1, 4],
        coreConflict: "",
        keyTurnChapter: 1,
        keyTurnEvent: "",
        harvestGoals: [],
        chapters: [
          { chapter: 1, event: "事件", beat: "节奏" }, // null-description
          { chapter: 2, event: "事件", beat: "节奏", description: "第2章：好" }, // real
          { chapter: 3, event: "事件", beat: "节奏", description: "第11-20章推进剧情" }, // range-placeholder
          { chapter: 4, event: "事件", beat: "节奏", description: "第4章内容待补充" }, // gap-placeholder
        ],
      }],
    );

    const result = auditOutline(outline);
    expect(result.totalMissing).toBe(3);
    expect(result.totalComplete).toBe(1);
    expect(result.missingChapters.map((e) => e.gapType)).toEqual([
      "null-description",
      "range-placeholder",
      "gap-placeholder",
    ]);
    expect(result.volumeSummaries[0].gapTypes["null-description"]).toBe(1);
    expect(result.volumeSummaries[0].gapTypes["range-placeholder"]).toBe(1);
    expect(result.volumeSummaries[0].gapTypes["gap-placeholder"]).toBe(1);
  });

  it("returns empty status when all chapters are missing", () => {
    const outline: VolumeOutline = makeOutline(
      { bookTitle: "空书", sourceFile: "test.md", generatedAt: "2024-01-01T00:00:00Z", totalChapters: 2, totalVolumes: 1 },
      [{
        volumeId: 1,
        volumeTitle: "第一卷",
        chapterRange: [1, 2],
        coreConflict: "",
        keyTurnChapter: 1,
        keyTurnEvent: "",
        harvestGoals: [],
        chapters: [
          { chapter: 1, event: "事件", beat: "节奏" },
          { chapter: 2, event: "事件", beat: "节奏" },
        ],
      }],
    );

    const result = auditOutline(outline);
    expect(result.volumeSummaries[0].status).toBe("empty");
    expect(result.completenessPercent).toBe(0);
  });

  it("computes completeness percentage correctly", () => {
    const outline: VolumeOutline = makeOutline(
      { bookTitle: "测试", sourceFile: "test.md", generatedAt: "2024-01-01T00:00:00Z", totalChapters: 10, totalVolumes: 1 },
      [{
        volumeId: 1,
        volumeTitle: "第一卷",
        chapterRange: [1, 10],
        coreConflict: "",
        keyTurnChapter: 1,
        keyTurnEvent: "",
        harvestGoals: [],
        chapters: Array.from({ length: 10 }, (_, i) => ({
          chapter: i + 1,
          event: "事件",
          beat: "节奏",
          description: i < 3 ? "第" + (i + 1) + "章：好" : undefined,
        })),
      }],
    );

    const result = auditOutline(outline);
    expect(result.totalComplete).toBe(3);
    expect(result.totalMissing).toBe(7);
    expect(result.completenessPercent).toBe(30);
  });
});

// ---------------------------------------------------------------------------
// expandRangePlaceholders
// ---------------------------------------------------------------------------

describe("expandRangePlaceholders", () => {
  it("expands a range-placeholder into individual chapters", () => {
    const outline: VolumeOutline = makeOutline(
      { bookTitle: "测试", sourceFile: "test.md", generatedAt: "2024-01-01T00:00:00Z", totalChapters: 5, totalVolumes: 1 },
      [{
        volumeId: 1,
        volumeTitle: "第一卷",
        chapterRange: [1, 6],
        coreConflict: "",
        keyTurnChapter: 1,
        keyTurnEvent: "",
        harvestGoals: [],
        chapters: [
          { chapter: 1, event: "事件A", beat: "节奏A", description: "第1章：好" },
          { chapter: 3, event: "range", beat: "beat", description: "第3-5章推进剧情" },
          { chapter: 6, event: "事件B", beat: "节奏B", description: "第6章：结束" },
        ],
      }],
    );

    const expanded = expandRangePlaceholders(outline);
    const chs = expanded.volumes[0].chapters;

    // ch1 + ch3-5 (3 nodes) + ch6 = 5 chapters
    expect(chs.length).toBe(5);
    expect(chs[0].chapter).toBe(1);
    expect(chs[0].description).toBe("第1章：好");
    expect(chs[1].chapter).toBe(3);
    expect(chs[1].description).toBeUndefined();
    expect(chs[2].chapter).toBe(4);
    expect(chs[2].description).toBeUndefined();
    expect(chs[3].chapter).toBe(5);
    expect(chs[3].description).toBeUndefined();
    expect(chs[4].chapter).toBe(6);
    expect(chs[4].description).toBe("第6章：结束");
  });

  it("leaves non-range-placeholder chapters unchanged", () => {
    const outline: VolumeOutline = makeOutline(
      { bookTitle: "测试", sourceFile: "test.md", generatedAt: "2024-01-01T00:00:00Z", totalChapters: 2, totalVolumes: 1 },
      [{
        volumeId: 1,
        volumeTitle: "第一卷",
        chapterRange: [1, 2],
        coreConflict: "",
        keyTurnChapter: 1,
        keyTurnEvent: "",
        harvestGoals: [],
        chapters: [
          { chapter: 1, event: "事件", beat: "节奏", description: "第1章：好" },
          { chapter: 2, event: "事件", beat: "节奏", description: "第2章：也好" },
        ],
      }],
    );

    const expanded = expandRangePlaceholders(outline);
    expect(expanded.volumes[0].chapters.length).toBe(2);
    expect(expanded.volumes[0].chapters[0].description).toBe("第1章：好");
    expect(expanded.volumes[0].chapters[1].description).toBe("第2章：也好");
  });

  it("recalculates totalChapters in meta", () => {
    const outline: VolumeOutline = makeOutline(
      { bookTitle: "测试", sourceFile: "test.md", generatedAt: "2024-01-01T00:00:00Z", totalChapters: 2, totalVolumes: 1 },
      [{
        volumeId: 1,
        volumeTitle: "第一卷",
        chapterRange: [1, 2],
        coreConflict: "",
        keyTurnChapter: 1,
        keyTurnEvent: "",
        harvestGoals: [],
        chapters: [
          { chapter: 1, event: "事件", beat: "节奏" },
          { chapter: 2, event: "事件", beat: "节奏", description: "第1-2章内容待补充" },
        ],
      }],
    );

    const expanded = expandRangePlaceholders(outline);
    // ch1 + ch1 + ch2 = 3
    expect(expanded.meta.totalChapters).toBe(3);
  });
});

// ---------------------------------------------------------------------------
// renderProgressBar
// ---------------------------------------------------------------------------

describe("renderProgressBar", () => {
  it("renders full bar for 100%", () => {
    const bar = renderProgressBar(10, 10, 10);
    // Output: "██████████  100%" (two spaces before percentage)
    expect(bar).toMatch(/^█{10}\s+100%$/);
  });

  it("renders empty bar for 0%", () => {
    const bar = renderProgressBar(0, 10, 10);
    expect(bar).toMatch(/^░{10}\s+0%$/);
  });

  it("renders half bar for 50%", () => {
    const bar = renderProgressBar(5, 10, 10);
    expect(bar).toMatch(/^█{5}░{5}\s+50%$/);
  });

  it("handles zero total", () => {
    const bar = renderProgressBar(0, 0, 10);
    expect(bar.trim()).toBe("0%");
  });
});

// ---------------------------------------------------------------------------
// generateSkeletonMarkdown
// ---------------------------------------------------------------------------

describe("generateSkeletonMarkdown", () => {
  it("generates a skeleton with missing chapter entries", () => {
    const outline: VolumeOutline = makeOutline(
      { bookTitle: "测试书", sourceFile: "test.md", generatedAt: "2024-01-01T00:00:00Z", totalChapters: 3, totalVolumes: 1 },
      [{
        volumeId: 1,
        volumeTitle: "第一卷",
        chapterRange: [1, 3],
        coreConflict: "",
        keyTurnChapter: 1,
        keyTurnEvent: "",
        harvestGoals: [],
        chapters: [
          { chapter: 1, event: "事件", beat: "节奏", description: "第1章：好" },
          { chapter: 2, event: "事件", beat: "节奏" },
          { chapter: 3, event: "事件", beat: "节奏" },
        ],
      }],
    );

    const result = auditOutline(outline);
    const md = generateSkeletonMarkdown(result, "zh");

    expect(md).toContain("测试书");
    expect(md).toContain("第2章");
    expect(md).toContain("第3章");
    expect(md).toContain("需要补充");
    expect(md).toContain("inkos outline import");
  });

  it("includes progress bar info in the header", () => {
    const outline: VolumeOutline = makeOutline(
      { bookTitle: "空书", sourceFile: "test.md", generatedAt: "2024-01-01T00:00:00Z", totalChapters: 2, totalVolumes: 1 },
      [{
        volumeId: 1,
        volumeTitle: "第一卷",
        chapterRange: [1, 2],
        coreConflict: "",
        keyTurnChapter: 1,
        keyTurnEvent: "",
        harvestGoals: [],
        chapters: [
          { chapter: 1, event: "事件", beat: "节奏" },
          { chapter: 2, event: "事件", beat: "节奏" },
        ],
      }],
    );

    const result = auditOutline(outline);
    const md = generateSkeletonMarkdown(result, "en");

    expect(md).toContain("Completeness: 0%");
    expect(md).toContain("[EMPTY]");
  });
});

// ---------------------------------------------------------------------------
// auditChapterOutlines (I/O — reads per-volume JSON files)
// ---------------------------------------------------------------------------

import { mkdtemp, rm, writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { auditChapterOutlines } from "../utils/outline-auditor.js";
import { writeVolumeChapters } from "../utils/chapter-outline-store.js";

describe("auditChapterOutlines", () => {
  let tmpDir: string;

  beforeEach(async () => {
    tmpDir = await mkdtemp(join(tmpdir(), "audit-ch-"));
  });

  afterEach(async () => {
    await rm(tmpDir, { recursive: true, force: true });
  });

  it("returns 100% when all volume chapters match the outline", async () => {
    // Write a complete vol-1-chapters.json
    await writeVolumeChapters(tmpDir, {
      schemaVersion: 1,
      volumeId: 1,
      volumeTitle: "第一卷",
      chapterRange: [1, 3],
      chapters: [
        { chapter: 1, event: "事件1", beat: "节拍1" },
        { chapter: 2, event: "事件2", beat: "节拍2" },
        { chapter: 3, event: "事件3", beat: "节拍3" },
      ],
    });

    const result = await auditChapterOutlines(tmpDir);
    expect(result.totalChapters).toBe(3);
    expect(result.totalComplete).toBe(3);
    expect(result.completenessPercent).toBe(100);
    expect(result.missingChapters).toHaveLength(0);
  });

  it("detects missing chapters when volume file has gaps", async () => {
    await writeVolumeChapters(tmpDir, {
      schemaVersion: 1,
      volumeId: 1,
      volumeTitle: "第一卷",
      chapterRange: [1, 5],
      chapters: [
        { chapter: 1, event: "事件1", beat: "节拍1" },
        { chapter: 3, event: "事件3", beat: "节拍3" },
        { chapter: 5, event: "事件5", beat: "节拍5" },
      ],
    });

    const result = await auditChapterOutlines(tmpDir);
    expect(result.totalChapters).toBe(5);
    expect(result.totalComplete).toBe(3);
    expect(result.missingChapters.map((e) => e.chapter)).toEqual([2, 4]);
  });

  it("detects incomplete volume when chapterRange exceeds stored chapters", async () => {
    // chapterRange says [1, 3] but only 2 chapters stored → 1 missing
    await writeVolumeChapters(tmpDir, {
      schemaVersion: 1,
      volumeId: 1,
      volumeTitle: "第一卷",
      chapterRange: [1, 3],
      chapters: [
        { chapter: 1, event: "事件1", beat: "节拍1" },
        { chapter: 3, event: "事件3", beat: "节拍3" },
      ],
    });

    const result = await auditChapterOutlines(tmpDir);
    expect(result.totalChapters).toBe(3);
    expect(result.totalComplete).toBe(2);
    expect(result.missingChapters.map((e) => e.chapter)).toEqual([2]);
  });

  it("handles multiple volumes", async () => {
    await writeVolumeChapters(tmpDir, {
      schemaVersion: 1,
      volumeId: 1,
      volumeTitle: "第一卷",
      chapterRange: [1, 2],
      chapters: [
        { chapter: 1, event: "事件1", beat: "节拍1" },
        { chapter: 2, event: "事件2", beat: "节拍2" },
      ],
    });
    await writeVolumeChapters(tmpDir, {
      schemaVersion: 1,
      volumeId: 2,
      volumeTitle: "第二卷",
      chapterRange: [3, 5],
      chapters: [
        { chapter: 3, event: "事件3", beat: "节拍3" },
      ],
    });

    const result = await auditChapterOutlines(tmpDir);
    expect(result.totalChapters).toBe(5);
    expect(result.totalComplete).toBe(3);
    expect(result.missingChapters.map((e) => e.chapter)).toEqual([4, 5]);
  });

  it("returns 0% when no volume files exist", async () => {
    const result = await auditChapterOutlines(tmpDir);
    expect(result.totalChapters).toBe(0);
    expect(result.completenessPercent).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// auditOutlineCross
// ---------------------------------------------------------------------------

import { auditOutlineCross } from "../utils/outline-auditor.js";

describe("auditOutlineCross", () => {
  let tmpDir: string;

  beforeEach(async () => {
    tmpDir = await mkdtemp(join(tmpdir(), "cross-audit-"));
    await mkdir(join(tmpDir, "story", "outline"), { recursive: true });
  });

  afterEach(async () => {
    await rm(tmpDir, { recursive: true, force: true });
  });

  /** Write a volume_map.json file in the temp directory. */
  async function writeVolumeMap(volumes: Array<{
    volumeId: number;
    volumeTitle: string;
    chapterRange: [number, number];
    chapters: Array<{ chapter: number; event: string; beat: string; description?: string }>;
  }>) {
    const outline = {
      schemaVersion: 1,
      meta: { bookTitle: "测试书", sourceFile: "test.md", generatedAt: "2024-01-01T00:00:00Z", totalChapters: volumes.reduce((s, v) => s + v.chapters.length, 0), totalVolumes: volumes.length },
      volumes: volumes.map(v => ({ ...v, coreConflict: "", keyTurnChapter: 1, keyTurnEvent: "", harvestGoals: [] })),
    };
    await writeFile(
      join(tmpDir, "story", "outline", "volume_map.json"),
      JSON.stringify(outline, null, 2),
      "utf-8",
    );
  }

  it("reports aligned when ranges and chapters match", async () => {
    await writeVolumeMap([{
      volumeId: 1, volumeTitle: "第一卷", chapterRange: [1, 3],
      chapters: [
        { chapter: 1, event: "事件1", beat: "节拍1" },
        { chapter: 2, event: "事件2", beat: "节拍2" },
        { chapter: 3, event: "事件3", beat: "节拍3" },
      ],
    }]);
    await writeVolumeChapters(tmpDir, {
      schemaVersion: 1, volumeId: 1, volumeTitle: "第一卷", chapterRange: [1, 3],
      chapters: [
        { chapter: 1, event: "事件1", beat: "节拍1" },
        { chapter: 2, event: "事件2", beat: "节拍2" },
        { chapter: 3, event: "事件3", beat: "节拍3" },
      ],
    });

    const result = await auditOutlineCross(tmpDir);
    expect(result.volumesAligned).toBe(1);
    expect(result.volumesDiverged).toBe(0);
    expect(result.entries).toHaveLength(0);
    expect(result.volumeSummaries[0].status).toBe("aligned");
  });

  it("detects range mismatch", async () => {
    await writeVolumeMap([{
      volumeId: 1, volumeTitle: "第一卷", chapterRange: [1, 5],
      chapters: [
        { chapter: 1, event: "事件1", beat: "节拍1" },
        { chapter: 2, event: "事件2", beat: "节拍2" },
      ],
    }]);
    await writeVolumeChapters(tmpDir, {
      schemaVersion: 1, volumeId: 1, volumeTitle: "第一卷", chapterRange: [1, 3],
      chapters: [
        { chapter: 1, event: "事件1", beat: "节拍1" },
        { chapter: 2, event: "事件2", beat: "节拍2" },
        { chapter: 3, event: "事件3", beat: "节拍3" },
      ],
    });

    const result = await auditOutlineCross(tmpDir);
    expect(result.volumeSummaries[0].rangeAligned).toBe(false);
    expect(result.entries.some(e => e.issueType === "range-mismatch")).toBe(true);
  });

  it("detects missing file", async () => {
    await writeVolumeMap([{
      volumeId: 1, volumeTitle: "第一卷", chapterRange: [1, 2],
      chapters: [
        { chapter: 1, event: "事件1", beat: "节拍1" },
        { chapter: 2, event: "事件2", beat: "节拍2" },
      ],
    }]);
    // No vol-1-chapters.json written

    const result = await auditOutlineCross(tmpDir);
    expect(result.volumesMissingFile).toBe(1);
    expect(result.volumeSummaries[0].status).toBe("missing-file");
  });

  it("detects orphan chapters in vol-N-chapters.json", async () => {
    await writeVolumeMap([{
      volumeId: 1, volumeTitle: "第一卷", chapterRange: [1, 2],
      chapters: [
        { chapter: 1, event: "事件1", beat: "节拍1" },
        { chapter: 2, event: "事件2", beat: "节拍2" },
      ],
    }]);
    await writeVolumeChapters(tmpDir, {
      schemaVersion: 1, volumeId: 1, volumeTitle: "第一卷", chapterRange: [1, 3],
      chapters: [
        { chapter: 1, event: "事件1", beat: "节拍1" },
        { chapter: 2, event: "事件2", beat: "节拍2" },
        { chapter: 3, event: "事件3", beat: "节拍3" },
      ],
    });

    const result = await auditOutlineCross(tmpDir);
    expect(result.volumeSummaries[0].missingInVolumeMap).toEqual([3]);
    expect(result.entries.some(e => e.issueType === "missing-in-volume-map" && e.chapter === 3)).toBe(true);
  });

  it("detects empty event field", async () => {
    await writeVolumeMap([{
      volumeId: 1, volumeTitle: "第一卷", chapterRange: [1, 2],
      chapters: [
        { chapter: 1, event: "事件1", beat: "节拍1" },
        { chapter: 2, event: "事件2", beat: "节拍2" },
      ],
    }]);
    // Write vol file directly (bypass Zod min(1) validation on event field)
    await writeFile(
      join(tmpDir, "story", "outline", "vol-1-chapters.json"),
      JSON.stringify({
        schemaVersion: 1, volumeId: 1, volumeTitle: "第一卷", chapterRange: [1, 2],
        chapters: [
          { chapter: 1, event: "事件1", beat: "节拍1" },
          { chapter: 2, event: "  ", beat: "节拍2" },
        ],
      }, null, 2),
      "utf-8",
    );

    const result = await auditOutlineCross(tmpDir);
    expect(result.volumeSummaries[0].incompleteFields).toEqual([2]);
    expect(result.entries.some(e => e.issueType === "empty-event" && e.chapter === 2)).toBe(true);
  });

  it("handles multiple volumes with mixed alignment", async () => {
    await writeVolumeMap([
      {
        volumeId: 1, volumeTitle: "第一卷", chapterRange: [1, 2],
        chapters: [
          { chapter: 1, event: "事件1", beat: "节拍1" },
          { chapter: 2, event: "事件2", beat: "节拍2" },
        ],
      },
      {
        volumeId: 2, volumeTitle: "第二卷", chapterRange: [3, 4],
        chapters: [
          { chapter: 3, event: "事件3", beat: "节拍3" },
          { chapter: 4, event: "事件4", beat: "节拍4" },
        ],
      },
    ]);
    await writeVolumeChapters(tmpDir, {
      schemaVersion: 1, volumeId: 1, volumeTitle: "第一卷", chapterRange: [1, 2],
      chapters: [
        { chapter: 1, event: "事件1", beat: "节拍1" },
        { chapter: 2, event: "事件2", beat: "节拍2" },
      ],
    });
    // Volume 2 missing

    const result = await auditOutlineCross(tmpDir);
    expect(result.totalVolumes).toBe(2);
    expect(result.volumesAligned).toBe(1);
    expect(result.volumesMissingFile).toBe(1);
  });

  it("returns empty result when volume_map.json is missing", async () => {
    const result = await auditOutlineCross(tmpDir);
    expect(result.totalVolumes).toBe(0);
    expect(result.entries).toHaveLength(0);
  });

  it("detects chapter in vol-N-chapters.json outside its declared range", async () => {
    // chapter 5 exists in the actual array but is outside declared range [1,3]
    await writeVolumeMap([{
      volumeId: 1, volumeTitle: "第一卷", chapterRange: [1, 3],
      chapters: [
        { chapter: 1, event: "事件1", beat: "节拍1" },
        { chapter: 2, event: "事件2", beat: "节拍2" },
        { chapter: 3, event: "事件3", beat: "节拍3" },
      ],
    }]);
    await writeFile(
      join(tmpDir, "story", "outline", "vol-1-chapters.json"),
      JSON.stringify({
        schemaVersion: 1, volumeId: 1, volumeTitle: "第一卷", chapterRange: [1, 3],
        chapters: [
          { chapter: 1, event: "事件1", beat: "节拍1" },
          { chapter: 2, event: "事件2", beat: "节拍2" },
          { chapter: 3, event: "事件3", beat: "节拍3" },
          { chapter: 5, event: "孤立章节", beat: "节拍5" }, // outside range [1,3]
        ],
      }, null, 2),
      "utf-8",
    );

    const result = await auditOutlineCross(tmpDir);
    // chapter 5 should be flagged as outside declared range
    const ch5Entry = result.entries.find(e => e.chapter === 5 && e.issueType === "range-mismatch");
    expect(ch5Entry).toBeDefined();
    expect(ch5Entry!.detail).toContain("outside declared range");
  });

  it("detects chapter in volume_map.json outside its declared range", async () => {
    // chapter 10 exists in volume_map.json chapters but is outside declared range [1,3]
    await writeVolumeMap([{
      volumeId: 1, volumeTitle: "第一卷", chapterRange: [1, 3],
      chapters: [
        { chapter: 1, event: "事件1", beat: "节拍1" },
        { chapter: 2, event: "事件2", beat: "节拍2" },
        { chapter: 3, event: "事件3", beat: "节拍3" },
        { chapter: 10, event: "孤立章节", beat: "节拍10" },
      ],
    }]);
    await writeVolumeChapters(tmpDir, {
      schemaVersion: 1, volumeId: 1, volumeTitle: "第一卷", chapterRange: [1, 3],
      chapters: [
        { chapter: 1, event: "事件1", beat: "节拍1" },
        { chapter: 2, event: "事件2", beat: "节拍2" },
        { chapter: 3, event: "事件3", beat: "节拍3" },
      ],
    });

    const result = await auditOutlineCross(tmpDir);
    const ch10Entry = result.entries.find(e => e.chapter === 10 && e.issueType === "range-mismatch");
    expect(ch10Entry).toBeDefined();
    expect(ch10Entry!.detail).toContain("outside declared range");
  });
});
