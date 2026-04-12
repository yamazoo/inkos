/**
 * Prompt tuning module: GEPA-based prompt optimization for InkOS.
 *
 * @example
 * import { optimizePrompts } from "@actalk/inkos-core";
 *
 * const run = await optimizePrompts({
 *   bookId: "my-book",
 *   agent: "writer",
 *   maxEvaluations: 50,
 * });
 * console.log(run.best_candidate.scores);
 */

// Parameter space
export {
  WriterParamsSchema,
  ContinuityParamsSchema,
  SettlerParamsSchema,
  AllParamsSchema,
  DEFAULT_WRITER_PARAMS,
  DEFAULT_CONTINUITY_PARAMS,
  DEFAULT_SETTLER_PARAMS,
  DEFAULT_ALL_PARAMS,
  PARAM_BOUNDS,
  BOOLEAN_PARAMS,
  CATEGORICAL_PARAMS,
} from "./parameter-space.js";

export type {
  WriterParams,
  ContinuityParams,
  SettlerParams,
  AllParams,
} from "./parameter-space.js";

// Optimization results
export {
  MultiObjectiveScoreSchema,
  OptimizationCandidateSchema,
  OptimizationRunSchema,
  serializeRun,
  parseRun,
  candidateToSeed,
  seedToParams,
} from "./optimization-result.js";

export type {
  MultiObjectiveScore,
  OptimizationCandidate,
  OptimizationRun,
} from "./optimization-result.js";

// Evaluation
export {
  computeAITellDensity,
  computeWordCountAccuracy,
  evaluateChapter,
  aggregateChapterScores,
  splitChaptersForOptimization,
} from "./evaluator-adapter.js";

export type { ChapterEvaluationResult } from "./evaluator-adapter.js";

// Orchestrator
export { OptimizePrompts, optimizePrompts } from "./optimizer.js";

// History
export {
  appendHistory,
  readHistory,
  getLatestRun,
  getOptimizationTrajectory,
} from "./history.js";

// Applier
export { createBackup, applyWriterParams, applyOptimizedRun } from "./applier.js";
