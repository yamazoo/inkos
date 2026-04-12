/**
 * InkOS Prompt Optimizer: orchestrates the full GEPA optimization loop.
 *
 * Flow:
 * 1. Read book config and chapter index
 * 2. Apply train/val split
 * 3. Write parameter space + evaluator config as JSON to temp file
 * 4. Spawn Python GEPA process: python -m gepa_wrapper.cli --config <tmp.json>
 * 5. Poll for completion, read results JSON
 * 6. Save results to .optimization/ directory
 * 7. Run validation evaluation on held-out chapters
 */

import { spawn } from "node:child_process";
import { randomUUID } from "node:crypto";
import { writeFile, mkdir, readFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { tmpdir } from "node:os";
import { existsSync, readFileSync } from "node:fs";
import { z } from "zod";
import {
  OptimizationRunSchema,
  candidateToSeed,
  seedToParams,
} from "./optimization-result.js";
import {
  DEFAULT_ALL_PARAMS,
  WriterParamsSchema,
  ContinuityParamsSchema,
  SettlerParamsSchema,
} from "./parameter-space.js";
import { splitChaptersForOptimization } from "./evaluator-adapter.js";

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

export interface OptimizePromptsOptions {
  bookId: string;
  agent?: "writer" | "auditor" | "settler" | "all";
  objectives?: {
    audit_pass_rate?: number;
    aigc_resistance?: number;
    wordcount_accuracy?: number;
    ai_tell_density?: number;
  };
  maxEvaluations?: number;
  trainChapters?: readonly [number, number];
  valChapters?: readonly [number, number];
  dryRun?: boolean;
  reflectionLm?: string;
  taskLm?: string;
  projectRoot?: string;
}

const DEFAULT_MAX_EVALUATIONS = 50;

// ---------------------------------------------------------------------------
// Main orchestrator
// ---------------------------------------------------------------------------

export class OptimizePrompts {
  private readonly projectRoot: string;
  private readonly bookId: string;
  private readonly agent: "writer" | "auditor" | "settler" | "all";
  private readonly maxEvals: number;
  private readonly objectives: Required<NonNullable<OptimizePromptsOptions["objectives"]>>;
  private readonly reflectionLm: string;
  private readonly taskLm: string;
  private readonly dryRun: boolean;

  constructor(options: OptimizePromptsOptions) {
    this.projectRoot = resolve(options.projectRoot ?? process.cwd());
    this.bookId = options.bookId;
    this.agent = options.agent ?? "all";
    this.maxEvals = options.maxEvaluations ?? DEFAULT_MAX_EVALUATIONS;
    this.objectives = {
      audit_pass_rate: options.objectives?.audit_pass_rate ?? 0.35,
      aigc_resistance: options.objectives?.aigc_resistance ?? 0.30,
      wordcount_accuracy: options.objectives?.wordcount_accuracy ?? 0.20,
      ai_tell_density: options.objectives?.ai_tell_density ?? 0.15,
    };
    this.reflectionLm = options.reflectionLm ?? "openai/gpt-4.1-mini";
    this.taskLm = options.taskLm ?? options.reflectionLm ?? "openai/gpt-4.1-mini";
    this.dryRun = options.dryRun ?? false;
  }

  async run(
    trainChapters: number[],
    valChapters: number[],
    progressCallback?: (msg: string) => void,
  ): Promise<z.infer<typeof OptimizationRunSchema>> {
    const runId = randomUUID();
    const timestamp = new Date().toISOString();

    progressCallback?.(`[${timestamp}] Starting optimization run ${runId}`);
    progressCallback?.(
      `Train chapters: ${trainChapters.join(",")} | Val chapters: ${valChapters.join(",")}`,
    );
    progressCallback?.(`Max evaluations: ${this.maxEvals}`);

    const seedCandidate = this.buildSeedCandidate();

    const gepaConfig = {
      project_root: this.projectRoot,
      book_id: this.bookId,
      agent: this.agent,
      train_chapters: trainChapters,
      val_chapters: valChapters,
      objectives: this.objectives,
      seed_candidate: seedCandidate,
    };

    const result = await this.runGepaProcess(gepaConfig, progressCallback);
    const parsed = this.parseGepaResult(result);

    const run: z.infer<typeof OptimizationRunSchema> = {
      id: runId,
      timestamp,
      book_id: this.bookId,
      agent: this.agent,
      train_chapters: trainChapters,
      val_chapters: valChapters,
      evaluations: this.maxEvals,
      pareto_front: parsed.paretoFront,
      best_candidate: parsed.bestCandidate,
      training_metrics: parsed.bestCandidate.scores,
      validation_metrics: undefined,
      dry_run: this.dryRun,
    };

    await this.saveRun(run);
    return run;
  }

  private buildSeedCandidate(): Record<string, number | boolean> {
    // Use double-underscore (writer__) to separate agent prefix from param name.
    // This allows seedToParams to unambiguously split on "__" and reconstruct
    // the schema key "writer_temperature_creative" from ["writer", "temperature_creative"].
    const seed: Record<string, number | boolean> = {};
    const defaults = DEFAULT_ALL_PARAMS;

    if (this.agent === "all" || this.agent === "writer") {
      for (const [k, v] of Object.entries(defaults.writer)) {
        if (typeof v === "number" || typeof v === "boolean") {
          seed[`writer__${k}`] = v;
        }
      }
    }

    if (this.agent === "all" || this.agent === "auditor") {
      for (const [k, v] of Object.entries(defaults.continuity)) {
        if (typeof v === "number" || typeof v === "boolean") {
          seed[`continuity__${k}`] = v;
        }
      }
    }

    if (this.agent === "all" || this.agent === "settler") {
      for (const [k, v] of Object.entries(defaults.settler)) {
        if (typeof v === "number" || typeof v === "boolean") {
          seed[`settler__${k}`] = v;
        }
      }
    }

    return seed;
  }

  private async runGepaProcess(
    config: Record<string, unknown>,
    progressCallback?: (msg: string) => void,
  ): Promise<string> {
    const tmpConfigPath = join(tmpdir(), `gepa-config-${randomUUID()}.json`);
    const tmpResultPath = join(tmpdir(), `gepa-result-${randomUUID()}.json`);
    await writeFile(tmpConfigPath, JSON.stringify(config, null, 2), "utf-8");

    progressCallback?.(`Config written to ${tmpConfigPath}`);

    const pythonExe = this.findPythonExe();
    const gepaPackage = join(this.projectRoot, "packages", "gepa");

    const baseArgs = [
      "-m",
      "gepa_wrapper.cli",
      "--config",
      tmpConfigPath,
      "--output",
      tmpResultPath,
      "--max-evals",
      String(this.maxEvals),
      "--reflection-lm",
      this.reflectionLm,
    ];

    let exe: string;
    let args: string[];
    if (pythonExe === "cmd") {
      // Windows fallback: use cmd /c python (may have stdout buffering issues)
      exe = "cmd";
      args = ["/c", "python", ...baseArgs];
    } else {
      // Direct spawn of python executable — avoids cmd.exe shell buffering
      exe = pythonExe;
      args = baseArgs;
    }

    return new Promise((resolve, reject) => {
      progressCallback?.(`Running: ${pythonExe} ${args.join(" ")}`);

      const proc = spawn(exe, args, {
        cwd: gepaPackage,
        stdio: ["pipe", "pipe", "pipe"],
        windowsHide: true,
        env: { ...process.env, ...loadEnvFile(this.projectRoot) },
      });

      let stdout = "";
      let stderr = "";

      proc.stdout?.on("data", (data: Buffer | string) => {
        const chunk = typeof data === "string" ? data : data.toString("utf-8");
        stdout += chunk;
        // GEPA iteration logs go to stdout; redirect to progress callback
        for (const line of chunk.split("\n")) {
          if (line.trim()) progressCallback?.(`[GEPA] ${line.trim()}`);
        }
      });

      proc.stderr?.on("data", (data: Buffer | string) => {
        stderr += typeof data === "string" ? data : data.toString("utf-8");
      });

      proc.on("close", async (code: number | null) => {
        progressCallback?.(`GEPA process exited with code ${code}`);
        if (code === 0) {
          // Read result from file (clean JSON, no GEPA log contamination)
          try {
            const result = await readFile(tmpResultPath, "utf-8");
            resolve(result);
          } catch {
            // Fallback: try to extract JSON from stdout
            resolve(stdout);
          }
        } else {
          reject(
            new Error(
              `GEPA process failed (exit ${code}): ${stderr.slice(-500)}`,
            ),
          );
        }
      });

      proc.on("error", (err: Error) => {
        reject(err);
      });
    });
  }

  private parseGepaResult(
    output: string,
  ): {
    paretoFront: z.infer<typeof OptimizationRunSchema>["pareto_front"];
    bestCandidate: z.infer<typeof OptimizationRunSchema>["best_candidate"];
  } {
    const lines = output.trim().split("\n");
    // Strip [GEPA] prefix from each line, keep lines that are JSON fragments
    const jsonLines = lines
      .map((l: string) => l.replace(/^\[GEPA\]\s*/, ""))
      .filter(
        (l: string) =>
          l.trim().length > 0 &&
          (l.trim().startsWith('"') ||
            l.trim() === "{" ||
            l.trim() === "}" ||
            l.trim() === "[" ||
            l.trim() === "]"),
      );
    const mergedOutput = jsonLines.join("\n");
    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(mergedOutput);
    } catch {
      // Fallback: try finding the JSON object in the raw output
      const match = output.match(/\{[\s\S]*"status"[\s\S]*\}/);
      if (!match) {
        throw new Error(`Could not parse GEPA output as JSON: ${output.slice(-500)}`);
      }
      parsed = JSON.parse(match[0]);
    }

    if (parsed.status === "error") {
      throw new Error(`GEPA error: ${parsed.error}`);
    }

    const result = parsed.result as Record<string, unknown> | undefined;
    const bestCandidateRaw = (result ?? parsed).best_candidate as
      | Record<string, unknown>
      | undefined;
    const candidates = this.extractCandidatesFromResult(result ?? parsed);

    const defaultScores = {
      audit_pass_rate: 0,
      aigc_resistance: 0,
      wordcount_accuracy: 0,
      ai_tell_density: 0,
      composite: 0,
    };

    // GEPA's best_candidate may have empty params (a known GEPA quirk).
    // Use the composite score from best_candidate to find the matching
    // candidate in the candidates array and merge its params with the
    // best_candidate's scores.
    const bestComposite =
      (bestCandidateRaw?.scores as Record<string, number> | undefined)
        ?.composite ?? 0;

    const bestByComposite = [...candidates].sort(
      (a, b) => b.scores.composite - a.scores.composite,
    )[0];

    let bestCandidate: z.infer<typeof OptimizationRunSchema>["best_candidate"];
    if (bestByComposite && bestComposite > 0) {
      // Merge: params from best candidate in array + scores from GEPA best_candidate
      bestCandidate = {
        id: bestByComposite.id,
        params: bestByComposite.params,
        scores: {
          audit_pass_rate:
            (bestCandidateRaw?.scores as Record<string, number>)?.audit_pass_rate ??
            bestByComposite.scores.audit_pass_rate,
          aigc_resistance:
            (bestCandidateRaw?.scores as Record<string, number>)?.aigc_resistance ??
            bestByComposite.scores.aigc_resistance,
          wordcount_accuracy:
            (bestCandidateRaw?.scores as Record<string, number>)?.wordcount_accuracy ??
            bestByComposite.scores.wordcount_accuracy,
          ai_tell_density:
            (bestCandidateRaw?.scores as Record<string, number>)?.ai_tell_density ??
            bestByComposite.scores.ai_tell_density,
          composite: bestComposite,
        },
        rank: bestByComposite.rank,
      };
    } else {
      bestCandidate =
        candidates.find((c) => c.rank === 0) ?? candidates[0] ?? {
          id: "default",
          params: DEFAULT_ALL_PARAMS,
          scores: defaultScores,
          rank: 0,
        };
    }

    return {
      paretoFront: candidates,
      bestCandidate,
    };
  }

  private extractCandidatesFromResult(
    result: Record<string, unknown>,
  ): z.infer<typeof OptimizationRunSchema>["pareto_front"] {
    const candidates: z.infer<typeof OptimizationRunSchema>["pareto_front"] = [];
    const raw = (result.candidates ?? result.pareto_front ?? []) as Array<
      Record<string, unknown>
    >;

    for (const c of raw) {
      try {
        const params = seedToParams((c.params ?? c) as Record<string, number | boolean>);
        const rawScores = (c.scores ?? c.fitness ?? {}) as Record<string, number>;
        const scores = {
          audit_pass_rate: rawScores.audit_pass_rate ?? 0,
          aigc_resistance: rawScores.aigc_resistance ?? 0,
          wordcount_accuracy: rawScores.wordcount_accuracy ?? 0,
          ai_tell_density: rawScores.ai_tell_density ?? 0.5,
          composite: rawScores.composite ?? rawScores.fitness ?? 0,
        };

        const parsedParams = {
          writer: WriterParamsSchema.parse(params.writer),
          continuity: ContinuityParamsSchema.parse(params.continuity),
          settler: SettlerParamsSchema.parse(params.settler),
        };

        candidates.push({
          id: String(c.id ?? c.candidate_id ?? `cand_${candidates.length}`),
          params: parsedParams,
          scores,
          rank: Number(c.rank ?? c.pareto_rank ?? 0),
          metadata:
            c.generation !== undefined
              ? { generation: Number(c.generation) }
              : undefined,
        });
      } catch {
        // Skip malformed candidates
      }
    }

    return candidates;
  }

  private findPythonExe(): string {
    // Find the actual python executable path so we can spawn it directly (not via cmd.exe).
    // cmd.exe shell buffering causes stdout capture issues on Windows.
    if (process.platform === "win32") {
      try {
        const { execSync } = require("node:child_process");
        // sys.executable gives the actual python.exe path (Anaconda etc.)
        const pythonPath: string = execSync(
          'cmd /c python -c "import sys; print(sys.executable)"',
          { stdio: "pipe", encoding: "utf-8", windowsHide: true },
        ).trim();
        if (pythonPath && pythonPath.length > 0 && pythonPath.endsWith("python.exe")) {
          return pythonPath;
        }
      } catch {
        // fall through
      }
    }
    for (const exe of ["python3", "python"]) {
      try {
        const { execSync } = require("node:child_process");
        execSync(`${exe} --version`, { stdio: "ignore" });
        return exe;
      } catch {
        // continue
      }
    }
    return process.platform === "win32" ? "cmd" : "python3";
  }

  private async saveRun(
    run: z.infer<typeof OptimizationRunSchema>,
  ): Promise<void> {
    const historyDir = join(
      this.projectRoot,
      "books",
      this.bookId,
      "story",
      ".optimization",
    );

    if (!existsSync(historyDir)) {
      await mkdir(historyDir, { recursive: true });
    }

    const historyFile = join(historyDir, "history.jsonl");
    const line = JSON.stringify(run) + "\n";
    await writeFile(historyFile, line, { flag: "a", encoding: "utf-8" });
  }
}

// ---------------------------------------------------------------------------
// Environment helpers
// ---------------------------------------------------------------------------

/** Load key=value lines from a .env file in the project root. */
function loadEnvFile(projectRoot: string): Record<string, string> {
  const envPath = join(projectRoot, ".env");
  if (!existsSync(envPath)) return {};

  try {
    const content = readFileSync(envPath, "utf-8");
    const env: Record<string, string> = {};
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eqIdx = trimmed.indexOf("=");
      if (eqIdx === -1) continue;
      const key = trimmed.slice(0, eqIdx).trim();
      const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, "");
      if (key) env[key] = val;
    }
    return env;
  } catch {
    return {};
  }
}

// ---------------------------------------------------------------------------
// Convenience API
// ---------------------------------------------------------------------------

export async function optimizePrompts(
  options: OptimizePromptsOptions,
  progressCallback?: (msg: string) => void,
): Promise<z.infer<typeof OptimizationRunSchema>> {
  const root = resolve(options.projectRoot ?? process.cwd());

  const { train_chapters, val_chapters } = await splitChaptersForOptimization(
    root,
    options.bookId,
    options.trainChapters,
    options.valChapters,
  );

  if (train_chapters.length === 0) {
    throw new Error(
      `No approved/ready-for-review chapters found for book "${options.bookId}". ` +
        "At least one chapter with status 'approved' or 'ready-for-review' is required.",
    );
  }

  const optimizer = new OptimizePrompts(options);
  return optimizer.run(train_chapters, val_chapters, progressCallback);
}
