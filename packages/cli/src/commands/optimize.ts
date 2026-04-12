import { Command } from "commander";
import {
  optimizePrompts,
  splitChaptersForOptimization,
  readHistory,
  getOptimizationTrajectory,
  applyOptimizedRun,
  createBackup,
} from "@actalk/inkos-core";
import { findProjectRoot, resolveBookId } from "../utils.js";

function parseRange(range?: string): readonly [number, number] | undefined {
  if (!range) return undefined;
  const [start, end] = range.split("-").map((s) => parseInt(s.trim()));
  if (isNaN(start) || isNaN(end)) return undefined;
  return [start, end];
}

function printScoreBar(score: number, width = 20): string {
  const filled = Math.round(score * width);
  const bar = "█".repeat(filled) + "░".repeat(width - filled);
  return `${bar} ${(score * 100).toFixed(1)}%`;
}

function printScores(metrics: {
  audit_pass_rate: number;
  aigc_resistance: number;
  wordcount_accuracy: number;
  ai_tell_density: number;
  composite: number;
}): void {
  console.log("  Audit pass rate   ", printScoreBar(metrics.audit_pass_rate));
  console.log("  AIGC resistance   ", printScoreBar(metrics.aigc_resistance));
  console.log("  Word count acc   ", printScoreBar(metrics.wordcount_accuracy));
  console.log("  AI-tell density  ", printScoreBar(metrics.ai_tell_density));
  console.log("  ─────────────────────────────");
  console.log("  Composite        ", printScoreBar(metrics.composite));
}

function printCandidate(
  label: string,
  cand: {
    id: string;
    rank: number;
    scores: {
      audit_pass_rate: number;
      aigc_resistance: number;
      wordcount_accuracy: number;
      ai_tell_density: number;
      composite: number;
    };
  },
): void {
  console.log(`\n  ${label} (rank=${cand.rank}, id=${cand.id})`);
  printScores(cand.scores);
}

export const optimizeCommand = new Command("optimize")
  .description("Optimize InkOS writing prompts using GEPA (Genetic-Pareto Evolutionary Prompt Optimization)")
  .addHelpText(
    "before",
    `InkOS Prompt Optimization via GEPA
https://github.com/gepa-ai/gepa

Optimizes writer/auditor/settler system prompts using evolutionary search
across multiple objectives: audit pass rate, AIGC resistance, word count accuracy.

Examples:
  inkos optimize prompts my-book --agent writer --evaluations 50
  inkos optimize prompts my-book --train-chapters 1-10 --val-chapters 11-15
  inkos optimize prompts my-book --objectives audit,aigc --dry-run
  inkos optimize history my-book --last 5
`,
  );

// ---------------------------------------------------------------------------
// optimize prompts
// ---------------------------------------------------------------------------

const promptsSub = new Command("prompts")
  .description("Run GEPA prompt optimization for a book");

promptsSub
  .argument("[book-id]", "Book ID (auto-detected if only one book)")
  .option(
    "--agent <name>",
    "Which agent to optimize: writer|auditor|settler|all (default: all)",
    "all",
  )
  .option(
    "--objectives <list>",
    "Objectives to optimize: audit,aigc,wordcount,aitells,all (default: all)",
    "all",
  )
  .option(
    "-e, --evaluations <n>",
    "Max GEPA evaluations (default: 50, recommended: 50-100)",
    "50",
  )
  .option(
    "--train-chapters <range>",
    "Training chapter range, e.g. 1-10",
  )
  .option(
    "--val-chapters <range>",
    "Validation chapter range, e.g. 11-15",
  )
  .option(
    "--reflection-lm <model>",
    "LLM for GEPA reflection step (default: openai/gpt-4.1-mini)",
  )
  .option(
    "--task-lm <model>",
    "LLM for InkOS task execution (default: same as reflection-lm)",
  )
  .option(
    "--dry-run",
    "Evaluate without applying results (always do this first)",
    false,
  )
  .option(
    "--apply",
    "Apply the best candidate's parameters to the project after optimization",
    false,
  )
  .option("--json", "Output JSON only")
  .action(
    async (
      bookIdArg: string | undefined,
      opts: {
        agent?: string;
        objectives?: string;
        evaluations?: string;
        trainChapters?: string;
        valChapters?: string;
        reflectionLm?: string;
        taskLm?: string;
        dryRun?: boolean;
        apply?: boolean;
        json?: boolean;
      },
    ) => {
      const root = findProjectRoot();
      const bookId = await resolveBookId(bookIdArg, root);

      if (!opts.json) {
        console.log(`\n🎯 GEPA Prompt Optimization`);
        console.log(`   Book: ${bookId}`);
        console.log(`   Agent: ${opts.agent ?? "all"}`);
        console.log(`   Evaluations: ${opts.evaluations ?? "50"}`);
        console.log("");
      }

      // Parse objectives
      const objList = (opts.objectives ?? "all").split(",") as string[];
      const objectives: Record<string, number> = {};
      const weights: Record<string, number> = {
        audit: 0.35,
        aigc: 0.30,
        wordcount: 0.20,
        aitells: 0.15,
      };
      if (objList.includes("all")) {
        Object.assign(objectives, weights);
      } else {
        for (const o of objList) {
          const key =
            o === "wordcount"
              ? "wordcount_accuracy"
              : o === "aitells"
                ? "ai_tell_density"
                : o === "audit"
                  ? "audit_pass_rate"
                  : o === "aigc"
                    ? "aigc_resistance"
                    : o;
          objectives[key] = weights[o] ?? 0.25;
        }
      }

      // Resolve chapter ranges
      let trainRange = parseRange(opts.trainChapters);
      let valRange = parseRange(opts.valChapters);

      if (!trainRange || !valRange) {
        const { train_chapters, val_chapters } = await splitChaptersForOptimization(
          root,
          bookId,
          trainRange ?? undefined,
          valRange ?? undefined,
        );
        if (train_chapters.length === 0) {
          console.error(
            `Error: No approved/ready-for-review chapters found for book "${bookId}".`,
          );
          process.exit(1);
        }
        trainRange ??= [train_chapters[0], train_chapters[train_chapters.length - 1]] as const;
        valRange ??= val_chapters.length > 0
          ? [val_chapters[0], val_chapters[val_chapters.length - 1]] as const
          : undefined;
      }

      if (!opts.json) {
        console.log(
          `   Train: ch ${trainRange[0]}-${trainRange[1]} | Val: ${valRange ? `${valRange[0]}-${valRange[1]}` : "none"}`,
        );
        console.log(`   Dry run: ${opts.dryRun ? "YES (no changes will be applied)" : "NO"}`);
        console.log("");
      }

      try {
        const run = await optimizePrompts(
          {
            bookId,
            agent: (opts.agent as "writer" | "auditor" | "settler" | "all") ?? "all",
            objectives,
            maxEvaluations: parseInt(opts.evaluations ?? "50"),
            trainChapters: trainRange,
            valChapters: valRange,
            dryRun: opts.dryRun ?? false,
            reflectionLm: opts.reflectionLm,
            taskLm: opts.taskLm,
            projectRoot: root,
          },
          (msg) => {
            if (!opts.json) console.log(`   ${msg}`);
          },
        );

        if (opts.apply) {
          try {
            if (!opts.json) {
              console.log("\n  Creating backup before applying...");
            }
            createBackup(root, bookId, run.id);
            applyOptimizedRun(root, run);
            if (!opts.json) {
              console.log("  ✅ Parameters applied to defaults.ts");
            }
          } catch (err) {
            if (!opts.json) {
              console.error(`\n❌ Failed to apply parameters: ${err}`);
            } else {
              console.error(JSON.stringify({ error: `apply failed: ${err}` }));
            }
            process.exit(1);
          }
        }

        if (opts.json) {
          console.log(JSON.stringify(run, null, 2));
          return;
        }

        console.log(`\n✅ Optimization complete (run ${run.id.slice(0, 8)})`);
        console.log(
          `   Pareto front: ${run.pareto_front.length} candidate(s)`,
        );
        console.log("");

        // Print best candidate
        printCandidate("Best candidate", run.best_candidate);

        // Print top Pareto candidates
        if (run.pareto_front.length > 1) {
          console.log("\n  Pareto front:");
          const top = run.pareto_front
            .filter((c) => c.rank === 0)
            .slice(0, 5);
          // If no rank-0 candidates (e.g. random search with uniform scores), show top by composite
          const shown = top.length > 0 ? top : [...run.pareto_front]
            .sort((a, b) => b.scores.composite - a.scores.composite)
            .slice(0, 5);
          for (const c of shown) {
            printCandidate(`  ·`, c);
          }
        }

        console.log("\n  Results saved to:");
        console.log(
          `  books/${bookId}/story/.optimization/history.jsonl`,
        );

        if (opts.dryRun) {
          console.log(
            "\n  ℹ️  This was a dry run. Run without --dry-run to apply results.",
          );
        } else {
          console.log(
            "\n  ℹ️  Results are saved but not yet applied. Review the Pareto front",
          );
          console.log(
            "  and apply manually using the JSON output, or re-run with --apply.",
          );
        }
      } catch (err) {
        if (opts.json) {
          console.error(JSON.stringify({ error: String(err) }));
        } else {
          console.error(`\n❌ Optimization failed: ${err}`);
          console.error(
            "  Make sure Python 3 is installed and GEPA is available:",
          );
          console.error("  pip install gepa");
          console.error("  pip install -e packages/gepa");
        }
        process.exit(1);
      }
    },
  );

// ---------------------------------------------------------------------------
// optimize history
// ---------------------------------------------------------------------------

const historySub = new Command("history")
  .description("View optimization history for a book");

historySub
  .argument("[book-id]", "Book ID (auto-detected if only one book)")
  .option("--last <n>", "Show last N runs", "5")
  .option("--json", "Output JSON only")
  .action(
    async (
      bookIdArg: string | undefined,
      opts: { last?: string; json?: boolean },
    ) => {
      const root = findProjectRoot();
      const bookId = await resolveBookId(bookIdArg, root);

      const runs = await readHistory(root, bookId);
      const last = Math.min(runs.length, parseInt(opts.last ?? "5"));
      const shown = runs.slice(-last).reverse();

      if (shown.length === 0) {
        if (!opts.json) console.log(`No optimization runs found for "${bookId}".`);
        return;
      }

      if (opts.json) {
        console.log(JSON.stringify(shown, null, 2));
        return;
      }

      console.log(`\n📊 Optimization history for "${bookId}"\n`);
      for (const run of shown) {
        const ts = new Date(run.timestamp).toLocaleString();
        console.log(
          `  Run ${run.id.slice(0, 8)}  ${ts}  agent=${run.agent}  evals=${run.evaluations}`,
        );
        console.log(
          `    Train ch ${run.train_chapters.join(",")} | Val ch ${run.val_chapters.join(",")}`,
        );
        console.log(
          `    Pareto front: ${run.pareto_front.length} candidates`,
        );
        console.log(
          `    Best composite: ${(run.best_candidate.scores.composite * 100).toFixed(1)}%  |  ` +
            `audit ${(run.best_candidate.scores.audit_pass_rate * 100).toFixed(0)}%  |  ` +
            `aigc ${(run.best_candidate.scores.aigc_resistance * 100).toFixed(0)}%`,
        );
        console.log("");
      }
    },
  );

// ---------------------------------------------------------------------------
// optimize trajectory
// ---------------------------------------------------------------------------

const trajectorySub = new Command("trajectory")
  .description("Show optimization score trajectory across runs");

trajectorySub
  .argument("[book-id]", "Book ID (auto-detected if only one book)")
  .option("--json", "Output JSON only")
  .action(async (bookIdArg: string | undefined, opts: { json?: boolean }) => {
    const root = findProjectRoot();
    const bookId = await resolveBookId(bookIdArg, root);

    const trajectory = await getOptimizationTrajectory(root, bookId);

    if (trajectory.length === 0) {
      if (!opts.json) console.log(`No optimization runs found for "${bookId}".`);
      return;
    }

    if (opts.json) {
      console.log(JSON.stringify(trajectory, null, 2));
      return;
    }

    console.log(`\n📈 Optimization trajectory for "${bookId}"\n`);
    console.log("  Run        Timestamp              Best Score   Pareto size");
    console.log("  " + "─".repeat(65));
    for (const t of trajectory) {
      const ts = new Date(t.timestamp).toLocaleString();
      const bar = printScoreBar(t.bestComposite, 15);
      console.log(
        `  ${t.runId.slice(0, 8)}  ${ts.padEnd(22)}  ${bar}  ${t.paretoSize}`,
      );
    }
  });

optimizeCommand.addCommand(promptsSub);
optimizeCommand.addCommand(historySub);
optimizeCommand.addCommand(trajectorySub);
