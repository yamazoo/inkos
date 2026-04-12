/**
 * Optimization history: append-only log of all GEPA optimization runs.
 * Stored in books/<id>/story/.optimization/history.jsonl (one JSON per line).
 */

import { readFile, writeFile, mkdir, readdir } from "node:fs/promises";
import { join } from "node:path";
import { existsSync } from "node:fs";
import { parseRun, serializeRun } from "./optimization-result.js";
import type { OptimizationRun } from "./optimization-result.js";

const HISTORY_FILE = "history.jsonl";
const OPTIMIZATION_DIR = ".optimization";

/**
 * Append a run to the history file.
 */
export async function appendHistory(
  projectRoot: string,
  bookId: string,
  run: OptimizationRun,
): Promise<void> {
  const dir = join(projectRoot, "books", bookId, "story", OPTIMIZATION_DIR);
  await mkdir(dir, { recursive: true });

  const path = join(dir, HISTORY_FILE);
  const line = JSON.stringify(run) + "\n";
  await writeFile(path, line, { flag: "a", encoding: "utf-8" });
}

/**
 * Read all optimization runs from history.
 */
export async function readHistory(
  projectRoot: string,
  bookId: string,
): Promise<OptimizationRun[]> {
  const path = join(
    projectRoot,
    "books",
    bookId,
    "story",
    OPTIMIZATION_DIR,
    HISTORY_FILE,
  );

  if (!existsSync(path)) return [];

  const raw = await readFile(path, "utf-8");
  const lines = raw.split("\n").filter((l) => l.trim().length > 0);

  const runs: OptimizationRun[] = [];
  for (const line of lines) {
    try {
      runs.push(parseRun(line));
    } catch {
      // Skip malformed lines
    }
  }

  return runs;
}

/**
 * Get the most recent optimization run.
 */
export async function getLatestRun(
  projectRoot: string,
  bookId: string,
): Promise<OptimizationRun | null> {
  const runs = await readHistory(projectRoot, bookId);
  return runs[runs.length - 1] ?? null;
}

/**
 * Get all Pareto fronts from history, ordered by timestamp.
 */
export async function getOptimizationTrajectory(
  projectRoot: string,
  bookId: string,
): Promise<
  Array<{
    runId: string;
    timestamp: string;
    bestComposite: number;
    paretoSize: number;
  }>
> {
  const runs = await readHistory(projectRoot, bookId);
  return runs.map((r) => ({
    runId: r.id,
    timestamp: r.timestamp,
    bestComposite: r.best_candidate.scores.composite,
    paretoSize: r.pareto_front.length,
  }));
}
