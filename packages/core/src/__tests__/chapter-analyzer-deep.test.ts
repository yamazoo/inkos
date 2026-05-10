import { afterEach, describe, expect, it, vi } from "vitest";
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { ChapterAnalyzerAgent } from "../agents/chapter-analyzer.js";
import type { BookConfig } from "../models/book.js";
import { countChapterLength } from "../utils/length-metrics.js";

const ZERO_USAGE = {
  promptTokens: 0,
  completionTokens: 0,
  totalTokens: 0,
} as const;

describe("ChapterAnalyzerAgent — deep", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  // -------------------------------------------------------------------------
  // Chinese text handling
  // -------------------------------------------------------------------------

  it("uses character count for a Chinese-language book", async () => {
    const bookDir = await mkdtemp(join(tmpdir(), "inkos-chapter-analyzer-zh-"));
    const chineseContent = "林越走进档案馆，把真正的账本藏在了袖中。";
    const agent = new ChapterAnalyzerAgent({
      client: {
        provider: "openai",
        apiFormat: "chat",
        stream: false,
        defaults: {
          temperature: 0.7,
          maxTokens: 4096,
          thinkingBudget: 0, maxTokensCap: null,
          extra: {},
        },
      },
      model: "test-model",
      projectRoot: process.cwd(),
    });

    const book: BookConfig = {
      id: "zh-book",
      title: "中文书",
      platform: "other",
      genre: "other",
      status: "active",
      targetChapters: 100,
      chapterWordCount: 2200,
      language: "zh",
      createdAt: "2026-03-22T00:00:00.000Z",
      updatedAt: "2026-03-22T00:00:00.000Z",
    };

    vi.spyOn(agent as unknown as { chat: (...args: unknown[]) => Promise<unknown> }, "chat")
      .mockResolvedValue({
        content: [
          "=== CHAPTER_TITLE ===",
          "档案馆密会",
          "",
          "=== CHAPTER_CONTENT ===",
          chineseContent,
          "",
          "=== PRE_WRITE_CHECK ===",
          "",
          "=== POST_SETTLEMENT ===",
          "",
          "=== UPDATED_STATE ===",
          "| 字段 | 值 |",
          "| --- | --- |",
          "| 当前章节 | 1 |",
          "",
          "=== UPDATED_LEDGER ===",
          "",
          "=== UPDATED_HOOKS ===",
          "| hook_id | 状态 |",
          "| --- | --- |",
          "| h1 | open |",
          "",
          "=== CHAPTER_SUMMARY ===",
          "| 1 | 档案馆密会 | 林越 | 藏账本于袖中 | — | — | 紧张 | 动作 |",
          "",
          "=== UPDATED_SUBPLOTS ===",
          "",
          "=== UPDATED_EMOTIONAL_ARCS ===",
          "",
          "=== UPDATED_CHARACTER_MATRIX ===",
          "",
        ].join("\n"),
        usage: ZERO_USAGE,
      });

    try {
      const output = await agent.analyzeChapter({
        book,
        bookDir,
        chapterNumber: 1,
        chapterContent: chineseContent,
      });

      // Chinese: each non-whitespace character counts as 1 (including punctuation)
      const expectedChars = countChapterLength(chineseContent, "zh_chars");
      expect(output.wordCount).toBe(expectedChars);
      // "林越走进档案馆，把真正的账本藏在了袖中。" → 19 Chinese chars + 1 "，" + 1 "。" = 20
      expect(output.wordCount).toBe(20);
    } finally {
      await rm(bookDir, { recursive: true, force: true });
    }
  });

  it("uses word count for an English-language book (baseline)", async () => {
    const bookDir = await mkdtemp(join(tmpdir(), "inkos-chapter-analyzer-en-deep-"));
    const englishContent = "Lin Yue entered the archive and kept the real ledger hidden inside his sleeve.";
    const agent = new ChapterAnalyzerAgent({
      client: {
        provider: "openai",
        apiFormat: "chat",
        stream: false,
        defaults: {
          temperature: 0.7,
          maxTokens: 4096,
          thinkingBudget: 0, maxTokensCap: null,
          extra: {},
        },
      },
      model: "test-model",
      projectRoot: process.cwd(),
    });

    const book: BookConfig = {
      id: "en-book",
      title: "English Book",
      platform: "other",
      genre: "other",
      status: "active",
      targetChapters: 10,
      chapterWordCount: 2200,
      language: "en",
      createdAt: "2026-03-22T00:00:00.000Z",
      updatedAt: "2026-03-22T00:00:00.000Z",
    };

    vi.spyOn(agent as unknown as { chat: (...args: unknown[]) => Promise<unknown> }, "chat")
      .mockResolvedValue({
        content: [
          "=== CHAPTER_TITLE ===",
          "Archive Entry",
          "",
          "=== CHAPTER_CONTENT ===",
          englishContent,
          "",
          "=== PRE_WRITE_CHECK ===",
          "",
          "=== POST_SETTLEMENT ===",
          "",
          "=== UPDATED_STATE ===",
          "| Field | Value |",
          "| --- | --- |",
          "| Current Chapter | 1 |",
          "",
          "=== UPDATED_LEDGER ===",
          "",
          "=== UPDATED_HOOKS ===",
          "| hook_id | status |",
          "| --- | --- |",
          "| h1 | open |",
          "",
          "=== CHAPTER_SUMMARY ===",
          "| 1 | Archive Entry |",
          "",
          "=== UPDATED_SUBPLOTS ===",
          "",
          "=== UPDATED_EMOTIONAL_ARCS ===",
          "",
          "=== UPDATED_CHARACTER_MATRIX ===",
          "",
        ].join("\n"),
        usage: ZERO_USAGE,
      });

    try {
      const output = await agent.analyzeChapter({
        book,
        bookDir,
        chapterNumber: 1,
        chapterContent: englishContent,
      });

      expect(output.wordCount).toBe(countChapterLength(englishContent, "en_words"));
      // "Lin" "Yue" "entered" "the" "archive" "and" "kept" "the" "real" "ledger" "hidden" "inside" "his" "sleeve"
      expect(output.wordCount).toBe(14);
    } finally {
      await rm(bookDir, { recursive: true, force: true });
    }
  });

  it("mixed Chinese/English content is counted by character (language=zh takes precedence)", async () => {
    const bookDir = await mkdtemp(join(tmpdir(), "inkos-chapter-analyzer-mixed-"));
    // Chinese with some English words embedded
    const mixedContent = "Lin Yue拿着令牌走进了暗道。";
    const agent = new ChapterAnalyzerAgent({
      client: {
        provider: "openai",
        apiFormat: "chat",
        stream: false,
        defaults: {
          temperature: 0.7,
          maxTokens: 4096,
          thinkingBudget: 0, maxTokensCap: null,
          extra: {},
        },
      },
      model: "test-model",
      projectRoot: process.cwd(),
    });

    const book: BookConfig = {
      id: "mixed-book",
      title: "Mixed Book",
      platform: "other",
      genre: "other",
      status: "active",
      targetChapters: 10,
      chapterWordCount: 2200,
      language: "zh",
      createdAt: "2026-03-22T00:00:00.000Z",
      updatedAt: "2026-03-22T00:00:00.000Z",
    };

    vi.spyOn(agent as unknown as { chat: (...args: unknown[]) => Promise<unknown> }, "chat")
      .mockResolvedValue({
        content: [
          "=== CHAPTER_TITLE ===",
          "暗道令牌",
          "",
          "=== CHAPTER_CONTENT ===",
          mixedContent,
          "",
          "=== PRE_WRITE_CHECK ===",
          "",
          "=== POST_SETTLEMENT ===",
          "",
          "=== UPDATED_STATE ===",
          "| 字段 | 值 |",
          "| --- | --- |",
          "| 当前章节 | 1 |",
          "",
          "=== UPDATED_LEDGER ===",
          "",
          "=== UPDATED_HOOKS ===",
          "",
          "=== CHAPTER_SUMMARY ===",
          "",
          "=== UPDATED_SUBPLOTS ===",
          "",
          "=== UPDATED_EMOTIONAL_ARCS ===",
          "",
          "=== UPDATED_CHARACTER_MATRIX ===",
          "",
        ].join("\n"),
        usage: ZERO_USAGE,
      });

    try {
      const output = await agent.analyzeChapter({
        book,
        bookDir,
        chapterNumber: 1,
        chapterContent: mixedContent,
      });

      // Mixed content with language=zh → zh_chars counting
      // "Lin Yue拿着令牌走进了暗道。" stripped = "Lin Yue拿着令牌走进了暗道。"
      // Non-whitespace chars = 7 (L,i,n, ,Y,u,e) + 12 Chinese chars = 19
      expect(output.wordCount).toBe(countChapterLength(mixedContent, "zh_chars"));
    } finally {
      await rm(bookDir, { recursive: true, force: true });
    }
  });

  // -------------------------------------------------------------------------
  // Multi-section output parsing
  // -------------------------------------------------------------------------

  it("parses all known sections into their respective output fields", async () => {
    const bookDir = await mkdtemp(join(tmpdir(), "inkos-chapter-analyzer-sections-"));
    const content = "Lin Yue stepped into the archive and kept the real ledger hidden inside his sleeve.";

    const agent = new ChapterAnalyzerAgent({
      client: {
        provider: "openai",
        apiFormat: "chat",
        stream: false,
        defaults: {
          temperature: 0.7,
          maxTokens: 4096,
          thinkingBudget: 0, maxTokensCap: null,
          extra: {},
        },
      },
      model: "test-model",
      projectRoot: process.cwd(),
    });

    const book: BookConfig = {
      id: "sections-book",
      title: "Sections Book",
      platform: "other",
      genre: "litrpg",
      status: "active",
      targetChapters: 10,
      chapterWordCount: 2200,
      language: "en",
      createdAt: "2026-03-22T00:00:00.000Z",
      updatedAt: "2026-03-22T00:00:00.000Z",
    };

    vi.spyOn(agent as unknown as { chat: (...args: unknown[]) => Promise<unknown> }, "chat")
      .mockResolvedValue({
        content: [
          "=== CHAPTER_TITLE ===",
          "The Archive",
          "",
          "=== CHAPTER_CONTENT ===",
          content,
          "",
          "=== PRE_WRITE_CHECK ===",
          "All characters present.",
          "",
          "=== POST_SETTLEMENT ===",
          "State updated.",
          "",
          "=== UPDATED_STATE ===",
          "| Field | Value |",
          "| --- | --- |",
          "| Current Chapter | 1 |",
          "| Current Location | Archive |",
          "",
          "=== UPDATED_LEDGER ===",
          "| resource | change |",
          "| --- | --- |",
          "| gold | -5 |",
          "",
          "=== UPDATED_HOOKS ===",
          "| hook_id | status |",
          "| --- | --- |",
          "| hook-1 | open |",
          "| hook-2 | advanced |",
          "",
          "=== CHAPTER_SUMMARY ===",
          "| 1 | The Archive | Lin Yue | Entered archive | Ledger hidden | hook-1 seeded | tense | action |",
          "",
          "=== UPDATED_SUBPLOTS ===",
          "| subplot | status |",
          "| --- | --- |",
          "| guild-trail | active |",
          "",
          "=== UPDATED_EMOTIONAL_ARCS ===",
          "| character | emotion | direction |",
          "| --- | --- | --- |",
          "| Lin Yue | alert | up |",
          "",
          "=== UPDATED_CHARACTER_MATRIX ===",
          "## Lin Yue",
          "- **Role**: protagonist",
          "- **Tags**: merchant, survivor",
          "",
        ].join("\n"),
        usage: ZERO_USAGE,
      });

    try {
      const output = await agent.analyzeChapter({
        book,
        bookDir,
        chapterNumber: 1,
        chapterContent: content,
      });

      expect(output.title).toBe("The Archive");
      expect(output.content).toBe(content);
      expect(output.preWriteCheck).toBe("All characters present.");
      expect(output.postSettlement).toBe("State updated.");
      expect(output.updatedState).toContain("Current Chapter | 1");
      expect(output.updatedState).toContain("Current Location | Archive");
      expect(output.updatedLedger).toContain("gold | -5");
      expect(output.updatedHooks).toContain("hook-1 | open");
      expect(output.updatedHooks).toContain("hook-2 | advanced");
      expect(output.chapterSummary).toContain("The Archive");
      expect(output.chapterSummary).toContain("Lin Yue");
      expect(output.updatedSubplots).toContain("guild-trail");
      expect(output.updatedSubplots).toContain("active");
      expect(output.updatedEmotionalArcs).toContain("Lin Yue");
      expect(output.updatedEmotionalArcs).toContain("alert");
      expect(output.updatedCharacterMatrix).toContain("## Lin Yue");
      expect(output.updatedCharacterMatrix).toContain("protagonist");
    } finally {
      await rm(bookDir, { recursive: true, force: true });
    }
  });

  it("missing section leaves the corresponding output field as empty string", async () => {
    const bookDir = await mkdtemp(join(tmpdir(), "inkos-chapter-analyzer-missing-"));
    const content = "Lin Yue stepped into the archive.";

    const agent = new ChapterAnalyzerAgent({
      client: {
        provider: "openai",
        apiFormat: "chat",
        stream: false,
        defaults: {
          temperature: 0.7,
          maxTokens: 4096,
          thinkingBudget: 0, maxTokensCap: null,
          extra: {},
        },
      },
      model: "test-model",
      projectRoot: process.cwd(),
    });

    const book: BookConfig = {
      id: "missing-book",
      title: "Missing Sections Book",
      platform: "other",
      genre: "other",
      status: "active",
      targetChapters: 10,
      chapterWordCount: 2200,
      language: "en",
      createdAt: "2026-03-22T00:00:00.000Z",
      updatedAt: "2026-03-22T00:00:00.000Z",
    };

    // LLM only returns CHAPTER_TITLE, CHAPTER_CONTENT, and UPDATED_STATE
    vi.spyOn(agent as unknown as { chat: (...args: unknown[]) => Promise<unknown> }, "chat")
      .mockResolvedValue({
        content: [
          "=== CHAPTER_TITLE ===",
          "Partial Output",
          "",
          "=== CHAPTER_CONTENT ===",
          content,
          "",
          "=== UPDATED_STATE ===",
          "| Field | Value |",
          "| --- | --- |",
          "| Current Chapter | 1 |",
          "",
        ].join("\n"),
        usage: ZERO_USAGE,
      });

    try {
      const output = await agent.analyzeChapter({
        book,
        bookDir,
        chapterNumber: 1,
        chapterContent: content,
      });

      expect(output.title).toBe("Partial Output");
      expect(output.content).toBe(content);
      expect(output.preWriteCheck).toBe("");
      expect(output.postSettlement).toBe("");
      expect(output.updatedState).toContain("Current Chapter | 1");
      expect(output.updatedLedger).toBe("");
      // When UPDATED_HOOKS is absent, the default English placeholder is returned
      expect(output.updatedHooks).toBe("(hooks pool not updated)");
      expect(output.chapterSummary).toBe("");
      expect(output.updatedSubplots).toBe("");
      expect(output.updatedEmotionalArcs).toBe("");
      expect(output.updatedCharacterMatrix).toBe("");
    } finally {
      await rm(bookDir, { recursive: true, force: true });
    }
  });

  it("extra/unknown section is ignored gracefully without causing an error", async () => {
    const bookDir = await mkdtemp(join(tmpdir(), "inkos-chapter-analyzer-unknown-"));
    const content = "Lin Yue entered the archive.";

    const agent = new ChapterAnalyzerAgent({
      client: {
        provider: "openai",
        apiFormat: "chat",
        stream: false,
        defaults: {
          temperature: 0.7,
          maxTokens: 4096,
          thinkingBudget: 0, maxTokensCap: null,
          extra: {},
        },
      },
      model: "test-model",
      projectRoot: process.cwd(),
    });

    const book: BookConfig = {
      id: "unknown-book",
      title: "Unknown Sections Book",
      platform: "other",
      genre: "other",
      status: "active",
      targetChapters: 10,
      chapterWordCount: 2200,
      language: "en",
      createdAt: "2026-03-22T00:00:00.000Z",
      updatedAt: "2026-03-22T00:00:00.000Z",
    };

    vi.spyOn(agent as unknown as { chat: (...args: unknown[]) => Promise<unknown> }, "chat")
      .mockResolvedValue({
        content: [
          "=== CHAPTER_TITLE ===",
          "Unknown Section Test",
          "",
          "=== CHAPTER_CONTENT ===",
          content,
          "",
          "=== PRE_WRITE_CHECK ===",
          "",
          "=== POST_SETTLEMENT ===",
          "",
          "=== UPDATED_STATE ===",
          "| Field | Value |",
          "| --- | --- |",
          "| Current Chapter | 1 |",
          "",
          "=== UPDATED_LEDGER ===",
          "",
          "=== UPDATED_HOOKS ===",
          "",
          "=== CHAPTER_SUMMARY ===",
          "",
          "=== UPDATED_SUBPLOTS ===",
          "",
          "=== UPDATED_EMOTIONAL_ARCS ===",
          "",
          "=== UPDATED_CHARACTER_MATRIX ===",
          "",
          "=== SOME_RANDOM_UNKNOWN_SECTION ===",
          "This section should be ignored.",
          "",
          "=== ANOTHER_FAKE_SECTION ===",
          "Also ignored.",
          "",
        ].join("\n"),
        usage: ZERO_USAGE,
      });

    try {
      const output = await agent.analyzeChapter({
        book,
        bookDir,
        chapterNumber: 1,
        chapterContent: content,
      });

      // Should parse correctly despite unknown sections
      expect(output.title).toBe("Unknown Section Test");
      expect(output.content).toBe(content);
      // Unknown sections should not appear in any known output field
      expect(output.updatedState).not.toContain("This section should be ignored");
      expect(output.updatedState).not.toContain("Also ignored");
      expect(output.chapterSummary).not.toContain("This section should be ignored");
    } finally {
      await rm(bookDir, { recursive: true, force: true });
    }
  });

  // -------------------------------------------------------------------------
  // Tag extraction from Chinese narrative
  // -------------------------------------------------------------------------

  it("extracts entity tags from Chinese narrative into UPDATED_CHARACTER_MATRIX", async () => {
    const bookDir = await mkdtemp(join(tmpdir(), "inkos-chapter-analyzer-tags-"));
    const chineseContent = "赵恒从后山暗道潜入，在密室中与林越相遇。令牌发出微光，空气中弥漫着紧张的气息。";

    const agent = new ChapterAnalyzerAgent({
      client: {
        provider: "openai",
        apiFormat: "chat",
        stream: false,
        defaults: {
          temperature: 0.7,
          maxTokens: 4096,
          thinkingBudget: 0, maxTokensCap: null,
          extra: {},
        },
      },
      model: "test-model",
      projectRoot: process.cwd(),
    });

    const book: BookConfig = {
      id: "zh-tags-book",
      title: "中文标签书",
      platform: "other",
      genre: "other",
      status: "active",
      targetChapters: 50,
      chapterWordCount: 2200,
      language: "zh",
      createdAt: "2026-03-22T00:00:00.000Z",
      updatedAt: "2026-03-22T00:00:00.000Z",
    };

    vi.spyOn(agent as unknown as { chat: (...args: unknown[]) => Promise<unknown> }, "chat")
      .mockResolvedValue({
        content: [
          "=== CHAPTER_TITLE ===",
          "密室相遇",
          "",
          "=== CHAPTER_CONTENT ===",
          chineseContent,
          "",
          "=== PRE_WRITE_CHECK ===",
          "",
          "=== POST_SETTLEMENT ===",
          "",
          "=== UPDATED_STATE ===",
          "| 字段 | 值 |",
          "| --- | --- |",
          "| 当前章节 | 1 |",
          "",
          "=== UPDATED_LEDGER ===",
          "",
          "=== UPDATED_HOOKS ===",
          "| hook_id | 状态 |",
          "| --- | --- |",
          "| h1 | open |",
          "",
          "=== CHAPTER_SUMMARY ===",
          "| 1 | 密室相遇 | 赵恒, 林越 | 暗道潜入, 令牌发光 | — | h1 seeded | 紧张 | 动作 |",
          "",
          "=== UPDATED_SUBPLOTS ===",
          "",
          "=== UPDATED_EMOTIONAL_ARCS ===",
          "",
          "=== UPDATED_CHARACTER_MATRIX ===",
          "## 赵恒",
          "- **定位**: 反派",
          "- **标签**: 暗主, 潜入者",
          "- **反差**: 行动隐秘却心怀坦荡",
          "- **说话**: 简洁低沉",
          "- **性格**: 阴沉多谋",
          "- **动机**: 夺回令牌",
          "- **当前**: 从后山暗道潜入密室",
          "- **关系**: 林越(对手/Ch1)",
          "- **已知**: 令牌的位置",
          "- **未知**: 林越已设下埋伏",
          "",
          "## 林越",
          "- **定位**: 主角",
          "- **标签**: 账房, 幸存者",
          "- **反差**: 表面柔弱实则坚韧",
          "- **说话**: 沉稳谨慎",
          "- **性格**: 外柔内刚",
          "- **动机**: 守护账本",
          "- **当前**: 在密室中等待",
          "- **关系**: 赵恒(对手/Ch1)",
          "- **已知**: 赵恒会来",
          "- **未知**: 赵恒的真实目的",
          "",
        ].join("\n"),
        usage: ZERO_USAGE,
      });

    try {
      const output = await agent.analyzeChapter({
        book,
        bookDir,
        chapterNumber: 1,
        chapterContent: chineseContent,
      });

      // Verify character tags
      expect(output.updatedCharacterMatrix).toContain("## 赵恒");
      expect(output.updatedCharacterMatrix).toContain("## 林越");
      expect(output.updatedCharacterMatrix).toContain("**定位**: 反派");
      expect(output.updatedCharacterMatrix).toContain("**定位**: 主角");
      expect(output.updatedCharacterMatrix).toContain("**标签**: 暗主, 潜入者");
      expect(output.updatedCharacterMatrix).toContain("**标签**: 账房, 幸存者");

      // Verify mood/theme tags
      expect(output.chapterSummary).toContain("紧张");

      // Verify location/item tags
      expect(output.updatedCharacterMatrix).toContain("后山暗道");
      expect(output.updatedCharacterMatrix).toContain("令牌");

      // Verify relationship tags
      expect(output.updatedCharacterMatrix).toContain("赵恒(对手/Ch1)");
      expect(output.updatedCharacterMatrix).toContain("林越(对手/Ch1)");
    } finally {
      await rm(bookDir, { recursive: true, force: true });
    }
  });

  it("extracts location tags from Chinese narrative into UPDATED_STATE", async () => {
    const bookDir = await mkdtemp(join(tmpdir(), "inkos-chapter-analyzer-locations-"));
    const chineseContent = "林越来到青云镇的东市集，发现了隐藏的地下通道入口。";

    const agent = new ChapterAnalyzerAgent({
      client: {
        provider: "openai",
        apiFormat: "chat",
        stream: false,
        defaults: {
          temperature: 0.7,
          maxTokens: 4096,
          thinkingBudget: 0, maxTokensCap: null,
          extra: {},
        },
      },
      model: "test-model",
      projectRoot: process.cwd(),
    });

    const book: BookConfig = {
      id: "zh-locations-book",
      title: "中文地点书",
      platform: "other",
      genre: "other",
      status: "active",
      targetChapters: 50,
      chapterWordCount: 2200,
      language: "zh",
      createdAt: "2026-03-22T00:00:00.000Z",
      updatedAt: "2026-03-22T00:00:00.000Z",
    };

    vi.spyOn(agent as unknown as { chat: (...args: unknown[]) => Promise<unknown> }, "chat")
      .mockResolvedValue({
        content: [
          "=== CHAPTER_TITLE ===",
          "青云镇东市",
          "",
          "=== CHAPTER_CONTENT ===",
          chineseContent,
          "",
          "=== PRE_WRITE_CHECK ===",
          "",
          "=== POST_SETTLEMENT ===",
          "",
          "=== UPDATED_STATE ===",
          "| 字段 | 值 |",
          "| --- | --- |",
          "| 当前章节 | 1 |",
          "| 当前位置 | 青云镇东市集 |",
          "| 关键地点 | 地下通道入口 |",
          "",
          "=== UPDATED_LEDGER ===",
          "",
          "=== UPDATED_HOOKS ===",
          "",
          "=== CHAPTER_SUMMARY ===",
          "",
          "=== UPDATED_SUBPLOTS ===",
          "",
          "=== UPDATED_EMOTIONAL_ARCS ===",
          "",
          "=== UPDATED_CHARACTER_MATRIX ===",
          "",
        ].join("\n"),
        usage: ZERO_USAGE,
      });

    try {
      const output = await agent.analyzeChapter({
        book,
        bookDir,
        chapterNumber: 1,
        chapterContent: chineseContent,
      });

      expect(output.updatedState).toContain("青云镇东市集");
      expect(output.updatedState).toContain("地下通道入口");
    } finally {
      await rm(bookDir, { recursive: true, force: true });
    }
  });

  // -------------------------------------------------------------------------
  // Character entity recognition from Chinese text
  // -------------------------------------------------------------------------

  it("recognises Chinese character names as characters in the matrix", async () => {
    const bookDir = await mkdtemp(join(tmpdir(), "inkos-chapter-analyzer-entities-"));
    const chineseContent = "沈墨白站在城墙上，注视着远方的烽火。李清瑶悄然出现，与他并肩而立。";

    const agent = new ChapterAnalyzerAgent({
      client: {
        provider: "openai",
        apiFormat: "chat",
        stream: false,
        defaults: {
          temperature: 0.7,
          maxTokens: 4096,
          thinkingBudget: 0, maxTokensCap: null,
          extra: {},
        },
      },
      model: "test-model",
      projectRoot: process.cwd(),
    });

    const book: BookConfig = {
      id: "zh-entities-book",
      title: "中文实体书",
      platform: "other",
      genre: "other",
      status: "active",
      targetChapters: 80,
      chapterWordCount: 2500,
      language: "zh",
      createdAt: "2026-03-22T00:00:00.000Z",
      updatedAt: "2026-03-22T00:00:00.000Z",
    };

    vi.spyOn(agent as unknown as { chat: (...args: unknown[]) => Promise<unknown> }, "chat")
      .mockResolvedValue({
        content: [
          "=== CHAPTER_TITLE ===",
          "烽火城墙",
          "",
          "=== CHAPTER_CONTENT ===",
          chineseContent,
          "",
          "=== PRE_WRITE_CHECK ===",
          "",
          "=== POST_SETTLEMENT ===",
          "",
          "=== UPDATED_STATE ===",
          "| 字段 | 值 |",
          "| --- | --- |",
          "| 当前章节 | 1 |",
          "",
          "=== UPDATED_LEDGER ===",
          "",
          "=== UPDATED_HOOKS ===",
          "",
          "=== CHAPTER_SUMMARY ===",
          "",
          "=== UPDATED_SUBPLOTS ===",
          "",
          "=== UPDATED_EMOTIONAL_ARCS ===",
          "",
          "=== UPDATED_CHARACTER_MATRIX ===",
          "## 沈墨白",
          "- **定位**: 主角",
          "- **标签**: 将领, 守城者",
          "- **当前**: 站在城墙上注视烽火",
          "",
          "## 李清瑶",
          "- **定位**: 盟友",
          "- **标签**: 侠客, 神秘",
          "- **当前**: 悄然出现，与沈墨白并肩",
          "",
        ].join("\n"),
        usage: ZERO_USAGE,
      });

    try {
      const output = await agent.analyzeChapter({
        book,
        bookDir,
        chapterNumber: 1,
        chapterContent: chineseContent,
      });

      // Both Chinese names should appear as separate character entries
      expect(output.updatedCharacterMatrix).toContain("## 沈墨白");
      expect(output.updatedCharacterMatrix).toContain("## 李清瑶");
      // Each should have role and tags
      expect(output.updatedCharacterMatrix).toContain("**定位**: 主角");
      expect(output.updatedCharacterMatrix).toContain("**定位**: 盟友");
      expect(output.updatedCharacterMatrix).toContain("**标签**: 将领, 守城者");
      expect(output.updatedCharacterMatrix).toContain("**标签**: 侠客, 神秘");
    } finally {
      await rm(bookDir, { recursive: true, force: true });
    }
  });

  it("recognises implicit role titles as characters even without formal name", async () => {
    const bookDir = await mkdtemp(join(tmpdir(), "inkos-chapter-analyzer-titles-"));
    const chineseContent = "暗主的手下从阴影中现身，低声报告了最新的情报。";

    const agent = new ChapterAnalyzerAgent({
      client: {
        provider: "openai",
        apiFormat: "chat",
        stream: false,
        defaults: {
          temperature: 0.7,
          maxTokens: 4096,
          thinkingBudget: 0, maxTokensCap: null,
          extra: {},
        },
      },
      model: "test-model",
      projectRoot: process.cwd(),
    });

    const book: BookConfig = {
      id: "zh-titles-book",
      title: "中文头衔书",
      platform: "other",
      genre: "other",
      status: "active",
      targetChapters: 50,
      chapterWordCount: 2200,
      language: "zh",
      createdAt: "2026-03-22T00:00:00.000Z",
      updatedAt: "2026-03-22T00:00:00.000Z",
    };

    vi.spyOn(agent as unknown as { chat: (...args: unknown[]) => Promise<unknown> }, "chat")
      .mockResolvedValue({
        content: [
          "=== CHAPTER_TITLE ===",
          "暗主密报",
          "",
          "=== CHAPTER_CONTENT ===",
          chineseContent,
          "",
          "=== PRE_WRITE_CHECK ===",
          "",
          "=== POST_SETTLEMENT ===",
          "",
          "=== UPDATED_STATE ===",
          "| 字段 | 值 |",
          "| --- | --- |",
          "| 当前章节 | 1 |",
          "",
          "=== UPDATED_LEDGER ===",
          "",
          "=== UPDATED_HOOKS ===",
          "",
          "=== CHAPTER_SUMMARY ===",
          "",
          "=== UPDATED_SUBPLOTS ===",
          "",
          "=== UPDATED_EMOTIONAL_ARCS ===",
          "",
          "=== UPDATED_CHARACTER_MATRIX ===",
          "## 暗主",
          "- **定位**: 反派",
          "- **标签**: 暗主, 情报网络",
          "- **当前**: 通过手下获取情报",
          "",
          "## 暗主手下",
          "- **定位**: 配角",
          "- **标签**: 密探, 阴影行者",
          "- **当前**: 从阴影中出现报告情报",
          "",
        ].join("\n"),
        usage: ZERO_USAGE,
      });

    try {
      const output = await agent.analyzeChapter({
        book,
        bookDir,
        chapterNumber: 1,
        chapterContent: chineseContent,
      });

      // Both the named entity (暗主) and the role-based entity (暗主手下) should be recognized
      expect(output.updatedCharacterMatrix).toContain("## 暗主");
      expect(output.updatedCharacterMatrix).toContain("## 暗主手下");
      expect(output.updatedCharacterMatrix).toContain("**定位**: 反派");
      expect(output.updatedCharacterMatrix).toContain("**定位**: 配角");
    } finally {
      await rm(bookDir, { recursive: true, force: true });
    }
  });

  it("uses Chinese system prompt when book language is zh", async () => {
    const bookDir = await mkdtemp(join(tmpdir(), "inkos-chapter-analyzer-zh-prompt-"));
    const chineseContent = "林越走进档案馆，把真正的账本藏在了袖中。";

    const agent = new ChapterAnalyzerAgent({
      client: {
        provider: "openai",
        apiFormat: "chat",
        stream: false,
        defaults: {
          temperature: 0.7,
          maxTokens: 4096,
          thinkingBudget: 0, maxTokensCap: null,
          extra: {},
        },
      },
      model: "test-model",
      projectRoot: process.cwd(),
    });

    const book: BookConfig = {
      id: "zh-prompt-book",
      title: "中文提示书",
      platform: "other",
      genre: "other",
      status: "active",
      targetChapters: 50,
      chapterWordCount: 2200,
      language: "zh",
      createdAt: "2026-03-22T00:00:00.000Z",
      updatedAt: "2026-03-22T00:00:00.000Z",
    };

    const chat = vi.spyOn(agent as unknown as { chat: (...args: unknown[]) => Promise<unknown> }, "chat")
      .mockResolvedValue({
        content: [
          "=== CHAPTER_TITLE ===",
          "档案馆密会",
          "",
          "=== CHAPTER_CONTENT ===",
          chineseContent,
          "",
          "=== PRE_WRITE_CHECK ===",
          "",
          "=== POST_SETTLEMENT ===",
          "",
          "=== UPDATED_STATE ===",
          "| 字段 | 值 |",
          "| --- | --- |",
          "| 当前章节 | 1 |",
          "",
          "=== UPDATED_LEDGER ===",
          "",
          "=== UPDATED_HOOKS ===",
          "",
          "=== CHAPTER_SUMMARY ===",
          "",
          "=== UPDATED_SUBPLOTS ===",
          "",
          "=== UPDATED_EMOTIONAL_ARCS ===",
          "",
          "=== UPDATED_CHARACTER_MATRIX ===",
          "",
        ].join("\n"),
        usage: ZERO_USAGE,
      });

    try {
      await agent.analyzeChapter({
        book,
        bookDir,
        chapterNumber: 1,
        chapterContent: chineseContent,
      });

      const messages = chat.mock.calls[0]?.[0] as Array<{ role: string; content: string }>;
      const systemPrompt = messages[0]?.content ?? "";

      // Chinese system prompt should not contain the English override instruction
      expect(systemPrompt).not.toContain("ALL output MUST be in English");
      // Should contain Chinese guidance
      expect(systemPrompt).toContain("小说连续性分析师");
      expect(systemPrompt).toContain("分析一章已完成的小说正文");

      const userPrompt = messages[1]?.content ?? "";
      // User prompt should be in Chinese
      expect(userPrompt).toContain("请分析第1章正文");
      expect(userPrompt).not.toContain("Analyze chapter 1");
    } finally {
      await rm(bookDir, { recursive: true, force: true });
    }
  });
});
