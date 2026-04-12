/**
 * Zod schemas for GEPA optimization results.
 * Captures the full optimization run output: Pareto front, best candidate,
 * train/val metrics, and run metadata.
 */

import { z } from "zod";
import {
  WriterParamsSchema,
  ContinuityParamsSchema,
  SettlerParamsSchema,
  AllParamsSchema,
  DEFAULT_CONTINUITY_PARAMS,
  DEFAULT_SETTLER_PARAMS,
} from "./parameter-space.js";

// ---------------------------------------------------------------------------
// Multi-objective score
// ---------------------------------------------------------------------------

export const MultiObjectiveScoreSchema = z.object({
  /** Fraction of evaluated chapters that passed ContinuityAuditor (0–1). */
  audit_pass_rate: z.number().min(0).max(1),
  /** AIGC resistance score: higher = more human-like (0–1). */
  aigc_resistance: z.number().min(0).max(1),
  /** Word count accuracy: 1 = exact match, 0 = way off target (0–1). */
  wordcount_accuracy: z.number().min(0).max(1),
  /** AI-tell density: lower = better, inverted to 0–1 (0–1, higher = better). */
  ai_tell_density: z.number().min(0).max(1),
  /** Weighted composite of all objectives (0–1). */
  composite: z.number().min(0).max(1),
});

export type MultiObjectiveScore = z.infer<typeof MultiObjectiveScoreSchema>;

// ---------------------------------------------------------------------------
// Optimization candidate
// ---------------------------------------------------------------------------

export const OptimizationCandidateSchema = z.object({
  /** Unique identifier for this candidate (e.g. "cand_001"). */
  id: z.string(),
  /** The parameter values for this candidate. */
  params: AllParamsSchema,
  /** Scores across all objectives. */
  scores: MultiObjectiveScoreSchema,
  /** Pareto rank (0 = on Pareto front). Lower = better. */
  rank: z.number().int().min(0),
  /** GEPA-specific metadata. */
  metadata: z
    .object({
      generation: z.number().int().optional(),
      mutation_from: z.string().optional(),
      fitness_history: z.array(z.number()).optional(),
    })
    .optional(),
});

export type OptimizationCandidate = z.infer<
  typeof OptimizationCandidateSchema
>;

// ---------------------------------------------------------------------------
// Optimization run
// ---------------------------------------------------------------------------

export const OptimizationRunSchema = z.object({
  /** Unique run identifier (UUID). */
  id: z.string(),
  /** ISO timestamp when optimization started. */
  timestamp: z.string(),
  /** Book ID this run optimized for. */
  book_id: z.string(),
  /** Which agent(s) were optimized. */
  agent: z.enum(["writer", "auditor", "settler", "all"]),
  /** Training chapter numbers used for optimization. */
  train_chapters: z.array(z.number().int()),
  /** Held-out validation chapter numbers. */
  val_chapters: z.array(z.number().int()),
  /** Number of GEPA evaluations performed. */
  evaluations: z.number().int(),
  /** All Pareto-optimal candidates found. */
  pareto_front: z.array(OptimizationCandidateSchema),
  /** Best candidate by composite score. */
  best_candidate: OptimizationCandidateSchema,
  /** Scores on training chapters for best candidate. */
  training_metrics: MultiObjectiveScoreSchema,
  /** Scores on validation chapters for best candidate. */
  validation_metrics: MultiObjectiveScoreSchema.optional(),
  /** GEPA version used. */
  gepa_version: z.string().optional(),
  /** Whether this run was a dry-run (not applied). */
  dry_run: z.boolean().default(false),
});

export type OptimizationRun = z.infer<typeof OptimizationRunSchema>;

// ---------------------------------------------------------------------------
// 
// 

/**
 * Serialize an OptimizationRun to JSON for persistence.
 */
export function serializeRun(run: OptimizationRun): string {
  return JSON.stringify(run, null, 2);
}

/**
 * Deserialize an OptimizationRun from JSON.
 */
export function parseRun(json: string): OptimizationRun {
  return OptimizationRunSchema.parse(JSON.parse(json));
}

/**
 * Serialize a single OptimizationCandidate to a flat dict
 * suitable for GEPA seed_candidate input.
 */
export function candidateToSeed(candidate: OptimizationCandidate): Record<string, number | boolean> {
  const flat: Record<string, number | boolean> = {};

  // Writer params
  for (const [k, v] of Object.entries(candidate.params.writer)) {
    if (typeof v === "number" || typeof v === "boolean") {
      flat[`writer_${k}`] = v;
    }
  }

  // Continuity params
  for (const [k, v] of Object.entries(candidate.params.continuity)) {
    if (typeof v === "number" || typeof v === "boolean") {
      flat[`continuity_${k}`] = v;
    }
  }

  // Settler params
  for (const [k, v] of Object.entries(candidate.params.settler)) {
    if (typeof v === "number" || typeof v === "boolean") {
      flat[`settler_${k}`] = v;
    }
  }

  return flat;
}

/**
 * Parse a flat seed dict back into a candidate params object.
 * Handles the double-underscore format: "writer__writer_temperature_creative"
 * splits on "__", 1 to get ["writer", "writer_temperature_creative"].
 * The rest IS the schema key (writer_temperature_creative is already in rest).
 *
 * Coerces near-integer floats to nearest int for .int() fields,
 * and fills missing continuity/settler params with defaults.
 */
export function seedToParams(
  seed: Record<string, number | boolean>,
): { writer: Record<string, number | boolean>; continuity: Record<string, number | boolean>; settler: Record<string, number | boolean> } {
  const writer: Record<string, number | boolean> = {};
  const continuity: Record<string, number | boolean> = {};
  const settler: Record<string, number | boolean> = {};

  const BOOLEAN_FIELD_NAMES = new Set([
    "disable_analysis_terms",
    "enforce_golden_chapters",
    "enforce_sensory_details",
    "enforce_ledger_verification",
    "pacing_force_cuts",
  ]);

  const INT_FIELD_NAMES = new Set([
    "max_transition_markers_per_3k",
    "max_hedge_words_per_chapter",
    "max_consecutive_dialogue_paragraphs",
    "critical_threshold",
    "warning_threshold",
  ]);

  function coerce(val: number | boolean, fieldName: string): number | boolean {
    // Booleans for boolean-schema fields pass through unchanged
    if (typeof val === "boolean") {
      if (BOOLEAN_FIELD_NAMES.has(fieldName)) return val;
      // Boolean passed for a numeric field (e.g. max_transition_markers_per_3k=true):
      // convert to 1/0 so Zod number().int() validation succeeds
      return val ? 1 : 0;
    }
    if (BOOLEAN_FIELD_NAMES.has(fieldName)) return Math.round(val) === 1;
    if (INT_FIELD_NAMES.has(fieldName)) return Math.round(val);
    return val;
  }

  for (const [k, v] of Object.entries(seed)) {
    const idx = k.indexOf("__");
    if (idx !== -1) {
      // Key format: "writer__writer_temperature_creative" = prefix + "__" + schemaKey
      // prefix = "writer", schemaKey = "writer_temperature_creative"
      // The schemaKey already contains the agent prefix (writer_) as part of the param name.
      const prefix = k.slice(0, idx);
      const schemaKey = k.slice(idx + 2); // e.g. "writer__temperature_creative" → "temperature_creative"
      // But since param names in DEFAULT_WRITER_PARAMS are like "writer_temperature_creative",
      // the full schemaKey in Python format is "writer__writer_temperature_creative".
      // For this key, schemaKey = "writer__temperature_creative" which still has the prefix.
      // The actual schema key is: prefix + "_" + rest (e.g., "writer_temperature_creative").
      const restPart = k.slice(idx + 2); // e.g. "writer__temperature_creative"
      const secondIdx = restPart.indexOf("__");
      let finalKey: string;
      if (secondIdx !== -1 && prefix === restPart.slice(0, secondIdx)) {
        // Double-prefixed: "writer__writer__temperature_creative" → "writer_temperature_creative"
        finalKey = restPart.slice(secondIdx + 2);
      } else {
        // Already single: "writer__temperature_creative" → "temperature_creative"
        finalKey = restPart;
      }
      const coerced = coerce(v, finalKey);
      if (prefix === "writer") {
        writer[finalKey] = coerced;
      } else if (prefix === "continuity") {
        continuity[finalKey] = coerced;
      } else if (prefix === "settler") {
        settler[finalKey] = coerced;
      }
    } else {
      const first = k.split("_")[0];
      const coerced = coerce(v, k);
      if (first === "writer") writer[k] = coerced;
      else if (first === "continuity") continuity[k] = coerced;
      else if (first === "settler") settler[k] = coerced;
    }
  }

  // Fill missing continuity/settler with defaults (required by schema, including enum fields)
  for (const [k, v] of Object.entries(DEFAULT_CONTINUITY_PARAMS)) {
    if (continuity[k] === undefined) {
      continuity[k] = v as number | boolean;
    }
  }
  for (const [k, v] of Object.entries(DEFAULT_SETTLER_PARAMS)) {
    if (settler[k] === undefined) {
      settler[k] = v as number | boolean;
    }
  }

  return { writer, continuity, settler };
}
