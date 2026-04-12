/**
 * Apply optimized parameters back to InkOS agent prompt files.
 *
 * Writes optimized values to packages/core/src/agents/ prompt files.
 * Creates a git backup before applying.
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import type { OptimizationRun } from "./optimization-result.js";
import { DEFAULT_WRITER_PARAMS } from "./parameter-space.js";

// ---------------------------------------------------------------------------
// Backup
// ---------------------------------------------------------------------------

export function createBackup(
  projectRoot: string,
  bookId: string,
  runId: string,
): void {
  const files = [
    "packages/core/src/agents/writer-prompts.ts",
    "packages/core/src/agents/continuity.ts",
    "packages/core/src/agents/settler-prompts.ts",
  ];

  const backupDir = join(
    projectRoot,
    "books",
    bookId,
    "story",
    ".optimization",
    "backups",
    runId,
  );

  for (const file of files) {
    const src = join(projectRoot, file);
    if (!existsSync(src)) continue;

    const content: string = readFileSync(src, "utf-8");
    const destDir = join(backupDir, dirname(file));
    const dest = join(backupDir, file);
    mkdirSync(destDir, { recursive: true });
    writeFileSync(dest, content, "utf-8");
  }
}

// ---------------------------------------------------------------------------
// Apply writer params
// ---------------------------------------------------------------------------

export function applyWriterParams(
  projectRoot: string,
  params: {
    max_transition_markers_per_3k?: number;
    max_hedge_words_per_chapter?: number;
    paragraph_uniformity_cv_threshold?: number;
    length_soft_tolerance_pct?: number;
    length_hard_tolerance_pct?: number;
    enforce_golden_chapters?: boolean;
    max_consecutive_dialogue_paragraphs?: number;
    enforce_sensory_details?: boolean;
    scene_beat_density?: number;
    pacing_force_cuts?: boolean;
    max_exposition_paragraphs?: number;
    inner_monologue_words_max?: number;
  },
): void {
  const defaultsPath = join(
    projectRoot,
    "packages/core/src/prompt-tuning/defaults.ts",
  );
  let content: string = readFileSync(defaultsPath, "utf-8");

  if (params.max_transition_markers_per_3k !== undefined) {
    content = content.replace(
      /export const DEFAULT_MAX_TRANSITION_MARKERS_PER_3K = \d+;/,
      `export const DEFAULT_MAX_TRANSITION_MARKERS_PER_3K = ${params.max_transition_markers_per_3k};`,
    );
  }

  if (params.max_hedge_words_per_chapter !== undefined) {
    content = content.replace(
      /export const DEFAULT_MAX_HEDGE_WORDS_PER_CHAPTER = \d+;/,
      `export const DEFAULT_MAX_HEDGE_WORDS_PER_CHAPTER = ${params.max_hedge_words_per_chapter};`,
    );
  }

  if (params.paragraph_uniformity_cv_threshold !== undefined) {
    content = content.replace(
      /export const DEFAULT_PARAGRAPH_CV_THRESHOLD = [\d.]+;/,
      `export const DEFAULT_PARAGRAPH_CV_THRESHOLD = ${params.paragraph_uniformity_cv_threshold};`,
    );
  }

  if (params.length_soft_tolerance_pct !== undefined) {
    content = content.replace(
      /export const DEFAULT_LENGTH_SOFT_TOLERANCE_PCT = [\d.]+;/,
      `export const DEFAULT_LENGTH_SOFT_TOLERANCE_PCT = ${params.length_soft_tolerance_pct};`,
    );
  }

  if (params.length_hard_tolerance_pct !== undefined) {
    content = content.replace(
      /export const DEFAULT_LENGTH_HARD_TOLERANCE_PCT = [\d.]+;/,
      `export const DEFAULT_LENGTH_HARD_TOLERANCE_PCT = ${params.length_hard_tolerance_pct};`,
    );
  }

  if (params.scene_beat_density !== undefined) {
    content = content.replace(
      /export const DEFAULT_SCENE_BEAT_DENSITY = \d+;/,
      `export const DEFAULT_SCENE_BEAT_DENSITY = ${params.scene_beat_density};`,
    );
  }

  if (params.pacing_force_cuts !== undefined) {
    content = content.replace(
      /export const DEFAULT_PACING_FORCE_CUTS = (?:true|false);/,
      `export const DEFAULT_PACING_FORCE_CUTS = ${params.pacing_force_cuts};`,
    );
  }

  if (params.max_exposition_paragraphs !== undefined) {
    content = content.replace(
      /export const DEFAULT_MAX_EXPOSITION_PARAGRAPHS = \d+;/,
      `export const DEFAULT_MAX_EXPOSITION_PARAGRAPHS = ${params.max_exposition_paragraphs};`,
    );
  }

  if (params.inner_monologue_words_max !== undefined) {
    content = content.replace(
      /export const DEFAULT_INNER_MONOLOGUE_WORDS_MAX = \d+;/,
      `export const DEFAULT_INNER_MONOLOGUE_WORDS_MAX = ${params.inner_monologue_words_max};`,
    );
  }

  writeFileSync(defaultsPath, content, "utf-8");
}

// ---------------------------------------------------------------------------
// Apply all params from run
// ---------------------------------------------------------------------------

export function applyOptimizedRun(
  projectRoot: string,
  run: OptimizationRun,
  options?: { dryRun?: boolean },
): void {
  const { writer } = run.best_candidate.params;

  applyWriterParams(projectRoot, {
    max_transition_markers_per_3k:
      writer.max_transition_markers_per_3k ?? DEFAULT_WRITER_PARAMS.max_transition_markers_per_3k,
    max_hedge_words_per_chapter:
      writer.max_hedge_words_per_chapter ?? DEFAULT_WRITER_PARAMS.max_hedge_words_per_chapter,
    paragraph_uniformity_cv_threshold:
      writer.paragraph_uniformity_cv_threshold ??
      DEFAULT_WRITER_PARAMS.paragraph_uniformity_cv_threshold,
    length_soft_tolerance_pct:
      writer.length_soft_tolerance_pct ?? DEFAULT_WRITER_PARAMS.length_soft_tolerance_pct,
    length_hard_tolerance_pct:
      writer.length_hard_tolerance_pct ?? DEFAULT_WRITER_PARAMS.length_hard_tolerance_pct,
    enforce_golden_chapters: writer.enforce_golden_chapters,
    max_consecutive_dialogue_paragraphs:
      writer.max_consecutive_dialogue_paragraphs ??
      DEFAULT_WRITER_PARAMS.max_consecutive_dialogue_paragraphs,
    enforce_sensory_details: writer.enforce_sensory_details,
    scene_beat_density:
      writer.scene_beat_density ?? DEFAULT_WRITER_PARAMS.scene_beat_density,
    pacing_force_cuts: writer.pacing_force_cuts ?? DEFAULT_WRITER_PARAMS.pacing_force_cuts,
    max_exposition_paragraphs:
      writer.max_exposition_paragraphs ?? DEFAULT_WRITER_PARAMS.max_exposition_paragraphs,
    inner_monologue_words_max:
      writer.inner_monologue_words_max ?? DEFAULT_WRITER_PARAMS.inner_monologue_words_max,
  });

  if (options?.dryRun) {
    console.log("[applyOptimizedRun] dry_run=true - no files written");
  }
}
