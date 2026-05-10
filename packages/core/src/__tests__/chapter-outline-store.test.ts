import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { mkdtemp, rm, readFile, writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import {
  readVolumeChapters,
  writeVolumeChapters,
  findChapterOutline,
  validateChapterOutlineSemantics,
  type VolumeChapterFile,
} from "../utils/chapter-outline-store.js";
import type { ChapterNode } from "../models/volume-outline.js";

let tmpDir: string;

function makeChapter(n: number, event = `事件${n}`, beat = `节拍${n}`): ChapterNode {
  return { chapter: n, event, beat };
}

function makeVolumeFile(
  volumeId: number,
  chapterRange: [number, number],
  chapters: ChapterNode[],
): VolumeChapterFile {
  return {
    schemaVersion: 1,
    volumeId,
    volumeTitle: `第${volumeId}卷`,
    chapterRange,
    chapters,
  };
}

beforeEach(async () => {
  tmpDir = await mkdtemp(join(tmpdir(), "outline-store-"));
});

afterEach(async () => {
  await rm(tmpDir, { recursive: true, force: true });
});

// ---------------------------------------------------------------------------
// readVolumeChapters
// ---------------------------------------------------------------------------

describe("readVolumeChapters", () => {
  it("returns null when file does not exist", async () => {
    const result = await readVolumeChapters(tmpDir, 1);
    expect(result).toBeNull();
  });

  it("reads a valid vol-N-chapters.json", async () => {
    const data = makeVolumeFile(1, [1, 3], [makeChapter(1), makeChapter(2), makeChapter(3)]);
    const outlineDir = join(tmpDir, "story", "outline");
    await mkdir(outlineDir, { recursive: true });
    await writeFile(join(outlineDir, "vol-1-chapters.json"), JSON.stringify(data), "utf-8");

    const result = await readVolumeChapters(tmpDir, 1);
    expect(result).not.toBeNull();
    expect(result!.volumeId).toBe(1);
    expect(result!.chapters).toHaveLength(3);
    expect(result!.chapters[0]!.chapter).toBe(1);
  });

  it("returns null for invalid JSON", async () => {
    const outlineDir = join(tmpDir, "story", "outline");
    await mkdir(outlineDir, { recursive: true });
    await writeFile(join(outlineDir, "vol-1-chapters.json"), "not json", "utf-8");

    const result = await readVolumeChapters(tmpDir, 1);
    expect(result).toBeNull();
  });

  it("returns null for schema-invalid JSON (missing required fields)", async () => {
    const outlineDir = join(tmpDir, "story", "outline");
    await mkdir(outlineDir, { recursive: true });
    await writeFile(
      join(outlineDir, "vol-1-chapters.json"),
      JSON.stringify({ schemaVersion: 1 }),
      "utf-8",
    );

    const result = await readVolumeChapters(tmpDir, 1);
    expect(result).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// writeVolumeChapters
// ---------------------------------------------------------------------------

describe("writeVolumeChapters", () => {
  it("creates the outline directory if missing", async () => {
    const data = makeVolumeFile(1, [1, 2], [makeChapter(1), makeChapter(2)]);
    await writeVolumeChapters(tmpDir, data);

    const raw = await readFile(join(tmpDir, "story", "outline", "vol-1-chapters.json"), "utf-8");
    const parsed = JSON.parse(raw);
    expect(parsed.volumeId).toBe(1);
    expect(parsed.chapters).toHaveLength(2);
  });

  it("round-trip: write then read produces identical data", async () => {
    const chapters = [makeChapter(5), makeChapter(6), makeChapter(7)];
    const data = makeVolumeFile(2, [5, 7], chapters);
    await writeVolumeChapters(tmpDir, data);

    const result = await readVolumeChapters(tmpDir, 2);
    expect(result).toEqual(data);
  });

  it("overwrites existing file", async () => {
    const data1 = makeVolumeFile(1, [1, 2], [makeChapter(1), makeChapter(2)]);
    await writeVolumeChapters(tmpDir, data1);

    const data2 = makeVolumeFile(1, [1, 3], [makeChapter(1), makeChapter(2), makeChapter(3)]);
    await writeVolumeChapters(tmpDir, data2);

    const result = await readVolumeChapters(tmpDir, 1);
    expect(result!.chapters).toHaveLength(3);
  });
});

// ---------------------------------------------------------------------------
// findChapterOutline
// ---------------------------------------------------------------------------

describe("findChapterOutline", () => {
  it("returns null when no volume files exist", async () => {
    const result = await findChapterOutline(tmpDir, 1);
    expect(result).toBeNull();
  });

  it("finds a chapter in a single-volume book", async () => {
    const data = makeVolumeFile(1, [1, 5], [
      makeChapter(1), makeChapter(2), makeChapter(3), makeChapter(4), makeChapter(5),
    ]);
    await writeVolumeChapters(tmpDir, data);

    const result = await findChapterOutline(tmpDir, 3);
    expect(result).not.toBeNull();
    expect(result!.chapter).toBe(3);
    expect(result!.event).toBe("事件3");
  });

  it("finds a chapter across multiple volumes", async () => {
    const vol1 = makeVolumeFile(1, [1, 3], [makeChapter(1), makeChapter(2), makeChapter(3)]);
    const vol2 = makeVolumeFile(2, [4, 6], [makeChapter(4), makeChapter(5), makeChapter(6)]);
    await writeVolumeChapters(tmpDir, vol1);
    await writeVolumeChapters(tmpDir, vol2);

    const ch1 = await findChapterOutline(tmpDir, 2);
    expect(ch1!.chapter).toBe(2);

    const ch5 = await findChapterOutline(tmpDir, 5);
    expect(ch5!.chapter).toBe(5);
  });

  it("returns null for a chapter not in any volume", async () => {
    const data = makeVolumeFile(1, [1, 3], [makeChapter(1), makeChapter(2), makeChapter(3)]);
    await writeVolumeChapters(tmpDir, data);

    const result = await findChapterOutline(tmpDir, 10);
    expect(result).toBeNull();
  });

  it("skips volumes whose file is corrupted", async () => {
    const outlineDir = join(tmpDir, "story", "outline");
    await mkdir(outlineDir, { recursive: true });
    await writeFile(join(outlineDir, "vol-1-chapters.json"), "corrupted", "utf-8");

    const vol2 = makeVolumeFile(2, [4, 6], [makeChapter(4), makeChapter(5), makeChapter(6)]);
    await writeVolumeChapters(tmpDir, vol2);

    // Chapter 1 is in vol-1 (corrupted) — should return null
    const ch1 = await findChapterOutline(tmpDir, 1);
    expect(ch1).toBeNull();

    // Chapter 5 is in vol-2 (valid) — should find it
    const ch5 = await findChapterOutline(tmpDir, 5);
    expect(ch5!.chapter).toBe(5);
  });
});

// ---------------------------------------------------------------------------
// validateChapterOutlineSemantics
// ---------------------------------------------------------------------------

describe("validateChapterOutlineSemantics", () => {
  it("returns empty warnings for clean chapters", () => {
    const chapters: ChapterNode[] = [
      { chapter: 1, event: "主角发现秘境入口", beat: "悬念引入，营造紧张感" },
      { chapter: 2, event: "进入秘境第一层", beat: "小高潮，展示主角实力" },
    ];
    const warnings = validateChapterOutlineSemantics(chapters);
    expect(warnings).toHaveLength(0);
  });

  it("flags placeholder event '待定'", () => {
    const chapters: ChapterNode[] = [
      { chapter: 1, event: "待定", beat: "正常节拍" },
    ];
    const warnings = validateChapterOutlineSemantics(chapters);
    expect(warnings.some((w) => w.chapter === 1 && w.field === "event" && w.issue === "placeholder")).toBe(true);
  });

  it("flags placeholder beat 'TODO'", () => {
    const chapters: ChapterNode[] = [
      { chapter: 1, event: "正常事件", beat: "TODO" },
    ];
    const warnings = validateChapterOutlineSemantics(chapters);
    expect(warnings.some((w) => w.chapter === 1 && w.field === "beat" && w.issue === "placeholder")).toBe(true);
  });

  it("flags too-short event (< 3 meaningful chars)", () => {
    const chapters: ChapterNode[] = [
      { chapter: 1, event: "打", beat: "正常节拍描述" },
    ];
    const warnings = validateChapterOutlineSemantics(chapters);
    expect(warnings.some((w) => w.chapter === 1 && w.field === "event" && w.issue === "too-short")).toBe(true);
  });

  it("flags duplicate events across chapters", () => {
    const chapters: ChapterNode[] = [
      { chapter: 1, event: "主角突破境界", beat: "节拍1" },
      { chapter: 2, event: "主角突破境界", beat: "节拍2" },
    ];
    const warnings = validateChapterOutlineSemantics(chapters);
    expect(warnings.some((w) => w.issue === "duplicate-event")).toBe(true);
  });

  it("detects duplicates against existing chapters", () => {
    const existing: ChapterNode[] = [
      { chapter: 1, event: "主角突破境界", beat: "节拍1" },
    ];
    const generated: ChapterNode[] = [
      { chapter: 2, event: "主角突破境界", beat: "节拍2" },
    ];
    const warnings = validateChapterOutlineSemantics(generated, existing);
    expect(warnings.some((w) => w.issue === "duplicate-event")).toBe(true);
  });

  it("allows same beat across chapters (only events trigger duplicates)", () => {
    const chapters: ChapterNode[] = [
      { chapter: 1, event: "事件A", beat: "相同节拍" },
      { chapter: 2, event: "事件B", beat: "相同节拍" },
    ];
    const warnings = validateChapterOutlineSemantics(chapters);
    expect(warnings.filter((w) => w.issue === "duplicate-event")).toHaveLength(0);
  });
});
