import { afterEach, describe, expect, it, vi } from "vitest";
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { ContinuityAuditor } from "../agents/continuity.js";

const ZERO_USAGE = {
  promptTokens: 0,
  completionTokens: 0,
  totalTokens: 0,
} as const;

describe("ContinuityAuditor", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("prefers book language override when building audit prompts", async () => {
    const root = await mkdtemp(join(tmpdir(), "inkos-auditor-lang-test-"));
    const bookDir = join(root, "book");
    const storyDir = join(bookDir, "story");
    await mkdir(storyDir, { recursive: true });

    await Promise.all([
      writeFile(
        join(bookDir, "book.json"),
        JSON.stringify({
          id: "english-book",
          title: "English Book",
          genre: "xuanhuan",
          platform: "royalroad",
          chapterWordCount: 800,
          targetChapters: 60,
          status: "active",
          language: "en",
          createdAt: "2026-03-23T00:00:00.000Z",
          updatedAt: "2026-03-23T00:00:00.000Z",
        }, null, 2),
        "utf-8",
      ),
      writeFile(join(storyDir, "current_state.md"), "# Current State\n\n- Lin Yue keeps the oath token hidden.\n", "utf-8"),
      writeFile(join(storyDir, "pending_hooks.md"), "# Pending Hooks\n", "utf-8"),
      writeFile(join(storyDir, "chapter_summaries.md"), "# Chapter Summaries\n", "utf-8"),
      writeFile(join(storyDir, "subplot_board.md"), "# Subplot Board\n", "utf-8"),
      writeFile(join(storyDir, "emotional_arcs.md"), "# Emotional Arcs\n", "utf-8"),
      writeFile(join(storyDir, "character_matrix.md"), "# Character Matrix\n", "utf-8"),
      writeFile(join(storyDir, "volume_outline.md"), "# Volume Outline\n\n## Chapter 1\nReturn to the mentor debt.\n", "utf-8"),
      writeFile(join(storyDir, "style_guide.md"), "# Style Guide\n\n- Keep the prose restrained.\n", "utf-8"),
    ]);

    const auditor = new ContinuityAuditor({
      client: {
        provider: "openai",
        apiFormat: "chat",
        stream: false,
        defaults: {
          temperature: 0.7,
          maxTokens: 4096,
          thinkingBudget: 0,
          extra: {},
        },
      },
      model: "test-model",
      projectRoot: root,
    });

    const chatSpy = vi.spyOn(ContinuityAuditor.prototype as never, "chat" as never).mockResolvedValue({
      content: JSON.stringify({
        passed: true,
        issues: [],
        summary: "ok",
      }),
      usage: ZERO_USAGE,
    });

    try {
      await auditor.auditChapter(bookDir, "Chapter body.", 1, "xuanhuan");

      const messages = chatSpy.mock.calls[0]?.[0] as
        | ReadonlyArray<{ content: string }>
        | undefined;
      const systemPrompt = messages?.[0]?.content ?? "";

      expect(systemPrompt).toContain("ALL OUTPUT MUST BE IN ENGLISH");
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  it("localizes English audit prompts instead of mixing Chinese control text", async () => {
    const root = await mkdtemp(join(tmpdir(), "inkos-auditor-en-prompt-test-"));
    const bookDir = join(root, "book");
    const storyDir = join(bookDir, "story");
    await mkdir(storyDir, { recursive: true });

    await Promise.all([
      writeFile(
        join(bookDir, "book.json"),
        JSON.stringify({
          id: "english-book",
          title: "English Book",
          genre: "other",
          platform: "royalroad",
          chapterWordCount: 800,
          targetChapters: 60,
          status: "active",
          language: "en",
          createdAt: "2026-03-23T00:00:00.000Z",
          updatedAt: "2026-03-23T00:00:00.000Z",
        }, null, 2),
        "utf-8",
      ),
      writeFile(join(storyDir, "current_state.md"), "# Current State\n\n- Mara keeps the warehouse key hidden.\n", "utf-8"),
      writeFile(join(storyDir, "pending_hooks.md"), "# Pending Hooks\n", "utf-8"),
      writeFile(join(storyDir, "chapter_summaries.md"), "# Chapter Summaries\n", "utf-8"),
      writeFile(join(storyDir, "subplot_board.md"), "# Subplot Board\n", "utf-8"),
      writeFile(join(storyDir, "emotional_arcs.md"), "# Emotional Arcs\n", "utf-8"),
      writeFile(join(storyDir, "character_matrix.md"), "# Character Matrix\n", "utf-8"),
      writeFile(join(storyDir, "volume_outline.md"), "# Volume Outline\n\n## Chapter 1\nCheck Warehouse 9.\n", "utf-8"),
      writeFile(join(storyDir, "style_guide.md"), "# Style Guide\n\n- Keep the prose restrained.\n", "utf-8"),
    ]);

    const auditor = new ContinuityAuditor({
      client: {
        provider: "openai",
        apiFormat: "chat",
        stream: false,
        defaults: {
          temperature: 0.7,
          maxTokens: 4096,
          thinkingBudget: 0,
          extra: {},
        },
      },
      model: "test-model",
      projectRoot: root,
    });

    const chatSpy = vi.spyOn(ContinuityAuditor.prototype as never, "chat" as never).mockResolvedValue({
      content: JSON.stringify({
        passed: true,
        issues: [],
        summary: "ok",
      }),
      usage: ZERO_USAGE,
    });

    try {
      await auditor.auditChapter(bookDir, "Chapter body.", 1, "other");

      const messages = chatSpy.mock.calls[0]?.[0] as
        | ReadonlyArray<{ content: string }>
        | undefined;
      const systemPrompt = messages?.[0]?.content ?? "";
      const userPrompt = messages?.[1]?.content ?? "";

      expect(systemPrompt).toContain("Hook Check");
      expect(systemPrompt).toContain("Chapter Memo Drift Check");
      expect(systemPrompt).not.toContain("Outline Drift Check");
      expect(systemPrompt).toContain("stays dormant long enough to feel abandoned");
      expect(systemPrompt).toContain("3-question test");
      expect(systemPrompt).toContain("same mode long enough to flatten rhythm");
      expect(systemPrompt).not.toContain("more than 5 chapters");
      expect(systemPrompt).not.toContain("3 straight chapters");
      expect(systemPrompt).not.toContain("3+ consecutive chapters");
      expect(systemPrompt).not.toContain("伏笔检查");
      expect(systemPrompt).not.toContain("大纲偏离检测");

      expect(userPrompt).toContain("Review chapter 1.");
      expect(userPrompt).toContain("## Current State Card");
      expect(userPrompt).toContain("## Pending Hooks");
      expect(userPrompt).not.toContain("请审查第1章");
      expect(userPrompt).not.toContain("## 当前状态卡");
      expect(userPrompt).not.toContain("## 伏笔池");
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  it("uses selected summary and hook evidence instead of full long-history markdown in governed mode", async () => {
    const root = await mkdtemp(join(tmpdir(), "inkos-auditor-test-"));
    const bookDir = join(root, "book");
    const storyDir = join(bookDir, "story");
    await mkdir(storyDir, { recursive: true });

    await Promise.all([
      writeFile(join(storyDir, "current_state.md"), "# Current State\n\n- Lin Yue still hides the broken oath token.\n", "utf-8"),
      writeFile(
        join(storyDir, "pending_hooks.md"),
        [
          "# Pending Hooks",
          "",
          "| hook_id | 起始章节 | 类型 | 状态 | 最近推进 | 预期回收 | 备注 |",
          "| --- | --- | --- | --- | --- | --- | --- |",
          "| guild-route | 1 | mystery | open | 2 | 6 | Merchant guild trail |",
          "| mentor-oath | 8 | relationship | open | 99 | 101 | Mentor oath debt with Lin Yue |",
          "",
        ].join("\n"),
        "utf-8",
      ),
      writeFile(
        join(storyDir, "chapter_summaries.md"),
        [
          "# Chapter Summaries",
          "",
          "| 1 | Guild Trail | Merchant guild flees west | Route clues only | None | guild-route seeded | tense | action |",
          "| 99 | Trial Echo | Lin Yue | Mentor left without explanation | Oath token matters again | mentor-oath advanced | aching | fallout |",
          "",
        ].join("\n"),
        "utf-8",
      ),
      writeFile(join(storyDir, "subplot_board.md"), "# 支线进度板\n", "utf-8"),
      writeFile(join(storyDir, "emotional_arcs.md"), "# 情感弧线\n", "utf-8"),
      writeFile(join(storyDir, "character_matrix.md"), "# 角色交互矩阵\n", "utf-8"),
      writeFile(join(storyDir, "volume_outline.md"), "# Volume Outline\n\n## Chapter 100\nTrack the merchant guild trail.\n", "utf-8"),
      writeFile(join(storyDir, "style_guide.md"), "# Style Guide\n\n- Keep the prose restrained.\n", "utf-8"),
    ]);

    const auditor = new ContinuityAuditor({
      client: {
        provider: "openai",
        apiFormat: "chat",
        stream: false,
        defaults: {
          temperature: 0.7,
          maxTokens: 4096,
          thinkingBudget: 0,
          extra: {},
        },
      },
      model: "test-model",
      projectRoot: root,
    });

    const chatSpy = vi.spyOn(ContinuityAuditor.prototype as never, "chat" as never).mockResolvedValue({
      content: JSON.stringify({
        passed: true,
        issues: [],
        summary: "ok",
      }),
      usage: ZERO_USAGE,
    });

    try {
      await auditor.auditChapter(
        bookDir,
        "Chapter body.",
        100,
        "xuanhuan",
        {
          chapterIntent: "# Chapter Intent\n\n## Goal\nBring the focus back to the mentor oath conflict.\n",
          contextPackage: {
            chapter: 100,
            selectedContext: [
              {
                source: "story/chapter_summaries.md#99",
                reason: "Relevant episodic memory.",
                excerpt: "Trial Echo | Mentor left without explanation | mentor-oath advanced",
              },
              {
                source: "story/pending_hooks.md#mentor-oath",
                reason: "Carry forward unresolved hook.",
                excerpt: "relationship | open | 101 | Mentor oath debt with Lin Yue",
              },
            ],
          },
          ruleStack: {
            layers: [{ id: "L4", name: "current_task", precedence: 70, scope: "local" }],
            sections: {
              hard: ["current_state"],
              soft: ["current_focus"],
              diagnostic: ["continuity_audit"],
            },
            overrideEdges: [],
            activeOverrides: [],
          },
        },
      );

      const messages = chatSpy.mock.calls[0]?.[0] as
        | ReadonlyArray<{ content: string }>
        | undefined;
      const userPrompt = messages?.[1]?.content ?? "";

      expect(userPrompt).toContain("story/chapter_summaries.md#99");
      expect(userPrompt).toContain("story/pending_hooks.md#mentor-oath");
      expect(userPrompt).not.toContain("| 1 | Guild Trail |");
      expect(userPrompt).not.toContain("guild-route | 1 | mystery");
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  describe("dimension 38 — outline compliance (checkOutlineCompliance)", () => {
    it("flags a setting keyword from 【事件】 that is missing in chapter text", async () => {
      const root = await mkdtemp(join(tmpdir(), "inkos-dim38-"));
      const bookDir = join(root, "book");
      const storyDir = join(bookDir, "story");
      await mkdir(storyDir, { recursive: true });

      await Promise.all([
        writeFile(join(storyDir, "current_state.md"), "# Current State\n", "utf-8"),
        writeFile(join(storyDir, "pending_hooks.md"), "# Pending Hooks\n", "utf-8"),
        writeFile(join(storyDir, "chapter_summaries.md"), "# Chapter Summaries\n", "utf-8"),
        writeFile(join(storyDir, "subplot_board.md"), "# Subplot\n", "utf-8"),
        writeFile(join(storyDir, "emotional_arcs.md"), "# Emotion\n", "utf-8"),
        writeFile(join(storyDir, "character_matrix.md"), "# Matrix\n", "utf-8"),
        writeFile(join(storyDir, "style_guide.md"), "# Style\n", "utf-8"),
      ]);

      const auditor = new ContinuityAuditor({
        client: {
          provider: "openai", apiFormat: "chat", stream: false,
          defaults: {
            temperature: 0.7, maxTokens: 4096, thinkingBudget: 0, maxTokensCap: null, extra: {},
          },
        },
        model: "test-model",
        projectRoot: root,
      });

      vi.spyOn(ContinuityAuditor.prototype as never, "chat" as never).mockResolvedValue({
        content: JSON.stringify({ passed: true, issues: [], summary: "ok" }),
        usage: ZERO_USAGE,
      });

      try {
        const result = await auditor.auditChapter(
          bookDir,
          "柴房里很暗。陈渊靠在土墙上，看着破窗外灰白的天。",
          1,
          "xuanhuan",
          {
            chapterIntent: [
              "【事件】陈渊在宗门演武场遭遇陈岳的挑衅",
              "【节拍】主角首次在公开场合展示实力",
              "【详述】宗门演武场是家族大比的场地，围观者众多",
            ].join("\n"),
          },
        );

        const outlineIssues = result.issues.filter(
          (i) => i.category === "细纲落地检查",
        );
        expect(outlineIssues.length).toBeGreaterThanOrEqual(1);
        const settingIssue = outlineIssues.find(
          (i) => i.description.includes("演武场"),
        );
        expect(settingIssue).toBeDefined();
        expect(settingIssue!.severity).toBe("warning");
      } finally {
        await rm(root, { recursive: true, force: true });
      }
    });

    it("filters out function-word-prefixed setting matches (在/的/被 etc.)", async () => {
      const root = await mkdtemp(join(tmpdir(), "inkos-dim38-fn-"));
      const bookDir = join(root, "book");
      const storyDir = join(bookDir, "story");
      await mkdir(storyDir, { recursive: true });

      await Promise.all([
        writeFile(join(storyDir, "current_state.md"), "# Current State\n", "utf-8"),
        writeFile(join(storyDir, "pending_hooks.md"), "# Pending Hooks\n", "utf-8"),
        writeFile(join(storyDir, "chapter_summaries.md"), "# Chapters\n", "utf-8"),
        writeFile(join(storyDir, "subplot_board.md"), "# Subplot\n", "utf-8"),
        writeFile(join(storyDir, "emotional_arcs.md"), "# Emotion\n", "utf-8"),
        writeFile(join(storyDir, "character_matrix.md"), "# Matrix\n", "utf-8"),
        writeFile(join(storyDir, "style_guide.md"), "# Style\n", "utf-8"),
      ]);

      const auditor = new ContinuityAuditor({
        client: {
          provider: "openai", apiFormat: "chat", stream: false,
          defaults: {
            temperature: 0.7, maxTokens: 4096, thinkingBudget: 0, maxTokensCap: null, extra: {},
          },
        },
        model: "test-model",
        projectRoot: root,
      });

      vi.spyOn(ContinuityAuditor.prototype as never, "chat" as never).mockResolvedValue({
        content: JSON.stringify({ passed: true, issues: [], summary: "ok" }),
        usage: ZERO_USAGE,
      });

      try {
        // When the event has no location-suffix keywords (场/擂台/殿堂/etc.),
        // the deterministic pre-check produces zero warnings — it doesn't
        // fabricate issues from bare text.
        const result = await auditor.auditChapter(
          bookDir,
          "陈渊醒了过来，周围很暗。",
          1,
          "xuanhuan",
          {
            chapterIntent: [
              "【事件】陈渊从昏迷中醒来，浑身疼痛",
              "【节拍】主角发现自己被扔在柴房里",
            ].join("\n"),
          },
        );

        const outlineIssues = result.issues.filter(
          (i) => i.category === "细纲落地检查",
        );
        expect(outlineIssues.length).toBe(0);
      } finally {
        await rm(root, { recursive: true, force: true });
      }
    });

    it("produces no warnings when all outline settings appear in chapter text", async () => {
      const root = await mkdtemp(join(tmpdir(), "inkos-dim38-ok-"));
      const bookDir = join(root, "book");
      const storyDir = join(bookDir, "story");
      await mkdir(storyDir, { recursive: true });

      await Promise.all([
        writeFile(join(storyDir, "current_state.md"), "# Current State\n", "utf-8"),
        writeFile(join(storyDir, "pending_hooks.md"), "# Pending Hooks\n", "utf-8"),
        writeFile(join(storyDir, "chapter_summaries.md"), "# Chapters\n", "utf-8"),
        writeFile(join(storyDir, "subplot_board.md"), "# Subplot\n", "utf-8"),
        writeFile(join(storyDir, "emotional_arcs.md"), "# Emotion\n", "utf-8"),
        writeFile(join(storyDir, "character_matrix.md"), "# Matrix\n", "utf-8"),
        writeFile(join(storyDir, "style_guide.md"), "# Style\n", "utf-8"),
      ]);

      const auditor = new ContinuityAuditor({
        client: {
          provider: "openai", apiFormat: "chat", stream: false,
          defaults: {
            temperature: 0.7, maxTokens: 4096, thinkingBudget: 0, maxTokensCap: null, extra: {},
          },
        },
        model: "test-model",
        projectRoot: root,
      });

      vi.spyOn(ContinuityAuditor.prototype as never, "chat" as never).mockResolvedValue({
        content: JSON.stringify({ passed: true, issues: [], summary: "ok" }),
        usage: ZERO_USAGE,
      });

      try {
        // Suffix keyword "演武场" is extracted from outline event, and
        // the chapter text contains it regardless of prefix variation.
        const result = await auditor.auditChapter(
          bookDir,
          "陈渊踏入宗门演武场。四周围满了围观的族人。",
          1,
          "xuanhuan",
          {
            chapterIntent: [
              "【事件】陈渊前往门派演武场参加比试",
              "【节拍】主角首次在公开场合展示实力",
            ].join("\n"),
          },
        );

        const outlineIssues = result.issues.filter(
          (i) => i.category === "细纲落地检查",
        );
        expect(outlineIssues.length).toBe(0);
      } finally {
        await rm(root, { recursive: true, force: true });
      }
    });

    it("all outline compliance issues are always warning severity, never critical", async () => {
      const root = await mkdtemp(join(tmpdir(), "inkos-dim38-sev-"));
      const bookDir = join(root, "book");
      const storyDir = join(bookDir, "story");
      await mkdir(storyDir, { recursive: true });

      await Promise.all([
        writeFile(join(storyDir, "current_state.md"), "# Current State\n", "utf-8"),
        writeFile(join(storyDir, "pending_hooks.md"), "# Pending Hooks\n", "utf-8"),
        writeFile(join(storyDir, "chapter_summaries.md"), "# Chapters\n", "utf-8"),
        writeFile(join(storyDir, "subplot_board.md"), "# Subplot\n", "utf-8"),
        writeFile(join(storyDir, "emotional_arcs.md"), "# Emotion\n", "utf-8"),
        writeFile(join(storyDir, "character_matrix.md"), "# Matrix\n", "utf-8"),
        writeFile(join(storyDir, "style_guide.md"), "# Style\n", "utf-8"),
      ]);

      const auditor = new ContinuityAuditor({
        client: {
          provider: "openai", apiFormat: "chat", stream: false,
          defaults: {
            temperature: 0.7, maxTokens: 4096, thinkingBudget: 0, maxTokensCap: null, extra: {},
          },
        },
        model: "test-model",
        projectRoot: root,
      });

      vi.spyOn(ContinuityAuditor.prototype as never, "chat" as never).mockResolvedValue({
        content: JSON.stringify({ passed: true, issues: [], summary: "ok" }),
        usage: ZERO_USAGE,
      });

      try {
        // Multiple missing settings to ensure we get several warnings
        const result = await auditor.auditChapter(
          bookDir,
          "陈渊坐在房间里。外面天色已暗。",
          1,
          "xuanhuan",
          {
            chapterIntent: [
              "【事件】陈渊在宗门演武场与陈岳殿堂对决，结束后转至城门密探",
              "【节拍】主角首次展示实力",
              "【详述】宗门演武场是家族核心场地，殿堂为长老议事处，城门为秘密通道",
            ].join("\n"),
          },
        );

        const outlineIssues = result.issues.filter(
          (i) => i.category === "细纲落地检查",
        );
        expect(outlineIssues.length).toBeGreaterThan(0);
        for (const issue of outlineIssues) {
          expect(issue.severity).toBe("warning");
        }
      } finally {
        await rm(root, { recursive: true, force: true });
      }
    });
  });

  it("injects the chapter memo into the audit prompt for memo-drift checking", async () => {
    const root = await mkdtemp(join(tmpdir(), "inkos-auditor-memo-drift-"));
    const bookDir = join(root, "book");
    const storyDir = join(bookDir, "story");
    await mkdir(storyDir, { recursive: true });

    await Promise.all([
      writeFile(join(storyDir, "current_state.md"), "# Current State\n", "utf-8"),
      writeFile(join(storyDir, "pending_hooks.md"), "# Pending Hooks\n", "utf-8"),
      writeFile(join(storyDir, "chapter_summaries.md"), "# Chapter Summaries\n", "utf-8"),
      writeFile(join(storyDir, "subplot_board.md"), "# 支线\n", "utf-8"),
      writeFile(join(storyDir, "emotional_arcs.md"), "# 情感\n", "utf-8"),
      writeFile(join(storyDir, "character_matrix.md"), "# 矩阵\n", "utf-8"),
      writeFile(join(storyDir, "style_guide.md"), "# Style\n", "utf-8"),
    ]);

    const auditor = new ContinuityAuditor({
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
      projectRoot: root,
    });

    const chatSpy = vi.spyOn(ContinuityAuditor.prototype as never, "chat" as never).mockResolvedValue({
      content: JSON.stringify({ passed: true, issues: [], summary: "ok" }),
      usage: ZERO_USAGE,
    });

    const memoBody = [
      "## 当前任务",
      "陆焚在小巷抢回残刃并离开。",
      "",
      "## 读者此刻在等什么",
      "读者想看他怎么脱身。",
      "",
      "## 该兑现的 / 暂不掀的",
      "兑现：残刃归手；暂不掀：身世。",
      "",
      "## 日常/过渡承担什么任务",
      "开篇小巷场景 → 情绪代入 + 信息植入。",
      "",
      "## 关键抉择过三连问",
      "陆焚选择独自动手的理由是什么？",
      "",
      "## 章尾必须发生的改变",
      "陆焚拿回残刃，被人目击。",
      "",
      "## 本章 hook 账",
      "resolve: H11 残刃下落 → 本章找回。defer: H04 幕后主使 → 留到第 50 章。",
      "",
      "## 不要做",
      "不要写成大段打斗。",
    ].join("\n");

    try {
      await auditor.auditChapter(bookDir, "Chapter body.", 42, "xuanhuan", {
        chapterMemo: {
          chapter: 42,
          goal: "陆焚抢回残刃并离开",
          isGoldenOpening: false,
          body: memoBody,
          threadRefs: [],
        },
      });

      const messages = chatSpy.mock.calls[0]?.[0] as
        | ReadonlyArray<{ content: string }>
        | undefined;
      const systemPrompt = messages?.[0]?.content ?? "";
      const userPrompt = messages?.[1]?.content ?? "";

      // Prompt declares structure-only scope and sparse-memo legality.
      expect(systemPrompt).toContain("审稿边界");
      expect(systemPrompt).toContain("你不审文笔");
      expect(systemPrompt).toContain("稀疏 memo 是合法状态");
      expect(systemPrompt).toContain("章节备忘偏离");
      expect(systemPrompt).not.toContain("大纲偏离检测");

      // User prompt injects the memo for drift-checking.
      expect(userPrompt).toContain("## 章节备忘（用于 memo 偏离检测）");
      expect(userPrompt).toContain("goal：陆焚抢回残刃并离开");
      expect(userPrompt).toContain("## 章尾必须发生的改变");
      // Legacy volume-outline block is gone.
      expect(userPrompt).not.toContain("## 卷纲");
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });
});
