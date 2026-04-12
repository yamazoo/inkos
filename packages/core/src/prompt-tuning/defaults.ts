/**
 * Default values for parameterized prompt knobs.
 * These are extracted from hardcoded literals in agent prompt builders.
 * GEPA varies these values during optimization.
 *
 * MUST stay in sync with packages/gepa/src/gepa_wrapper/parameter_space.py
 * and packages/core/src/prompt-tuning/parameter-space.ts.
 */

// ---------------------------------------------------------------------------
// Transition / surprise markers (anti-AI)
// ---------------------------------------------------------------------------

/** Surprise/transition markers that indicate AI-written text. */
export const TRANSITION_MARKERS = [
  "仿佛", "忽然", "竟", "竟然", "猛地", "猛然", "不禁", "宛如",
] as const;

/** Max total occurrences of transition markers per 3000 characters. */
export const DEFAULT_MAX_TRANSITION_MARKERS_PER_3K = 1;

// ---------------------------------------------------------------------------
// Hedge words (anti-AI)
// ---------------------------------------------------------------------------

/** Hedge words that dilute narrative voice. */
export const HEDGE_WORDS = [
  "似乎", "好像", "大概", "也许", "似乎", "仿佛", "隐隐约约",
] as const;

/** Max hedge word occurrences per chapter. */
export const DEFAULT_MAX_HEDGE_WORDS_PER_CHAPTER = 3;

// ---------------------------------------------------------------------------
// Paragraph uniformity
// ---------------------------------------------------------------------------

/**
 * Coefficient-of-variation threshold for paragraph length uniformity.
 * CV = stddev / mean. Values above this = formulaic/AI-like structure.
 */
export const DEFAULT_PARAGRAPH_CV_THRESHOLD = 0.15;

// ---------------------------------------------------------------------------
// Length governance
// ---------------------------------------------------------------------------

/** Default soft tolerance around target word count (fraction). */
export const DEFAULT_LENGTH_SOFT_TOLERANCE_PCT = 0.1; // 2% (GEPA evolved: tighter = fewer length warnings)

/** Default hard tolerance around target word count (fraction). */
export const DEFAULT_LENGTH_HARD_TOLERANCE_PCT = 0.2; // 5% (GEPA evolved)

// ---------------------------------------------------------------------------
// Golden chapters
// ---------------------------------------------------------------------------

/** Chapters 1-3 receive golden-chapter special rules. */
export const GOLDEN_CHAPTER_MAX = 3;

// ---------------------------------------------------------------------------
// Dialogue
// ---------------------------------------------------------------------------

/** Max consecutive dialogue-only paragraphs before requiring an action beat. */
export const DEFAULT_MAX_CONSECUTIVE_DIALOGUE_PARAGRAPHS = 4;

// ---------------------------------------------------------------------------
// Anti-AI rules text (shared between prompt builders)
// ---------------------------------------------------------------------------

/**
 * Anti-AI transition marker rule text.
 * Injected into Writer system prompt.
 */
export function buildTransitionMarkerRule(
  maxPer3k: number = DEFAULT_MAX_TRANSITION_MARKERS_PER_3K,
): string {
  const markers = TRANSITION_MARKERS.join("、");
  return `【铁律】转折/惊讶标记词（${markers}）全篇总数不超过每3000字${maxPer3k}次。超出时改用具体动作或感官描写传递突然性`;
}

/**
 * Anti-AI hedge word rule text.
 */
export function buildHedgeWordRule(
  maxPerChapter: number = DEFAULT_MAX_HEDGE_WORDS_PER_CHAPTER,
): string {
  return `【铁律】全文使用"似乎/好像/大概/也许"等模糊词不超过${maxPerChapter}次。超出时改用确定性的动作和感官描写。`;
}

/**
 * Paragraph uniformity rule text.
 */
export function buildParagraphUniformityRule(
  cvThreshold: number = DEFAULT_PARAGRAPH_CV_THRESHOLD,
): string {
  return `【铁律】段落长度变异系数（CV）不得超过${cvThreshold}。连续4段以上等长段落视为流水账。`;
}

/**
 * Same-imagery repetition rule (anti-AI).
 */
export const DEFAULT_MAX_SAME_IMAGERY_ROUNDS = 2;

/**
 * Same-imagery repetition rule text.
 */
export function buildSameImageryRule(
  maxRounds: number = DEFAULT_MAX_SAME_IMAGERY_ROUNDS,
): string {
  return `【铁律】同一意象/体感禁止连续渲染超过${maxRounds}轮。第三次出现相同意象域（如"火在体内流动"）时必须切换到新信息或新动作，避免原地打转。`;
}

// ---------------------------------------------------------------------------
// Pacing control (fast-paced genre fiction)
// ---------------------------------------------------------------------------

/** Default scene beats (cut/turn/beat) per 1000 words. */
export const DEFAULT_SCENE_BEAT_DENSITY = 3;

/** Replace soft transitions with hard scene cuts (>>>). */
export const DEFAULT_PACING_FORCE_CUTS = false;

/** Max pure-exposition paragraphs per chapter (0=tight, 5=permissive). */
export const DEFAULT_MAX_EXPOSITION_PARAGRAPHS = 2;

/** Max words in any single inner monologue passage. */
export const DEFAULT_INNER_MONOLOGUE_WORDS_MAX = 80;

/**
 * Pacing rule text — controls scene beat density.
 */
export function buildPacingRule(
  sceneBeatDensity: number = DEFAULT_SCENE_BEAT_DENSITY,
  pacingForceCuts: boolean = DEFAULT_PACING_FORCE_CUTS,
  maxExpositionParagraphs: number = DEFAULT_MAX_EXPOSITION_PARAGRAPHS,
  innerMonologueWordsMax: number = DEFAULT_INNER_MONOLOGUE_WORDS_MAX,
): string {
  const cutLine = pacingForceCuts
    ? "- 【节奏加速】启用硬切（>>>）替代软过渡，全章不得出现软过渡词"
    : `- 场景节拍：每1000字至少${sceneBeatDensity}个场景节拍（场景切割、转折、Beat），高于此则节奏偏慢，低于此则节奏偏紧`;
  const expoLine = `- 纯交代段落每章不超过${maxExpositionParagraphs}段，超出则并入行动场景或删除`;
  const monoLine = `- 内心独白单段上限${innerMonologueWordsMax}字，超出则拆分为反应+动作`;
  return [cutLine, expoLine, monoLine].join("\n");
}

// ---------------------------------------------------------------------------
// Genre fatigue words
// ---------------------------------------------------------------------------

/**
 * Build genre-specific fatigue word rule.
 */
export function buildFatigueWordRule(
  fatigueWords: readonly string[],
  maxPerChapter: number = 1,
): string {
  if (fatigueWords.length === 0) return "";
  return `高疲劳词（${fatigueWords.join("、")}）单章最多出现${maxPerChapter}次`;
}
