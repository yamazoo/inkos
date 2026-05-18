import { describe, expect, it, beforeEach, afterEach } from "vitest";
import {
  stripThinkingBlocks,
  parseTableRow,
  isTableSep,
  splitSections,
  parseOverviewTable,
  parseVolumeHeadings,
  parseChapterTable,
  parseBulletChapters,
  detectPhases,
  parseVolumeSection,
  parseOkrSection,
  convertVolumeOutlineToJson,
} from "../utils/volume-outline-converter.js";
import type { VolumeSummary } from "../utils/volume-outline-converter.js";
import { mkdtemp, rm, writeFile, mkdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";

// ---------------------------------------------------------------------------
// parseTableRow
// ---------------------------------------------------------------------------

describe("parseTableRow", () => {
  it("parses a basic pipe-separated row", () => {
    expect(parseTableRow("| a | b | c |")).toEqual(["a", "b", "c"]);
  });

  it("handles extra whitespace in cells", () => {
    expect(parseTableRow("|  卷名  | 1-50 | 核心冲突 |")).toEqual([
      "卷名",
      "1-50",
      "核心冲突",
    ]);
  });

  it("handles Chinese characters", () => {
    expect(parseTableRow("| 第一卷 | 第1-60章 | 暗流涌动 |")).toEqual([
      "第一卷",
      "第1-60章",
      "暗流涌动",
    ]);
  });

  it("returns empty array when no content between pipes", () => {
    expect(parseTableRow("|  |  |")).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// isTableSep
// ---------------------------------------------------------------------------

describe("isTableSep", () => {
  it("matches standard separator", () => {
    expect(isTableSep("|---|---|")).toBe(true);
  });

  it("matches separator with spaces and alignment colons", () => {
    expect(isTableSep("| --- | :---: | ---: |")).toBe(true);
  });

  it("rejects data rows", () => {
    expect(isTableSep("| a | b | c |")).toBe(false);
  });

  it("rejects non-table lines", () => {
    expect(isTableSep("some random text")).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// stripThinkingBlocks
// ---------------------------------------------------------------------------

describe("stripThinkingBlocks", () => {
  it("removes /** ... */ comment blocks", () => {
    const input = "Some text\n/** thinking comment */\nMore text";
    const result = stripThinkingBlocks(input);
    expect(result).not.toContain("/**");
    expect(result).not.toContain("thinking comment");
    expect(result).toContain("Some text");
    expect(result).toContain("More text");
  });

  it("removes <!-- ... --> HTML comments", () => {
    const input = "<!-- html comment -->\nReal content";
    const result = stripThinkingBlocks(input);
    expect(result).not.toContain("html comment");
    expect(result).toContain("Real content");
  });

  it("removes <think>...</think> blocks", () => {
    const input = "Before\n<think>LLM reasoning here</think>\nAfter";
    const result = stripThinkingBlocks(input);
    expect(result).not.toContain("LLM reasoning");
    expect(result).toContain("Before");
    expect(result).toContain("After");
  });

  it("removes <thought>...</thought> blocks", () => {
    const input = "<thought>internal monologue</thought>\nContent";
    const result = stripThinkingBlocks(input);
    expect(result).not.toContain("internal monologue");
    expect(result).toContain("Content");
  });

  it("handles text with no blocks", () => {
    const input = "Just normal text with no blocks";
    expect(stripThinkingBlocks(input)).toBe(input);
  });

  it("handles multiline thinking blocks", () => {
    const input = "Start\n/**\n  Multi-line\n  thinking block\n*/\nEnd";
    const result = stripThinkingBlocks(input);
    expect(result).not.toContain("thinking block");
    expect(result).toContain("Start");
    expect(result).toContain("End");
  });

  it("handles multiple blocks in one text", () => {
    const input =
      "/** block 1 */\nText A\n<think>block 2</think>\nText B\n<!-- block 3 -->";
    const result = stripThinkingBlocks(input);
    expect(result).not.toContain("block 1");
    expect(result).not.toContain("block 2");
    expect(result).not.toContain("block 3");
    expect(result).toContain("Text A");
    expect(result).toContain("Text B");
  });
});

// ---------------------------------------------------------------------------
// splitSections
// ---------------------------------------------------------------------------

describe("splitSections", () => {
  it("splits by horizontal rules (---)", () => {
    const input =
      "# 总览\n\n| 卷名 | 章节 | 核心冲突 |\n|---|---|---|\n| 第一卷 | 1-30 | 冲突A |\n\n---\n\n### 第一卷：觉醒（第1-30章）\n\n| 章节 | 事件 | 节奏点 |\n|---|---|---|\n| 1 | 事件A | 节拍A |";
    const sections = splitSections(input);
    expect(sections.length).toBeGreaterThanOrEqual(2);
    expect(sections[0]).toContain("总览");
    expect(sections[1]).toContain("第一卷");
  });

  it("splits by H3 volume headings when no HR present", () => {
    const input =
      "### 第一卷：觉醒（第1-30章）\n\nChapter content\n\n### 第二卷：破局（第31-60章）\n\nMore content";
    const sections = splitSections(input);
    expect(sections.length).toBeGreaterThanOrEqual(2);
  });

  it("handles bold **第N卷：title** format", () => {
    const input =
      "**第一卷：觉醒（第1-25章）**\n\nContent\n\n**第二卷：破局（第26-50章）**\n\nMore";
    const sections = splitSections(input);
    expect(sections.length).toBeGreaterThanOrEqual(2);
  });

  it("returns single section when no split pattern matches", () => {
    const input = "Just a paragraph with no section markers.";
    const sections = splitSections(input);
    expect(sections.length).toBe(1);
    expect(sections[0]).toContain("paragraph");
  });

  it("handles 骨刀行-style sections (no overview, volume headings only)", () => {
    const input =
      "### 第一卷：青茅重梦（第1-25章）\n\nContent here\n\n### 第二卷：县城风云（第26-50章）\n\nMore";
    const sections = splitSections(input);
    expect(sections.length).toBeGreaterThanOrEqual(2);
  });

  it("handles empty input", () => {
    const sections = splitSections("");
    // Fallback returns [""] — single empty section
    expect(sections.length).toBe(1);
  });
});

// ---------------------------------------------------------------------------
// parseOverviewTable
// ---------------------------------------------------------------------------

describe("parseOverviewTable", () => {
  it("parses a standard 5-column overview table", () => {
    const input = [
      "| 卷名 | 章节 | 核心冲突 | 关键转折 | 收益目标 |",
      "|---|---|---|---|---|",
      "| 第一卷 | 1-30 | 生存危机 | 第15章觉醒 | 获得传承 |",
      "| 第二卷 | 31-60 | 门派斗争 | 第45章对决 | 突破境界 |",
    ].join("\n");

    const summaries = parseOverviewTable(input);
    expect(summaries).toHaveLength(2);
    expect(summaries[0].volumeId).toBe(1);
    expect(summaries[0].volumeTitle).toContain("第一卷");
    expect(summaries[0].chapterRange).toEqual([1, 30]);
    expect(summaries[0].coreConflict).toBe("生存危机");
    expect(summaries[1].volumeId).toBe(2);
    expect(summaries[1].chapterRange).toEqual([31, 60]);
  });

  it("parses table with ~ range separator", () => {
    const input = [
      "| 卷名 | 章节 | 核心冲突 | 关键转折 |",
      "|---|---|---|---|",
      "| 第一卷 | 1~30 | 冲突 | 转折 |",
    ].join("\n");

    const summaries = parseOverviewTable(input);
    expect(summaries).toHaveLength(1);
    expect(summaries[0].chapterRange).toEqual([1, 30]);
  });

  it("parses table with Chinese 至 range separator", () => {
    const input = [
      "| 卷名 | 章节 | 核心冲突 | 关键转折 |",
      "|---|---|---|---|",
      "| 第一卷 | 1至30 | 冲突 | 转折 |",
    ].join("\n");

    const summaries = parseOverviewTable(input);
    expect(summaries).toHaveLength(1);
    expect(summaries[0].chapterRange).toEqual([1, 30]);
  });

  it("returns empty array when section starts with volume heading", () => {
    const input =
      "### 第一卷：觉醒（第1-30章）\n\nSome content";
    const summaries = parseOverviewTable(input);
    expect(summaries).toHaveLength(0);
  });

  it("parses Chinese numeral volume IDs", () => {
    const input = [
      "| 卷名 | 章节 | 核心冲突 | 关键转折 |",
      "|---|---|---|---|",
      "| 第三卷 | 31-60 | 冲突C | 转折C |",
    ].join("\n");

    const summaries = parseOverviewTable(input);
    expect(summaries[0].volumeId).toBe(3);
  });

  it("handles harvest goals splitting by comma/semicolon", () => {
    const input = [
      "| 卷名 | 章节 | 核心冲突 | 关键转折 | 收益目标 |",
      "|---|---|---|---|---|",
      "| 第一卷 | 1-30 | 冲突 | 转折 | 目标A，目标B；目标C |",
    ].join("\n");

    const summaries = parseOverviewTable(input);
    expect(summaries[0].harvestGoals).toHaveLength(3);
    expect(summaries[0].harvestGoals).toContain("目标A");
    expect(summaries[0].harvestGoals).toContain("目标B");
  });

  it("strips bold markers from volume titles", () => {
    const input = [
      "| 卷名 | 章节 | 核心冲突 | 关键转折 |",
      "|---|---|---|---|",
      "| **第一卷** | 1-30 | 冲突 | 转折 |",
    ].join("\n");

    const summaries = parseOverviewTable(input);
    expect(summaries[0].volumeTitle).not.toContain("**");
  });

  it("handles non-table content gracefully", () => {
    const input = "这是一段散文，没有表格。";
    const summaries = parseOverviewTable(input);
    expect(summaries).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// parseVolumeHeadings
// ---------------------------------------------------------------------------

describe("parseVolumeHeadings", () => {
  it("parses Pattern A: H3 with Chinese numeral and chapter range (fullwidth parens)", () => {
    const text =
      "### 第一卷：县城风云（第1-60章）\n\n### 第二卷：暗流涌动（第61-120章）";
    const summaries = parseVolumeHeadings(text);
    expect(summaries).toHaveLength(2);
    expect(summaries[0].volumeId).toBe(1);
    expect(summaries[0].volumeTitle).toBe("第一卷：县城风云");
    expect(summaries[0].chapterRange).toEqual([1, 60]);
    expect(summaries[1].volumeId).toBe(2);
    expect(summaries[1].chapterRange).toEqual([61, 120]);
  });

  it("parses Pattern H: H3 with ASCII parens (ch1-20)", () => {
    const text = "### 第一卷：暗流 (ch1-20)\n\n### 第二卷：破局 (ch21-60)";
    const summaries = parseVolumeHeadings(text);
    expect(summaries).toHaveLength(2);
    expect(summaries[0].chapterRange).toEqual([1, 20]);
    expect(summaries[1].chapterRange).toEqual([21, 60]);
  });

  it("parses Pattern G: range-first format", () => {
    const text = "### 第一卷（1-20章）：暗流\n\n### 第二卷（21-60章）：破局";
    const summaries = parseVolumeHeadings(text);
    expect(summaries).toHaveLength(2);
    expect(summaries[0].chapterRange).toEqual([1, 20]);
    expect(summaries[1].chapterRange).toEqual([21, 60]);
  });

  it("parses Pattern B: bold with Chinese numeral", () => {
    const text = "**第一卷：青茅重梦（第1-25章）**";
    const summaries = parseVolumeHeadings(text);
    expect(summaries).toHaveLength(1);
    expect(summaries[0].volumeId).toBe(1);
    expect(summaries[0].chapterRange).toEqual([1, 25]);
  });

  it("parses Pattern C: heading with middle dot and Ch. range", () => {
    const text = "### 卷一·觉醒（Ch.1–70）";
    const summaries = parseVolumeHeadings(text);
    expect(summaries).toHaveLength(1);
    expect(summaries[0].volumeTitle).toContain("觉醒");
    expect(summaries[0].chapterRange).toEqual([1, 70]);
  });

  it("parses Pattern C with Arabic numeral", () => {
    const text = "### 卷1·开始（1-50章）";
    const summaries = parseVolumeHeadings(text);
    expect(summaries).toHaveLength(1);
    expect(summaries[0].volumeId).toBe(1);
  });

  it("parses Pattern D: bold with Arabic numeral", () => {
    const text = "**卷一：剑冢觉醒（ch1-50）**";
    const summaries = parseVolumeHeadings(text);
    expect(summaries).toHaveLength(1);
    expect(summaries[0].volumeTitle).toContain("剑冢觉醒");
    expect(summaries[0].chapterRange).toEqual([1, 50]);
  });

  it("parses Pattern D2: bold with middle dot and colon outside bold", () => {
    const text = "**卷一·铁与血**：主题是**活过今天**。";
    const summaries = parseVolumeHeadings(text);
    expect(summaries).toHaveLength(1);
    expect(summaries[0].volumeTitle).toContain("铁与血");
  });

  it("parses Pattern E: 卷名 subtitle appended to previous volume", () => {
    const text =
      "**第一卷：开始（第1-10章）**\n\n**卷名**：绝境求生，恶女觉醒";
    const summaries = parseVolumeHeadings(text);
    expect(summaries).toHaveLength(1);
    expect(summaries[0].volumeTitle).toContain("绝境求生");
  });

  it("parses Pattern F: bold **第N卷：title** without chapter range", () => {
    const text = "**第一卷：孤坟**\n**第二卷：燃灯**";
    const summaries = parseVolumeHeadings(text);
    expect(summaries).toHaveLength(2);
    expect(summaries[0].volumeTitle).toBe("第一卷：孤坟");
    expect(summaries[1].volumeTitle).toBe("第二卷：燃灯");
    expect(summaries[0].chapterRange).toEqual([0, 0]);
  });

  it("returns empty array for non-heading text", () => {
    const text = "Some random prose without any volume heading patterns.";
    const summaries = parseVolumeHeadings(text);
    expect(summaries).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// parseChapterTable
// ---------------------------------------------------------------------------

describe("parseChapterTable", () => {
  it("parses a standard chapter table", () => {
    const input = [
      "| 章节 | 事件 | 节奏点 |",
      "|---|---|---|",
      "| 1 | 主角觉醒了特殊能力 | 开场铺垫 |",
      "| 2 | 首次战斗试炼 | 小高潮 |",
      "| 3 | 获得前辈传承 | 转折 |",
    ].join("\n");

    const chapters = parseChapterTable(input);
    expect(chapters).toHaveLength(3);
    expect(chapters[0]).toMatchObject({
      chapter: 1,
      event: "主角觉醒了特殊能力",
      beat: "开场铺垫",
    });
    expect(chapters[1].chapter).toBe(2);
    expect(chapters[2].chapter).toBe(3);
  });

  it("parses Chinese chapter notation (第N章)", () => {
    const input = [
      "| 章节 | 事件 | 节奏点 |",
      "|---|---|---|",
      "| 第10章 | 关键对决 | 高潮 |",
    ].join("\n");

    const chapters = parseChapterTable(input);
    expect(chapters).toHaveLength(1);
    expect(chapters[0].chapter).toBe(10);
  });

  it("strips bold markers from event and beat", () => {
    const input = [
      "| 章节 | 事件 | 节奏点 |",
      "|---|---|---|",
      "| 1 | **【威胁1】** 灵气复苏 | **关键转折** |",
    ].join("\n");

    const chapters = parseChapterTable(input);
    expect(chapters[0].event).toBe("【威胁1】 灵气复苏");
    expect(chapters[0].beat).toBe("关键转折");
  });

  it("skips non-numeric chapter cells", () => {
    const input = [
      "| 章节 | 事件 | 节奏点 |",
      "|---|---|---|",
      "| 卷首语 | 说明 | 开场 |",
      "| 1 | 实际第一章 | 铺垫 |",
    ].join("\n");

    const chapters = parseChapterTable(input);
    // "卷首语" is not a number, so only chapter 1 should be parsed
    expect(chapters.length).toBeGreaterThanOrEqual(1);
    const ch1 = chapters.find((c) => c.chapter === 1);
    expect(ch1).toBeDefined();
  });

  it("skips lines that are not in table format", () => {
    const input = [
      "Some prose text",
      "| 章节 | 事件 | 节奏点 |",
      "|---|---|---|",
      "| 1 | 事件A | 节拍A |",
      "Not in table anymore",
    ].join("\n");

    const chapters = parseChapterTable(input);
    expect(chapters).toHaveLength(1);
  });

  it("returns empty array for non-table input", () => {
    const input = "Just prose, no table here.";
    expect(parseChapterTable(input)).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// parseBulletChapters
// ---------------------------------------------------------------------------

describe("parseBulletChapters", () => {
  it("parses bullet list chapters (Format A)", () => {
    const input = [
      "* 第1章：面临黑虎帮收保护费并威胁生命的困境。",
      "* 第2章：找到逃脱机会，反杀混混。",
      "*   第3章：发现剁骨刀法可以实战。",
    ].join("\n");

    const chapters = parseBulletChapters(input);
    expect(chapters).toHaveLength(3);
    expect(chapters[0].chapter).toBe(1);
    expect(chapters[0].event).toContain("黑虎帮");
    expect(chapters[0].beat).toBe("关键转折");
    expect(chapters[2].chapter).toBe(3);
  });

  it("parses Ch. format bullets (Format B)", () => {
    const input = [
      "- Ch.1：打脸名场面——用办公椅腿捅死王德发BOSS",
      "- Ch.2：掉落名牌嘲讽，获得第一个技能",
    ].join("\n");

    const chapters = parseBulletChapters(input);
    expect(chapters).toHaveLength(2);
    expect(chapters[0].chapter).toBe(1);
    expect(chapters[1].chapter).toBe(2);
  });

  it("parses single Chinese numeral chapters in bullets", () => {
    // Only single-character Chinese numerals (一-十) are supported
    const input = "* 第三章：大结局";
    const chapters = parseBulletChapters(input);
    expect(chapters).toHaveLength(1);
    expect(chapters[0].chapter).toBe(3);
  });

  it("strips bold markers from events", () => {
    const input = "* 第1章：**关键事件**发生的时刻";
    const chapters = parseBulletChapters(input);
    expect(chapters[0].event).toBe("关键事件发生的时刻");
  });

  it("returns empty array for non-bullet text", () => {
    expect(parseBulletChapters("Plain text without bullets")).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// detectPhases
// ---------------------------------------------------------------------------

describe("detectPhases", () => {
  it("detects phase headers with chapter ranges", () => {
    const lines = [
      "**【第一阶段：第61-70章】威胁初显**",
      "| 章节 | 事件 | 节奏点 |",
      "|---|---|---|",
      "| 61 | 事件A | 节拍A |",
      "**【第二阶段：第71-80章】矛盾升级**",
      "| 章节 | 事件 | 节奏点 |",
      "|---|---|---|",
      "| 71 | 事件B | 节拍B |",
    ];

    const phases = detectPhases(lines);
    expect(phases).toHaveLength(2);
    expect(phases[0].label).toContain("第一阶段");
    expect(phases[0].range).toEqual([61, 70]);
    expect(phases[0].lines).toHaveLength(3);
    expect(phases[1].label).toContain("第二阶段");
    expect(phases[1].range).toEqual([71, 80]);
  });

  it("detects phase headers without stage label", () => {
    const lines = [
      "**【第101-110章】阶段收束**",
      "| 章节 | 事件 | 节奏点 |",
      "|---|---|---|",
      "| 101 | 事件A | 节拍A |",
    ];

    const phases = detectPhases(lines);
    expect(phases).toHaveLength(1);
    expect(phases[0].range).toEqual([101, 110]);
  });

  it("returns empty array when no phases found", () => {
    const lines = [
      "| 章节 | 事件 | 节奏点 |",
      "|---|---|---|",
      "| 1 | 事件A | 节拍A |",
    ];

    expect(detectPhases(lines)).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// parseVolumeSection
// ---------------------------------------------------------------------------

describe("parseVolumeSection", () => {
  const baseSummary: VolumeSummary = {
    volumeId: 1,
    volumeTitle: "第一卷：觉醒",
    chapterRange: [1, 5],
    coreConflict: "生存危机",
    keyTurnEvent: "第3章觉醒",
    harvestGoals: [],
  };

  it("parses a single-phase volume with chapter table", () => {
    const section = [
      "### 第一卷：觉醒（第1-5章）",
      "",
      "| 章节 | 事件 | 节奏点 |",
      "|---|---|---|",
      "| 1 | 来到新世界 | 开场 |",
      "| 2 | 首次战斗 | 小高潮 |",
      "| 3 | 关键转折：觉醒能力 | 转折 |",
      "| 4 | 巩固实力 | 过渡 |",
      "| 5 | 卷末对决 | 高潮 |",
    ].join("\n");

    const volume = parseVolumeSection(section, baseSummary);
    expect(volume.volumeId).toBe(1);
    expect(volume.chapters).toHaveLength(5);
    expect(volume.chapters[0].chapter).toBe(1);
    expect(volume.chapters[0].event).toContain("来到");
    // keyTurnChapter should detect "关键转折" in event
    expect(volume.keyTurnChapter).toBe(3);
  });

  it("parses a multi-phase volume", () => {
    const section = [
      "### 第三卷：暗流（第61-80章）",
      "",
      "**【第一阶段：第61-70章】威胁初显**",
      "| 章节 | 事件 | 节奏点 |",
      "|---|---|---|",
      "| 61 | 初遇威胁 | 开场 |",
      "| 70 | 威胁升级 | 转折 |",
      "",
      "**【第二阶段：第71-80章】破局**",
      "| 章节 | 事件 | 节奏点 |",
      "|---|---|---|",
      "| 71 | 制定计划 | 铺垫 |",
      "| 80 | 破局成功 | 高潮 |",
    ].join("\n");

    const volume = parseVolumeSection(section, {
      ...baseSummary,
      volumeId: 3,
      volumeTitle: "第三卷：暗流",
      chapterRange: [61, 80],
    });

    expect(volume.phases).toBeDefined();
    expect(volume.phases!).toHaveLength(2);
    expect(volume.phases![0].label).toContain("威胁初显");
    expect(volume.phases![0].range).toEqual([61, 70]);
    expect(volume.phases![0].chapters).toHaveLength(2);
    expect(volume.phases![1].label).toContain("破局");
    // Flat chapters should include all phases
    expect(volume.chapters).toHaveLength(4);
  });

  it("falls back to bullet chapters when no table found", () => {
    const section = [
      "### 第一卷：觉醒",
      "",
      "核心冲突描述...",
      "* 第1章：主角初到县城，遇到第一个挑战",
      "* 第2章：击败反派",
      "* 第3章：获得宝藏",
    ].join("\n");

    const volume = parseVolumeSection(section, baseSummary);
    expect(volume.chapters).toHaveLength(3);
    expect(volume.chapters[0].chapter).toBe(1);
    expect(volume.chapters[0].event).toContain("县城");
  });

  it("sets keyTurnChapter to first chapter when no key-turn event found", () => {
    const section = [
      "### 第一卷：日常（第1-3章）",
      "",
      "| 章节 | 事件 | 节奏点 |",
      "|---|---|---|",
      "| 1 | 日常训练 | 日常 |",
      "| 2 | 继续训练 | 日常 |",
      "| 3 | 还是训练 | 日常 |",
    ].join("\n");

    const volume = parseVolumeSection(section, {
      ...baseSummary,
      chapterRange: [1, 3],
    });
    // Falls back to chapterRange[0] since no "关键" event found
    expect(volume.keyTurnChapter).toBe(1);
  });
});

// ---------------------------------------------------------------------------
// parseOkrSection — Fix 3: bold KR format
// ---------------------------------------------------------------------------

describe("parseOkrSection", () => {
  it("parses bold KR labels like **KR1**：", () => {
    const text = `## 各卷 OKR

**第一卷 OKR：**
- **KR1**：完成主角觉醒
- **KR2**：建立力量体系
`;
    const result = parseOkrSection(text);
    expect(result.get(1)).toEqual(["KR1：完成主角觉醒", "KR2：建立力量体系"]);
  });

  it("parses plain KR labels without bold", () => {
    const text = `## 各卷 OKR

**第二卷 OKR：**
- KR1：推进主线冲突
- KR2：引入新角色
`;
    const result = parseOkrSection(text);
    expect(result.get(2)).toEqual(["KR1：推进主线冲突", "KR2：引入新角色"]);
  });

  it("returns empty map when no OKR section exists", () => {
    const result = parseOkrSection("## 概述\n没有OKR内容");
    expect(result.size).toBe(0);
  });

  it("matches OKR heading with 段 prefix (e.g. ## 段 3：各卷 OKR)", () => {
    const text = `## 段 3：各卷 OKR

**第一卷 OKR：**
- KR1：完成主角觉醒
- KR2：建立力量体系

**第二卷 OKR：**
- KR1：推进主线冲突
- KR2：引入新角色
`;
    const result = parseOkrSection(text);
    expect(result.get(1)).toEqual(["KR1：完成主角觉醒", "KR2：建立力量体系"]);
    expect(result.get(2)).toEqual(["KR1：推进主线冲突", "KR2：引入新角色"]);
  });

  it("matches abbreviated **第N卷 O** format (real volume_map.md style)", () => {
    const text = `## 段 3：各卷 OKR

**第一卷 O**：从家族废物到剑冢觉醒者。
- KR1：陈渊在族比中击败陈珏。

**第二卷 O**：离开家族游历散修世界。
- KR1：沈秋登场。
- KR2：陈渊首次进入剑修遗迹。

**第三卷 O**：遭遇丹道宗门的道统之争。
- KR1：与丹道宗门的道统之争爆发。
`;
    const result = parseOkrSection(text);
    expect(result.get(1)).toEqual(["KR1：陈渊在族比中击败陈珏。"]);
    expect(result.get(2)).toEqual(["KR1：沈秋登场。", "KR2：陈渊首次进入剑修遗迹。"]);
    expect(result.get(3)).toEqual(["KR1：与丹道宗门的道统之争爆发。"]);
  });
});

// ---------------------------------------------------------------------------
// convertVolumeOutlineToJson — cross-volume contamination guard
// ---------------------------------------------------------------------------

describe("convertVolumeOutlineToJson cross-volume contamination", () => {
  let tmpDir: string;

  beforeEach(async () => {
    tmpDir = await mkdtemp(join(tmpdir(), "vol-conv-"));
    await mkdir(join(tmpDir, "story", "outline"), { recursive: true });
  });

  afterEach(async () => {
    await rm(tmpDir, { recursive: true, force: true });
  });

  /**
   * "段" format: all volume descriptions in 段1, separated by --- from
   * other sections (hooks, OKR, end-of-volume changes, rhythm rules).
   * This mirrors the real volume_map.md structure.
   */
  const DUAN_FORMAT_MD = `## 段 1：各卷主题与情绪曲线

**第一卷：寒渊（1-40章）**
主题：在沉默中积蓄爆发。情绪曲线：前段压抑到极致。

**第二卷：游尘（41-80章）**
主题：在无路中找出路。情绪曲线：离开家族后的迷茫。

**第三卷：问剑（81-120章）**
主题：剑道的敌人不是比你强的人。情绪曲线：道统之争。

**第四卷：绝渊（121-160章）**
主题：在死亡边缘找到突破。情绪曲线：剑冢容量逼近极限。

**第五卷：炉火（161-200章）**
主题：炉火不灭，剑道永生。情绪曲线：封锁者现身。

---

## 段 2：卷间钩子与回收承诺

- H001：陈珏践踏陈渊，第10章回收。
- H002：婶婆的馒头，第2卷中段回收。

---

## 各卷 OKR

**第一卷 O**：从家族废物到剑冢觉醒者，在族比中完成身份翻转。
- KR1：陈渊在第10章族比中击败陈珏
- KR2：陈渊在第20章发现经脉缺陷是优势
- KR3：第40章三长老出手干预

**第二卷 O**：离开家族游历散修世界，与沈秋结伴。
- KR1：第50章沈秋登场
- KR2：第60章沈秋师门真相被揭开
- KR3：第75章剑冢容量扩展到三道

**第三卷 O**：遭遇丹道宗门的道统之争，面对沈远现身。
- KR1：第90章道统之争爆发
- KR2：第105章祖父道出剑冢是桥梁
- KR3：第115章祖父牺牲

**第四卷 O**：在剑冢容量逼近极限完成剑意归一的突破。
- KR1：第130章多道剑意冲突
- KR2：第145章完成剑意整合
- KR3：第155章突破完成

**第五卷 O**：终结末法时代，剑道重回世间。
- KR1：第170章封锁者现身
- KR2：第190章九道剑意归一
- KR3：第200章终局画面

---

## 段 4：卷尾必须发生的改变

**第一卷尾（第40章）**：陈渊完成族比碾压，陈珏崩溃，但三长老正式出手干预。
**第二卷尾（第80章）**：陈渊与沈秋的同行关系在第75章经历考验。
**第三卷尾（第120章）**：祖父牺牲、父亲剑意苏醒。
**第四卷尾（第160章）**：剑意归一完成，但代价是陈渊的身体已经到了极限。
**第五卷尾（第200章）**：末法时代终结，陈渊的生命也走到了终点。

---

## 段 5：节奏原则

1. **高潮间距**：大高潮之间最长不超过18章。
2. **喘息频率**：每连续3章高压情节后，必须插入1章喘息章。
3. **钩子密度**：每章章末必须有钩子。
`;

  it("does not contaminate volumes when all volumes are in a single section (段 format)", async () => {
    await writeFile(join(tmpDir, "book.json"), JSON.stringify({
      title: "测试书", targetChapters: 200, genre: "xianxia",
    }), "utf-8");
    await writeFile(join(tmpDir, "story", "outline", "volume_map.md"), DUAN_FORMAT_MD, "utf-8");

    const result = await convertVolumeOutlineToJson(tmpDir);
    expect(result).not.toBeNull();

    const json = JSON.parse(await readFile(join(tmpDir, "story", "outline", "volume_map.json"), "utf-8"));
    const vols = json.volumes;

    expect(vols).toHaveLength(5);

    // Vol 2 harvestGoals must NOT contain vol-1 OKR content (e.g. "第10章族比")
    const vol2Goals = vols[1].harvestGoals.join(" ");
    expect(vol2Goals).not.toContain("第10章");
    expect(vol2Goals).not.toContain("族比");

    // Vol 3 harvestGoals must NOT contain vol-1 or vol-2 content
    const vol3Goals = vols[2].harvestGoals.join(" ");
    expect(vol3Goals).not.toContain("第一卷尾");
    expect(vol3Goals).not.toContain("第40章");

    // Vol 4 coreConflict must NOT be rhythm rules from 段5
    expect(vols[3].coreConflict).not.toContain("喘息章");
    expect(vols[3].coreConflict).not.toContain("钩子密度");

    // Vol 4 harvestGoals must NOT contain rhythm rules
    const vol4Goals = vols[3].harvestGoals.join(" ");
    expect(vol4Goals).not.toContain("喘息章");
    expect(vol4Goals).not.toContain("高潮间距");
  });

  it("correctly assigns OKR goals by volume in 段 format", async () => {
    await writeFile(join(tmpDir, "book.json"), JSON.stringify({
      title: "测试书", targetChapters: 200, genre: "xianxia",
    }), "utf-8");
    await writeFile(join(tmpDir, "story", "outline", "volume_map.md"), DUAN_FORMAT_MD, "utf-8");

    await convertVolumeOutlineToJson(tmpDir);
    const json = JSON.parse(await readFile(join(tmpDir, "story", "outline", "volume_map.json"), "utf-8"));
    const vols = json.volumes;

    // Vol 1: should have its own KR goals
    expect(vols[0].harvestGoals.some((g: string) => g.includes("第10章"))).toBe(true);
    expect(vols[0].harvestGoals.some((g: string) => g.includes("三长老"))).toBe(true);

    // Vol 2: should have its own KR goals (沈秋, 剑冢容量)
    expect(vols[1].harvestGoals.some((g: string) => g.includes("沈秋"))).toBe(true);
    expect(vols[1].harvestGoals.some((g: string) => g.includes("剑冢容量") || g.includes("三道"))).toBe(true);

    // Vol 3: should have its own KR goals (道统之争, 祖父)
    expect(vols[2].harvestGoals.some((g: string) => g.includes("道统"))).toBe(true);
    expect(vols[2].harvestGoals.some((g: string) => g.includes("祖父"))).toBe(true);

    // Vol 4: should have its own KR goals (剑意冲突, 整合)
    expect(vols[3].harvestGoals.some((g: string) => g.includes("剑意冲突") || g.includes("剑意整合"))).toBe(true);

    // Vol 5: should have its own KR goals (封锁者, 归一)
    expect(vols[4].harvestGoals.some((g: string) => g.includes("封锁者") || g.includes("归一"))).toBe(true);
  });
});
