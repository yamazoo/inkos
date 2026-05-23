import { BaseAgent } from "./base.js";
import type { GenreProfile } from "../models/genre-profile.js";
import type { BookRules } from "../models/book-rules.js";
import type { FanficMode } from "../models/book.js";
import type { ChapterMemo, ContextPackage, RuleStack } from "../models/input-governance.js";
import { readGenreProfile, readBookLanguage, readBookRules } from "./rules-reader.js";
import { getFanficDimensionConfig, FANFIC_DIMENSIONS } from "./fanfic-dimensions.js";
import { readFile, readdir } from "node:fs/promises";
import { filterHooks, filterSummaries, filterSubplots, filterEmotionalArcs, filterCharacterMatrix } from "../utils/context-filter.js";
import { buildGovernedMemoryEvidenceBlocks } from "../utils/governed-context.js";
import {
  readCurrentStateWithFallback,
  readCharacterContext,
  readVolumeMap,
} from "../utils/outline-paths.js";
import { join } from "node:path";
import { extractTemporalMarkers, formatTemporalMarkerBlock } from "../utils/temporal-markers.js";
import { loadTimeline, computeDeterministicTimelineIssues, formatTimelineAuditSummary } from "../utils/timeline.js";

export interface AuditResult {
  readonly passed: boolean;
  readonly issues: ReadonlyArray<AuditIssue>;
  readonly summary: string;
  /** 0-100 overall quality score. Present when the auditor supports scoring. */
  readonly overallScore?: number;
  readonly tokenUsage?: {
    readonly promptTokens: number;
    readonly completionTokens: number;
    readonly totalTokens: number;
  };
}

export interface AuditIssue {
  readonly severity: "critical" | "warning" | "info";
  readonly category: string;
  readonly description: string;
  readonly suggestion: string;
}

type PromptLanguage = "zh" | "en";

const DIMENSION_LABELS: Record<number, { readonly zh: string; readonly en: string }> = {
  1: { zh: "OOC检查", en: "OOC Check" },
  2: { zh: "时间线检查", en: "Timeline Check" },
  3: { zh: "设定冲突", en: "Lore Conflict Check" },
  4: { zh: "战力崩坏", en: "Power Scaling Check" },
  5: { zh: "数值检查", en: "Numerical Consistency Check" },
  6: { zh: "伏笔检查", en: "Hook Check" },
  7: { zh: "节奏检查", en: "Pacing Check" },
  8: { zh: "文风检查", en: "Style Check" },
  9: { zh: "信息越界", en: "Information Boundary Check" },
  10: { zh: "词汇疲劳", en: "Lexical Fatigue Check" },
  11: { zh: "利益链断裂", en: "Incentive Chain Check" },
  12: { zh: "年代考据", en: "Era Accuracy Check" },
  13: { zh: "配角降智", en: "Side Character Competence Check" },
  14: { zh: "配角工具人化", en: "Side Character Instrumentalization Check" },
  15: { zh: "爽点虚化", en: "Payoff Dilution Check" },
  16: { zh: "台词失真", en: "Dialogue Authenticity Check" },
  17: { zh: "流水账", en: "Chronicle Drift Check" },
  18: { zh: "知识库污染", en: "Knowledge Base Pollution Check" },
  19: { zh: "视角一致性", en: "POV Consistency Check" },
  20: { zh: "段落等长", en: "Paragraph Uniformity Check" },
  21: { zh: "套话密度", en: "Cliche Density Check" },
  22: { zh: "公式化转折", en: "Formulaic Twist Check" },
  23: { zh: "列表式结构", en: "List-like Structure Check" },
  24: { zh: "支线停滞", en: "Subplot Stagnation Check" },
  25: { zh: "弧线平坦", en: "Arc Flatline Check" },
  26: { zh: "节奏单调", en: "Pacing Monotony Check" },
  27: { zh: "敏感词检查", en: "Sensitive Content Check" },
  28: { zh: "正传事件冲突", en: "Mainline Canon Event Conflict" },
  29: { zh: "未来信息泄露", en: "Future Knowledge Leak Check" },
  30: { zh: "世界规则跨书一致性", en: "Cross-Book World Rule Check" },
  31: { zh: "番外伏笔隔离", en: "Spinoff Hook Isolation Check" },
  32: { zh: "读者期待管理", en: "Reader Expectation Check" },
  33: { zh: "章节备忘偏离", en: "Chapter Memo Drift Check" },
  34: { zh: "角色还原度", en: "Character Fidelity Check" },
  35: { zh: "世界规则遵守", en: "World Rule Compliance Check" },
  36: { zh: "关系动态", en: "Relationship Dynamics Check" },
  37: { zh: "正典事件一致性", en: "Canon Event Consistency Check" },
  38: { zh: "细纲落地检查", en: "Outline Compliance Check" },
  39: { zh: "章内叙事节拍重复", en: "Within-Chapter Beat Repetition" },
  40: { zh: "意识流/内心戏检查", en: "Stream-of-Consciousness Check" },
};

function containsChinese(text: string): boolean {
  return /[\u4e00-\u9fff]/u.test(text);
}

function resolveGenreLabel(genreId: string, profileName: string, language: PromptLanguage): string {
  if (language === "zh" || !containsChinese(profileName)) {
    return profileName;
  }

  if (genreId === "other") {
    return "general";
  }

  return genreId.replace(/[_-]+/g, " ");
}

function dimensionName(id: number, language: PromptLanguage): string | undefined {
  return DIMENSION_LABELS[id]?.[language];
}

function joinLocalized(items: ReadonlyArray<string>, language: PromptLanguage): string {
  return items.join(language === "en" ? ", " : "、");
}

function formatFanficSeverityNote(
  severity: "critical" | "warning" | "info",
  language: PromptLanguage,
): string {
  if (language === "en") {
    return severity === "critical"
      ? "Strict check."
      : severity === "info"
        ? "Log only; do not fail the chapter."
        : "Warning level.";
  }

  return severity === "critical"
    ? "（严格检查）"
    : severity === "info"
      ? "（仅记录，不判定失败）"
      : "（警告级别）";
}

function buildDimensionNote(
  id: number,
  language: PromptLanguage,
  gp: GenreProfile,
  bookRules: BookRules | null,
  fanficMode: FanficMode | undefined,
  fanficConfig: ReturnType<typeof getFanficDimensionConfig> | undefined,
): string {
  const words = bookRules?.fatigueWordsOverride && bookRules.fatigueWordsOverride.length > 0
    ? bookRules.fatigueWordsOverride
    : gp.fatigueWords;

  if (fanficConfig?.notes.has(id) && language === "zh") {
    return fanficConfig.notes.get(id)!;
  }

  if (id === 1 && fanficMode === "ooc") {
    return language === "en"
      ? "In OOC mode, personality drift can be intentional; record only, do not fail. Evaluate against the character dossiers in fanfic_canon.md."
      : "OOC模式下角色可偏离性格底色，此维度仅记录不判定失败。参照 fanfic_canon.md 角色档案评估偏离程度。";
  }

  if (id === 1 && fanficMode === "canon") {
    return language === "en"
      ? "Canon-faithful fanfic: characters must stay close to their original personality core. Evaluate against fanfic_canon.md character dossiers."
      : "原作向同人：角色必须严格遵守性格底色。参照 fanfic_canon.md 角色档案中的性格底色和行为模式。";
  }

  if (id === 10 && words.length > 0) {
    return language === "en"
      ? `Fatigue words: ${words.join(", ")}. Also check AI tell markers (仿佛/不禁/宛如/竟然/忽然/猛地); warn when any appears more than once per 3,000 words.`
      : `高疲劳词：${words.join("、")}。同时检查AI标记词（仿佛/不禁/宛如/竟然/忽然/猛地）密度，每3000字超过1次即warning`;
  }

  if (id === 15 && gp.satisfactionTypes.length > 0) {
    return language === "en"
      ? `Payoff types: ${gp.satisfactionTypes.join(", ")}`
      : `爽点类型：${gp.satisfactionTypes.join("、")}`;
  }

  if (id === 12 && bookRules?.eraConstraints) {
    const era = bookRules.eraConstraints;
    const parts = [era.period, era.region].filter(Boolean);
    if (parts.length > 0) {
      return language === "en"
        ? `Era: ${parts.join(", ")}`
        : `年代：${parts.join("，")}`;
    }
  }

  // v10: Enhanced dimension notes with writing methodology awareness
  if (id === 7) {
    return language === "en"
      ? "Check pacing rhythm: Do the recent 3-5 chapters form a complete mini-goal cycle (build-up → escalation → climax → aftermath)? If 5+ consecutive chapters pass without a climax (payoff/reward/reversal), flag as pacing stagnation. If the previous chapter was a climax/big reversal, does this chapter show change (relationships shifted, status changed, costs paid)? If it jumps straight to new build-up without showing impact, flag as 'post-climax impact missing'. Daily/transition scenes must carry at least one task: plant a hook, advance a relationship, set up contrast, or prepare the next cycle."
      : "检查节奏波形：最近 3-5 章是否形成了完整的「蓄压→升级→爆发→后效」周期？如果连续 5 章没有爆发（兑现/回报/翻转），标记为节奏停滞。如果上一章是爆发/高潮/大反转，本章是否写出了改变？如果直接跳到新蓄压而没有展示前一波爆发的影响，标记为「高潮后影响缺失」。非冲突章节中的日常/过渡/对话段落，是否至少承担了一项任务：埋伏笔、推关系、建立反差、准备下一轮蓄压。纯水日常标记为流水账风险。";
  }

  if (id === 15) {
    const base = gp.satisfactionTypes.length > 0
      ? (language === "en" ? `Payoff types: ${gp.satisfactionTypes.join(", ")}. ` : `爽点类型：${gp.satisfactionTypes.join("、")}。`)
      : "";
    const planNote = language === "en"
      ? `\nIf the chapter plan specifies a satisfactionType, evaluate whether that type's core narrative pattern is present in the text (e.g., "绝地反击" requires "desperation → turning point → reversal" beats). Output a verdict: "delivered" if the pattern is clearly present, "partially delivered" if only weakly evidenced, "not delivered" if absent.`
      : `\n如果 chapter plan 指定了 satisfactionType，判断该类型的核心叙事模式是否在正文中体现（如"绝地反击"需要"绝境→转折→逆转"的叙事节拍）。输出判定："delivered"（模式清晰体现）、"partially delivered"（仅弱证据）、"not delivered"（缺失）。`;
    const severityNote = language === "en"
      ? `\nSeverity grading: "not delivered" when plan specifies satisfactionType → critical. "partially delivered" → warning. Consecutive 3 chapters with no satisfaction delivery → critical. Consecutive 4 chapters of sustained high pressure (压抑/紧张/绝望) without release → critical.`
      : `\n严重等级：plan 指定 satisfactionType 但判定为 "not delivered" → critical。"partially delivered" → warning。连续 3 章无任何 satisfaction delivery → critical。连续 4 章持续高压（压抑/紧张/绝望）无释放 → critical。`;
    return language === "en"
      ? `${base}Check desire engine: Has the chapter created an emotional gap (reader wants release) OR delivered a payoff that exceeds expectations? A payoff that only satisfies 70% of built-up anticipation counts as diluted. If this chapter is in the aftermath phase of a mini-goal cycle, verify that consequences are shown — not just emotional reactions, but concrete changes to status, relationships, or resources.${planNote}${severityNote}`
      : `${base}检查欲望驱动：本章是否制造了情绪缺口（读者渴望释放）或完成了超出预期的兑现？只满足读者70%期待的兑现等于爽点虚化。如果本章处于小目标周期的后效阶段，检查是否展示了具体改变——不只是情绪反应，而是地位、关系或资源的实际变化。${planNote}${severityNote}`;
  }

  if (id === 2) {
    return language === "en"
      ? "Timeline check (three-layer): 1. Deterministic temporal marker extraction in appendix — compare numeric values for hard contradictions. 2. Timeline state summary: the ## Timeline Status block provides cross-chapter event anchors with known conflicts marked [CONFLICT!]. Verify these conflicts against the chapter text. 3. Calendar continuity: check that storyDay progression between chapters is reasonable. Report: [dimension=2] consistency verdict with specific conflicting references."
      : "时间线检查（三层）：1. 附录中的时间标记提取——对比数值检测硬矛盾。2. 时间线状态摘要：## 时间线状态 块提供了跨章事件锚点，已知矛盾标记为[矛盾!]，请对照正文验证。3. 日历连续性：检查章间 storyDay 跳跃是否合理。报告格式：[dimension=2] 一致性判定，标注具体冲突引用。";
  }

  if (id === 25) {
    return language === "en"
      ? "Cross-check character behavior against the 3-question test: (1) Why does the character do this? (2) Does it match their established profile? (3) Would a reader who only read prior chapters find it jarring? Also check if character's emotional state progresses or stagnates."
      : "人设三问检查：(1)角色为什么这么做？(2)符合之前建立的人设吗？(3)只看过前面章节的读者会觉得突兀吗？同时检查角色情绪弧线是否在推进还是停滞。";
  }

  switch (id) {
    case 6:
      // Phase 7 — hook-debt escalation. Reviewer now reads pending_hooks.md
      // not just for "is this hook undelivered" but for causal/temporal
      // debt escalation. The ledger's status column carries "过期 (距=…/半衰=…)"
      // and "受阻于 …" markers emitted by the stale/blocked detector; this
      // dimension tells the reviewer how to escalate them.
      return language === "en"
        ? `Hook-debt escalation (Phase 7 + hotfixes 2/3). Read the pending_hooks.md ledger and escalate based on the stale / blocked / core_hook / depends_on / promoted columns, NOT only on "undelivered hook present":

• Critical severity only applies to hooks with promoted=true in the ledger. A stale/blocked non-promoted hook stays at info — the promotion flag is the gate that keeps reviewer noise down, because architect-seed emits many non-load-bearing seeds.
• A promoted core_hook=true hook that has been stale for over 10 chapters → escalate from warning to critical. The book has only 3-7 core hooks; letting one drift that long is the lead symptom of narrative rot (cf. new.txt L1569).
• A promoted hook whose status cell contains "blocked on X (blocked Y chapters)" with Y >= 6 → warning. The literal "blocked Y chapters" token comes straight from the ledger — read it, don't guess. Call out the upstream hook id so the planner can route the resolution.
• At volume end (final chapter of any volume per volume_map) a promoted core_hook that is still open or stale without explicit "carried over to volume N+1" planning → critical.
• Any non-promoted stale hook → info-level log; do not fail the chapter on it, but note it so the planner can schedule cleanup.

Quote the exact hook_id in description and include the stale / blocked marker text verbatim. Structure check only — do not judge hook prose quality.`
        : `Phase 7 hook-debt 升级规则（含 hotfix 2/3）。阅读 pending_hooks.md 伏笔池时不要只看"有没有悬而未决的伏笔"，要读状态列中的 stale / blocked 标记、core_hook 列、depends_on 列、以及升级列：

• critical 级别仅适用于升级=是（promoted=true）的伏笔。非升级的 stale/blocked 伏笔一律保持 info——升级标志是降噪的开关，因为架构师阶段会产出大量非承重的伏笔种子。
• 升级=是且 core_hook=是 的伏笔过期超过 10 章未回收 → warning 升级为 critical。全书只有 3-7 条核心伏笔，任何一条漂移这么久都是烂尾前兆（对应 new.txt L1569"严禁烂尾逻辑"）。
• 升级=是的受阻伏笔，状态列中"受阻于 X (已阻 Y 章)"且 Y ≥ 6 → warning。"已阻 Y 章"这个字面 token 直接读自账本，不要猜。描述中要写出具体的上游 hook_id，让 planner 能安排落地路径。
• 卷尾（volume_map 中任一卷的末章）仍有升级=是的主线伏笔处于 open 或 stale 且没有显式"延至下一卷"规划 → critical。
• 升级=否的 stale 伏笔 → info 级记录，不判本章失败，但保留以便 planner 安排清理。

description 中要明确引用 hook_id，并把状态列中 stale / blocked 的原文标记字面抄进去。本维度只审结构，不评价伏笔文笔。`;
    case 19:
      return language === "en"
        ? "Check whether POV shifts are signaled clearly and stay consistent with the configured viewpoint."
        : "检查视角切换是否有过渡、是否与设定视角一致";
    case 24:
      return language === "en"
        ? "Cross-check subplot_board and chapter_summaries: flag any subplot that stays dormant long enough to feel abandoned, or a recent run where every subplot is only restated instead of genuinely moving."
        : "对照 subplot_board 和 chapter_summaries：标记那些沉寂到接近被遗忘的支线，或近期连续只被重复提及、没有真实推进的支线。";
    case 25:
      return language === "en"
        ? "Cross-check emotional_arcs and chapter_summaries: flag any major character whose emotional line holds one pressure shape across a run instead of taking new pressure, release, reversal, or reinterpretation. Distinguish unchanged circumstances from unchanged inner movement."
        : "对照 emotional_arcs 和 chapter_summaries：标记主要角色在一段时间内始终停留在同一种情绪压力形态、没有新压力、释放、转折或重估的情况。注意区分'处境未变'和'内心未变'。";
    case 26:
      return language === "en"
        ? "Cross-check chapter_summaries for chapter-type distribution: warn when the recent sequence stays in the same mode long enough to flatten rhythm, or when payoff / release beats disappear for too long. Explicitly list the recent type sequence."
        : "对照 chapter_summaries 的章节类型分布：当近期章节长时间停留在同一种模式、把节奏压平，或回收/释放/高潮章节缺席过久时给出 warning。请明确列出最近章节的类型序列。";
    case 28:
      return language === "en"
        ? "Check whether spinoff events contradict the mainline canon constraints."
        : "检查番外事件是否与正典约束表矛盾";
    case 29:
      return language === "en"
        ? "Check whether characters reference information that should only be revealed after the divergence point (see the information-boundary table)."
        : "检查角色是否引用了分歧点之后才揭示的信息（参照信息边界表）";
    case 30:
      return language === "en"
        ? "Check whether the spinoff violates mainline world rules (power system, geography, factions)."
        : "检查番外是否违反正传世界规则（力量体系、地理、阵营）";
    case 31:
      return language === "en"
        ? "Check whether the spinoff resolves mainline hooks without authorization (warning level)."
        : "检查番外是否越权回收正传伏笔（warning级别）";
    case 32:
      return language === "en"
        ? "Check whether the ending renews curiosity, whether promised payoffs are landing on the cadence their hooks imply, whether pressure gets any release, and whether reader expectation gaps are accumulating faster than they are being satisfied. If a climax just occurred, check whether the aftermath chapters show concrete change before starting a new cycle."
        : "检查：章尾是否重新点燃好奇心，已经承诺的回收是否按伏笔自身节奏落地，压力是否得到释放，读者期待缺口是在持续累积还是在被满足。如果刚经历高潮，检查后效章节是否在开启新周期前展示了具体改变。";
    case 33:
      return language === "en"
        ? "Cross-check the chapter_memo provided with the chapter. Does the final prose deliver the memo's goal and leave a visible trace for every one of the 7 sections it contains (tasks, pay-offs / held-back cards, daily/transition function map, three-question check, end-of-chapter concrete changes, hard-don'ts)? Missing or contradicted sections -> critical. Note: a sparse memo (breather chapter, goal + skeleton body only) is legitimate — only flag drift against sections that the memo actually populates. Never flag the memo itself for being sparse."
        : "对照随章提供的 chapter_memo。成稿是否兑现了 memo 中的 goal，并在 7 段正文（当前任务 / 该兑现·暂不掀 / 日常过渡功能 / 关键抉择三连问 / 章尾必须发生的改变 / 不要做 等）中留下可见落地痕迹？任何段落缺失或被写反 → critical。提醒：稀疏 memo 合法（喘息章 memo 可以只有 goal + 骨架 body），只检查 memo 实际写出的段落，不能因为 memo 稀疏就判 incomplete。";
    case 38: {
      if (language === "en") {
        return [
          'Check the "Outline Node" section in the Chapter Control Inputs above.',
          "It contains 【事件】(event) and 【节拍】(beat) fields from the per-chapter outline.",
          "",
          "Rules:",
          "1. Extract ALL key actions, settings, and character interactions from 【事件】.",
          '   Each one must appear in the chapter text in substantially the same context.',
          '   "Same context" means: if the outline says "at the family arena, Chen Yue crushes Chen Yuan publicly",',
          "   the arena, Chen Yue as the opponent, public humiliation, AND bloodline suppression must ALL appear",
          '   — not just "Chen Yuan gets hurt somewhere".',
          "2. Check 【节拍】: the beat describes a specific narrative turning point.",
          "   That turning point must actually happen in the chapter, not merely be hinted at or recalled later.",
          "3. Creative latitude: scene reordering, different POV, expanded/condensed, merged scenes — all OK.",
          "   But rewriting the SETTING, REMOVING key characters from the scene, or replacing a PRESENT-TENSE event",
          "   with a PAST-TENSE flashback of that event is NOT adaptation — it is a deviation.",
          "4. If a core action from 【事件】 is completely absent (not resequenced, not reinterpreted — just gone) -> critical.",
          "5. If the core event described in 【事件】 is REPLACED by a fundamentally different event (different narrative direction, different goal, different protagonist trajectory) -> critical.",
          "6. If the core event happens but in a different setting/context (same narrative direction, different location details) -> warning.",
          "7. If 【节拍】 turning point is missing entirely -> warning.",
          "Severity: critical when the outline's core event direction is replaced wholesale (the chapter tells a different story than the outline). Warning for setting/context deviations and missing beats. Info for creative adaptation that preserves the outline's narrative direction.",
        ].join("\n");
      }
      return [
        "对照 Chapter Control Inputs 中的「Outline Node」段落。",
        "其中包含来自细纲的【事件】和【节拍】字段。",
        "",
        "判定规则：",
        "1. 从【事件】中提取所有关键动作、场景、人物互动，逐项检查是否在正文中以基本相同的语境出现。",
        "「相同语境」指：如果细纲写「在家族演武场，陈岳当众碾压陈渊」，",
        "那么演武场、陈岳作为对手、当众羞辱、血脉压制这四个要素必须全部出现——不能只是「陈渊在某处受伤」。",
        "2. 检查【节拍】：节拍描述的是一个具体的叙事转折点，该转折点必须在正文中实际发生，而不仅仅是被暗示或在回忆中提及。",
        "3. 创作发挥的空间：场景重排、换视角、扩写/缩写、合并场景均允许。",
        "但改写场景设定、删除场景中的关键角色、或用过去时态的回忆替代现在时态的实际事件——这些不是发挥，而是偏离。",
        "4. 【事件】中某项核心动作完全缺失（不是重排、不是重新诠释——就是没有）→ critical。",
        "5. 细纲描述的核心事件被替换为完全不同的事件（叙事方向不同、目标不同、主角轨迹不同）→ critical。",
        "6. 核心事件发生了但发生在不同的场景/语境中（叙事方向相同，只是地点细节不同）→ warning。",
        "7. 【节拍】转折点完全缺席 → warning。",
        "严重度：细纲的核心事件方向被整体替换时（正文讲的是一个和细纲完全不同的故事）→ critical。场景/语境偏差和节拍缺失 → warning。保留细纲叙事方向的创作发挥 → info。",
      ].join("\n");
    }
    case 34:
    case 35:
    case 36:
    case 37: {
      if (!fanficConfig) return "";
      const severity = fanficConfig.severityOverrides.get(id) ?? "warning";
      const baseNote = language === "en"
        ? {
            34: "Check whether dialogue tics, speaking style, and behavior remain consistent with the character dossiers in fanfic_canon.md. Deviations need clear situational motivation.",
            35: "Check whether the chapter violates world rules documented in fanfic_canon.md (geography, power system, faction relations).",
            36: "Check whether relationship beats remain plausible and aligned with, or meaningfully develop from, the key relationships documented in fanfic_canon.md.",
            37: "Check whether the chapter contradicts the key event timeline in fanfic_canon.md.",
          }[id]
        : FANFIC_DIMENSIONS.find((dimension) => dimension.id === id)?.baseNote;

      return baseNote
        ? `${baseNote} ${formatFanficSeverityNote(severity, language)}`
        : "";
    }
    case 39:
      return language === "en"
        ? "Within-chapter beat repetition check: scan the last 40% of the chapter body. Detect three patterns: (1) Emotional beat synonymy — the same emotion (e.g., 'felt something but couldn't name it') expressed with different metaphors more than once. (2) Physical detail restating — sensory details already present in the first half (frostbitten hands, aching knees, cold water) restated item by item in the final section. (3) Scene-action cycling — the same A→B action sequence cycled more than once (e.g., 'looked→walked away→looked back→walked away again'). Report as severity=warning. Do not flag normal parallelism, escalation, or callback structures."
        : `章内叙事节拍重复检查：扫描正文章末 40% 的段落。检测三种重复模式：(1) 情绪节拍同义反复——同一情绪（如"感受到什么但说不清""心头微震"）被不同比喻展开 > 1 次。(2) 五感/物理细节重述——章前已出现的感官细节（冻裂的血口、酸痛的膝盖、冰冷的水）在章末被逐个重述。(3) 场景动作循环——同一场景的 A→B 动作序列循环展开 > 1 轮（如"看→走→回头→又走"）。severity=warning。不要误报正常的排比、递进、呼应式结构。`;
    case 40:
      return language === "en"
        ? "Stream-of-consciousness / internal monologue check. Detect four patterns: (A) Emotion declaration sentences with words like 'felt', 'realized', 'finally understood' — max 3 per 3,000 words. (B) Analytical reasoning sentences with framework terms like 'this means', 'weighing pros and cons', 'if...then' — max 2 per 3,000 words. (C) Consecutive monologue paragraphs — no more than 2 consecutive paragraphs dominated by internal thought without dialogue, action, or scene description. (D) Chapter-wide monologue ratio — internal-monologue-dominant paragraphs must not exceed 30% of total word count. Severity: warning for all violations. Rewrite suggestions: replace emotion declarations with physical actions, replace analytical reasoning with dialogue or instinctive reactions, break consecutive monologue with dialogue or scene shifts."
        : `意识流/内心戏检查。检测四种模式：(A) 情绪声明句——含"感到""心中涌起""终于明白""终于意识到"等声明式情绪词的句子，每3000字最多3句。(B) 分析式推理句——含"这意味着""权衡利弊""综合考虑""如果…那么"等分析框架词的句子，每3000字最多2句。(C) 连续独白段落——连续3段及以上以内心活动为主（无对话、无动作、无场景描写）的段落即违规。(D) 全章独白占比——内心戏主导的段落总字数不得超过全章30%。severity=warning。改写建议：情绪声明→动作外化，分析推理→对话或直觉反应，连续独白→插入对话或场景切换。`;
    default:
      return "";
  }
}

function buildDimensionList(
  gp: GenreProfile,
  bookRules: BookRules | null,
  language: PromptLanguage,
  hasParentCanon = false,
  fanficMode?: FanficMode,
): ReadonlyArray<{ readonly id: number; readonly name: string; readonly note: string }> {
  const activeIds = new Set(gp.auditDimensions);

  // Add book-level additional dimensions (supports both numeric IDs and name strings)
  if (bookRules?.additionalAuditDimensions) {
    // Build reverse lookup: name → id
    const nameToId = new Map<string, number>();
    for (const [id, labels] of Object.entries(DIMENSION_LABELS)) {
      nameToId.set(labels.zh, Number(id));
      nameToId.set(labels.en, Number(id));
    }

    for (const d of bookRules.additionalAuditDimensions) {
      if (typeof d === "number") {
        activeIds.add(d);
      } else if (typeof d === "string") {
        // Try exact match first, then substring match
        const exactId = nameToId.get(d);
        if (exactId !== undefined) {
          activeIds.add(exactId);
        } else {
          // Fuzzy: find dimension whose name contains the string
          for (const [name, id] of nameToId) {
            if (name.includes(d) || d.includes(name)) {
              activeIds.add(id);
              break;
            }
          }
        }
      }
    }
  }

  // Always-active dimensions
  activeIds.add(32); // 读者期待管理 — universal
  activeIds.add(33); // 章节备忘偏离 — universal (replaces legacy volume-outline drift)
  activeIds.add(38); // 细纲落地检查 — universal (outline event/beat compliance)
  activeIds.add(40); // 意识流/内心戏检查 — universal (stream-of-consciousness guard)

  // Conditional overrides
  if (gp.eraResearch || bookRules?.eraConstraints?.enabled) {
    activeIds.add(12);
  }

  // Spinoff dimensions — activated when parent_canon.md exists (but NOT in fanfic mode)
  if (hasParentCanon && !fanficMode) {
    activeIds.add(28); // 正传事件冲突
    activeIds.add(29); // 未来信息泄露
    activeIds.add(30); // 世界规则跨书一致性
    activeIds.add(31); // 番外伏笔隔离
  }

  // Fanfic dimensions — replace spinoff dims with fanfic-specific checks
  let fanficConfig: ReturnType<typeof getFanficDimensionConfig> | undefined;
  if (fanficMode) {
    fanficConfig = getFanficDimensionConfig(fanficMode, bookRules?.allowedDeviations);
    for (const id of fanficConfig.activeIds) {
      activeIds.add(id);
    }
    for (const id of fanficConfig.deactivatedIds) {
      activeIds.delete(id);
    }
  }

  const dims: Array<{ id: number; name: string; note: string }> = [];

  for (const id of [...activeIds].sort((a, b) => a - b)) {
    const name = dimensionName(id, language);
    if (!name) continue;

    const note = buildDimensionNote(id, language, gp, bookRules, fanficMode, fanficConfig);

    dims.push({ id, name, note });
  }

  return dims;
}

export class ContinuityAuditor extends BaseAgent {
  get name(): string {
    return "continuity-auditor";
  }

  async auditChapter(
    bookDir: string,
    chapterContent: string,
    chapterNumber: number,
    genre?: string,
    options?: {
      temperature?: number;
      chapterIntent?: string;
      chapterMemo?: ChapterMemo;
      contextPackage?: ContextPackage;
      ruleStack?: RuleStack;
      truthFileOverrides?: {
        currentState?: string;
        ledger?: string;
        hooks?: string;
      };
    },
  ): Promise<AuditResult> {
    const [diskCurrentState, diskLedger, diskHooks, styleGuideRaw, subplotBoard, emotionalArcs, characterMatrix, chapterSummaries, parentCanon, fanficCanon, volumeOutline] =
      await Promise.all([
        // Phase 5 consolidation: derive initial state from roles + seed hooks
        // when current_state.md is still the architect seed placeholder.
        readCurrentStateWithFallback(bookDir, "(文件不存在)"),
        this.readFileSafe(join(bookDir, "story/particle_ledger.md")),
        this.readFileSafe(join(bookDir, "story/pending_hooks.md")),
        this.readFileSafe(join(bookDir, "story/style_guide.md")),
        this.readFileSafe(join(bookDir, "story/subplot_board.md")),
        this.readFileSafe(join(bookDir, "story/emotional_arcs.md")),
        readCharacterContext(bookDir, "(文件不存在)"),
        this.readFileSafe(join(bookDir, "story/chapter_summaries.md")),
        this.readFileSafe(join(bookDir, "story/parent_canon.md")),
        this.readFileSafe(join(bookDir, "story/fanfic_canon.md")),
        readVolumeMap(bookDir, "(文件不存在)"),
      ]);
    const currentState = options?.truthFileOverrides?.currentState ?? diskCurrentState;
    const ledger = options?.truthFileOverrides?.ledger ?? diskLedger;
    const hooks = options?.truthFileOverrides?.hooks ?? diskHooks;

    const timeline = await loadTimeline(bookDir);

    const hasParentCanon = parentCanon !== "(文件不存在)";
    const hasFanficCanon = fanficCanon !== "(文件不存在)";

    // Load last chapter full text for fine-grained continuity checking
    const previousChapter = await this.loadPreviousChapter(bookDir, chapterNumber);

    // Load genre profile and book rules
    const genreId = genre ?? "other";
    const [{ profile: gp }, bookLanguage] = await Promise.all([
      readGenreProfile(this.ctx.projectRoot, genreId),
      readBookLanguage(bookDir),
    ]);
    const parsedRules = await readBookRules(bookDir);
    const bookRules = parsedRules?.rules ?? null;

    // Fallback: use book_rules body when style_guide.md doesn't exist.
    // Phase 5 hotfix 2: parsedRules.body is only populated for legacy
    // book_rules.md sources — story_frame.md frontmatter yields an empty
    // body, and an empty string is NOT a usable style guide. Treat
    // missing/empty body as "no fallback available".
    const legacyRulesBody = parsedRules?.body?.trim();
    const styleGuide = styleGuideRaw !== "(文件不存在)"
      ? styleGuideRaw
      : (legacyRulesBody || "(无文风指南)");

    const resolvedLanguage = bookLanguage ?? gp.language;
    const isEnglish = resolvedLanguage === "en";
    const fanficMode = hasFanficCanon ? (bookRules?.fanficMode as FanficMode | undefined) : undefined;
    const dimensions = buildDimensionList(gp, bookRules, resolvedLanguage, hasParentCanon, fanficMode);
    const dimList = dimensions
      .map((d) => `${d.id}. ${d.name}${d.note ? (isEnglish ? ` (${d.note})` : `（${d.note}）`) : ""}`)
      .join("\n");
    const genreLabel = resolveGenreLabel(genreId, gp.name, resolvedLanguage);

    const protagonistBlock = bookRules?.protagonist
      ? isEnglish
        ? `\n\nProtagonist lock: ${bookRules.protagonist.name}; personality locks: ${joinLocalized(bookRules.protagonist.personalityLock, resolvedLanguage)}; behavioral constraints: ${joinLocalized(bookRules.protagonist.behavioralConstraints, resolvedLanguage)}.`
        : `\n主角人设锁定：${bookRules.protagonist.name}，${bookRules.protagonist.personalityLock.join("、")}，行为约束：${bookRules.protagonist.behavioralConstraints.join("、")}`
      : "";

    const searchNote = gp.eraResearch
      ? isEnglish
        ? "\n\nYou have web-search capability (search_web / fetch_url). For real-world eras, people, events, geography, or policies, you must verify with search_web instead of relying on memory. Cross-check at least 2 sources."
        : "\n\n你有联网搜索能力（search_web / fetch_url）。对于涉及真实年代、人物、事件、地理、政策的内容，你必须用search_web核实，不可凭记忆判断。至少对比2个来源交叉验证。"
      : "";

    const systemPrompt = isEnglish
      ? `You are a strict ${genreLabel} web-fiction structural editor. Audit the chapter for completion and structure, not for prose craft. ALL OUTPUT MUST BE IN ENGLISH.${protagonistBlock}${searchNote}

## Reviewer Scope (hard constraints)

You audit completion and structure only. Your job is to decide whether the chapter delivers the plan, keeps characters and timelines intact, and moves the book forward. Wording, sentence rhythm, paragraph shape, punctuation, imagery, and other prose-surface choices are NOT yours — those belong to the Polisher pass that runs after you. If you notice prose-surface issues, you may flag them with severity "info" so the Polisher can see them, but they do not count toward passed / overall_score and they must never be critical.

You audit twelve structural reader-pain patterns: dragging / flat openings, blurry worldbuilding disconnected from reality, contradictory character setup, tangled POV, mainline drift or stagnation, weak conflict with missing payoff, pacing loss of control and abrupt transitions, character inconsistency across the arc, thin/one-note characters without contrast, stiff emotion expression and abrupt relationship jumps, imbalanced cheats/power gifts, and settings that never land in concrete action. Alongside these, keep the engineering dimensions listed below (OOC, timeline coherence, information boundary, hook debt, cross-chapter repetition, lexical fatigue, length band, title fatigue, paragraph shape).

Sparse chapter_memo is legitimate. Breather / aftermath / transition chapters may ship a memo that only contains goal + a skeleton body — do NOT flag such memos as incomplete, and do NOT penalise the chapter for lacking content against sections the memo itself does not populate. Judge drift only against what the memo actually says.

Audit dimensions:
${dimList}

Output format MUST be JSON:
{
  "passed": true/false,
  "overall_score": 0-100,
  "issues": [
    {
      "severity": "critical|warning|info",
      "category": "dimension name",
      "description": "specific issue description",
      "suggestion": "fix suggestion"
    }
  ],
  "summary": "one-sentence audit conclusion"
}

passed is false ONLY when critical-severity issues exist.

overall_score calibration:
- 95-100: Publishable as-is, no noticeable issues
- 85-94: Minor blemishes but smooth reading, the reader won't break immersion
- 75-84: Noticeable problems but the story backbone holds, needs revision but not urgent
- 65-74: Multiple issues hurt the reading experience, pacing or continuity has gaps
- < 65: Structural breakdown, needs major rewrite
Score holistically — do not let a single minor issue tank the score.`
      : `你是一位严格的${gp.name}网络小说结构审稿编辑。你只审完成度 + 结构，不审文笔。${protagonistBlock}${searchNote}

## 审稿边界（硬约束）

你不审文笔、不审排版、不审句式——这些归 Polisher。你发现的文笔问题只能以 severity="info" 标注供 Polisher 参考，不计入 reviewer 的 passed/overall_score，也绝不可标为 critical。

你审 12 条结构类雷点：开篇拖沓/平淡、世界观模糊脱现实、人设矛盾、视角杂乱、主线偏离/停滞、冲突乏力爽点缺失、节奏失控过渡生硬、人设前后矛盾、人物单薄无反差、情感表达生硬/关系突兀、金手指失衡、设定无落地。同时保留工程维度（OOC、timeline 一致、信息越界、hook-debt、跨章重复、词汇疲劳、章节字数、标题疲劳、段落形状）。

稀疏 memo 是合法状态。喘息章 / 后效章 / 过渡章的 memo 可以只有 goal + 骨架 body——此类 memo 不判 incomplete，也不能因为 memo 没写的段落就扣成稿的分。只按 memo 实际写出来的内容判偏离。

审查维度：
${dimList}

输出格式必须为 JSON：
{
  "passed": true/false,
  "overall_score": 0-100,
  "issues": [
    {
      "severity": "critical|warning|info",
      "category": "审查维度名称",
      "description": "具体问题描述",
      "suggestion": "修改建议"
    }
  ],
  "summary": "一句话总结审查结论"
}

只有当存在 critical 级别问题时，passed 才为 false。

overall_score 评分校准：
- 95-100：可直接发布，无明显问题
- 85-94：有小瑕疵但整体流畅可读，读者不会出戏
- 75-84：有明显问题但故事主干完整，需要修但不紧急
- 65-74：多处影响阅读体验的问题，节奏或连续性有断裂
- < 65：结构性问题，需要大幅重写
综合评分，不要因为单一小问题大幅拉低分数。`;

    const ledgerBlock = gp.numericalSystem
      ? isEnglish
        ? `\n## Resource Ledger\n${ledger}`
        : `\n## 资源账本\n${ledger}`
      : "";

    // Smart context filtering for auditor — same logic as writer
    const bookRulesForFilter = parsedRules?.rules ?? null;
    const filteredSubplots = filterSubplots(subplotBoard);
    const filteredArcs = filterEmotionalArcs(emotionalArcs, chapterNumber);
    const filteredMatrix = filterCharacterMatrix(characterMatrix, volumeOutline, bookRulesForFilter?.protagonist?.name);
    const filteredSummaries = filterSummaries(chapterSummaries, chapterNumber);
    const filteredHooks = filterHooks(hooks);

    const governedMemoryBlocks = options?.contextPackage
      ? buildGovernedMemoryEvidenceBlocks(options.contextPackage, resolvedLanguage)
      : undefined;

    const hooksBlock = governedMemoryBlocks?.hooksBlock
      ?? (filteredHooks !== "(文件不存在)"
        ? isEnglish
          ? `\n## Pending Hooks\n${filteredHooks}\n`
          : `\n## 伏笔池\n${filteredHooks}\n`
        : "");
    const subplotBlock = filteredSubplots !== "(文件不存在)"
      ? isEnglish
        ? `\n## Subplot Board\n${filteredSubplots}\n`
        : `\n## 支线进度板\n${filteredSubplots}\n`
      : "";
    const emotionalBlock = filteredArcs !== "(文件不存在)"
      ? isEnglish
        ? `\n## Emotional Arcs\n${filteredArcs}\n`
        : `\n## 情感弧线\n${filteredArcs}\n`
      : "";
    const matrixBlock = filteredMatrix !== "(文件不存在)"
      ? isEnglish
        ? `\n## Character Interaction Matrix\n${filteredMatrix}\n`
        : `\n## 角色交互矩阵\n${filteredMatrix}\n`
      : "";
    const summariesBlock = governedMemoryBlocks?.summariesBlock
      ?? (filteredSummaries !== "(文件不存在)"
        ? isEnglish
          ? `\n## Chapter Summaries (for pacing checks)\n${filteredSummaries}\n`
          : `\n## 章节摘要（用于节奏检查）\n${filteredSummaries}\n`
        : "");
    const volumeSummariesBlock = governedMemoryBlocks?.volumeSummariesBlock ?? "";

    const canonBlock = hasParentCanon
      ? isEnglish
        ? `\n## Mainline Canon Reference (for spinoff audit)\n${parentCanon}\n`
        : `\n## 正传正典参照（番外审查专用）\n${parentCanon}\n`
      : "";

    const fanficCanonBlock = hasFanficCanon
      ? isEnglish
        ? `\n## Fanfic Canon Reference (for fanfic audit)\n${fanficCanon}\n`
        : `\n## 同人正典参照（同人审查专用）\n${fanficCanon}\n`
      : "";

    const memoBlock = options?.chapterMemo
      ? isEnglish
        ? `\n## Chapter Memo (for memo drift checks)\nGoal: ${options.chapterMemo.goal}\n\n${options.chapterMemo.body}\n`
        : `\n## 章节备忘（用于 memo 偏离检测）\ngoal：${options.chapterMemo.goal}\n\n${options.chapterMemo.body}\n`
      : "";
    const reducedControlBlock = options?.chapterIntent && options.contextPackage && options.ruleStack
      ? this.buildReducedControlBlock(options.chapterIntent, options.contextPackage, options.ruleStack, resolvedLanguage)
      : "";
    const styleGuideBlock = reducedControlBlock.length === 0
      ? isEnglish
        ? `\n## Style Guide\n${styleGuide}`
        : `\n## 文风指南\n${styleGuide}`
      : "";

    const prevChapterBlock = previousChapter
      ? isEnglish
        ? `\n## Previous Chapter Full Text (for transition checks)\n${previousChapter}\n`
        : `\n## 上一章全文（用于衔接检查）\n${previousChapter}\n`
      : "";

    const hasDimension2 = dimensions.some((d) => d.id === 2);
    const temporalMarkerBlock = hasDimension2
      ? (() => {
          const currMarkers = extractTemporalMarkers(chapterContent);
          const prevMarkers = previousChapter ? extractTemporalMarkers(previousChapter) : [];
          return currMarkers.length > 0 || prevMarkers.length > 0
            ? `\n${formatTemporalMarkerBlock(currMarkers, prevMarkers, resolvedLanguage)}\n`
            : "";
        })()
      : "";

    const timelineSummaryBlock = hasDimension2 && timeline.storyDays.length > 0
      ? `\n${formatTimelineAuditSummary(timeline, resolvedLanguage)}\n`
      : "";

    const userPrompt = isEnglish
      ? `Review chapter ${chapterNumber}.

## Current State Card
${currentState}
${ledgerBlock}
${hooksBlock}${volumeSummariesBlock}${subplotBlock}${emotionalBlock}${matrixBlock}${summariesBlock}${canonBlock}${fanficCanonBlock}${reducedControlBlock}${memoBlock}${temporalMarkerBlock}${timelineSummaryBlock}${prevChapterBlock}${styleGuideBlock}

## Chapter Content Under Review
${chapterContent}`
      : `请审查第${chapterNumber}章。

## 当前状态卡
${currentState}
${ledgerBlock}
${hooksBlock}${volumeSummariesBlock}${subplotBlock}${emotionalBlock}${matrixBlock}${summariesBlock}${canonBlock}${fanficCanonBlock}${reducedControlBlock}${memoBlock}${temporalMarkerBlock}${timelineSummaryBlock}${prevChapterBlock}${styleGuideBlock}

## 待审章节内容
${chapterContent}`;

    const chatMessages = [
      { role: "system" as const, content: systemPrompt },
      { role: "user" as const, content: userPrompt },
    ];
    const chatOptions = { temperature: options?.temperature ?? 0.3 };

    // Use web search for fact verification when eraResearch is enabled
    const response = gp.eraResearch
      ? await this.chatWithSearch(chatMessages, chatOptions)
      : await this.chat(chatMessages, chatOptions);

    const result = this.parseAuditResult(response.content, resolvedLanguage);
    const outlineWarnings = this.checkOutlineCompliance(
      options?.chapterIntent, chapterContent, resolvedLanguage,
    );

    const deterministicTimelineIssues = hasDimension2
      ? computeDeterministicTimelineIssues(timeline)
      : [];

    const hasCriticalTimeline = deterministicTimelineIssues.some(
      (i) => i.severity === "critical",
    );

    return {
      passed: hasCriticalTimeline ? false : result.passed,
      issues: [...result.issues, ...outlineWarnings, ...deterministicTimelineIssues],
      summary: result.summary,
      overallScore: result.overallScore,
      tokenUsage: response.usage,
    };
  }

  /**
   * Deterministic pre-check: extract key nouns from the outline event text
   * and verify they appear in the chapter content. Supplements the LLM-based
   * dimension 38 check with a reliable keyword-matching step.
   */
  private checkOutlineCompliance(
    chapterIntent: string | undefined,
    chapterContent: string,
    language: PromptLanguage,
  ): AuditIssue[] {
    if (!chapterIntent) return [];

    // Extract 【事件】content from intent markdown
    const eventMatch = chapterIntent.match(/【事件】(.+?)(?:\n|$)/);
    if (!eventMatch) return [];
    const eventText = eventMatch[1].trim();
    if (!eventText) return [];

    // Extract 【详述】for additional context (settings, character names)
    const descMatch = chapterIntent.match(/【详述】([\s\S]+?)(?=\n## |$)/);
    const descText = descMatch?.[1]?.trim() ?? "";
    const combinedText = `${eventText} ${descText}`;

    const issues: AuditIssue[] = [];

    // Extract quoted phrases from the event:「xxx」"xxx"
    const quotedPhrases = [
      ...eventText.matchAll(/[「""]([^「」""]{2,15})[」""]/g),
    ].map((m) => m[1]);

    // Extract scene markers: suffix captured in group 1, full match in group 0.
    // We use the full match only for function-word filtering (在/的/被 etc. before a
    // location word usually means it isn't a scene-setting noun), but check the
    // chapter text against the suffix keyword alone to avoid false negatives from
    // prefix variability (e.g. "踏入宗门演武场" vs "位于宗门演武场").
    const settingSuffixes = [
      ...combinedText.matchAll(
        /[一-鿿]{2,6}(场|擂台|演武场|殿堂|大殿|祠堂|酒楼|城门|山谷|密洞|宫殿|武台|比武场)/g,
      ),
    ]
      .filter((m) => !/^[在的了之以把被从向让给对与和跟]/.test(m[0]))
      .map((m) => m[1]);

    // Extract character name candidates from combined text:
    // 2-char Chinese names before action particles or as known subject
    const namePatterns = /(?:^|[，。；！？、\s])([陈林李王张刘赵杨黄周吴徐孙马朱胡郭何高罗郑梁谢宋唐韩曹冯邓许彭曾肖田董潘袁蔡蒋余于杜叶程魏苏吕丁任卢姚沈钟姜崔谭陆范汪廖石金贾韦夏付方邹熊白孟秦邱侯江尹薛闫雷龙段郝孔邵史毛常万顾赖武康贺严尹倪)([一-鿿])(?:被|将|把|对|向|让|给|使|与|和|跟|，|。|的|在|是|从|走|站|坐|说|看|听)/g;
    const characters: string[] = [];
    for (const m of eventText.matchAll(namePatterns)) {
      const name = m[1] + m[2];
      if (name.length >= 2 && name.length <= 3) characters.push(name);
    }

    // Also look for repeated 2-3 char sequences in the event text (likely names)
    const ngrams = new Map<string, number>();
    for (let len = 2; len <= 3; len++) {
      for (let i = 0; i <= eventText.length - len; i++) {
        const gram = eventText.slice(i, i + len);
        if (/^[一-鿿]+$/.test(gram)) {
          ngrams.set(gram, (ngrams.get(gram) ?? 0) + 1);
        }
      }
    }
    for (const [gram, count] of ngrams) {
      if (count >= 2 && gram.length >= 2 && !characters.includes(gram)) {
        characters.push(gram);
      }
    }

    // Deduplicate
    const uniqueSuffixes = [...new Set(settingSuffixes)];
    const uniqueCharacters = [...new Set(characters)].filter(
      (c) => c.length >= 2 && !/^[的是了在有不人这中大为上个]/.test(c),
    );

    // Check missing settings (by suffix keyword, not full prefixed match)
    for (const suffix of uniqueSuffixes) {
      if (!chapterContent.includes(suffix)) {
        issues.push({
          severity: "warning" as const,
          category: "细纲落地检查",
          description: language === "en"
            ? `Outline specifies setting "${suffix}" but it does not appear in the chapter text.`
            : `细纲事件指定场景「${suffix}」在正文中未出现。`,
          suggestion: language === "en"
            ? `Ensure the chapter uses the described setting, or update the outline if the scene change is intentional.`
            : `请确保章节在细纲场景中展开，如场景变更属创作意图，请同步更新细纲。`,
        });
      }
    }

    // Check missing characters (only flag if the name appears multiple times in outline)
    for (const char of uniqueCharacters) {
      if (!chapterContent.includes(char)) {
        issues.push({
          severity: "warning" as const,
          category: "细纲落地检查",
          description: language === "en"
            ? `Outline involves "${char}" but this character/element does not appear in the chapter text.`
            : `细纲涉及「${char}」但该角色/要素未在正文中出现。`,
          suggestion: language === "en"
            ? `Include the character or update the outline.`
            : `请在正文中包含该角色或更新细纲。`,
        });
      }
    }

    // Cap at 3 warnings to avoid noise
    return issues.slice(0, 3);
  }

  private parseAuditResult(content: string, language: PromptLanguage): AuditResult {
    // Try multiple JSON extraction strategies (handles small/local models)

    // Strategy 1: Find balanced JSON object (not greedy)
    const balanced = this.extractBalancedJson(content);
    if (balanced) {
      const result = this.tryParseAuditJson(balanced, language);
      if (result) return result;
    }

    // Strategy 2: Try the whole content as JSON (some models output pure JSON)
    const trimmed = content.trim();
    if (trimmed.startsWith("{")) {
      const result = this.tryParseAuditJson(trimmed, language);
      if (result) return result;
    }

    // Strategy 3: Look for ```json code blocks
    const codeBlockMatch = content.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
    if (codeBlockMatch) {
      const result = this.tryParseAuditJson(codeBlockMatch[1]!.trim(), language);
      if (result) return result;
    }

    // Strategy 4: Try to extract individual fields via regex (last resort fallback)
    const passedMatch = content.match(/"passed"\s*:\s*(true|false)/);
    const issuesMatch = content.match(/"issues"\s*:\s*\[([\s\S]*?)\]/);
    const summaryMatch = content.match(/"summary"\s*:\s*"([^"]*)"/);
    if (passedMatch) {
      const issues: AuditIssue[] = [];
      if (issuesMatch) {
        // Try to parse individual issue objects
        const issuePattern = /\{[^{}]*"severity"\s*:\s*"[^"]*"[^{}]*\}/g;
        let match: RegExpExecArray | null;
        while ((match = issuePattern.exec(issuesMatch[1]!)) !== null) {
          try {
            const issue = JSON.parse(match[0]);
            issues.push({
              severity: issue.severity ?? "warning",
              category: issue.category ?? (language === "en" ? "Uncategorized" : "未分类"),
              description: issue.description ?? "",
              suggestion: issue.suggestion ?? "",
            });
          } catch {
            // skip malformed individual issue
          }
        }
      }
      const scoreMatch = content.match(/"overall_score"\s*:\s*(\d+)/);
      const overallScore = scoreMatch ? (() => {
        const s = parseInt(scoreMatch[1]!, 10);
        return Number.isFinite(s) && s >= 0 && s <= 100 ? Math.round(s) : undefined;
      })() : undefined;
      return {
        passed: passedMatch[1] === "true",
        issues,
        summary: summaryMatch?.[1] ?? "",
        overallScore,
      };
    }

    return {
      passed: false,
      issues: [{
        severity: "critical",
        category: language === "en" ? "System Error" : "系统错误",
        description: language === "en"
          ? "Audit output format was invalid and could not be parsed as JSON."
          : "审稿输出格式异常，无法解析为 JSON",
        suggestion: language === "en"
          ? "The model may not support reliable structured output. Try a stronger model or inspect the API response format."
          : "可能是模型不支持结构化输出。尝试换一个更大的模型，或检查 API 返回格式。",
      }],
      summary: language === "en" ? "Audit output parsing failed" : "审稿输出解析失败",
    };
  }

  private buildReducedControlBlock(
    chapterIntent: string,
    contextPackage: ContextPackage,
    ruleStack: RuleStack,
    language: PromptLanguage,
  ): string {
    const selectedContext = contextPackage.selectedContext
      .map((entry) => `- ${entry.source}: ${entry.reason}${entry.excerpt ? ` | ${entry.excerpt}` : ""}`)
      .join("\n");
    const overrides = ruleStack.activeOverrides.length > 0
      ? ruleStack.activeOverrides
        .map((override) => `- ${override.from} -> ${override.to}: ${override.reason} (${override.target})`)
        .join("\n")
      : "- none";

    return language === "en"
      ? `\n## Chapter Control Inputs (compiled by Planner/Composer)
${chapterIntent}

### Selected Context
${selectedContext || "- none"}

### Rule Stack
- Hard guardrails: ${ruleStack.sections.hard.join(", ") || "(none)"}
- Soft constraints: ${ruleStack.sections.soft.join(", ") || "(none)"}
- Diagnostic rules: ${ruleStack.sections.diagnostic.join(", ") || "(none)"}

### Active Overrides
${overrides}\n`
      : `\n## 本章控制输入（由 Planner/Composer 编译）
${chapterIntent}

### 已选上下文
${selectedContext || "- none"}

### 规则栈
- 硬护栏：${ruleStack.sections.hard.join("、") || "(无)"}
- 软约束：${ruleStack.sections.soft.join("、") || "(无)"}
- 诊断规则：${ruleStack.sections.diagnostic.join("、") || "(无)"}

### 当前覆盖
${overrides}\n`;
  }

  private extractBalancedJson(text: string): string | null {
    const start = text.indexOf("{");
    if (start === -1) return null;
    let depth = 0;
    for (let i = start; i < text.length; i++) {
      if (text[i] === "{") depth++;
      if (text[i] === "}") depth--;
      if (depth === 0) return text.slice(start, i + 1);
    }
    return null;
  }

  private tryParseAuditJson(json: string, language: PromptLanguage = "zh"): AuditResult | null {
    try {
      const parsed = JSON.parse(json);
      if (typeof parsed.passed !== "boolean" && parsed.passed !== undefined) return null;
      const rawScore = parsed.overall_score ?? parsed.overallScore;
      const overallScore = typeof rawScore === "number" && Number.isFinite(rawScore)
        ? Math.round(Math.max(0, Math.min(100, rawScore)))
        : undefined;
      return {
        passed: Boolean(parsed.passed ?? false),
        issues: Array.isArray(parsed.issues)
          ? parsed.issues.map((i: Record<string, unknown>) => ({
              severity: (i.severity as string) ?? "warning",
              category: (i.category as string) ?? (language === "en" ? "Uncategorized" : "未分类"),
              description: (i.description as string) ?? "",
              suggestion: (i.suggestion as string) ?? "",
            }))
          : [],
        summary: String(parsed.summary ?? ""),
        overallScore,
      };
    } catch {
      return null;
    }
  }

  private async loadPreviousChapter(bookDir: string, currentChapter: number): Promise<string> {
    if (currentChapter <= 1) return "";
    const chaptersDir = join(bookDir, "chapters");
    try {
      const files = await readdir(chaptersDir);
      const paddedPrev = String(currentChapter - 1).padStart(4, "0");
      const prevFile = files.find((f) => f.startsWith(paddedPrev) && f.endsWith(".md"));
      if (!prevFile) return "";
      return await readFile(join(chaptersDir, prevFile), "utf-8");
    } catch {
      return "";
    }
  }

  private async readFileSafe(path: string): Promise<string> {
    try {
      return await readFile(path, "utf-8");
    } catch {
      return "(文件不存在)";
    }
  }
}
