/**
 * Post-write rule-based validator.
 *
 * Deterministic, zero-LLM-cost checks that run after every chapter generation.
 * Catches violations that prompt-only rules cannot guarantee.
 */

import { analyzeChapterCadence } from "../utils/chapter-cadence.js";
import { stripThinkBlocks } from "../utils/strip-think-blocks.js";
import type { BookRules } from "../models/book-rules.js";
import type { GenreProfile } from "../models/genre-profile.js";

export interface PostWriteViolation {
  readonly rule: string;
  readonly severity: "error" | "warning";
  readonly description: string;
  readonly suggestion: string;
}

export function normalizePostWriteSurface(
  content: string,
  languageOverride?: "zh" | "en",
): string {
  let normalized = stripThinkBlocks(content);
  normalized = stripPostWriteMetaLines(normalized);
  normalized = stripFullLineItalic(normalized);
  normalized = stripInlineMarkdown(normalized);
  if (languageOverride !== "en") {
    normalized = normalized.replace(/——+/g, "，");
    normalized = normalized.replace(/「/g, "“").replace(/」/g, "”");
  }
  return normalized.trimEnd();
}

/**
 * Strip lines where the entire line is wrapped in markdown italic markers.
 * e.g. "*不远处的三长老站在书房窗前，看着心腹传回来的消息。*"
 * Safe: anchors (^...$) prevent matching inline asterisks within longer lines.
 */
function stripFullLineItalic(content: string): string {
  return content.replace(/^\*([^*\n]+)\*$/gm, "$1");
}

// Order matters: bold (**) before underline (__). Single * is NOT stripped —
// too aggressive for Chinese fiction where stray asterisks are common.
function stripInlineMarkdown(content: string): string {
  return content
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/__(.+?)__/g, "$1");
}

function stripPostWriteMetaLines(content: string): string {
  const lines = content.split(/\r?\n/);
  const filtered = lines.filter((line) =>
    !/^\s*\[(?:polisher|writer|reviser|reviewer)-note\]\s*/i.test(line)
    && !/^\s*\[(?:润色|写作|修订|审稿)备注\]\s*/.test(line)
  );
  return filtered.join("\n");
}

interface ParagraphShape {
  readonly paragraphs: ReadonlyArray<string>;
  readonly shortThreshold: number;
  readonly shortParagraphs: ReadonlyArray<string>;
  readonly shortRatio: number;
  readonly averageLength: number;
  readonly maxConsecutiveShort: number;
}

// --- Marker word lists ---

/** AI转折/惊讶标记词 */
const SURPRISE_MARKERS = ["仿佛", "忽然", "竟然", "猛地", "猛然", "不禁", "宛如"];

/** 元叙事/编剧旁白模式 */
const META_NARRATION_PATTERNS = [
  /到这里[，,]?算是/,
  /接下来[，,]?(?:就是|将会|即将)/,
  /(?:后面|之后)[，,]?(?:会|将|还会)/,
  /(?:故事|剧情)(?:发展)?到了/,
  /读者[，,]?(?:可能|应该|也许)/,
  /我们[，,]?(?:可以|不妨|来看)/,
];

/** 分析报告式术语（禁止出现在正文中） */
const REPORT_TERMS = [
  "核心动机", "信息边界", "信息落差", "核心风险", "利益最大化",
  "当前处境", "行为约束", "性格过滤", "情绪外化", "锚定效应",
  "沉没成本", "认知共鸣",
];

/** 作者说教词 */
const SERMON_WORDS = ["显然", "毋庸置疑", "不言而喻", "众所周知", "不难看出"];

/** 全场震惊类集体反应 */
const COLLECTIVE_SHOCK_PATTERNS = [
  /(?:全场|众人|所有人|在场的人)[，,]?(?:都|全|齐齐|纷纷)?(?:震惊|惊呆|倒吸凉气|目瞪口呆|哗然|惊呼)/,
  /(?:全场|一片)[，,]?(?:寂静|哗然|沸腾|震动)/,
];

// --- Weak chapter ending detector (white-list: external anchor required) ---

/** External scene words (compound-first to avoid single-char false positives) */
const EXTERNAL_SCENE_WORDS: ReadonlyArray<string> = [
  "门", "门响", "脚步声", "来人", "火光", "灯火", "雷声", "雨声",
  "烟", "月", "星辰", "夜风", "风", "雪", "云", "鸟鸣", "犬吠",
  "更鼓", "鼓声", "钟声", "水声", "余烬", "灶火",
  "灯影", "影子", "人影", "黑影", "声响", "响声", "回响",
];
const EXTERNAL_SCENE_RE = new RegExp(
  "(?:" + EXTERNAL_SCENE_WORDS.join("|") + ")",
);

function detectWeakChapterEnding(
  content: string,
  language: "zh" | "en",
): ReadonlyArray<PostWriteViolation> {
  // English not supported yet — skip to avoid false positives
  if (language === "en") return [];

  const paragraphs = content
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0)
    .filter((p) => !p.startsWith("#"))
    .filter((p) => p !== "---");

  if (paragraphs.length < 2) return [];
  const lastParagraph = paragraphs[paragraphs.length - 1]!;

  // External anchor detection (any hit = good ending)
  const hasDialogue = /[""「『]/.test(lastParagraph);
  const hasExternalScene = EXTERNAL_SCENE_RE.test(lastParagraph);
  const hasActionVerb =
    /(?:走|跑|转|站|坐|躺|扑|推|拉|握|拔|砍|刺|踢|翻|跳|冲|撞|摔|倒|闪|挡|劈|斩|挥|举|落|射|扔|甩|按|扯|抓|捏|踩|踏|跨|迈|登|爬|跪|蹲|退|进|逃|奔|来|出|入|回|靠|碰|触|拾|捡|掏|摸|拨|撕|拽|砸|戳|压|挤|攀|跃|窜|穿|迎|赴|赶|开|起|闭|睁|盯|瞪|瞥|望|看|听|闻|吸|呼|吞|咽|咳|笑|哭|喊|叫|骂|吼|哼|叹|皱|低|收|端|递|揭|夹|瞄|嘀|嘟|念|读|唱|喝|吃|咬|吻|打)(?:了|着|过来|过去|下去|上来|出来|进去|回来|起来|下去)?/.test(
      lastParagraph,
    );
  const hasFuturePromise =
    /(?:三天后|明日|明天|后天|当晚|当夜|待到)/.test(lastParagraph) &&
    /(?:见分晓|再|答案|届时|动手)/.test(lastParagraph);

  const hasAnyAnchor =
    hasDialogue || hasExternalScene || hasActionVerb || hasFuturePromise;

  if (!hasAnyAnchor) {
    return [
      {
        rule: "弱章尾",
        severity: "error",
        description: "章尾缺少外部锚点（动作/对话/场景），纯心理活动或氛围声明收尾，违反「章尾铁律」。",
        suggestion: "最后一段必须包含具体动作、对话或环境细节。示例：脚步声响起、门被推开、远处有人说话。",
      },
    ];
  }

  return [];
}

// --- Validator ---

export function validatePostWrite(
  content: string,
  genreProfile: GenreProfile,
  bookRules: BookRules | null,
  languageOverride?: "zh" | "en",
): ReadonlyArray<PostWriteViolation> {
  const violations: PostWriteViolation[] = [];

  // Skip Chinese-specific rules for English content
  const isEnglish = (languageOverride ?? genreProfile.language) === "en";
  if (isEnglish) {
    // For English, only run book-specific prohibitions and paragraph length check
    return validatePostWriteEnglish(content, genreProfile, bookRules);
  }

  // 1. 硬性禁令: "不是…而是/是…" 句式（密度统计）
  {
    const buShiPattern = /不是[^，。！？\n]{0,30}[，,]?\s*(?:而是|是(?!什么))/g;
    const buShiMatches = [...content.matchAll(buShiPattern)];
    if (buShiMatches.length > 0) {
      violations.push({
        rule: "禁止句式",
        severity: buShiMatches.length >= 2 ? "error" : "warning",
        description: `出现了${buShiMatches.length}处「不是……而是/是……」句式`,
        suggestion: "用具体动作和细节替代抽象对比，让读者自己得出结论",
      });
    }
  }

  // 2. 硬性禁令: 破折号
  if (content.includes("——")) {
    violations.push({
      rule: "禁止破折号",
      severity: "error",
      description: "出现了破折号「——」",
      suggestion: "用逗号或句号断句",
    });
  }

  // 2b. 英文句子检测（中文小说中的 LLM artifact）
  {
    // Match quoted text that is entirely Latin script (English sentences in dialogue)
    const englishInQuotes =
      /["“”「」]([A-Za-z][\p{Script=Latin}\s,.!?;:'"()\-]{9,})["“”「」]/gu;
    const matches = [...content.matchAll(englishInQuotes)];
    if (matches.length > 0) {
      const samples = matches
        .slice(0, 3)
        .map((m) => `"${m[1].slice(0, 40)}${m[1].length > 40 ? "..." : ""}"`)
        .join("、");
      violations.push({
        rule: "英文句子",
        severity: "error",
        description: `中文正文中出现英文整句（${matches.length}处），如 ${samples}`,
        suggestion: "中文小说正文禁止出现英文对话/叙述，改用中文表达",
      });
    }
  }

  // 3. 转折/惊讶标记词密度 ≤ 1次/3000字
  const markerCounts: Record<string, number> = {};
  let totalMarkerCount = 0;
  for (const word of SURPRISE_MARKERS) {
    const matches = content.match(new RegExp(word, "g"));
    const count = matches?.length ?? 0;
    if (count > 0) {
      markerCounts[word] = count;
      totalMarkerCount += count;
    }
  }
  const markerLimit = Math.max(1, Math.floor(content.length / 3000));
  if (totalMarkerCount > markerLimit) {
    const detail = Object.entries(markerCounts)
      .map(([w, c]) => `"${w}"×${c}`)
      .join("、");
    violations.push({
      rule: "转折词密度",
      severity: "warning",
      description: `转折/惊讶标记词共${totalMarkerCount}次（上限${markerLimit}次/${content.length}字），明细：${detail}`,
      suggestion: "改用具体动作或感官描写传递突然性",
    });
  }

  // 4. 高疲劳词检查（从 genreProfile 读取，单章每词 ≤ 1次）
  const fatigueWords = bookRules?.fatigueWordsOverride && bookRules.fatigueWordsOverride.length > 0
    ? bookRules.fatigueWordsOverride
    : genreProfile.fatigueWords;
  for (const word of fatigueWords) {
    const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const matches = content.match(new RegExp(escaped, "g"));
    const count = matches?.length ?? 0;
    if (count > 1) {
      violations.push({
        rule: "高疲劳词",
        severity: "warning",
        description: `高疲劳词"${word}"出现${count}次（上限1次/章）`,
        suggestion: `替换多余的"${word}"为同义但不同形式的表达`,
      });
    }
  }

  // 5. 元叙事检查（编剧旁白）
  for (const pattern of META_NARRATION_PATTERNS) {
    const match = content.match(pattern);
    if (match) {
      violations.push({
        rule: "元叙事",
        severity: "warning",
        description: `出现编剧旁白式表述："${match[0]}"`,
        suggestion: "删除元叙事，让剧情自然展开",
      });
      break; // 报一次即可
    }
  }

  // 6. 分析报告式术语
  const foundTerms: string[] = [];
  for (const term of REPORT_TERMS) {
    if (content.includes(term)) {
      foundTerms.push(term);
    }
  }
  if (foundTerms.length > 0) {
    violations.push({
      rule: "报告术语",
      severity: "error",
      description: `正文中出现分析报告术语：${foundTerms.map(t => `"${t}"`).join("、")}`,
      suggestion: "这些术语只能用于 PRE_WRITE_CHECK 内部推理，正文中用口语化表达替代",
    });
  }

  // 7. 正文中的章节号指称（如"第33章"、"chapter 33"）
  const chapterRefPattern = /(?:第\s*\d+\s*章|[Cc]hapter\s+\d+)/g;
  const chapterRefs = content.match(chapterRefPattern);
  if (chapterRefs && chapterRefs.length > 0) {
    const unique = [...new Set(chapterRefs)];
    violations.push({
      rule: isEnglish ? "chapter-number-reference" : "章节号指称",
      severity: "error",
      description: isEnglish
        ? `Chapter text contains explicit chapter number references: ${unique.map(r => `"${r}"`).join(", ")}. Characters do not know they are in a numbered chapter.`
        : `正文中出现了章节号指称：${unique.map(r => `"${r}"`).join("、")}。角色不知道自己在第几章。`,
      suggestion: isEnglish
        ? "Replace with natural references: 'that night', 'when the warehouse burned', 'the incident at the dock'"
        : '改成自然表达："那天晚上"、"仓库出事那次"、"码头上的事"',
    });
  }

  // 8. 作者说教词
  const foundSermons: string[] = [];
  for (const word of SERMON_WORDS) {
    if (content.includes(word)) {
      foundSermons.push(word);
    }
  }
  if (foundSermons.length > 0) {
    violations.push({
      rule: "作者说教",
      severity: "warning",
      description: `出现说教词：${foundSermons.map(w => `"${w}"`).join("、")}`,
      suggestion: "删除说教词，让读者自己从情节中判断",
    });
  }

  // 8. 全场震惊类集体反应
  for (const pattern of COLLECTIVE_SHOCK_PATTERNS) {
    const match = content.match(pattern);
    if (match) {
      violations.push({
        rule: "集体反应",
        severity: "warning",
        description: `出现集体反应套话："${match[0]}"`,
        suggestion: "改写成1-2个具体角色的身体反应",
      });
      break;
    }
  }

  // 9. 连续"了"字检查（3句以上连续含"了"）
  const sentences = content
    .split(/[。！？]/)
    .map(s => s.trim())
    .filter(s => s.length > 2);

  let consecutiveLe = 0;
  let maxConsecutiveLe = 0;
  for (const sentence of sentences) {
    if (sentence.includes("了")) {
      consecutiveLe++;
      maxConsecutiveLe = Math.max(maxConsecutiveLe, consecutiveLe);
    } else {
      consecutiveLe = 0;
    }
  }
  if (maxConsecutiveLe >= 6) {
    violations.push({
      rule: "连续了字",
      severity: "warning",
      description: `检测到${maxConsecutiveLe}句连续包含"了"字，节奏拖沓`,
      suggestion: "保留最有力的一个「了」，其余改为无「了」句式",
    });
  }

  // 10. 段落长度检查（手机阅读适配：50-250字/段为宜）
  const paragraphs = content
    .split(/\n\s*\n/)
    .map(p => p.trim())
    .filter(p => p.length > 0);

  const longParagraphs = paragraphs.filter(p => p.length > 300);
  if (longParagraphs.length >= 2) {
    violations.push({
      rule: "段落过长",
      severity: "warning",
      description: `${longParagraphs.length}个段落超过300字，不适合手机阅读`,
      suggestion: "长段落拆分为3-5行的短段落，在动作切换或情绪节点处断开",
    });
  }

  violations.push(...detectParagraphShapeWarnings(content, "zh"));

  // 11. 章节结尾质量检查：禁止纯心理/氛围收尾
  violations.push(...detectWeakChapterEnding(content, "zh"));

  // 12. Book-level prohibitions
  // Short prohibitions (2-30 chars): exact substring match
  // Long prohibitions (>30 chars): skip — these are conceptual rules for prompt-level enforcement only
  if (bookRules?.prohibitions) {
    for (const prohibition of bookRules.prohibitions) {
      if (prohibition.length >= 2 && prohibition.length <= 30 && content.includes(prohibition)) {
        violations.push({
          rule: "本书禁忌",
          severity: "error",
          description: `出现了本书禁忌内容："${prohibition}"`,
          suggestion: "删除或改写该内容",
        });
      }
    }
  }

  return violations;
}

/**
 * Within-chapter narrative beat repetition detection.
 *
 * Detects three patterns in the last 40% of a chapter:
 * A) Paragraph-level restatement (bigram Jaccard > 0.4 vs first 60%)
 * B) Noun-phrase amplification (phrase density in check zone ≥ 2x reference zone)
 * C) Scene-cycle structure (alternating paragraph similarity via para[i] vs para[i+2])
 */
export function detectNarrativeBeatRepetition(
  content: string,
  language: "zh" | "en" = "zh",
): readonly PostWriteViolation[] {
  if (language === "en") return [];

  const allParagraphs = extractParagraphs(content);
  const paragraphs = allParagraphs.filter((p) => !isDialogueParagraph(p));

  // Guard: need ≥ 8 non-dialogue paragraphs for meaningful 60/40 split
  if (paragraphs.length < 8) return [];

  const splitIndex = Math.floor(paragraphs.length * 0.6);
  const reference = paragraphs.slice(0, splitIndex);
  const check = paragraphs.slice(splitIndex);
  if (reference.length === 0 || check.length === 0) return [];

  const violations: PostWriteViolation[] = [];
  const refText = reference.join("");

  // --- Rule A: Paragraph-level restatement (bigram Jaccard) ---
  const STOP_CHARS = new Set("的了着在和与是有不到被把从对也就都而及或");
  const toBigrams = (text: string): Set<string> => {
    const clean = text.replace(/[^一-鿿]/g, "");
    const filtered = [...clean].filter((c) => !STOP_CHARS.has(c)).join("");
    const bigrams = new Set<string>();
    for (let i = 0; i < filtered.length - 1; i++) {
      bigrams.add(filtered.slice(i, i + 2));
    }
    return bigrams;
  };
  const jaccard = (a: Set<string>, b: Set<string>): number => {
    if (a.size === 0 && b.size === 0) return 0;
    let intersection = 0;
    for (const item of a) {
      if (b.has(item)) intersection++;
    }
    return intersection / (a.size + b.size - intersection);
  };

  const refBigrams = reference.map(toBigrams);
  const ruleAViolations: number[] = [];
  for (let ci = 0; ci < check.length; ci++) {
    const checkBg = toBigrams(check[ci]!);
    if (checkBg.size === 0) continue;
    let maxSim = 0;
    for (const refBg of refBigrams) {
      const sim = jaccard(checkBg, refBg);
      if (sim > maxSim) maxSim = sim;
    }
    if (maxSim > 0.4) {
      ruleAViolations.push(splitIndex + ci);
    }
  }
  if (ruleAViolations.length > 0) {
    violations.push({
      rule: "章内段落重述",
      severity: "warning",
      description: `章末有${ruleAViolations.length}个段落与前文高度相似（bigram Jaccard > 0.4），疑似叙事节拍重述`,
      suggestion: "删除或大幅压缩章末重复段落，章末留给钩子和余韵，不是展开回顾的空间",
    });
  }

  // --- Rule B: Noun-phrase amplification (density ratio) ---
  const phrasePattern = /[一-鿿]{4,}/g;
  const extractPhrases = (text: string): string[] => [...(text.match(phrasePattern) ?? [])];

  const refPhrases = extractPhrases(refText);
  const checkPhrases = check.flatMap(extractPhrases);
  const refCharCount = refText.length || 1;
  const checkCharCount = check.join("").length || 1;

  const refPhraseCounts = new Map<string, number>();
  for (const p of refPhrases) refPhraseCounts.set(p, (refPhraseCounts.get(p) ?? 0) + 1);
  const checkPhraseCounts = new Map<string, number>();
  for (const p of checkPhrases) checkPhraseCounts.set(p, (checkPhraseCounts.get(p) ?? 0) + 1);

  const ruleBHits: string[] = [];
  for (const [phrase, checkCount] of checkPhraseCounts) {
    if (checkCount < 2) continue;
    const checkDensity = checkCount / checkCharCount;
    const refCount = refPhraseCounts.get(phrase) ?? 0;
    const refDensity = refCount / refCharCount;
    // Only flag if check-zone density is ≥ 2x reference-zone density
    if (refDensity > 0 && checkDensity / refDensity >= 2) {
      ruleBHits.push(`"${phrase}"(×${checkCount})`);
    } else if (refDensity === 0 && checkCount >= 2) {
      // Phrase absent from reference but repeated in check
      ruleBHits.push(`"${phrase}"(×${checkCount})`);
    }
  }
  if (ruleBHits.length > 0) {
    violations.push({
      rule: "章内短语重复",
      severity: "warning",
      description: `章末有${ruleBHits.length}个名词短语重复出现且密度远高于前文：${ruleBHits.slice(0, 5).join("、")}`,
      suggestion: "前文已写过的感官细节不要在章末逐个重述，读者记得前文写了什么",
    });
  }

  // --- Rule C: Scene-cycle detection (alternating paragraph similarity) ---
  const checkBigrams = check.map(toBigrams);
  let cycleRun = 0;
  let maxCycleRun = 0;
  for (let i = 0; i < checkBigrams.length - 2; i++) {
    if (checkBigrams[i]!.size === 0 || checkBigrams[i + 2]!.size === 0) {
      cycleRun = 0;
      continue;
    }
    const sim = jaccard(checkBigrams[i]!, checkBigrams[i + 2]!);
    if (sim > 0.3) {
      cycleRun++;
      if (cycleRun > maxCycleRun) maxCycleRun = cycleRun;
    } else {
      cycleRun = 0;
    }
  }
  // Need 4+ paragraphs in cycle (2 alternations = 4 paragraphs, so cycleRun ≥ 2)
  if (maxCycleRun >= 2) {
    violations.push({
      rule: "章内场景循环",
      severity: "warning",
      description: `章末检测到场景循环结构（交替段落相似度连续${maxCycleRun + 2}段 > 0.3），疑似 A→B→A→B 模式`,
      suggestion: "场景动作序列只保留 1 轮，不要循环展开",
    });
  }

  return violations;
}

/**
 * Cross-chapter repetition check.
 * Detects phrases from the current chapter that also appeared in recent chapters.
 */
export function detectCrossChapterRepetition(
  currentContent: string,
  recentChaptersContent: string,
  language: "zh" | "en" = "zh",
): ReadonlyArray<PostWriteViolation> {
  if (!recentChaptersContent || recentChaptersContent.length < 100) return [];

  const violations: PostWriteViolation[] = [];
  const isEnglish = language === "en";

  if (isEnglish) {
    // Extract 3-word phrases from current chapter
    const words = currentContent.toLowerCase().replace(/[^\w\s']/g, "").split(/\s+/).filter(w => w.length > 2);
    const phraseCounts = new Map<string, number>();
    for (let i = 0; i < words.length - 2; i++) {
      const phrase = `${words[i]} ${words[i + 1]} ${words[i + 2]}`;
      phraseCounts.set(phrase, (phraseCounts.get(phrase) ?? 0) + 1);
    }
    // Check which repeated phrases (2+ in current) also appear in recent chapters
    const recentLower = recentChaptersContent.toLowerCase();
    const crossRepeats: string[] = [];
    for (const [phrase, count] of phraseCounts) {
      if (count >= 2 && recentLower.includes(phrase)) {
        crossRepeats.push(`"${phrase}" (×${count})`);
      }
    }
    if (crossRepeats.length >= 3) {
      violations.push({
        rule: "Cross-chapter repetition",
        severity: "warning",
        description: `${crossRepeats.length} repeated phrases also found in recent chapters: ${crossRepeats.slice(0, 5).join(", ")}`,
        suggestion: "Vary action verbs and descriptive phrases to avoid cross-chapter repetition",
      });
    }
  } else {
    // Chinese: 6-char ngrams
    const chars = currentContent.replace(/[\s\n\r]/g, "");
    const phraseCounts = new Map<string, number>();
    for (let i = 0; i < chars.length - 5; i++) {
      const phrase = chars.slice(i, i + 6);
      if (/^[\u4e00-\u9fff]{6}$/.test(phrase)) {
        phraseCounts.set(phrase, (phraseCounts.get(phrase) ?? 0) + 1);
      }
    }
    const recentClean = recentChaptersContent.replace(/[\s\n\r]/g, "");
    const crossRepeats: string[] = [];
    for (const [phrase, count] of phraseCounts) {
      if (count >= 2 && recentClean.includes(phrase)) {
        crossRepeats.push(`"${phrase}"(×${count})`);
      }
    }
    if (crossRepeats.length >= 3) {
      violations.push({
        rule: "跨章重复",
        severity: "warning",
        description: `${crossRepeats.length}个重复短语在近期章节中也出现过：${crossRepeats.slice(0, 5).join("、")}`,
        suggestion: "变换动作描写和场景用语，避免跨章节机械重复",
      });
    }
  }

  return violations;
}

export function detectParagraphLengthDrift(
  currentContent: string,
  recentChaptersContent: string,
  language: "zh" | "en" = "zh",
): ReadonlyArray<PostWriteViolation> {
  if (!recentChaptersContent || recentChaptersContent.trim().length === 0) return [];

  const current = analyzeParagraphShape(currentContent, language);
  const recent = analyzeParagraphShape(recentChaptersContent, language);

  if (current.paragraphs.length < 4 || recent.paragraphs.length < 4) return [];
  if (recent.averageLength <= 0 || current.averageLength <= 0) return [];

  const shrinkRatio = current.averageLength / recent.averageLength;
  const shortRatioDelta = current.shortRatio - recent.shortRatio;

  if (shrinkRatio >= 0.6 || current.shortRatio < 0.5 || shortRatioDelta < 0.25) {
    return [];
  }

  const dropPercent = Math.round((1 - shrinkRatio) * 100);

  return [
    language === "en"
      ? {
          rule: "Paragraph density drift",
          severity: "warning",
          description: `Average paragraph length dropped from ${Math.round(recent.averageLength)} to ${Math.round(current.averageLength)} characters (${dropPercent}% shorter) compared with recent chapters.`,
          suggestion: "Let action, observation, and reaction share paragraphs more often instead of cutting every beat into a single short line.",
        }
      : {
          rule: "段落密度漂移",
          severity: "warning",
          description: `当前章平均段长从近期章节的${Math.round(recent.averageLength)}字降到${Math.round(current.averageLength)}字，缩短了${dropPercent}%。`,
          suggestion: "不要把每个动作都切成单独短句；适当把动作、观察和反应并入同一段，恢复段落层次。",
        },
  ];
}

/** English-specific post-write validation rules. */
function validatePostWriteEnglish(
  content: string,
  genreProfile: GenreProfile,
  bookRules: BookRules | null,
): ReadonlyArray<PostWriteViolation> {
  const violations: PostWriteViolation[] = [];

  // 1. AI-tell word density (from en-prompt-sections IRON LAW 3)
  const aiTellWords = ["delve", "tapestry", "testament", "intricate", "pivotal", "vibrant", "embark", "comprehensive", "nuanced"];
  for (const word of aiTellWords) {
    const regex = new RegExp(`\\b${word}\\b`, "gi");
    const matches = content.match(regex);
    if (matches && matches.length > Math.ceil(content.length / 3000)) {
      violations.push({
        rule: "AI-tell word density",
        severity: "warning",
        description: `"${word}" appears ${matches.length} times (limit: 1 per 3000 chars)`,
        suggestion: `Replace with a more specific word`,
      });
    }
  }

  // 2. Paragraph overflow (same rule applies to English)
  const paragraphs = content.split(/\n\s*\n/).filter((p) => p.trim().length > 0);
  const longParagraphs = paragraphs.filter((p) => p.length > 500);
  if (longParagraphs.length >= 2) {
    violations.push({
      rule: "Paragraph length",
      severity: "warning",
      description: `${longParagraphs.length} paragraphs exceed 500 characters`,
      suggestion: "Break into shorter paragraphs for readability",
    });
  }

  violations.push(...detectParagraphShapeWarnings(content, "en"));

  // 2.5. Multi-character scene with almost no direct exchange
  const quotedLines = content.match(/"[^"]+"/g) ?? [];
  const englishNames = [...new Set(
    (content.match(/\b[A-Z][a-z]{2,}\b/g) ?? [])
      .filter((name) => !ENGLISH_NAME_STOP_WORDS.has(name)),
  )];
  if (englishNames.length >= 2 && quotedLines.length < 2 && content.length >= 120) {
    violations.push({
      rule: "Dialogue pressure",
      severity: "warning",
      description: `Multi-character scene appears to rely on narration with almost no direct exchange (${englishNames.slice(0, 3).join(", ")}).`,
      suggestion: "Add at least one resistance-bearing exchange so characters push back, withhold, or pressure each other directly.",
    });
  }

  // 3. Book-specific prohibitions
  if (bookRules?.prohibitions) {
    for (const prohibition of bookRules.prohibitions) {
      if (prohibition.length >= 2 && prohibition.length <= 50 && content.toLowerCase().includes(prohibition.toLowerCase())) {
        violations.push({
          rule: "Book prohibition",
          severity: "error",
          description: `Found banned content: "${prohibition}"`,
          suggestion: "Remove or rewrite this content",
        });
      }
    }
  }

  // 4. Genre fatigue words
  const fatigueWords = bookRules?.fatigueWordsOverride && bookRules.fatigueWordsOverride.length > 0
    ? bookRules.fatigueWordsOverride
    : genreProfile.fatigueWords;
  for (const word of fatigueWords) {
    const regex = new RegExp(`\\b${word}\\b`, "gi");
    const matches = content.match(regex);
    if (matches && matches.length > 1) {
      violations.push({
        rule: "Fatigue word",
        severity: "warning",
        description: `"${word}" appears ${matches.length} times (max 1 per chapter)`,
        suggestion: "Vary the vocabulary",
      });
    }
  }

  return violations;
}

function appendParagraphShapeWarnings(
  violations: PostWriteViolation[],
  content: string,
  language: "zh" | "en",
): void {
  const shape = analyzeParagraphShape(content, language);
  if (shape.paragraphs.length < 4) return;

  if (shape.shortParagraphs.length >= 4 && shape.shortRatio >= 0.6) {
    violations.push(
      language === "en"
        ? {
            rule: "Paragraph fragmentation",
            severity: "warning",
            description: `${shape.shortParagraphs.length} of ${shape.paragraphs.length} paragraphs are shorter than ${shape.shortThreshold} characters.`,
            suggestion: "Merge adjacent action, observation, and reaction beats so the chapter does not collapse into one-line paragraphs.",
          }
        : {
            rule: "段落过碎",
            severity: "warning",
            description: `${shape.paragraphs.length}个段落里有${shape.shortParagraphs.length}个不足${shape.shortThreshold}字，段落被切得过碎。`,
            suggestion: "把相邻的动作、观察、反应适当并段，不要每句话都单独起段。",
          },
    );
  }

  if (shape.maxConsecutiveShort >= 3) {
    violations.push(
      language === "en"
        ? {
            rule: "Consecutive short paragraphs",
            severity: "warning",
            description: `${shape.maxConsecutiveShort} short paragraphs appear back to back.`,
            suggestion: "Break the one-beat-per-paragraph rhythm by folding connected beats into fuller paragraphs.",
          }
        : {
            rule: "连续短段",
            severity: "warning",
            description: `连续出现${shape.maxConsecutiveShort}个不足${shape.shortThreshold}字的短段，容易形成短句堆砌。`,
            suggestion: "把连续的碎动作重新编组，至少让一个段落承载完整的动作链或情绪推进。",
          },
    );
  }
}

export function detectParagraphShapeWarnings(
  content: string,
  language: "zh" | "en" = "zh",
): ReadonlyArray<PostWriteViolation> {
  const violations: PostWriteViolation[] = [];
  appendParagraphShapeWarnings(violations, content, language);
  return violations;
}

// --- Temporal homogeneity detection ---

const ZH_NIGHT_KEYWORDS = /夜[晚色深里风]|月光|月色|月亮|星辰|灯火|关灯|灭灯|躺下|入睡|深夜|子时|亥时|半夜|三更|黑暗|黑幕|夜幕|万籁俱寂|夜风/;
const ZH_MORNING_KEYWORDS = /清晨|晨光|天亮|天明|黎明|破晓|日出|拂晓|卯时|寅时|鸡鸣|朝霞|曙光/;
const EN_NIGHT_KEYWORDS = /\b(night|moonlight|moon|starlight|darkness|midnight|pitch.?dark|lamp|lantern|candle|slept|sleep|asleep|bed|pillow)\b/i;
const EN_MORNING_KEYWORDS = /\b(morning|dawn|sunrise|daybreak|first.?light|crack.?of.?dawn|sun.?came.?up|woke|woken|awake|dawned)\b/i;

function extractChapterTail(content: string, charLimit = 200): string {
  const lines = content.split(/\r?\n/).map((l) => l.trim()).filter((l) =>
    l.length > 0 && !l.startsWith("#") && !l.startsWith("|") && !l.startsWith("==="),
  );
  const tail: string[] = [];
  let total = 0;
  for (let i = lines.length - 1; i >= 0 && total < charLimit; i--) {
    tail.unshift(lines[i]);
    total += lines[i].length;
  }
  return tail.join(" ");
}

function extractChapterHead(content: string, charLimit = 200): string {
  const lines = content.split(/\r?\n/).map((l) => l.trim()).filter((l) =>
    l.length > 0 && !l.startsWith("#") && !l.startsWith("|") && !l.startsWith("==="),
  );
  const head: string[] = [];
  let total = 0;
  for (let i = 0; i < lines.length && total < charLimit; i++) {
    head.push(lines[i]);
    total += lines[i].length;
  }
  return head.join(" ");
}

/**
 * Detect temporal homogeneity across recent chapters.
 * Flags when all recent chapter endings share the same time-of-day anchor
 * (e.g., every chapter ends at night) or when all openings do.
 *
 * @param currentContent - The current chapter's full text
 * @param recentChaptersContent - Concatenated text of recent chapters (separated by "\n\n")
 * @param language - "zh" or "en"
 */
export function detectTemporalHomogeneity(
  currentContent: string,
  recentChaptersContent: string,
  language: "zh" | "en" = "zh",
): ReadonlyArray<PostWriteViolation> {
  if (!recentChaptersContent || recentChaptersContent.trim().length === 0) return [];

  const nightRe = language === "en" ? EN_NIGHT_KEYWORDS : ZH_NIGHT_KEYWORDS;
  const morningRe = language === "en" ? EN_MORNING_KEYWORDS : ZH_MORNING_KEYWORDS;

  // Split recent chapters by chapter heading patterns.
  // The lookahead ensures we only split at chapter boundaries, not between paragraphs.
  const chapters = recentChaptersContent
    .split(/\n{2,}(?=# 第|#{1,3} Chapter|\d{4}_)/)
    .map((c) => c.trim())
    .filter((c) => c.length > 100);

  if (chapters.length < 2) return [];

  // Include current chapter as the last one
  const allChapters = [...chapters, currentContent];
  const recent = allChapters.slice(-3);

  if (recent.length < 3) return [];

  const violations: PostWriteViolation[] = [];

  // Check endings: are all recent chapters ending at night?
  const nightEndings = recent.filter((ch) => nightRe.test(extractChapterTail(ch)));
  if (nightEndings.length === recent.length) {
    violations.push(
      language === "en"
        ? {
            rule: "Temporal homogeneity",
            severity: "warning",
            description: `All ${recent.length} recent chapters end at night. Repetitive time anchors create a lullaby rhythm that numbs tension.`,
            suggestion: "Break at a different moment: mid-afternoon confrontation, pre-dawn alarm, a sentence cut short at high noon. Time variety is a suspense tool.",
          }
        : {
            rule: "时间节奏同质化",
            severity: "warning",
            description: `最近${recent.length}章全部以夜晚收尾（月光/深夜/关灯/夜色等），时间锚点高度重复。`,
            suggestion: "换一个时刻断章：午后对决中断、正午阳光下来客、凌晨异响惊醒、黄昏对话戛然而止。时间本身就是悬念工具。",
          },
    );
  }

  // Check openings: are all recent chapters starting in the morning?
  const morningOpenings = recent.filter((ch) => morningRe.test(extractChapterHead(ch)));
  if (morningOpenings.length === recent.length) {
    violations.push(
      language === "en"
        ? {
            rule: "Temporal homogeneity",
            severity: "warning",
            description: `All ${recent.length} recent chapters open at dawn/morning. The "wake up and start a new day" pattern is the most common AI cadence trap.`,
            suggestion: "Open mid-scene: the fight is already underway, the conversation has been going for ten minutes, the train is already moving. Skip the sunrise.",
          }
        : {
            rule: "时间节奏同质化",
            severity: "warning",
            description: `最近${recent.length}章全部以清晨/天亮开场，"一觉醒来开始新的一天"是最常见的AI节奏陷阱。`,
            suggestion: "从场景中间切入：打斗已经开始了、对话已经进行了十分钟、车已经开动了。跳过日出。",
          },
    );
  }

  return violations;
}

function isDialogueParagraph(paragraph: string): boolean {
  const trimmed = paragraph.trim();
  // Match all opening dialogue marks: Chinese/Japanese brackets, double quotes (smart & straight),
  // single quotes (straight & smart), and em-dash dialogue
  return /^[""「『''"'《]/.test(trimmed) || /^——/.test(trimmed);
}

function analyzeParagraphShape(content: string, language: "zh" | "en"): ParagraphShape {
  const paragraphs = extractParagraphs(content);
  // Exclude dialogue lines from short paragraph counting — dialogue is naturally short
  const narrativeParagraphs = paragraphs.filter((p) => !isDialogueParagraph(p));
  const shortThreshold = language === "en" ? 120 : 35;
  const shortParagraphs = narrativeParagraphs.filter((paragraph) => paragraph.length < shortThreshold);
  const averageLength = paragraphs.length > 0
    ? paragraphs.reduce((sum, paragraph) => sum + paragraph.length, 0) / paragraphs.length
    : 0;

  let maxConsecutiveShort = 0;
  let currentConsecutive = 0;
  for (const paragraph of narrativeParagraphs) {
    if (paragraph.length < shortThreshold) {
      currentConsecutive++;
      maxConsecutiveShort = Math.max(maxConsecutiveShort, currentConsecutive);
    } else {
      currentConsecutive = 0;
    }
  }

  return {
    paragraphs,
    shortThreshold,
    shortParagraphs,
    shortRatio: narrativeParagraphs.length > 0 ? shortParagraphs.length / narrativeParagraphs.length : 0,
    averageLength,
    maxConsecutiveShort,
  };
}

function extractParagraphs(content: string): string[] {
  return content
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter((paragraph) => paragraph.length > 0)
    .filter((paragraph) => paragraph !== "---")
    .filter((paragraph) => !paragraph.startsWith("#"));
}

/** Split text into sentences, respecting quote boundaries. */
export function splitSentences(text: string): string[] {
  const sentences: string[] = [];
  let current = "";
  let inQuote = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i]!;
    current += ch;

    // Opening quotes: enter quoted mode
    if (ch === '"' || ch === "“" || ch === "'" || ch === "'" || ch === "‘" || ch === "「" || ch === "『") {
      if (!inQuote) { inQuote = true; continue; }
    }
    // Closing quotes: exit quoted mode and split
    if (ch === '"' || ch === "”" || ch === "'" || ch === "’" || ch === "」" || ch === "』") {
      if (inQuote) {
        inQuote = false;
        const trimmed = current.trim();
        if (trimmed.length > 0) sentences.push(trimmed);
        current = "";
        continue;
      }
    }
    if (inQuote) continue;

    // Ellipsis: consume entire "…" sequence; split after it + trailing sentence-ending punctuation
    if (ch === "…") {
      while (i + 1 < text.length && text[i + 1] === "…") {
        i++;
        current += text[i]!;
      }
      // Consume trailing sentence-ending punctuation (e.g. ……。)
      if (i + 1 < text.length && (text[i + 1] === "。" || text[i + 1] === "！" || text[i + 1] === "？")) {
        i++;
        current += text[i]!;
      }
      const trimmed = current.trim();
      if (trimmed.length > 0) sentences.push(trimmed);
      current = "";
      continue;
    }

    // Standard sentence-ending punctuation
    if (ch === "。" || ch === "！" || ch === "？" || ch === "." || ch === "!" || ch === "?") {
      const trimmed = current.trim();
      if (trimmed.length > 0) sentences.push(trimmed);
      current = "";
    }
  }

  const trimmed = current.trim();
  if (trimmed.length > 0) sentences.push(trimmed);
  return sentences;
}

const ENGLISH_NAME_STOP_WORDS = new Set([
  "The",
  "And",
  "But",
  "When",
  "While",
  "After",
  "Before",
  "Even",
  "Then",
  "They",
]);

const CHINESE_TITLE_STOP_WORDS = new Set([
  "这次",
  "正文",
  "标题",
  "重复",
  "不同",
  "完全",
  "只是",
  "碰巧",
  "没有",
  "回头",
]);

const CHINESE_TITLE_STOP_CHARS = new Set(["的", "了", "着", "一", "只", "从", "在", "和", "与", "把", "被", "有", "没", "里", "又", "才"]);

/**
 * Detect duplicate or near-duplicate chapter titles.
 * Compares the new title against existing chapter titles from index.
 */
export function detectDuplicateTitle(
  newTitle: string,
  existingTitles: ReadonlyArray<string>,
): ReadonlyArray<PostWriteViolation> {
  if (!newTitle.trim()) return [];

  const normalized = newTitle.trim().toLowerCase();
  const violations: PostWriteViolation[] = [];

  for (const existing of existingTitles) {
    const existingNorm = existing.trim().toLowerCase();
    if (!existingNorm) continue;

    // Exact match
    if (normalized === existingNorm) {
      violations.push({
        rule: "duplicate-title",
        severity: "warning",
        description: `章节标题"${newTitle}"与已有章节标题完全相同`,
        suggestion: "更换一个不同的章节标题",
      });
      break;
    }

    // Near-duplicate: one is substring of the other, or only differs by punctuation/numbers
    const stripPunct = (s: string) => s.replace(/[^\p{L}\p{N}]/gu, "");
    if (stripPunct(normalized) === stripPunct(existingNorm)) {
      violations.push({
        rule: "near-duplicate-title",
        severity: "warning",
        description: `章节标题"${newTitle}"与已有标题"${existing}"高度相似`,
        suggestion: "避免使用相似的章节标题",
      });
      break;
    }
  }

  return violations;
}

/**
 * Detect generic/default chapter titles that indicate the LLM failed to provide a meaningful title.
 * Patterns: "第23章", "Chapter 23", or empty.
 */
export function detectGenericTitle(
  title: string,
  chapterNumber: number,
  language: "zh" | "en" = "zh",
): ReadonlyArray<PostWriteViolation> {
  const trimmed = title.trim();
  if (!trimmed) {
    return [{
      rule: language === "en" ? "empty-title" : "空标题",
      severity: "warning",
      description: language === "en"
        ? `Chapter ${chapterNumber} has no title. The LLM failed to output a === CHAPTER_TITLE === tag.`
        : `第${chapterNumber}章没有标题，LLM 未输出 === CHAPTER_TITLE === 标签`,
      suggestion: language === "en"
        ? "Re-run with a title generation prompt or manually assign a title."
        : "重新生成或手动为章节命名",
    }];
  }

  // Reject single-character Chinese titles (e.g. "静", "寻") — too short to be meaningful
  if (language !== "en" && trimmed.length < 2) {
    return [{
      rule: "短标题",
      severity: "warning",
      description: `章节标题"${trimmed}"过短（${trimmed.length}字），最少需要2个字`,
      suggestion: "建议重新生成或手动赋予一个2-4字标题",
    }];
  }

  // Reject single-word English titles (e.g. "Silence") — too short to be meaningful
  if (language === "en" && /^\S+$/.test(trimmed)) {
    return [{
      rule: "short-title",
      severity: "warning",
      description: `Chapter title "${trimmed}" is a single word — too short to be meaningful.`,
      suggestion: "Re-run or manually assign a 2-4 word title.",
    }];
  }

  const isGeneric = language === "en"
    ? /^Chapter\s+\d+$/i.test(trimmed)
    : /^第\s*\d+\s*章$/.test(trimmed);

  if (!isGeneric) return [];

  return [{
    rule: language === "en" ? "generic-title" : "默认标题",
    severity: "warning",
    description: language === "en"
      ? `Chapter title "${trimmed}" is the default placeholder — no meaningful title was generated.`
      : `章节标题"${trimmed}"是默认占位符，未生成有意义的标题`,
    suggestion: language === "en"
      ? "The LLM failed to follow the === CHAPTER_TITLE === output format. Consider re-running or manually assigning a 2-4 word title."
      : "LLM 未遵循 === CHAPTER_TITLE === 输出格式。建议重新生成或手动赋予一个2-4字标题",
  }];
}

export function resolveDuplicateTitle(
  newTitle: string,
  existingTitles: ReadonlyArray<string>,
  language: "zh" | "en" = "zh",
  options?: {
    readonly content?: string;
  },
): {
  readonly title: string;
  readonly issues: ReadonlyArray<PostWriteViolation>;
} {
  const trimmed = newTitle.trim();
  if (!trimmed) {
    return { title: newTitle, issues: [] };
  }

  const duplicateIssues = detectDuplicateTitle(trimmed, existingTitles);
  if (duplicateIssues.length > 0) {
    const regenerated = regenerateDuplicateTitle(trimmed, existingTitles, language, options?.content);
    if (regenerated && detectDuplicateTitle(regenerated, existingTitles).length === 0) {
      return { title: regenerated, issues: duplicateIssues };
    }

    let counter = 2;
    while (counter < 100) {
      const candidate = language === "en"
        ? `${trimmed} (${counter})`
        : `${trimmed}（${counter}）`;
      if (detectDuplicateTitle(candidate, existingTitles).length === 0) {
        return { title: candidate, issues: duplicateIssues };
      }
      counter++;
    }

    return { title: trimmed, issues: duplicateIssues };
  }

  const collapseIssues = detectTitleCollapse(trimmed, existingTitles, language);
  if (collapseIssues.length === 0) {
    return { title: trimmed, issues: [] };
  }

  const regenerated = regenerateCollapsedTitle(trimmed, existingTitles, language, options?.content);
  if (
    regenerated
    && detectDuplicateTitle(regenerated, existingTitles).length === 0
    && detectTitleCollapse(regenerated, existingTitles, language).length === 0
  ) {
    return { title: regenerated, issues: collapseIssues };
  }

  return { title: trimmed, issues: collapseIssues };
}

function detectTitleCollapse(
  newTitle: string,
  existingTitles: ReadonlyArray<string>,
  language: "zh" | "en",
): ReadonlyArray<PostWriteViolation> {
  const recentTitles = existingTitles
    .map((title) => title.trim())
    .filter(Boolean)
    .slice(-3);
  if (recentTitles.length < 3) {
    return [];
  }

  const cadence = analyzeChapterCadence({
    language,
    rows: [...recentTitles, newTitle].map((title, index) => ({
      chapter: index + 1,
      title,
      mood: "",
      chapterType: "",
    })),
  });
  const titlePressure = cadence.titlePressure;
  if (!titlePressure || titlePressure.pressure !== "high") {
    return [];
  }
  if (!newTitle.includes(titlePressure.repeatedToken)) {
    return [];
  }

  return [
    language === "en"
      ? {
          rule: "title-collapse",
          severity: "warning",
          description: `Chapter title "${newTitle}" keeps leaning on the recent "${titlePressure.repeatedToken}" title shell.`,
          suggestion: "Rename the chapter around a new image, action, consequence, or character focus.",
        }
      : {
          rule: "title-collapse",
          severity: "warning",
          description: `章节标题"${newTitle}"仍在沿用近期围绕“${titlePressure.repeatedToken}”的命名壳。`,
          suggestion: "换一个新的意象、动作、后果或人物焦点来命名。",
        },
  ];
}

function regenerateDuplicateTitle(
  baseTitle: string,
  existingTitles: ReadonlyArray<string>,
  language: "zh" | "en",
  content?: string,
): string | undefined {
  if (!content || !content.trim()) {
    return undefined;
  }

  const qualifier = language === "en"
    ? extractEnglishTitleQualifier(baseTitle, existingTitles, content)
    : extractChineseTitleQualifier(baseTitle, existingTitles, content);
  if (!qualifier) {
    return undefined;
  }

  return language === "en"
    ? `${baseTitle}: ${qualifier}`
    : `${baseTitle}：${qualifier}`;
}

function regenerateCollapsedTitle(
  baseTitle: string,
  existingTitles: ReadonlyArray<string>,
  language: "zh" | "en",
  content?: string,
): string | undefined {
  if (!content || !content.trim()) {
    return undefined;
  }

  const fresh = language === "en"
    ? extractEnglishTitleQualifier(baseTitle, existingTitles, content)
    : extractChineseTitleQualifier(baseTitle, existingTitles, content);
  if (!fresh) {
    return undefined;
  }

  return fresh === baseTitle ? undefined : fresh;
}

function extractEnglishTitleQualifier(
  baseTitle: string,
  existingTitles: ReadonlyArray<string>,
  content: string,
): string | undefined {
  const blocked = new Set(extractEnglishTitleTerms([baseTitle, ...existingTitles].join(" ")));
  const words = (content.match(/[A-Za-z]{4,}/g) ?? [])
    .map((word) => word.toLowerCase())
    .filter((word) => !ENGLISH_NAME_STOP_WORDS.has(capitalize(word)))
    .filter((word) => !blocked.has(word));
  const first = words[0];
  if (!first) {
    return undefined;
  }

  const second = words.find((word) => word !== first && !blocked.has(word));
  return second
    ? `${capitalize(first)} ${capitalize(second)}`
    : capitalize(first);
}

function extractChineseTitleQualifier(
  baseTitle: string,
  existingTitles: ReadonlyArray<string>,
  content: string,
): string | undefined {
  const blocked = new Set(extractChineseTitleTerms([baseTitle, ...existingTitles].join("")));
  const segments = content.match(/[\u4e00-\u9fff]+/g) ?? [];

  for (const segment of segments) {
    for (let start = 0; start < segment.length; start += 1) {
      for (let size = 2; size <= 4; size += 1) {
        const candidate = segment.slice(start, start + size).trim();
        if (candidate.length < 2) continue;
        if (CHINESE_TITLE_STOP_WORDS.has(candidate)) continue;
        if ([...candidate].some((char) => CHINESE_TITLE_STOP_CHARS.has(char))) continue;
        if (blocked.has(candidate)) continue;
        return candidate;
      }
    }
  }

  return undefined;
}

function extractEnglishTitleTerms(text: string): string[] {
  return [...new Set((text.match(/[A-Za-z]{4,}/g) ?? []).map((word) => word.toLowerCase()))];
}

function extractChineseTitleTerms(text: string): string[] {
  const terms = new Set<string>();
  const segments = text.match(/[\u4e00-\u9fff]+/g) ?? [];

  for (const segment of segments) {
    for (let start = 0; start < segment.length; start += 1) {
      for (let size = 2; size <= 4; size += 1) {
        const candidate = segment.slice(start, start + size).trim();
        if (candidate.length < 2) continue;
        if ([...candidate].some((char) => CHINESE_TITLE_STOP_CHARS.has(char))) continue;
        terms.add(candidate);
      }
    }
  }

  return [...terms];
}

function capitalize(word: string): string {
  return word.length === 0 ? word : `${word[0]!.toUpperCase()}${word.slice(1)}`;
}

/** Stop words that carry no discriminative value for mustKeep matching. */
const MUST_KEEP_STOP_WORDS = new Set([
  "的", "了", "着", "在", "和", "与", "是", "有", "不", "到",
  "被", "把", "从", "对", "也", "就", "都", "而", "及", "或",
]);

/**
 * Extract key terms from a mustKeep item for fuzzy matching.
 * Returns bigram (2-char) substrings from Chinese segments, filtering out stop words.
 */
function extractMustKeepTerms(item: string): ReadonlyArray<string> {
  const terms: string[] = [];
  const segments = item.match(/[一-鿿]+/g) ?? [];
  for (const segment of segments) {
    for (let i = 0; i < segment.length - 1; i++) {
      const bigram = segment.slice(i, i + 2);
      if (MUST_KEEP_STOP_WORDS.has(bigram)) continue;
      terms.push(bigram);
    }
  }
  return [...new Set(terms)];
}

/**
 * Validate that mustKeep constraints are reflected in generated content.
 * For each mustKeep item, extracts key terms and checks if ≥2/3 appear in content.
 * Returns violations for items that appear to be missing.
 */
export function validateMustKeepCompliance(
  content: string,
  mustKeepItems: ReadonlyArray<string>,
  language: "zh" | "en" = "zh",
): ReadonlyArray<PostWriteViolation> {
  if (!mustKeepItems || mustKeepItems.length === 0) return [];
  if (!content || content.length < 50) return [];

  const violations: PostWriteViolation[] = [];

  for (const item of mustKeepItems) {
    const trimmed = item.trim().slice(0, 50);
    if (!trimmed) continue;

    // Direct substring check — if the full item appears, it's compliant
    if (content.includes(trimmed)) continue;

    const terms = extractMustKeepTerms(trimmed);
    if (terms.length === 0) continue;

    const matchedCount = terms.filter((t) => content.includes(t)).length;
    const threshold = Math.ceil(terms.length * (2 / 3));

    if (matchedCount < threshold) {
      violations.push({
        rule: language === "en" ? "mustKeep compliance" : "mustKeep 合规",
        severity: "warning",
        description: language === "en"
          ? `Must-keep constraint "${trimmed}" appears absent from chapter content (${matchedCount}/${terms.length} key terms found).`
          : `mustKeep 约束"${trimmed}"在章节正文中似乎未体现（匹配${matchedCount}/${terms.length}个关键词）`,
        suggestion: language === "en"
          ? `Ensure the chapter content reflects: "${trimmed}"`
          : `请确保章节内容体现：「${trimmed}」`,
      });
    }
  }

  return violations;
}

/** Detect overuse of simile markers (像/像是/宛如/犹如/仿佛). */
export function detectSimileOveruse(
  content: string,
  language: "zh" | "en" = "zh",
): ReadonlyArray<PostWriteViolation> {
  const violations: PostWriteViolation[] = [];
  if (language !== "zh") return violations;

  const charCount = content.replace(/\s/g, "").length;
  if (charCount === 0) return violations;

  const SPECULATIVE_VERBS = /^[想记忘知道觉有要会能]/;
  const similePattern = /(像是|好像|宛如|犹如|仿佛|像)([^，。！？\n]{5,40})/g;
  let match: RegExpExecArray | null;
  let simileCount = 0;
  const samples: string[] = [];
  while ((match = similePattern.exec(content)) !== null) {
    const afterMarker = match[2]!.trimStart();
    if (afterMarker.length > 0 && SPECULATIVE_VERBS.test(afterMarker[0]!)) continue;
    simileCount++;
    if (samples.length < 3) samples.push(`"${match[0].slice(0, 20)}"`);
  }

  const density = simileCount / (charCount / 1000);
  if (density > 3) {
    violations.push({
      rule: "明喻密度过高",
      severity: "warning",
      description: `明喻出现${simileCount}次（密度${density.toFixed(1)}次/千字，阈值>3），${samples.join("、")}等`,
      suggestion: "用直接描写替代明喻：✗'像一块石头' → ✓'一动不动地站着'",
    });
  }
  return violations;
}

/** Detect cross-chapter simile repetition via 8-char fingerprint. */
export function detectCrossChapterSimile(
  currentContent: string,
  recentChaptersContent: string,
  language: "zh" | "en" = "zh",
): ReadonlyArray<PostWriteViolation> {
  if (!recentChaptersContent || recentChaptersContent.length < 100) return [];
  if (language !== "zh") return [];

  const violations: PostWriteViolation[] = [];
  const similePattern = /(?:像是|宛如|犹如|仿佛|像)([^，。！？\n]{2,})/g;
  const SPECULATIVE = /^[想记忘知道觉有要会能]/;

  const recentFingerprints = new Set<string>();
  let m: RegExpExecArray | null;
  while ((m = similePattern.exec(recentChaptersContent)) !== null) {
    const after = m[1]!.trimStart();
    if (after.length > 0 && SPECULATIVE.test(after[0]!)) continue;
    const obj = after.replace(/[\s\n\r]/g, "").slice(0, 8);
    if (obj.length >= 4) recentFingerprints.add(obj);
  }

  const repeated: string[] = [];
  similePattern.lastIndex = 0;
  while ((m = similePattern.exec(currentContent)) !== null) {
    const after = m[1]!.trimStart();
    if (after.length > 0 && SPECULATIVE.test(after[0]!)) continue;
    const obj = after.replace(/[\s\n\r]/g, "").slice(0, 8);
    if (obj.length >= 4 && recentFingerprints.has(obj)) {
      repeated.push(`"${m[0].slice(0, 20)}"`);
    }
  }

  if (repeated.length >= 1) {
    violations.push({
      rule: "跨章比喻重复",
      severity: "warning",
      description: `${repeated.length}个比喻与近期章节重复：${[...new Set(repeated)].slice(0, 3).join("、")}`,
      suggestion: "换用不同的意象或直接描写，避免跨章使用相同比喻",
    });
  }
  return violations;
}

// ── detectExcessiveMonologue ─────────────────────────────────────────────

/** Count non-punctuation, non-space characters (Chinese chars + letters + digits). */
function countWords(text: string): number {
  return text.replace(/[\s\p{P}]/gu, "").length;
}

const EMOTION_DECLARATION_WORDS = [
  "感到", "感受到", "心中涌起", "心头一震", "心中一紧", "心中暗想", "心想",
  "心中不禁", "内心深处", "不由得想到", "暗暗想到", "心里明白", "心知肘明",
  "他终于明白", "她终于明白", "这一刻他终于", "这一刻她终于", "他终于懂了",
  "她终于懂了", "他终于意识到", "她终于意识到", "他心中暗道", "她心中暗道",
];

const COGNITIVE_METAPHOR_WORDS = [
  "记忆的闸门", "往昔的画面", "底下有个声音", "心底响起", "灵魂深处",
  "脑海中浮现", "记忆涌上心头", "仿佛回到了", "一切如同梦中", "思绪万千",
  "百感交集", "五味杂陈", "感慨万千", "万千思绪", "心潮起伏",
];

const ANALYTICAL_TERMS = [
  "这意味着", "如此一来", "换言之", "也就是说", "不难看出", "可以预见",
  "毫无疑问", "毫无疑义", "从某种意义上", "在这种情况下", "面对这样的局面",
  "权衡利弊", "综合考虑", "仔细分析", "从逻辑上看", "理性地想",
  "最优解", "最大化", "风险收益", "利大于弊", "弊大于利",
  "核心矛盾", "根本问题", "本质原因", "深层原因",
  "摆在面前的只有两条路", "他心里盘算", "她暗自盘算",
];

const ANALYTICAL_PATTERNS: readonly RegExp[] = [
  /如果.{1,20}那么/,
  /之所以.{1,20}是因为/,
  /不是因为.{1,20}而是因为/,
];

const ACTION_VERBS = new Set([
  "走", "跑", "站", "坐", "躺", "拿", "抓", "握", "推", "拉", "打", "踢", "杀", "刺", "砍",
  "拔", "收", "放", "扔", "捡", "转身", "回头", "抬头", "低头", "点头", "摇头",
  "深吸", "吐出", "咬牙", "攥紧", "拍", "敲", "举", "伸", "摸", "抱",
]);

const DIALOGUE_ATTRIBUTION = new Set([
  "开口", "沉声", "冷声", "厉声", "喝道", "喊道", "笑道", "叹道", "怒道", "低声道",
  "淡淡道", "缓缓道", "冷冷道", "哑声道", "沙哑道",
]);

const SCENE_WORDS = new Set([
  "门外", "窗外", "远处", "前方", "身后", "头顶", "脚下", "院子里", "大殿上",
  "天边", "山顶", "城墙", "大门", "长廊", "阶梯", "街道", "巷口", "马上", "船上",
]);

const PSYCHO_WORDS: readonly string[] = [
  "感到", "心想", "暗想", "明白", "知道", "觉得", "意识到",
  "回忆", "想起", "盘算", "琢磨", "思忖", "寻思", "暗道",
  "恐惧", "愤怒", "悲伤", "喜悦", "惊讶", "厌恶", "焦虑",
  "心中", "内心", "脑海", "心底", "心里",
];

function containsAny(text: string, words: readonly string[]): boolean {
  return words.some((w) => text.includes(w));
}

function containsAnyPattern(text: string, patterns: readonly RegExp[]): boolean {
  return patterns.some((p) => p.test(text));
}

function containsActionOrDialogue(text: string): boolean {
  for (const v of ACTION_VERBS) { if (text.includes(v)) return true; }
  for (const d of DIALOGUE_ATTRIBUTION) { if (text.includes(d)) return true; }
  for (const s of SCENE_WORDS) { if (text.includes(s)) return true; }
  return false;
}

/** Rule A: Detect emotion declaration sentences. */
function detectEmotionDeclarations(
  content: string,
  wordCount: number,
): PostWriteViolation[] {
  if (wordCount < 500) return [];
  const violations: PostWriteViolation[] = [];
  const allTriggerWords = [...EMOTION_DECLARATION_WORDS, ...COGNITIVE_METAPHOR_WORDS];
  const maxAllowed = Math.floor(wordCount / 3000) * 3;
  let triggered = 0;

  const paragraphs = extractParagraphs(content);
  for (const para of paragraphs) {
    if (isDialogueParagraph(para)) continue;
    const sentences = splitSentences(para);
    for (const sentence of sentences) {
      const sWords = countWords(sentence);
      if (sWords <= 15 && !containsAny(sentence, ANALYTICAL_TERMS)) continue;
      if (containsAny(sentence, allTriggerWords)) {
        triggered++;
        if (triggered > maxAllowed) {
          violations.push({
            rule: "excessive-monologue",
            severity: "warning",
            description: `情绪声明：'${sentence.slice(0, 30)}'`,
            suggestion: "用动作外化情绪，不直接告诉读者角色的感受",
          });
        }
      }
    }
  }
  return violations;
}

/** Rule B: Detect analytical reasoning sentences. */
function detectAnalyticalReasoning(
  content: string,
  wordCount: number,
): PostWriteViolation[] {
  if (wordCount < 500) return [];
  const violations: PostWriteViolation[] = [];
  const maxAllowed = Math.floor(wordCount / 3000) * 2;
  let triggered = 0;

  const paragraphs = extractParagraphs(content);
  for (const para of paragraphs) {
    if (isDialogueParagraph(para)) continue;
    const sentences = splitSentences(para);
    for (const sentence of sentences) {
      if (countWords(sentence) <= 15) continue;
      if (containsAny(sentence, ANALYTICAL_TERMS) || containsAnyPattern(sentence, ANALYTICAL_PATTERNS)) {
        triggered++;
        if (triggered > maxAllowed) {
          violations.push({
            rule: "analytical-monologue",
            severity: "warning",
            description: `分析式推理：'${sentence.slice(0, 30)}'`,
            suggestion: "禁止报告式内心戏，用对话或动作替代",
          });
        }
      }
    }
  }
  return violations;
}

/** Determine if a paragraph is dominated by monologue. */
function isMonologueParagraph(para: string): boolean {
  if (isDialogueParagraph(para)) return false;
  const hasQuote = /["“”‘’「」『』]/.test(para);
  if (hasQuote) return false;
  if (containsActionOrDialogue(para)) {
    const sentences = splitSentences(para);
    if (sentences.length < 3) return false;
    const monoCount = sentences.filter(
      (s) => !containsActionOrDialogue(s) && containsAny(s, PSYCHO_WORDS),
    ).length;
    return monoCount / sentences.length >= 0.6;
  }
  return containsAny(para, PSYCHO_WORDS);
}

/** Rule C: Detect consecutive monologue paragraphs. */
function detectConsecutiveMonologue(
  content: string,
  consecutiveMax: number,
): PostWriteViolation[] {
  const violations: PostWriteViolation[] = [];
  const paragraphs = extractParagraphs(content);
  const filtered = paragraphs.filter(
    (p) => !p.startsWith("#") && !p.startsWith("---") && p.length > 0,
  );
  if (filtered.length < 5) return [];

  const monoFlags = filtered.map((p) => isMonologueParagraph(p));

  let runStart = -1;
  let runLen = 0;
  for (let i = 0; i < monoFlags.length; i++) {
    if (monoFlags[i]) {
      if (runStart === -1) runStart = i;
      runLen++;
    } else {
      if (runLen >= consecutiveMax + 1) {
        violations.push({
          rule: "consecutive-monologue",
          severity: "warning",
          description: `连续 ${runLen} 段内心独白主导（第 ${runStart + 1}-${runStart + runLen} 段）`,
          suggestion: "用对话、动作或场景切换打断连续独白",
        });
      }
      runStart = -1;
      runLen = 0;
    }
  }
  if (runLen >= consecutiveMax + 1) {
    violations.push({
      rule: "consecutive-monologue",
      severity: "warning",
      description: `连续 ${runLen} 段内心独白主导（第 ${runStart + 1}-${runStart + runLen} 段）`,
      suggestion: "用对话、动作或场景切换打断连续独白",
    });
  }
  return violations;
}

/** Rule D: Detect chapter-wide monologue ratio. */
function detectMonologueRatio(
  content: string,
  wordCount: number,
  ratioMax: number,
): PostWriteViolation[] {
  if (wordCount < 500) return [];
  const paragraphs = extractParagraphs(content);
  const filtered = paragraphs.filter(
    (p) => !p.startsWith("#") && !p.startsWith("---") && p.length > 0,
  );

  let monoWords = 0;
  for (const para of filtered) {
    if (isMonologueParagraph(para)) {
      monoWords += countWords(para);
    }
  }

  const ratio = monoWords / wordCount;
  if (ratio > ratioMax) {
    return [{
      rule: "monologue-ratio",
      severity: "warning",
      description: `全章独白占比 ${(ratio * 100).toFixed(1)}%（${monoWords}/${wordCount}字），超过阈值 ${ratioMax * 100}%`,
      suggestion: "压缩内心戏，增加对话和动作推进情节",
    }];
  }
  return [];
}

/**
 * Detect excessive monologue / stream-of-consciousness in chapter content.
 * Four rules: emotion declarations (A), analytical reasoning (B),
 * consecutive monologue paragraphs (C), chapter-wide monologue ratio (D).
 */
export function detectExcessiveMonologue(
  content: string,
  language: "zh" | "en" = "zh",
  options?: { monologueRatioMax?: number; consecutiveMax?: number },
): readonly PostWriteViolation[] {
  if (language !== "zh") return [];
  try {
    const wordCount = countWords(content);
    const ratioMax = options?.monologueRatioMax ?? 0.30;
    const consecutiveMax = options?.consecutiveMax ?? 2;

    return [
      ...detectEmotionDeclarations(content, wordCount),
      ...detectAnalyticalReasoning(content, wordCount),
      ...detectConsecutiveMonologue(content, consecutiveMax),
      ...detectMonologueRatio(content, wordCount, ratioMax),
    ];
  } catch (e) {
    console.warn("[detectExcessiveMonologue] failed:", e);
    return [];
  }
}
