/**
 * TypeScript parameter space for InkOS prompt optimization.
 * Must stay in sync with packages/gepa/src/gepa_wrapper/parameter_space.py.
 */

import { z } from "zod";

// ---------------------------------------------------------------------------
// Writer agent knobs
// ---------------------------------------------------------------------------

export const WriterParamsSchema = z.object({
  writer_temperature_creative: z
    .number()
    .min(0.5)
    .max(0.9)
    .describe("LLM temperature during creative (draft) phase"),
  writer_temperature_settlement: z
    .number()
    .min(0.1)
    .max(0.4)
    .describe("LLM temperature during settlement phase"),
  max_transition_markers_per_3k: z
    .number()
    .int()
    .min(0)
    .max(5)
    .describe(
      "Max transition/surprise markers (仿佛/不禁/竟然) per 3000 characters",
    ),
  max_hedge_words_per_chapter: z
    .number()
    .int()
    .min(0)
    .max(10)
    .describe("Max hedge words per chapter"),
  paragraph_uniformity_cv_threshold: z
    .number()
    .min(0.05)
    .max(0.35)
    .describe(
      "Coefficient-of-variation threshold for paragraph length uniformity",
    ),
  disable_analysis_terms: z
    .boolean()
    .describe(
      "Forbid analysis-framework terms in narrative (当前处境/核心动机/etc.)",
    ),
  length_soft_tolerance_pct: z
    .number()
    .min(0.05)
    .max(0.25)
    .describe("Soft tolerance % around target word count"),
  length_hard_tolerance_pct: z
    .number()
    .min(0.1)
    .max(0.4)
    .describe("Hard tolerance % around target word count"),
  enforce_golden_chapters: z
    .boolean()
    .describe("Apply golden-three-chapters rules for chapter 1-3"),
  max_consecutive_dialogue_paragraphs: z
    .number()
    .int()
    .min(2)
    .max(8)
    .describe(
      "Max consecutive dialogue-only paragraphs before requiring action beat",
    ),
  enforce_sensory_details: z
    .boolean()
    .describe("Require at least 1-2 sensory details per major scene"),
  // Pacing control (for fast-paced genre fiction)
  scene_beat_density: z
    .number()
    .int()
    .min(2)
    .max(8)
    .describe("Target scene beats (cut/turn) per 1000 words — higher = faster pacing"),
  pacing_force_cuts: z
    .boolean()
    .describe("Replace soft transitions with hard scene cuts (>>>) for fast pacing"),
  max_exposition_paragraphs: z
    .number()
    .int()
    .min(0)
    .max(5)
    .describe("Max pure-exposition paragraphs per chapter (0=tight, 5=permissive)"),
  inner_monologue_words_max: z
    .number()
    .int()
    .min(20)
    .max(200)
    .describe("Max words in any single inner monologue passage (shorter = tighter)"),
});

export type WriterParams = z.infer<typeof WriterParamsSchema>;

export const DEFAULT_WRITER_PARAMS: WriterParams = {
  writer_temperature_creative: 0.7,
  writer_temperature_settlement: 0.3,
  max_transition_markers_per_3k: 1,
  max_hedge_words_per_chapter: 3,
  paragraph_uniformity_cv_threshold: 0.15,
  disable_analysis_terms: true,
  length_soft_tolerance_pct: 0.1,
  length_hard_tolerance_pct: 0.2,
  enforce_golden_chapters: true,
  max_consecutive_dialogue_paragraphs: 4,
  enforce_sensory_details: true,
  // Pacing defaults — moderate (fast-pacing tuned via GEPA)
  scene_beat_density: 3,
  pacing_force_cuts: false,
  max_exposition_paragraphs: 2,
  inner_monologue_words_max: 80,
};

// ---------------------------------------------------------------------------
// Continuity auditor knobs
// ---------------------------------------------------------------------------

export const ContinuityParamsSchema = z.object({
  ooc_strictness: z
    .number()
    .min(0.0)
    .max(1.0)
    .describe(
      "Weight for OOC (character consistency) issues (0=ignore, 1=critical)",
    ),
  pacing_weight: z
    .number()
    .min(0.0)
    .max(1.0)
    .describe("Weight for pacing issues"),
  info_boundary_weight: z
    .number()
    .min(0.0)
    .max(1.0)
    .describe("Weight for information boundary violations"),
  power_scaling_weight: z
    .number()
    .min(0.0)
    .max(1.0)
    .describe("Weight for power-scaling (战力崩坏) issues"),
  fatigue_scan_depth: z
    .enum(["surface", "medium", "deep"])
    .default("medium")
    .describe("How deeply to scan for lexical fatigue patterns"),
  critical_threshold: z
    .number()
    .int()
    .min(0)
    .max(5)
    .describe("Max allowed critical-severity issues before FAIL"),
  warning_threshold: z
    .number()
    .int()
    .min(0)
    .max(20)
    .describe("Max allowed warning-severity issues before FAIL"),
});

export type ContinuityParams = z.infer<typeof ContinuityParamsSchema>;

export const DEFAULT_CONTINUITY_PARAMS: ContinuityParams = {
  ooc_strictness: 0.7,
  pacing_weight: 0.6,
  info_boundary_weight: 0.7,
  power_scaling_weight: 0.6,
  fatigue_scan_depth: "medium",
  critical_threshold: 0,
  warning_threshold: 5,
};

// ---------------------------------------------------------------------------
// Settler knobs
// ---------------------------------------------------------------------------

export const SettlerParamsSchema = z.object({
  settler_temperature: z
    .number()
    .min(0.1)
    .max(0.5)
    .describe("LLM temperature for Settler phase"),
  over_extract_bias: z
    .number()
    .min(0.0)
    .max(1.0)
    .describe(
      "Bias toward over-extraction (1.0 = extract everything, 0.0 = only certain facts)",
    ),
  enforce_ledger_verification: z
    .boolean()
    .describe("Enforce numerical ledger verification (期初+增量=期末)"),
});

export type SettlerParams = z.infer<typeof SettlerParamsSchema>;

export const DEFAULT_SETTLER_PARAMS: SettlerParams = {
  settler_temperature: 0.2,
  over_extract_bias: 0.7,
  enforce_ledger_verification: true,
};

// ---------------------------------------------------------------------------
// Combined parameter set
// ---------------------------------------------------------------------------

export const AllParamsSchema = z.object({
  writer: WriterParamsSchema,
  continuity: ContinuityParamsSchema,
  settler: SettlerParamsSchema,
});

export type AllParams = z.infer<typeof AllParamsSchema>;

export const DEFAULT_ALL_PARAMS: AllParams = {
  writer: DEFAULT_WRITER_PARAMS,
  continuity: DEFAULT_CONTINUITY_PARAMS,
  settler: DEFAULT_SETTLER_PARAMS,
};

// ---------------------------------------------------------------------------
// Parameter bounds (flat dict for GEPA)
// ---------------------------------------------------------------------------

/** Flat parameter bounds: param_name -> [min, max]. Sync with Python PARAM_BOUNDS. */
export const PARAM_BOUNDS: Record<string, readonly [number, number]> = {
  // Writer
  writer_temperature_creative: [0.5, 0.9],
  writer_temperature_settlement: [0.1, 0.4],
  max_transition_markers_per_3k: [0, 5],
  max_hedge_words_per_chapter: [0, 10],
  paragraph_uniformity_cv_threshold: [0.05, 0.35],
  length_soft_tolerance_pct: [0.05, 0.25],
  length_hard_tolerance_pct: [0.1, 0.4],
  max_consecutive_dialogue_paragraphs: [2, 8],
  // Continuity
  ooc_strictness: [0.0, 1.0],
  pacing_weight: [0.0, 1.0],
  info_boundary_weight: [0.0, 1.0],
  power_scaling_weight: [0.0, 1.0],
  critical_threshold: [0, 5],
  warning_threshold: [0, 20],
  // Settler
  settler_temperature: [0.1, 0.5],
  over_extract_bias: [0.0, 1.0],
};

/** All boolean params (not in PARAM_BOUNDS, handled separately). */
export const BOOLEAN_PARAMS = [
  "disable_analysis_terms",
  "enforce_golden_chapters",
  "enforce_sensory_details",
  "enforce_ledger_verification",
] as const;

/** Categorical params (enum, not numeric). */
export const CATEGORICAL_PARAMS = ["fatigue_scan_depth"] as const;
