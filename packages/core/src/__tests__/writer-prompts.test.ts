import { describe, expect, it } from "vitest";
import type { BookConfig } from "../models/book.js";
import type { GenreProfile } from "../models/genre-profile.js";
import { LengthSpecSchema } from "../models/length-governance.js";
import { buildWriterSystemPrompt, buildGoldenOpeningDiscipline, buildIdentityPerspectiveRules } from "../agents/writer-prompts.js";

const BOOK: BookConfig = {
  id: "prompt-book",
  title: "Prompt Book",
  platform: "tomato",
  genre: "other",
  status: "active",
  targetChapters: 20,
  chapterWordCount: 3000,
  createdAt: "2026-03-22T00:00:00.000Z",
  updatedAt: "2026-03-22T00:00:00.000Z",
};

const GENRE: GenreProfile = {
  id: "other",
  name: "综合",
  language: "zh",
  chapterTypes: ["setup", "conflict"],
  fatigueWords: [],
  numericalSystem: false,
  powerScaling: false,
  eraResearch: false,
  pacingRule: "",
  satisfactionTypes: [],
  auditDimensions: [],
};

describe("buildWriterSystemPrompt", () => {
  it("includes writing methodology blocks in governed mode", () => {
    const prompt = buildWriterSystemPrompt(
      BOOK,
      GENRE,
      null,
      "# Book Rules",
      "# Genre Body",
      "# Style Guide\n\nKeep the prose restrained.",
      undefined,
      3,
      "creative",
      undefined,
      "zh",
      "governed",
    );

    expect(prompt).toContain("## 输入治理契约");
    expect(prompt).toContain("卷纲是默认规划");
    // v10: compact craft card replaces full methodology modules
    expect(prompt).toContain("写作铁律");
    expect(prompt).toContain("盐溶于汤");
    expect(prompt).toContain("黄金3章");
  });

  it("uses target-range wording when a length spec is provided", () => {
    const lengthSpec = LengthSpecSchema.parse({
      target: 2200,
      softMin: 1900,
      softMax: 2500,
      hardMin: 1600,
      hardMax: 2800,
      countingMode: "zh_chars",
      normalizeMode: "none",
    });

    const prompt = buildWriterSystemPrompt(
      BOOK,
      GENRE,
      null,
      "# Book Rules",
      "# Genre Body",
      "# Style Guide\n\nKeep the prose restrained.",
      undefined,
      3,
      "creative",
      undefined,
      "zh",
      "governed",
      lengthSpec,
    );

    expect(prompt).toContain("目标字数：2200");
    expect(prompt).toContain("允许区间：1900-2500");
    expect(prompt).not.toContain("正文不少于2200字");
  });

  it("keeps hard guardrails and book/style constraints in governed mode", () => {
    const prompt = buildWriterSystemPrompt(
      BOOK,
      GENRE,
      null,
      "# Book Rules\n\n- Do not reveal the mastermind.",
      "# Genre Body",
      "# Style Guide\n\nKeep the prose restrained.",
      undefined,
      3,
      "creative",
      undefined,
      "zh",
      "governed",
    );

    expect(prompt).toContain("## 核心规则");
    expect(prompt).toContain("## 硬性禁令");
    expect(prompt).toContain("Do not reveal the mastermind");
    expect(prompt).toContain("Keep the prose restrained");
  });

  it("injects the creative constitution and six pillars of immersion as prose (zh)", () => {
    const prompt = buildWriterSystemPrompt(
      BOOK,
      GENRE,
      null,
      "# Book Rules",
      "# Genre Body",
      "# Style Guide",
      undefined,
      3,
      "creative",
      undefined,
      "zh",
      "governed",
    );

    // Constitution and pillars appear as prose section headings.
    expect(prompt).toContain("## 创作宪法");
    expect(prompt).toContain("## 代入感六支柱");
    // Constitution prose beats — verify a few load-bearing phrases ship.
    expect(prompt).toContain("盐溶于汤");
    expect(prompt).toContain("全员智商在线");
    expect(prompt).toContain("拒绝流水账");
    // Pillar prose beats — ensure six-pillar content is present.
    expect(prompt).toContain("基础信息标签化");
    expect(prompt).toContain("可视化熟悉感");
    expect(prompt).toContain("五感钩子");
    // Must NOT be rendered as a numbered checklist — writer must internalise.
    expect(prompt).not.toContain("1. 基础信息标签化");
    expect(prompt).not.toContain("- 基础信息标签化");
  });

  it("injects the creative constitution and six pillars of immersion as prose (en)", () => {
    const prompt = buildWriterSystemPrompt(
      { ...BOOK, language: "en" },
      { ...GENRE, language: "en", name: "General" },
      null,
      "# Book Rules",
      "# Genre Body",
      "# Style Guide",
      undefined,
      3,
      "creative",
      undefined,
      "en",
      "governed",
    );

    expect(prompt).toContain("## Creative Constitution");
    expect(prompt).toContain("## Six Pillars of Immersion");
    expect(prompt).toContain("salt in soup");
    expect(prompt).toContain("Refuse chronicle drift");
    expect(prompt).toContain("core tag plus one contrasting detail");
  });

  it("injects golden opening discipline into zh writer system prompt for ch<=3", () => {
    for (const ch of [1, 2, 3]) {
      const prompt = buildWriterSystemPrompt(
        BOOK,
        GENRE,
        null,
        "# Book Rules",
        "# Genre Body",
        "# Style Guide",
        undefined,
        ch,
        "creative",
        undefined,
        "zh",
        "governed",
      );
      expect(prompt).toContain("黄金三章写作纪律");
      expect(prompt).toContain(`第 ${ch} 章`);
    }
  });

  it("injects golden opening discipline into en writer system prompt for ch<=3", () => {
    for (const ch of [1, 2, 3]) {
      const prompt = buildWriterSystemPrompt(
        BOOK,
        { ...GENRE, language: "en", name: "General" },
        null,
        "# Book Rules",
        "# Genre Body",
        "# Style Guide",
        undefined,
        ch,
        "creative",
        undefined,
        "en",
        "governed",
      );
      expect(prompt).toContain("Golden Opening Discipline");
      expect(prompt).toContain(`Chapter ${ch}`);
    }
  });

  it("omits golden opening discipline for ch>=4 in both languages", () => {
    const zh = buildWriterSystemPrompt(
      BOOK, GENRE, null, "# Book Rules", "# Genre Body", "# Style Guide",
      undefined, 4, "creative", undefined, "zh", "governed",
    );
    expect(zh).not.toContain("黄金三章写作纪律");

    const en = buildWriterSystemPrompt(
      BOOK, { ...GENRE, language: "en", name: "General" }, null,
      "# Book Rules", "# Genre Body", "# Style Guide",
      undefined, 4, "creative", undefined, "en", "governed",
    );
    expect(en).not.toContain("Golden Opening Discipline");
  });

  it("renders golden opening discipline as cohesive prose, not a checklist", () => {
    const out = buildGoldenOpeningDiscipline(1, "zh");
    // Header line is allowed; body must not contain enumerated/bulleted lines.
    expect(out).not.toMatch(/^\s*1\.\s/m);
    expect(out).not.toMatch(/^\s*-\s/m);
    expect(out).not.toMatch(/^\s*\*\s/m);
    // Carries the load-bearing slot constraints.
    expect(out).toContain("800 字");
    expect(out).toContain("做出来");
    expect(out).toContain("说出来");
    expect(out).toContain("小钩子");
  });

  it("buildGoldenOpeningDiscipline returns empty string for ch>=4 / undefined", () => {
    expect(buildGoldenOpeningDiscipline(4, "zh")).toBe("");
    expect(buildGoldenOpeningDiscipline(99, "en")).toBe("");
    expect(buildGoldenOpeningDiscipline(undefined, "zh")).toBe("");
  });

  it("tells governed English prompts to obey variance briefs and include resistance-bearing exchanges", () => {
    const prompt = buildWriterSystemPrompt(
      {
        ...BOOK,
        language: "en",
      },
      {
        ...GENRE,
        language: "en",
        name: "General",
      },
      null,
      "# Book Rules",
      "# Genre Body",
      "# Style Guide\n\nKeep the prose restrained.",
      undefined,
      3,
      "creative",
      undefined,
      "en",
      "governed",
    );

    expect(prompt).toContain("English Variance Brief");
    expect(prompt).toContain("resistance-bearing exchange");
  });
});

describe("buildIdentityPerspectiveRules", () => {
  it("returns empty when no characterContext", () => {
    expect(buildIdentityPerspectiveRules(undefined)).toBe("");
  });

  it("returns empty when no identity tags", () => {
    expect(buildIdentityPerspectiveRules("云辰，16岁，斗者初期。")).toBe("");
  });

  it("generates transmigration rules for 魂穿", () => {
    const result = buildIdentityPerspectiveRules(
      "云辰前世是某大学体育特长生，魂穿废柴。",
    );
    expect(result).toContain("身份视角守则");
    expect(result).toContain("前世记忆");
    expect(result).toContain("认知冲突");
  });

  it("generates game knowledge rules for LOL reference", () => {
    const result = buildIdentityPerspectiveRules(
      "云辰前世是LOL钻石段位玩家，穿越到异世界。",
    );
    expect(result).toContain("游戏机制");
    expect(result).toContain("内心想法");
  });

  it("generates English rules when language=en", () => {
    const result = buildIdentityPerspectiveRules(
      "Yun Chen transmigrated to another world. Past life: LOL diamond player.",
      "en",
    );
    expect(result).toContain("Identity Perspective");
    expect(result).toContain("past life");
  });

  it("generates rebirth rules for 重生", () => {
    const result = buildIdentityPerspectiveRules(
      "主角重生回到十年前，这一次要改变命运。",
    );
    expect(result).toContain("先知先觉");
    expect(result).toContain("前世经历");
  });
});

describe("Cold-style satisfaction delivery", () => {
  const XIANXIA_GENRE: GenreProfile = {
    ...GENRE,
    satisfactionTypes: ["悟道突破", "绝地反击", "法宝收获", "身份揭示", "因果了结"],
  };

  it("buildSatisfactionGuide includes cold-style adaptation paragraph", () => {
    const prompt = buildWriterSystemPrompt(
      BOOK,
      XIANXIA_GENRE,
      null,
      "# Book Rules",
      "# Genre Body",
      "# Style Guide",
      undefined,
      3,
      "creative",
      undefined,
      "zh",
      "governed",
    );
    expect(prompt).toContain("冷冽风格爽点交付附加指引");
    expect(prompt).toContain("安静→低语→死寂→突然一声");
    expect(prompt).toContain("环境暗示替代直白情绪");
  });

  it("core rules include bystander amplifier and evaluation reversal", () => {
    const prompt = buildWriterSystemPrompt(
      BOOK,
      XIANXIA_GENRE,
      null,
      "# Book Rules",
      "# Genre Body",
      "# Style Guide",
      undefined,
      3,
      "creative",
      undefined,
      "zh",
      "governed",
    );
    expect(prompt).toContain("旁观者反应放大器");
    expect(prompt).toContain("评价逆转模板");
    expect(prompt).toContain("情绪释放节拍");
  });

  it("English prompts include cold-style section", () => {
    const enGenre: GenreProfile = { ...XIANXIA_GENRE, language: "en" };
    const prompt = buildWriterSystemPrompt(
      { ...BOOK, language: "en" },
      enGenre,
      null,
      "# Book Rules",
      "# Genre Body",
      "# Style Guide",
      undefined,
      3,
      "creative",
      undefined,
      "en",
      "governed",
    );
    expect(prompt).toContain("Cold-Restrained Style Adaptation");
    expect(prompt).toContain("silence → whisper → dead quiet");
  });
});
