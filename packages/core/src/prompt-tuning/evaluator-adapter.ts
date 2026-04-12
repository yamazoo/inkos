/**
 * TypeScript evaluator adapter: runs InkOS pipeline with candidate params
 * and extracts multi-objective scores.
 *
 * This is the TypeScript side of the evaluation bridge.
 * It avoids subprocess overhead when running evaluation from the TS context,
 * and provides the structured score extraction used by the optimizer.
 */

import { z } from "zod";
import { join } from "node:path";
import { readdir, readFile } from "node:fs/promises";
import type { BookConfig } from "../models/book.js";
import type { ChapterMeta } from "../models/chapter.js";
import { MultiObjectiveScoreSchema } from "./optimization-result.js";
import {
  WriterParams,
  ContinuityParams,
  SettlerParams,
  DEFAULT_WRITER_PARAMS,
  DEFAULT_CONTINUITY_PARAMS,
  DEFAULT_SETTLER_PARAMS,
} from "./parameter-space.js";
import {
  DEFAULT_MAX_TRANSITION_MARKERS_PER_3K,
  buildTransitionMarkerRule,
} from "./defaults.js";

// ---------------------------------------------------------------------------
// 
// 

/**
 * Compute AI-tell density from chapter text.
 * Scans for known AI-marking patterns and returns a density score (0-1).
 * Lower = more human-like.
 */
export function computeAITellDensity(text: string): number {
  const len = text.length;
  if (len === 0) return 0.5;

  let score = 0;

  // Count transition/surprise markers
  const markerCount = countMatches(
    text,
    /仿佛|不禁|宛如|竟然|忽然|猛地|猛然|竟(?!然)/g,
  );
  score += markerCount / Math.max(1, len / 3000) * 0.3;

  // Count hedge words
  const hedgeCount = countMatches(
    text,
    /似乎|好像|大概|也许|隐隐约约|似乎也|好像在/g,
  );
  score += hedgeCount * 0.05;

  // Count analysis framework terms
  const analysisCount = countMatches(
    text,
    /当前处境|核心动机|信息边界|性格过滤|利益最大化|当前目标|当前利益|决策权重|风险评估|核心风险|关键变量|最优解|最大化|博弈/g,
  );
  score += analysisCount * 0.1;

  // Count "不禁感叹道" style meta-commentary
  const metaCount = countMatches(
    text,
    /不禁感叹道|不禁想到|心中暗想.*是|他明白.*已经|显然.*低估|显然.*高估/g,
  );
  score += metaCount * 0.1;

  // Count uniform paragraph pattern (AI tends to write equal-length paragraphs)
  const paragraphs = text.split(/\n\n+/).filter((p) => p.trim().length > 20);
  if (paragraphs.length >= 4) {
    const lengths = paragraphs.map((p) => p.trim().length);
    const mean = lengths.reduce((a, b) => a + b, 0) / lengths.length;
    const variance =
      lengths.reduce((a, b) => a + (b - mean) ** 2, 0) / lengths.length;
    const cv = Math.sqrt(variance) / mean;
    if (cv < 0.1) score += 0.2; // Very uniform = suspicious
    else if (cv < 0.2) score += 0.1;
  }

  // Normalize to 0-1
  return Math.min(1.0, score);
}

/**
 * Compute word count deviation from target.
 * Returns 0-1 where 1 = exact match, 0 = 40%+ deviation.
 */
export function computeWordCountAccuracy(
  actualChars: number,
  targetChars: number,
  hardTolerance: number = 0.4,
): number {
  if (targetChars === 0) return 0.5;
  const deviation = Math.abs(actualChars - targetChars) / targetChars;
  return Math.max(0, 1 - deviation / hardTolerance);
}

/**
 * Count regex matches in text (handles unicode).
 */
function countMatches(text: string, regex: RegExp): number {
  const matches = text.match(regex);
  return matches ? matches.length : 0;
}

// ---------------------------------------------------------------------------
// 
// 

/**
 * Raw per-chapter evaluation result before aggregation.
 */
export interface ChapterEvaluationResult {
  chapter: number;
  /** Whether the chapter passed ContinuityAuditor. */
  audit_pass: boolean;
  /** ContinuityAuditor audit score (0-1). */
  audit_score: number;
  /** AIGC detector resistance score (0-1, higher = more human-like). */
  aigc_resistance: number;
  /** Word count accuracy (0-1, higher = better). */
  wordcount_accuracy: number;
  /** AI-tell density (0-1, lower = more human-like). */
  ai_tell_density: number;
  /** Chapter text length in characters. */
  char_count: number;
  /** Raw audit issues for diagnostics. */
  audit_issues?: ReadonlyArray<{ severity: string; category: string }>;
}

/**
 * Evaluate a single chapter text against target parameters.
 */
export function evaluateChapter(
  chapterNumber: number,
  text: string,
  targetWordCount: number,
  options?: {
    continuityParams?: ContinuityParams;
    writerParams?: WriterParams;
  },
): ChapterEvaluationResult {
  const aiTellDensity = computeAITellDensity(text);

  // AIGC resistance is inversely related to AI-tell density
  const aigcResistance = 1.0 - aiTellDensity;

  const wordCountAccuracy = computeWordCountAccuracy(
    text.length,
    targetWordCount,
    options?.writerParams?.length_hard_tolerance_pct ??
      DEFAULT_WRITER_PARAMS.length_hard_tolerance_pct,
  );

  return {
    chapter: chapterNumber,
    audit_pass: false, // Populated by ContinuityAuditor if available
    audit_score: 0.0,  // Populated by ContinuityAuditor if available
    aigc_resistance: aigcResistance,
    wordcount_accuracy: wordCountAccuracy,
    ai_tell_density: aiTellDensity,
    char_count: text.length,
  };
}

/**
 * Aggregate per-chapter results into multi-objective score.
 */
export function aggregateChapterScores(
  results: ChapterEvaluationResult[],
): z.infer<typeof MultiObjectiveScoreSchema> {
  if (results.length === 0) {
    return {
      audit_pass_rate: 0,
      aigc_resistance: 0,
      wordcount_accuracy: 0,
      ai_tell_density: 0,
      composite: 0,
    };
  }

  const n = results.length;
  const audit_pass_rate =
    results.filter((r) => r.audit_pass).length / n;
  const aigc_resistance =
    results.reduce((sum, r) => sum + r.aigc_resistance, 0) / n;
  const wordcount_accuracy =
    results.reduce((sum, r) => sum + r.wordcount_accuracy, 0) / n;
  // ai_tell_density: lower is better, invert for scoring
  const avg_aitell = results.reduce((sum, r) => sum + r.ai_tell_density, 0) / n;
  const ai_tell_density = 1.0 - avg_aitell;

  // Weighted composite
  const composite =
    audit_pass_rate * 0.35 +
    aigc_resistance * 0.30 +
    wordcount_accuracy * 0.20 +
    ai_tell_density * 0.15;

  return {
    audit_pass_rate,
    aigc_resistance,
    wordcount_accuracy,
    ai_tell_density,
    composite,
  };
}

// ---------------------------------------------------------------------------
// 
// 

/**
 * Split chapters into training and validation sets.
 * Only includes chapters with approved/ready-for-review status.
 */
export async function splitChaptersForOptimization(
  projectRoot: string,
  bookId: string,
  trainRange?: readonly [number, number],
  valRange?: readonly [number, number],
): Promise<{
  train_chapters: number[];
  val_chapters: number[];
}> {
  const chaptersDir = join(projectRoot, "books", bookId, "chapters");
  const indexPath = join(chaptersDir, "index.json");

  let chapters: ChapterMeta[] = [];

  try {
    const raw = await readFile(indexPath, "utf-8");
    chapters = JSON.parse(raw) as ChapterMeta[];
  } catch {
    // Fallback: scan chapter files
    const files = await readdir(chaptersDir);
    const nums = files
      .filter((f) => f.startsWith("chapter-") && f.endsWith(".md"))
      .map((f) => parseInt(f.replace("chapter-", "").replace(".md", "")))
      .filter((n) => !isNaN(n))
      .sort((a, b) => a - b);
    return {
      train_chapters: trainRange
        ? nums.filter((n) => n >= trainRange[0] && n <= trainRange[1])
        : nums,
      val_chapters: valRange
        ? nums.filter((n) => n >= valRange[0] && n <= valRange[1])
        : [],
    };
  }

  const passed = chapters
    .filter(
      (ch) =>
        ch.status === "approved" ||
        ch.status === "ready-for-review" ||
        ch.status === "published",
    )
    .map((ch) => ch.number)
    .sort((a, b) => a - b);

  if (trainRange && valRange) {
    return {
      train_chapters: passed.filter(
        (n) => n >= trainRange[0] && n <= trainRange[1],
      ),
      val_chapters: passed.filter(
        (n) => n >= valRange[0] && n <= valRange[1],
      ),
    };
  }

  if (passed.length === 0) {
    return { train_chapters: [], val_chapters: [] };
  }

  // Default: last 20% as validation
  const splitIdx = Math.max(1, Math.floor(passed.length * 0.8));
  return {
    train_chapters: passed.slice(0, splitIdx),
    val_chapters: passed.slice(splitIdx),
  };
}
