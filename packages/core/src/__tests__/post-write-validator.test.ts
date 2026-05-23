import { describe, it, expect } from "vitest";
import {
  detectCrossChapterSimile,
  detectExcessiveMonologue,
  detectDuplicateTitle,
  detectGenericTitle,
  splitSentences,
  detectNarrativeBeatRepetition,
  detectParagraphLengthDrift,
  detectParagraphShapeWarnings,
  detectSimileOveruse,
  detectTemporalHomogeneity,
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

  it("returns warning for single-character Chinese title", () => {
    const violations = detectGenericTitle("静", 28);
    expect(violations).toHaveLength(1);
    expect(violations[0]!.rule).toBe("短标题");
    expect(violations[0]!.severity).toBe("warning");
  });

  it("does not flag two-character Chinese title", () => {
    expect(detectGenericTitle("归剑", 9)).toHaveLength(0);
  });

  it("returns warning for single-word English title", () => {
    const violations = detectGenericTitle("Silence", 5, "en");
    expect(violations).toHaveLength(1);
    expect(violations[0]!.rule).toBe("short-title");
  });

  it("does not flag multi-word English title", () => {
    expect(detectGenericTitle("The Descent", 5, "en")).toHaveLength(0);
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
    expect(findRule(result, "禁止句式")!.severity).toBe("warning");
  });

  it("detects dash '——'", () => {
    const content = "他走了过去——然后停下来。";
    const result = validatePostWrite(content, baseProfile, null);
    expect(findRule(result, "禁止破折号")).toBeDefined();
    expect(findRule(result, "禁止破折号")!.severity).toBe("error");
  });

  it("detects English dialogue sentences in Chinese text", () => {
    const content = '疤脸开口了。"Demonstrate your ability. Show me what you can see."空气忽然静了一拍。';
    const result = validatePostWrite(content, baseProfile, null);
    const rule = findRule(result, "英文句子");
    expect(rule).toBeDefined();
    expect(rule!.severity).toBe("error");
  });

  it("does not flag short English words/names in Chinese text", () => {
    const content = '他打开了iPhone，看了一眼GPS定位。';
    const result = validatePostWrite(content, baseProfile, null);
    expect(findRule(result, "英文句子")).toBeUndefined();
  });

  it("detects English in Chinese quotes 「」", () => {
    const content = '考官说「Hello everyone, welcome to the test」然后转身离开。';
    const result = validatePostWrite(content, baseProfile, null);
    expect(findRule(result, "英文句子")).toBeDefined();
  });

  it("skips English detection for English books", () => {
    const content = '"Demonstrate your ability," the examiner said.';
    const result = validatePostWrite(content, { ...baseProfile, language: "en" }, null);
    expect(findRule(result, "英文句子")).toBeUndefined();
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

describe("章节结尾质量检查", () => {
  function findEnding(violations: ReadonlyArray<PostWriteViolation>) {
    return violations.find(v => v.rule === "弱章尾");
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

  it("✓ 动作结尾是好的", () => {
    const content = `他站起来。\n\n他把断剑柄插进泥里，转身走了。`;
    const result = validatePostWrite(content, baseProfile, null);
    expect(findEnding(result)).toBeUndefined();
  });

  it("✓ 微动作结尾是好的（叹气）", () => {
    const content = `他看着窗外。\n\n他叹了口气。`;
    const result = validatePostWrite(content, baseProfile, null);
    expect(findEnding(result)).toBeUndefined();
  });

  it("✗ 纯心理活动结尾是违规", () => {
    const content = `他躺在床上。\n\n他想活下去。他必须活下去。`;
    const result = validatePostWrite(content, baseProfile, null);
    expect(findEnding(result)?.severity).toBe("error");
  });

  it("✗ 反思式结尾是违规（这就是...的...）", () => {
    const content = "他望着窗外的夜色。\n\n这就是他一直追寻的意义。";
    const result = validatePostWrite(content, baseProfile, null);
    expect(findEnding(result)?.severity).toBe("error");
  });

  it("✗ 情绪声明结尾是违规", () => {
    const content = `他站起来。\n\n可他不怕了。`;
    const result = validatePostWrite(content, baseProfile, null);
    expect(findEnding(result)?.severity).toBe("error");
  });

  it("✗ 氛围式结尾是违规", () => {
    const content = `他走出门。\n\n夜还很长。`;
    const result = validatePostWrite(content, baseProfile, null);
    expect(findEnding(result)?.severity).toBe("error");
  });

  it("✗ 模糊预告结尾是违规", () => {
    const content = `他看着远方。\n\n这一次，是真正的证明。`;
    const result = validatePostWrite(content, baseProfile, null);
    expect(findEnding(result)?.severity).toBe("error");
  });

  it("✗ 有时间词但无承诺词是违规（三天。）", () => {
    const content = `他走出门。\n\n三天。`;
    const result = validatePostWrite(content, baseProfile, null);
    expect(findEnding(result)?.severity).toBe("error");
  });

  it("✓ 短但有外部锚点的结尾是好的", () => {
    const content = `他走过去。\n\n门响了。`;
    const result = validatePostWrite(content, baseProfile, null);
    expect(findEnding(result)).toBeUndefined();
  });

  it("短章节（<2 段）不报错", () => {
    const content = `只有这一段。`;
    const result = validatePostWrite(content, baseProfile, null);
    expect(findEnding(result)).toBeUndefined();
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

// Helper: generate padding text (~N chars) without similes or banned patterns
function padding(n: number): string {
  const base = "他走在青石铺就的长街上，脚步不紧不慢，两侧的店铺已经关了门板，只剩几盏灯笼挂在檐下，映出一圈昏黄的光晕。";
  return base.repeat(Math.ceil(n / base.length)).slice(0, n);
}

describe("不是而是 density", () => {
  it("warns (not errors) for a single 不是而是 instance", () => {
    const content = `他不是害怕，而是愤怒。${padding(2000)}`;
    const result = validatePostWrite(content, baseProfile, null);
    const v = findRule(result, "禁止句式");
    expect(v).toBeDefined();
    expect(v!.severity).toBe("warning");
  });

  it("errors for 2+ 不是而是 instances", () => {
    const content = `他不是害怕，而是愤怒。这不是普通的剑，而是一柄杀过人的剑。${padding(2000)}`;
    const result = validatePostWrite(content, baseProfile, null);
    const v = findRule(result, "禁止句式");
    expect(v).toBeDefined();
    expect(v!.severity).toBe("error");
  });

  it("detects 不是A，是B variant", () => {
    const content = `他不是害怕，是愤怒。${padding(2000)}`;
    const result = validatePostWrite(content, baseProfile, null);
    const v = findRule(result, "禁止句式");
    expect(v).toBeDefined();
  });
});

describe("detectSimileOveruse", () => {
  it("warns when simile density exceeds 3/千字", () => {
    // 8 similes in ~1300 chars → density > 6/千字, well above threshold
    const similes = [
      "他的目光像刀子一样锋利。",
      "她的话像冰水浇在头上。",
      "他的心像被什么揪住了一样。",
      "空气像凝固了一般。",
      "远处的灯火像鬼火般摇曳。",
      "他的背影像一座孤峰。",
      "夜色像墨汁一样浓稠。",
      "她的笑容像春天的花一样灿烂。",
    ].join("");
    const content = similes + padding(1000);
    const result = detectSimileOveruse(content);
    expect(result.length).toBeGreaterThanOrEqual(1);
    expect(result[0]!.rule).toBe("明喻密度过高");
  });

  it("passes when simile density is under threshold", () => {
    const content = `他的目光像刀子一样锋利。${padding(2000)}`;
    const result = detectSimileOveruse(content);
    expect(result).toHaveLength(0);
  });

  it("does not trigger on speculative 像 usage", () => {
    const content = "像是想起了什么，他停下了脚步。像是想起了往事，她叹了口气。像是想起了什么重要的事，他猛地回头。" + padding(1500);
    const result = detectSimileOveruse(content);
    expect(result).toHaveLength(0);
  });

  it("does not trigger on speculative 好像 usage", () => {
    const content = "好像有人来了。好像有人在叫他。好像有人在门外。" + padding(1500);
    const result = detectSimileOveruse(content);
    expect(result).toHaveLength(0);
  });
});

describe("detectCrossChapterSimile", () => {
  it("warns when current chapter repeats a simile from recent chapters", () => {
    // Both have "像是一件易碎的东西要…" → 8-char fingerprint "一件易碎的东西要" matches
    const current = "他的眼神像是一件易碎的东西要轻拿轻放。" + padding(500);
    const recent = "她看着那物件，像是一件易碎的东西要看护好。" + padding(500);
    const result = detectCrossChapterSimile(current, recent);
    expect(result.length).toBeGreaterThanOrEqual(1);
    expect(result[0]!.rule).toBe("跨章比喻重复");
  });

  it("passes when similes are different", () => {
    const current = "他的目光像刀子一样锋利，让人不敢直视。" + padding(500);
    const recent = "她的心像一潭死水，照不出任何情绪。" + padding(500);
    const result = detectCrossChapterSimile(current, recent);
    expect(result).toHaveLength(0);
  });

  it("does not trigger on speculative usage across chapters", () => {
    const current = "像是想起了什么，他停下了脚步。" + padding(500);
    const recent = "像是想起了往事，她叹了口气。" + padding(500);
    const result = detectCrossChapterSimile(current, recent);
    expect(result).toHaveLength(0);
  });

  it("returns empty for short recent content", () => {
    const current = "像一件易碎的东西。" + padding(500);
    const result = detectCrossChapterSimile(current, "短");
    expect(result).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// detectTemporalHomogeneity
// ---------------------------------------------------------------------------

function makeChapter(ending: string, opening: string, bodyLen = 500): string {
  const body = padding(bodyLen);
  return `# 第N章 标题\n\n${opening}\n\n${body}\n\n${ending}`;
}

describe("detectTemporalHomogeneity", () => {
  it("warns when all 3 recent chapters end at night (zh)", () => {
    const ch1 = makeChapter("月光透过窗帘洒在地上，夜色沉沉。", "清晨的阳光照进房间。");
    const ch2 = makeChapter("夜深了，他关灯躺下，黑暗中只有呼吸声。", "天亮了，新的一天开始了。");
    const ch3 = makeChapter("子时已过，万籁俱寂，只有远处传来几声犬吠。", "晨光透过窗户照进来。");
    const recent = `${ch1}\n\n${ch2}`;
    const result = detectTemporalHomogeneity(ch3, recent, "zh");
    const nightWarning = result.find((v) => v.rule === "时间节奏同质化" && v.description.includes("夜晚收尾"));
    expect(nightWarning).toBeDefined();
    expect(nightWarning!.severity).toBe("warning");
  });

  it("warns when all 3 recent chapters open at morning (zh)", () => {
    const ch1 = makeChapter("他转身离去。", "清晨的阳光洒在院子里，露水还没干。");
    const ch2 = makeChapter("战斗结束了。", "天亮了，鸡鸣声此起彼伏。");
    const ch3 = makeChapter("他握紧了拳头。", "晨光透过窗户，新的一天开始了。");
    const recent = `${ch1}\n\n${ch2}`;
    const result = detectTemporalHomogeneity(ch3, recent, "zh");
    const morningWarning = result.find((v) => v.rule === "时间节奏同质化" && v.description.includes("清晨"));
    expect(morningWarning).toBeDefined();
  });

  it("passes when time anchors are varied", () => {
    const ch1 = makeChapter("月光洒在地上，夜色沉沉。", "清晨的阳光照进房间。");
    const ch2 = makeChapter("午后阳光正好，院子里一片安静。", "下午三点，训练馆里热火朝天。");
    const ch3 = makeChapter("黄昏时分，天边染上了橘红色。", "正午时分，太阳毒辣辣地照着。");
    const recent = `${ch1}\n\n${ch2}`;
    const result = detectTemporalHomogeneity(ch3, recent, "zh");
    expect(result).toHaveLength(0);
  });

  it("returns empty for fewer than 3 chapters", () => {
    const ch1 = makeChapter("月光洒在地上。", "清晨天亮了。");
    const result = detectTemporalHomogeneity(ch1, "", "zh");
    expect(result).toHaveLength(0);
  });

  it("detects night endings in English", () => {
    const ch1 = makeChapter("The moonlight fell across the floor as darkness settled in.", "Morning came with the first light of dawn.");
    const ch2 = makeChapter("He lay in bed, staring at the ceiling in the pitch dark midnight.", "She woke at sunrise, ready for the day.");
    const ch3 = makeChapter("The stars shone above as the night deepened around them.", "Dawn broke over the mountains.");
    const recent = `${ch1}\n\n${ch2}`;
    const result = detectTemporalHomogeneity(ch3, recent, "en");
    const nightWarning = result.find((v) => v.rule === "Temporal homogeneity" && v.description.includes("night"));
    expect(nightWarning).toBeDefined();
  });
});

// --- detectNarrativeBeatRepetition ---

describe("detectNarrativeBeatRepetition", () => {
  // Helper: generate unique paragraphs with distinct content per index
  const filler = (n: number, seed: string): string[] =>
    Array.from({ length: n }, (_, i) => {
      const unique = `${seed}第${i + 1}节，这是第${i + 1}段独有的内容，${seed}场景推进中。`;
      return unique;
    });
  const makeContent = (refParas: string[], checkParas: string[]): string =>
    [...refParas, ...checkParas].join("\n\n");

  it("returns empty for language=en", () => {
    const content = makeContent(filler(5, "英文"), filler(4, "英文"));
    expect(detectNarrativeBeatRepetition(content, "en")).toHaveLength(0);
  });

  it("returns empty for short chapters (< 8 non-dialogue paragraphs)", () => {
    const content = makeContent(filler(3, "短章"), filler(3, "短章"));
    expect(detectNarrativeBeatRepetition(content, "zh")).toHaveLength(0);
  });

  // --- Rule A ---
  it("Rule A: detects paragraph-level restatement (bigram Jaccard > 0.4)", () => {
    const ref = filler(6, "前文");
    // Near-duplicate of ref[0] — same structure and most characters
    const dup = "前文第1节，这是第1段独有的内容，前文场景推进中。";
    const check = [dup, ...filler(3, "章末")];
    const result = detectNarrativeBeatRepetition(makeContent(ref, check), "zh");
    expect(findRule(result, "章内段落重述")).toBeDefined();
  });

  it("Rule A: passes when check paragraphs are distinct from reference", () => {
    // Use completely different character sets to avoid accidental bigram overlap
    const ref = filler(6, "东南西北春夏秋冬");
    const check = [
      "山河湖海日月星辰风云变幻大地苍茫。",
      "虎豹豺狼鹰隼翱翔深林密谷溪流潺潺。",
      "刀枪剑戟斧钺钩叉十八般武艺样样精通。",
      "琴棋书画诗词歌赋风花雪月雅韵悠长。",
    ];
    const result = detectNarrativeBeatRepetition(makeContent(ref, check), "zh");
    expect(findRule(result, "章内段落重述")).toBeUndefined();
  });

  // --- Rule B ---
  it("Rule B: detects noun-phrase amplification (density ratio ≥ 2x)", () => {
    const ref = [
      ...filler(5, "正常段落"),
      "他的冻伤的手指已经裂开了血口，疼痛从指尖蔓延到手腕。",
    ];
    const check = [
      "他低头看着冻伤的手指，血口还在渗血。",
      "冻伤的手指僵硬地握着碗边，疼痛让他皱起了眉头。",
      "那双冻伤的手指在寒风中微微发抖，血口已经被冻住了。",
      ...filler(2, "章末其他"),
    ];
    const result = detectNarrativeBeatRepetition(makeContent(ref, check), "zh");
    expect(findRule(result, "章内短语重复")).toBeDefined();
  });

  it("Rule B: passes when character names are uniformly distributed", () => {
    // Each paragraph is unique but mentions "陈渊" — uniform density, no amplification
    const ref = [
      "陈渊站在院子里，看着远方的山脉，心中若有所思。",
      "陈渊走进灶房，点燃了灶台上的柴火。",
      "陈渊蹲在地上，用树枝在泥地上画着什么。",
      "陈渊抬起头，看着天边渐渐暗下来的云层。",
      "陈渊摸了摸口袋，里面只剩下几枚铜钱。",
      "陈渊叹了口气，转身朝屋内走去。",
    ];
    const check = [
      "陈渊坐在桌前，翻看着一本破旧的书册。",
      "陈渊站起身来，走到窗前望着外面的雨。",
      "陈渊拿起茶杯，却发现茶水已经凉透了。",
      "陈渊推开门，一阵冷风扑面而来。",
    ];
    const result = detectNarrativeBeatRepetition(makeContent(ref, check), "zh");
    expect(findRule(result, "章内短语重复")).toBeUndefined();
  });

  // --- Rule C ---
  it("Rule C: detects scene-cycle structure (A→B→A→B)", () => {
    const ref = filler(6, "前文");
    const sceneA = "老者凝视着陈渊的眼睛，浑浊的目光中带着一丝深意。";
    const sceneB = "老者转身离开，拐杖敲击青石板的声音渐行渐远。";
    const check = [sceneA, sceneB, sceneA, sceneB];
    const result = detectNarrativeBeatRepetition(makeContent(ref, check), "zh");
    expect(findRule(result, "章内场景循环")).toBeDefined();
  });

  it("Rule C: passes for normal progressive paragraphs", () => {
    const ref = filler(6, "前文");
    const check = [
      "清晨的阳光照进厨房，灶台上的火已经熄灭了灰烬残留。",
      "他站起来走到门口，看着远处的山脉若隐若现云雾缭绕。",
      "院子里传来脚步声，老者从拐角处走了出来手拄拐杖。",
      "陈渊低下头，开始收拾地上的碗筷碎片默默无言。",
    ];
    const result = detectNarrativeBeatRepetition(makeContent(ref, check), "zh");
    expect(findRule(result, "章内场景循环")).toBeUndefined();
  });

    // --- Dialogue filtering ---
  it("excludes dialogue-only paragraphs from detection", () => {
    // Use fully distinct content in ref and check to avoid accidental bigram overlap
    const ref = [
      "东南方的群山连绵起伏，苍翠的松柏覆盖了整个山谷地带。",
      "春雨绵绵不断，打湿了庭院里的青石板路面。",
      "西风吹过田野，金黄的麦浪翻滚起伏不定。",
      "北极星高悬夜空，指引着旅人前行的方向。",
      "古老的城墙历经风雨，依然巍峨耸立不倒。",
      "潺潺溪水从山间流过，清澈见底鱼虾嬉戏。",
    ];
    // Use Chinese quotes that isDialogueParagraph matches (U+201C / U+201D)
    const dialogueParas = [
      "“你来了。”",
      "“嗯，我来了。”",
      "“坐下吧。”",
      "“好的，谢谢。”",
    ];
    const check = [
      ...dialogueParas,
      "刀光剑影闪烁不停，江湖恩怨情仇难解难分。",
      "虎啸龙吟震山林，英雄豪杰齐聚一堂论短长。",
    ];
    const result = detectNarrativeBeatRepetition(makeContent(ref, check), "zh");
    // After dialogue filtering: 6 ref + 2 check = 8 total, passes guard
    // The 2 check paragraphs are distinct from ref -> no violations
    expect(result).toHaveLength(0);
  });
});

describe("splitSentences", () => {
  it("splits on Chinese sentence-ending punctuation", () => {
    const result = splitSentences("他走了。她哭了。");
    expect(result).toEqual(["他走了。", "她哭了。"]);
  });

  it("splits on question and exclamation marks", () => {
    const result = splitSentences("你是谁？我不知道！");
    expect(result).toEqual(["你是谁？", "我不知道！"]);
  });

  it("does not split inside Chinese double quotes", () => {
    const input = "他开口道：“你疯了。这是不可能的。”然后转身离开。";
    const result = splitSentences(input);
    expect(result).toHaveLength(2);
    expect(result[0]).toContain("这是不可能的");
  });

  it("does not split inside Chinese single quotes", () => {
    const input = "他低声道：‘来了。’然后站起身。";
    const result = splitSentences(input);
    expect(result).toHaveLength(2);
  });

  it("handles ellipsis followed by sentence-ending punctuation", () => {
    const result = splitSentences("他愣住了……。怎么办？");
    expect(result).toHaveLength(2);
  });

  it("handles standalone ellipsis as sentence break", () => {
    const result = splitSentences("他沉默了……她也沉默了。");
    expect(result).toHaveLength(2);
  });

  it("handles half-width punctuation", () => {
    const result = splitSentences("He thought. This is wrong.");
    expect(result).toHaveLength(2);
  });

  it("returns empty array for empty input", () => {
    expect(splitSentences("")).toEqual([]);
  });

  it("returns single element for text without sentence-ending punctuation", () => {
    const result = splitSentences("一段没有句号的文字");
    expect(result).toEqual(["一段没有句号的文字"]);
  });

  it("handles mixed dialogue and narration", () => {
    const input = "“你疯了。”他低声道，“这意味着战争。”然后他走了。";
    const result = splitSentences(input);
    expect(result.length).toBeGreaterThanOrEqual(2);
  });
});

describe("detectExcessiveMonologue", () => {
  const pad = "陈渊站在院子里，看着天空。远处的山峰在晨光中显得格外清晰。陈渊站在院子里，看着天空。远处的山峰在晨光中显得格外清晰。陈渊站在院子里，看着天空。远处的山峰在晨光中显得格外清晰。陈渊站在院子里，看着天空。远处的山峰在晨光中显得格外清晰。陈渊站在院子里，看着天空。远处的山峰在晨光中显得格外清晰。陈渊站在院子里，看着天空。远处的山峰在晨光中显得格外清晰。陈渊站在院子里，看着天空。远处的山峰在晨光中显得格外";

  it("returns empty for English", () => {
    const violations = detectExcessiveMonologue("He felt fear. She was angry.", "en");
    expect(violations).toHaveLength(0);
  });

  it('returns empty for short chapters (< 500 words)', () => {
    const content = '他感到恐惧。心中涌起一股寒意。他终于明白这一切都是假的。';
    const violations = detectExcessiveMonologue(content);
    expect(violations).toHaveLength(0);
  });

  it('Rule A: detects emotion declarations beyond frequency threshold', () => {
    const emotionSentences = [
      '“他感到一阵莫名的恐惧，仿佛整个世界都在崩塞。”',
      '“她感受到前所未有的压力，心中涌起一股绝望。”',
      '“他心中涌起一股暖意，终于明白了她的用心良苦。”',
      '“她心头一震，不由得想到这或许是最后的机会。”',
    ];
    const content = pad + emotionSentences.join(pad.substring(0, 100));
    const violations = detectExcessiveMonologue(content);
    const emotionViols = violations.filter(v => v.rule === 'excessive-monologue');
    expect(emotionViols.length).toBeGreaterThanOrEqual(1);
  });

  it('Rule A: does not flag short oral reactions', () => {
    const content = pad + '操。完了。不对劲。' + pad;
    const violations = detectExcessiveMonologue(content);
    const emotionViols = violations.filter(v => v.rule === 'excessive-monologue');
    expect(emotionViols).toHaveLength(0);
  });

  it('Rule A: does not flag dialogue paragraphs', () => {
    const content = pad + '“我感到非常害怕。”他低声道。' + pad;
    const violations = detectExcessiveMonologue(content);
    const emotionViols = violations.filter(v => v.rule === 'excessive-monologue');
    expect(emotionViols).toHaveLength(0);
  });

  it('Rule B: detects analytical reasoning', () => {
    const content = pad + pad + '\n\n他心里盘算着，如果此时动手，那么风险在于对方的修为远超自己，综合考虑利大于弊。' + pad;
    const violations = detectExcessiveMonologue(content);
    const analyticalViols = violations.filter(v => v.rule === 'analytical-monologue');
    expect(analyticalViols.length).toBeGreaterThanOrEqual(1);
  });

  it('Rule B: does not flag short analytical phrases', () => {
    const content = pad + '这意味着战争。' + pad;
    const violations = detectExcessiveMonologue(content);
    const analyticalViols = violations.filter(v => v.rule === 'analytical-monologue');
    expect(analyticalViols).toHaveLength(0);
  });

  it('Rule C: detects consecutive monologue paragraphs', () => {
    const monoParas = [
      '他心中暗想，这一切究竟是怎么回事。恐惧在心底蔓延，他感到前所未有的无助。',
      '内心深处有个声音在呼唤，记忆涌上心头，他终于明白了一切的真相。',
      '脑海中的画面不断闪回，思绪万千，百感交集，他觉得自己快要崩溃了。',
    ];
    const normalPara = '他转身走了出去。门外的阳光刺得他睁不开眼。院子里的老槐树沙沙作响。';
    const content = normalPara + '\n\n' + monoParas.join('\n\n') + '\n\n' + normalPara;
    const violations = detectExcessiveMonologue(content);
    const consecViols = violations.filter(v => v.rule === 'consecutive-monologue');
    expect(consecViols.length).toBeGreaterThanOrEqual(1);
  });

  it('Rule C: does not flag when monologue is interspersed with action', () => {
    const mixed = [
      '他心中暗想，这不对劲。',
      '他转身推开门，走到院子里。',
      '心里明白，这一关躲不过去了。',
      '他拔出剑，握紧剑柄。',
      '他觉得事情越来越复杂。',
    ];
    const content = mixed.join('\n\n');
    const violations = detectExcessiveMonologue(content);
    const consecViols = violations.filter(v => v.rule === 'consecutive-monologue');
    expect(consecViols).toHaveLength(0);
  });

  it('Rule D: detects monologue ratio exceeding threshold', () => {
    const monoBlock = '他心中暗想，这一切究竟是怎么回事。恐惧在心底蔓延。脑海中的画面不断闪回。思绪万千，百感交集。内心深处有个声音在呼唤。记忆涌上心头。灵魂深处的某个角落在颤抖。心底响起一个声音。';
    const actionBlock = '他转身推开门。走到院子里。抬头看着天空。深吸一口气。拔出剑。握紧剑柄。踢开石子。捡起地上的信。';
    const content = pad + (monoBlock + '\n\n' + actionBlock + '\n\n').repeat(5) + (monoBlock + '\n\n').repeat(5);
    const violations = detectExcessiveMonologue(content);
    const ratioViols = violations.filter(v => v.rule === 'monologue-ratio');
    expect(ratioViols.length).toBeGreaterThanOrEqual(1);
  });

  it('Rule D: does not flag when ratio is within threshold', () => {
    const content = pad + '\n\n他推开门，走到院子里。抬头看了看天。拔出剑。转身离开。' + pad;
    const violations = detectExcessiveMonologue(content);
    const ratioViols = violations.filter(v => v.rule === 'monologue-ratio');
    expect(ratioViols).toHaveLength(0);
  });

  it('Rule D: strict mode via options.monologueRatioMax', () => {
    const monoBlock = '他心中暗想，这一切究竟是怎么回事。恐惧在心底蔓延。脑海中的画面不断闪回。思绪万千，百感交集。内心深处有个声音在呼唤。记忆涌上心头。灵魂深处的某个角落在颤抖。心底响起一个声音。';
    const actionBlock = '他转身推开门。走到院子里。抬头看着天空。深吸一口气。拔出剑。握紧剑柄。踢开石子。捡起地上的信。';
    const content = pad + (monoBlock + '\n\n' + actionBlock + '\n\n').repeat(3);
    const normalViolations = detectExcessiveMonologue(content);
    const strictViolations = detectExcessiveMonologue(content, 'zh', { monologueRatioMax: 0.20 });
    const normalRatio = normalViolations.filter(v => v.rule === 'monologue-ratio').length;
    const strictRatio = strictViolations.filter(v => v.rule === 'monologue-ratio').length;
    expect(strictRatio).toBeGreaterThanOrEqual(normalRatio);
  });

  it("regression: does not flag Chinese single-quote dialogue as monologue", () => {
    const pad = "陈渊站在院子里，看着天空。远处的山峰在晨光中显得格外清晰。陈渊站在院子里，看着天空。远处的山峰在晨光中显得格外清晰。陈渊站在院子里，看着天空。远处的山峰在晨光中显得格外清晰。陈渊站在院子里，看着天空。远处的山峰在晨光中显得格外清晰。陈渊站在院子里，看着天空。远处的山峰在晨光中显得格外清晰。陈渊站在院子里，看着天空。远处的山峰在晨光中显得格外清晰";
    const content = pad + "\n\n" + "‘我感到非常害怕。’他低声道。" + pad;
    const violations = detectExcessiveMonologue(content);
    const emotionViols = violations.filter(v => v.rule === "excessive-monologue");
    expect(emotionViols).toHaveLength(0);
  });


  it('multiple rules can fire simultaneously', () => {
    const monoBlock = '他心中涌起一股暖意，终于明白了她的用心良苦。恐惧在心底蔓延。记忆涌上心头。灵魂深处有个声音在呼唤。思绪万千。百感交集。内心深处有个声音在呼唤。脑海中的画面不断闪回。';
    const content = pad + pad + '\n\n' + monoBlock.repeat(3);
    const violations = detectExcessiveMonologue(content);
    const rules = new Set(violations.map(v => v.rule));
    expect(rules.size).toBeGreaterThanOrEqual(2);
  });

  it('violation descriptions include snippet of offending text', () => {
    const content = pad + pad + '\n\n他心里盘算着，如果此时动手，那么风险在于对方的修为远超自己，综合考虑利大于弊。' + pad;
    const violations = detectExcessiveMonologue(content);
    const analytical = violations.find(v => v.rule === 'analytical-monologue');
    expect(analytical).toBeDefined();
    expect(analytical!.description).toContain('盘算');
  });

  it('short analytical sentence under 15 words is skipped', () => {
    const content = pad + '\n\n这意味着战争。他转身离开。他推开门。他走向远方。' + pad;
    const violations = detectExcessiveMonologue(content);
    const analytical = violations.filter(v => v.rule === 'analytical-monologue');
    expect(analytical).toHaveLength(0);
  });

  it('heavy dialogue chapter is not flagged as monologue ratio', () => {
    const dialoguePara = [
      '“你疯了。”他低声道。',
      '“我没疯。”她笑了笑。',
      '“这是不可能的。”他摇头。',
      '“一切皆有可能。”她转身离开。',
    ];
    const content = dialoguePara.join('\n\n');
    const violations = detectExcessiveMonologue(content);
    const ratioViols = violations.filter(v => v.rule === 'monologue-ratio');
    expect(ratioViols).toHaveLength(0);
  });

  it('paragraph with mixed action and monologue is classified correctly', () => {
    const mixedPara = '他推开窗，心中暗想，这一切来得太突然了。恐惧让他握紧了拳头，转身走向门口。';
    const normalPara = '门外传来脚步声。阳光洒在地上。院子里的树沙沙作响。远处有人在说话。';
    const content = normalPara + '\n\n' + mixedPara + '\n\n' + normalPara;
    const violations = detectExcessiveMonologue(content);
    const consecViols = violations.filter(v => v.rule === 'consecutive-monologue');
    expect(consecViols).toHaveLength(0);
  });
  it('error handling: returns empty array on exception', () => {
    const violations = detectExcessiveMonologue(null as any);
    expect(Array.isArray(violations)).toBe(true);
  });
});
