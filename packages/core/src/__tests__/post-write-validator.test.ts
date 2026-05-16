import { describe, it, expect } from "vitest";
import {
  detectDuplicateTitle,
  detectGenericTitle,
  detectParagraphLengthDrift,
  detectParagraphShapeWarnings,
  resolveDuplicateTitle,
  normalizePostWriteSurface,
  validatePostWrite,
  validateMustKeepCompliance,
  type PostWriteViolation,
} from "../agents/post-write-validator.js";
import type { GenreProfile } from "../models/genre-profile.js";

const baseProfile: GenreProfile = {
  id: "test",
  name: "测试",
  language: "zh",
  chapterTypes: [],
  fatigueWords: [],
  pacingRule: "",
  numericalSystem: false,
  powerScaling: false,
  eraResearch: false,
  auditDimensions: [],
  satisfactionTypes: [],
};

function findRule(violations: ReadonlyArray<PostWriteViolation>, rule: string): PostWriteViolation | undefined {
  return violations.find(v => v.rule === rule);
}

describe("normalizePostWriteSurface - stripInlineMarkdown", () => {
  it("strips **bold** markers but preserves content", () => {
    const content = "林越看着**远处的**灯火，心中五味杂陈。";
    const normalized = normalizePostWriteSurface(content);
    expect(normalized).not.toContain("**");
    expect(normalized).toContain("远处的");
  });

  it("strips __underline__ markers", () => {
    const content = "__关键证据__浮出水面。";
    const normalized = normalizePostWriteSurface(content);
    expect(normalized).not.toContain("__");
    expect(normalized).toContain("关键证据");
  });

  it("does NOT strip single * markers (too aggressive for Chinese fiction)", () => {
    const content = "他*轻声*说道。";
    const normalized = normalizePostWriteSurface(content);
    expect(normalized).toContain("*轻声*");
  });
});

describe("normalizePostWriteSurface - stripFullLineItalic", () => {
  it("strips full-line italic markers from POV-shift sections", () => {
    const content = [
      "他转身离开。",
      "",
      "*不远处的三长老站在书房窗前，看着心腹传回来的消息。*",
      "*\"陈渊回了破院，喝了半碗粥，坐到院墙下发呆。\"*",
      "*三长老把纸条扔进炭盆，看着它烧成灰烬。*",
    ].join("\n");
    const normalized = normalizePostWriteSurface(content);
    expect(normalized).not.toContain("*不");
    expect(normalized).not.toContain("发呆。*");
    expect(normalized).toContain("不远处的三长老站在书房窗前");
    expect(normalized).toContain("三长老把纸条扔进炭盆");
  });

  it("does NOT strip inline * within longer lines", () => {
    const content = "他*轻声*说道，然后转身离开。";
    const normalized = normalizePostWriteSurface(content);
    expect(normalized).toContain("*轻声*");
  });

  it("handles multiple consecutive full-line italic lines", () => {
    const content = [
      "*窗外起了风，吹得树枝沙沙作响。*",
      "*没有人回答。*",
      "*他念着这个名字，念得很轻。*",
    ].join("\n");
    const normalized = normalizePostWriteSurface(content);
    expect(normalized).not.toContain("*窗");
    expect(normalized).not.toContain("作响。*");
    expect(normalized).toContain("窗外起了风");
    expect(normalized).toContain("没有人回答。");
  });

  it("preserves lines with only one asterisk (not full-line italic)", () => {
    const content = "这是正文。\n* 这是一行列表项\n继续正文。";
    const normalized = normalizePostWriteSurface(content);
    expect(normalized).toContain("* 这是一行列表项");
  });
});

describe("normalizePostWriteSurface - quotation marks", () => {
  it("converts corner brackets to Chinese double quotes", () => {
    const content = "「你好。」他说道。";
    const normalized = normalizePostWriteSurface(content);
    expect(normalized).toBe("\u201c你好。\u201d他说道。");
    expect(normalized).not.toContain("「");
    expect(normalized).not.toContain("」");
  });

  it("converts mixed corner brackets and curly quotes to all curly quotes", () => {
    const content = "「带毒上场，是想碰瓷我陈家吗？」\n\n他听见有人低声说了一句\u201c可惜了\u201d。";
    const normalized = normalizePostWriteSurface(content);
    expect(normalized).not.toContain("「");
    expect(normalized).not.toContain("」");
    expect(normalized).toContain("\u201c带毒上场");
    expect(normalized).toContain("可惜了\u201d");
  });

  it("does NOT convert corner brackets when language is en", () => {
    const content = "「Hello,」 he said.";
    const normalized = normalizePostWriteSurface(content, "en");
    expect(normalized).toContain("「");
    expect(normalized).toContain("」");
  });

  it("converts em-dash to comma for zh content", () => {
    const content = "他走进来——然后转身离开。";
    const normalized = normalizePostWriteSurface(content, "zh");
    expect(normalized).not.toContain("——");
    expect(normalized).toContain("，");
  });
});

describe("detectGenericTitle", () => {
  it("returns warning for empty title", () => {
    const violations = detectGenericTitle("", 1);
    expect(violations).toHaveLength(1);
    expect(violations[0]!.severity).toBe("warning");
    expect(violations[0]!.rule).toBe("空标题");
  });

  it("returns warning for generic Chinese title", () => {
    const violations = detectGenericTitle("第23章", 23);
    expect(violations).toHaveLength(1);
    expect(violations[0]!.rule).toBe("默认标题");
  });

  it("returns warning for generic Chinese title with whitespace", () => {
    const violations = detectGenericTitle("  第 32 章  ", 32);
    expect(violations).toHaveLength(1);
  });

  it("returns empty array for meaningful Chinese title", () => {
    expect(detectGenericTitle("暗缝", 23)).toHaveLength(0);
  });

  it("does not flag title with subtitle after chapter number", () => {
    expect(detectGenericTitle("第32章 暗缝", 32)).toHaveLength(0);
  });

  it("returns warning for generic English title", () => {
    const violations = detectGenericTitle("Chapter 5", 5, "en");
    expect(violations).toHaveLength(1);
    expect(violations[0]!.rule).toBe("generic-title");
  });

  it("returns empty array for meaningful English title", () => {
    expect(detectGenericTitle("The Descent", 5, "en")).toHaveLength(0);
  });

  it("uses zh rules by default", () => {
    const violations = detectGenericTitle("第1章", 1);
    expect(violations[0]!.rule).toBe("默认标题");
  });
});

describe("validatePostWrite", () => {
  it("strips model-side post-write note lines before persistence", () => {
    const content = [
      "他把U盘攥进手心，回头看了一眼档案室的黑窗。",
      "",
      "[polisher-note] 无。",
      "[writer-note] 这里需要后续补伏笔。",
    ].join("\n");

    const normalized = normalizePostWriteSurface(content);

    expect(normalized).toBe("他把U盘攥进手心，回头看了一眼档案室的黑窗。");
  });

  it("strips <think> blocks from LLM thinking leakage", () => {
    const content = [
      "# 第5章 寒潭底（续）",
      "",
      "<think>",
      "用户要求我作为章节长度修正器，将当前章节压缩到3000字左右。",
      "当前字数：4712字",
      "目标字数：3000字",
      "</think>",
      "",
      "天黑了，又亮了。",
      "陈渊第三次从剑冢里退出来时，窗外的天色已经从鱼肚白转成了淡金色。",
    ].join("\n");

    const normalized = normalizePostWriteSurface(content);

    expect(normalized).toContain("天黑了，又亮了。");
    expect(normalized).toContain("陈渊第三次");
    expect(normalized).not.toContain("<think>");
    expect(normalized).not.toContain("章节长度修正器");
  });

  it("returns no violations for clean content", () => {
    const content = "他走过去，端起杯子，灌了一口。外面的雨越下越大。\n\n她站在窗前，看着街上的行人匆匆走过。";
    const result = validatePostWrite(content, baseProfile, null);
    expect(result).toHaveLength(0);
  });

  it("detects '不是…而是…' pattern", () => {
    const content = "这不是勇气，而是愚蠢。他知道这一点。";
    const result = validatePostWrite(content, baseProfile, null);
    expect(findRule(result, "禁止句式")).toBeDefined();
    expect(findRule(result, "禁止句式")!.severity).toBe("error");
  });

  it("detects dash '——'", () => {
    const content = "他走了过去——然后停下来。";
    const result = validatePostWrite(content, baseProfile, null);
    expect(findRule(result, "禁止破折号")).toBeDefined();
    expect(findRule(result, "禁止破折号")!.severity).toBe("error");
  });

  it("skips Chinese-only rules when the book language override is English", () => {
    const content = "He stepped forward——then stopped at the door.";
    const validateWithLanguage = validatePostWrite as (
      content: string,
      genreProfile: GenreProfile,
      bookRules: null,
      languageOverride?: "zh" | "en",
    ) => ReadonlyArray<PostWriteViolation>;

    const result = validateWithLanguage(content, baseProfile, null, "en");

    expect(findRule(result, "禁止破折号")).toBeUndefined();
  });

  it("detects surprise marker density exceeding threshold", () => {
    // ~100 chars total, threshold = max(1, floor(100/3000)) = 1, but we put 3 markers
    const content = "他忽然站起来。仿佛听到了什么声音。竟然是那个人回来了。";
    const result = validatePostWrite(content, baseProfile, null);
    expect(findRule(result, "转折词密度")).toBeDefined();
  });

  it("allows markers within threshold", () => {
    // 3000+ chars with only 1 marker
    const filler = "这是一段很长的正文内容，描述了角色的行动和场景的变化。".repeat(60);
    const content = `${filler}他忽然站起来。${filler}`;
    const result = validatePostWrite(content, baseProfile, null);
    expect(findRule(result, "转折词密度")).toBeUndefined();
  });

  it("detects fatigue words from genre profile", () => {
    const profile = { ...baseProfile, fatigueWords: ["一道目光"] };
    const content = "一道目光扫过来，又一道目光从侧面射来，第三道目光也来了。";
    const result = validatePostWrite(content, profile, null);
    expect(findRule(result, "高疲劳词")).toBeDefined();
  });

  it("detects meta-narration patterns", () => {
    const content = "故事发展到了这里，主角终于做出了选择。他站起来走向门口。";
    const result = validatePostWrite(content, baseProfile, null);
    expect(findRule(result, "元叙事")).toBeDefined();
  });

  it("detects report-style terms in prose", () => {
    const content = "他的核心动机其实很简单，就是想活下去。信息边界在此刻变得模糊。";
    const result = validatePostWrite(content, baseProfile, null);
    const v = findRule(result, "报告术语");
    expect(v).toBeDefined();
    expect(v!.severity).toBe("error");
    expect(v!.description).toContain("核心动机");
    expect(v!.description).toContain("信息边界");
  });

  it("detects sermon words", () => {
    const content = "显然，对方低估了他的实力。毋庸置疑，这将是一场硬仗。";
    const result = validatePostWrite(content, baseProfile, null);
    const v = findRule(result, "作者说教");
    expect(v).toBeDefined();
    expect(v!.description).toContain("显然");
    expect(v!.description).toContain("毋庸置疑");
  });

  it("detects collective shock patterns", () => {
    const content = "众人齐齐震惊，没有人想到他居然能赢。";
    const result = validatePostWrite(content, baseProfile, null);
    expect(findRule(result, "集体反应")).toBeDefined();
  });

  it("detects consecutive '了' sentences", () => {
    const content = "他走了过去。他拿了杯子。他喝了一口。他放了下来。他转了身。他叹了口气。他摇了摇头。";
    const result = validatePostWrite(content, baseProfile, null);
    const v = findRule(result, "连续了字");
    expect(v).toBeDefined();
    expect(v!.severity).toBe("warning");
  });

  it("detects overly long paragraphs", () => {
    const longPara = "这是一段非常长的段落。".repeat(30); // ~300+ chars
    const content = `${longPara}\n\n${longPara}\n\n短段落。`;
    const result = validatePostWrite(content, baseProfile, null);
    expect(findRule(result, "段落过长")).toBeDefined();
  });

  it("detects fragmented short paragraphs in Chinese prose", () => {
    const content = [
      "门开了。",
      "他没进去。",
      "先听了一下。",
      "里面没有声响。",
      "他才把手按上去。",
      "冷意顺着门缝钻出来。",
    ].join("\n\n");

    const result = validatePostWrite(content, baseProfile, null);
    expect(findRule(result, "段落过碎")).toBeDefined();
    expect(findRule(result, "段落过碎")?.severity).toBe("warning");
  });

  it("detects runs of consecutive short paragraphs", () => {
    const content = [
      "他绕过柜台，把灯挪到门边，先看了一眼地上的水印，确认脚印是新的。",
      "门虚掩着。",
      "风从外面钻进来。",
      "他没有立刻追出去。",
      "他先低头，看见门槛上沾了一点灰黑色的泥。",
    ].join("\n\n");

    const result = validatePostWrite(content, baseProfile, null);
    expect(findRule(result, "连续短段")).toBeDefined();
    expect(findRule(result, "连续短段")?.severity).toBe("warning");
  });

  it("detects book-level prohibitions", () => {
    const bookRules = {
      version: "1",
      protagonist: { name: "张三", personalityLock: [], behavioralConstraints: [] },
      prohibitions: ["跪舔"],
      genreLock: { primary: "xuanhuan" as const, forbidden: [] },
      chapterTypesOverride: [],
      fatigueWordsOverride: [],
      additionalAuditDimensions: [],
      enableFullCastTracking: false,
      allowedDeviations: [],
    };
    const content = "他一脸跪舔的样子让人恶心。";
    const result = validatePostWrite(content, baseProfile, bookRules);
    expect(findRule(result, "本书禁忌")).toBeDefined();
  });

  it("does not flag allowed content", () => {
    // Content that is clean across all rules
    const content = `他站起来，环顾四周。窗外的月光洒在地板上，像一层薄薄的霜。\n\n\u201c走吧。\u201d她转身推开门。冷风从缝隙里钻进来，她裹紧了衣服。`;
    const result = validatePostWrite(content, baseProfile, null);
    expect(result).toHaveLength(0);
  });

  it("warns when an English multi-character scene has almost no direct exchange", () => {
    const content = [
      "Mara cornered Taryn in the archive and kept the ledger between them.",
      "Mara demanded a clear answer about the missing page while Taryn refused to meet her eyes.",
      "Taryn stepped back toward the window and Mara followed without letting the pressure break.",
    ].join(" ");

    const result = validatePostWrite(content, baseProfile, null, "en");
    expect(findRule(result, "Dialogue pressure")).toBeDefined();
    expect(findRule(result, "Dialogue pressure")?.severity).toBe("warning");
  });

  it("detects paragraph density drift against recent chapters", () => {
    const recent = [
      "他把伞挂在门边，又低头看了一眼鞋底带进来的泥。柜台后的热水壶正轻轻作响，白气沿着玻璃慢慢爬上去。林越没有急着开口，只先把屋里的灯都扫了一遍，确认少了一盏。",
      "",
      "姜敏把账本推过来时，手指还压在封皮边上，没有立刻松开。她先问他是不是又去找过旧港的人，然后才把下午听到的消息一点点拆开说，连谁在门口停过脚都没漏掉。",
      "",
      "---",
      "",
      "他靠着墙站了半分钟，才把那张折过三次的纸重新摊开。纸上的字不多，但每一行都像故意留了半截，逼着他把前后几天听到的话重新拼回去。",
      "",
      "外面的雨势已经压下来，棚顶被打得一阵紧一阵。林越没有马上下楼，而是先把窗推开一条缝，让冷风吹进来，把刚才在屋里积住的闷气慢慢散掉。",
    ].join("\n\n");
    const current = [
      "他停下。",
      "先看门。",
      "又看窗。",
      "没人说话。",
      "他这才进去。",
      "屋里很冷。",
    ].join("\n\n");

    const result = detectParagraphLengthDrift(current, recent, "zh");
    expect(findRule(result, "段落密度漂移")).toBeDefined();
    expect(findRule(result, "段落密度漂移")?.severity).toBe("warning");
  });

  it("exposes paragraph shape warnings for final-stage reuse", () => {
    const current = [
      "他停下。",
      "先看门。",
      "又看窗。",
      "没人说话。",
      "他这才进去。",
      "屋里很冷。",
    ].join("\n\n");

    const result = detectParagraphShapeWarnings(current, "zh");
    expect(findRule(result, "段落过碎")).toBeDefined();
    expect(findRule(result, "连续短段")).toBeDefined();
  });

  it("detects duplicate chapter titles", () => {
    const result = detectDuplicateTitle("回声", ["旧路", "回声"]);
    expect(findRule(result, "duplicate-title")).toBeDefined();
  });

  it("detects near-duplicate chapter titles", () => {
    const result = detectDuplicateTitle("Echo-2", ["Echo 2"]);
    expect(findRule(result, "near-duplicate-title")).toBeDefined();
  });

  it("prefers regenerating a duplicate title from chapter content before numeric suffix fallback", () => {
    const result = resolveDuplicateTitle(
      "回声",
      ["旧路", "回声"],
      "zh",
      {
        content: "塔楼里的铜铃只响了一声，风从缺口灌进来，守夜人没有回头。",
      },
    );

    expect(result.title).toContain("塔楼");
    expect(result.title).not.toBe("回声（2）");
  });

  it("regenerates a title when it continues a collapsed recent title shell", () => {
    const result = resolveDuplicateTitle(
      "名单未落",
      ["名单之前", "名单之后", "名单还在"],
      "zh",
      {
        content: "塔楼里的铜铃只响了一声，守夜人没有回头，风从缺口灌进来。",
      },
    );

    expect(result.issues.some((issue) => issue.rule === "title-collapse")).toBe(true);
    expect(result.title).not.toContain("名单");
    expect(result.title).toContain("塔楼");
  });
});

describe("章节结尾类型检查", () => {
  function findEnding(violations: ReadonlyArray<PostWriteViolation>) {
    return violations.find(v => v.rule === "内心独白结尾");
  }

  it("✓ 对话结尾是好的", () => {
    const content = `他走过去，敲了敲门。\n\n门外传来一个低沉的声音："进来吧。"`;
    const result = validatePostWrite(content, baseProfile, null);
    expect(findEnding(result)).toBeUndefined();
  });

  it("✓ 外部场景描写结尾是好的", () => {
    const content = `他走出门，雨已经小了。\n\n远处，青云门的灯火彻夜未熄。`;
    const result = validatePostWrite(content, baseProfile, null);
    expect(findEnding(result)).toBeUndefined();
  });

  it("✓ 未来承诺结尾是好的（三天后+具体事件）", () => {
    const content = `他转身离去，背影消失在夜色中。\n\n三天后，枯井边见分晓。`;
    const result = validatePostWrite(content, baseProfile, null);
    expect(findEnding(result)).toBeUndefined();
  });

  it("✗ 主角内心盘算结尾是违规", () => {
    const content = `他躺在床上，闭上眼睛。\n\n他想，明天得想个办法把这件事解决了。`;
    const result = validatePostWrite(content, baseProfile, null);
    expect(findEnding(result)?.severity).toBe("error");
  });

  it("✗ 反思式结尾是违规（这就是...的...）", () => {
    const content = "他望着窗外的夜色。\n\n这就是他一直追寻的意义。";
    const result = validatePostWrite(content, baseProfile, null);
    expect(findEnding(result)?.severity).toBe("error");
  });

  it("✗ 计划式结尾无外部事件是违规", () => {
    const content = `他站起身，拍了拍衣服上的土。\n\n明天要去找那个猎人问清楚情况。`;
    const result = validatePostWrite(content, baseProfile, null);
    expect(findEnding(result)?.severity).toBe("error");
  });

  it("✗ 多主观词结尾无外部事件是违规", () => {
    const content = `门关上了，夜色吞没了最后一点光。\n\n也许，这就是命吧。大概如此。`;
    const result = validatePostWrite(content, baseProfile, null);
    expect(findEnding(result)?.severity).toBe("error");
  });
});

describe("validateMustKeepCompliance", () => {
  it("returns empty for empty inputs", () => {
    expect(validateMustKeepCompliance("", [])).toEqual([]);
    expect(validateMustKeepCompliance("content", [])).toEqual([]);
    expect(validateMustKeepCompliance("short", ["林越父亲已死"])).toEqual([]);
  });

  it("passes when mustKeep item is directly present", () => {
    const content = "林越站在旧港码头上，想起父亲已死的事实，心中五味杂陈。".repeat(5);
    const violations = validateMustKeepCompliance(content, ["林越父亲已死"]);
    expect(violations).toHaveLength(0);
  });

  it("passes when ≥2/3 key terms are present", () => {
    const content = "林越拿起母亲遗留的账册，翻开了尘封多年的记录开始仔细查看。".repeat(3);
    // "母亲遗物" → bigrams: 母亲, 亲遗, 遗物 (3 terms, threshold=2)
    // "母亲" and "亲遗" both appear in "母亲遗留"
    const violations = validateMustKeepCompliance(content, ["母亲遗物"]);
    expect(violations).toHaveLength(0);
  });

  it("warns when fewer than 2/3 key terms are present", () => {
    const content = "他走在大街上，看到一个陌生人从对面走过来打了个招呼。".repeat(3);
    const violations = validateMustKeepCompliance(content, ["林越父亲已死"]);
    expect(violations.length).toBeGreaterThanOrEqual(1);
    expect(violations[0]!.severity).toBe("warning");
    expect(violations[0]!.description).toContain("林越父亲已死");
  });

  it("handles multiple mustKeep items independently", () => {
    const content = "林越拿起母亲遗留的旧账册，想起父亲已死多年不禁叹息感慨万千。".repeat(3);
    const violations = validateMustKeepCompliance(content, [
      "林越父亲已死",
      "母亲遗物",
    ]);
    // Both items should have their key terms well-represented
    expect(violations.length).toBeLessThanOrEqual(1);
  });

  it("respects 50-char truncation on items", () => {
    const longItem = "这是一个非常长的mustKeep约束项，超过了五十个字符的限制，应该被截断处理才行啊真的太长了这真的是太长了吧应该够了";
    const content = "一个非常长的约束项超过了五十个字符的限制应该被截断处理才行啊真的太长了这真的是太长了吧应该够了已经截断完毕了足够了。".repeat(3);
    const violations = validateMustKeepCompliance(content, [longItem]);
    // Should not crash; result depends on truncated content matching
    expect(Array.isArray(violations)).toBe(true);
  });

  it("returns empty for English content with matching terms", () => {
    const content = "The protagonist discovered that his father was dead and the family heirloom was missing from the old chest.".repeat(3);
    const violations = validateMustKeepCompliance(content, ["father was dead"], "en");
    expect(violations).toHaveLength(0);
  });
});
