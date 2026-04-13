import { Command } from "commander";
import { readFile } from "node:fs/promises";
import { DEFAULT_REVISE_MODE, PipelineRunner, type ReviseMode, type GepaEvalScores } from "@actalk/inkos-core";
import { loadConfig, buildPipelineConfig, findProjectRoot, resolveBookId, log, logError } from "../utils.js";

/** Minimum fields needed from the GEPA eval config written by Python runner. */
interface GepaEvalConfig {
  candidate_id?: string;
  params?: Record<string, number | boolean>;
  chapter?: number;
}

function emitGepaScores(scores: GepaEvalScores, wordCount: number, targetWordCount: number): void {
  // Emit to stdout so Python subprocess can capture it via regex on stdout
  const payload = JSON.stringify({
    audit_pass: scores.auditPass,
    audit_score: scores.auditScore,
    aigc_resistance: scores.aigcResistance,
    wordcount_deviation_pct: scores.wordcountDeviationPct,
    ai_tell_density: scores.aiTellDensity,
    word_count: wordCount,
    target_word_count: targetWordCount,
  });
  process.stdout.write(`<!-- GEPA_SCORES ${payload} GEPA_SCORES -->\n`);
}

export const reviseCommand = new Command("revise")
  .description("Revise a chapter based on audit issues")
  .argument("[book-id]", "Book ID (auto-detected if only one book)")
  .argument("[chapter]", "Chapter number (defaults to latest)")
  .option("--mode <mode>", "Revise mode: spot-fix, polish, rewrite, rework, anti-detect", DEFAULT_REVISE_MODE)
  .option("--brief <text>", "One-off creative guidance for this revise/rewrite only")
  .option("--json", "Output JSON")
  .option("--config <path>", "Path to GEPA evaluation config (JSON with candidate_id, params, chapter)")
  .option("--writer-params <json>", "JSON string or @file:path with writer parameter overrides")
  .option("--gepa-eval", "Compute and emit GEPA scoring markers after revision")
  .action(async (bookIdArg: string | undefined, chapterStr: string | undefined, opts: {
    mode?: string;
    json?: boolean;
    config?: string;
    writerParams?: string;
    gepaEval?: boolean;
    brief?: string;
  }) => {
    try {
      const config = await loadConfig();
      const root = findProjectRoot();

      let bookId: string;
      let chapterNumber: number | undefined;
      if (bookIdArg && /^\d+$/.test(bookIdArg)) {
        bookId = await resolveBookId(undefined, root);
        chapterNumber = parseInt(bookIdArg, 10);
      } else {
        bookId = await resolveBookId(bookIdArg, root);
        chapterNumber = chapterStr ? parseInt(chapterStr, 10) : undefined;
      }

      // Load GEPA eval config if provided (used by Python GEPA runner)
      if (opts.config) {
        try {
          const parsed: GepaEvalConfig = JSON.parse(await readFile(opts.config, "utf-8"));
          if (parsed.chapter !== undefined && chapterNumber === undefined) {
            chapterNumber = parsed.chapter;
          }
        } catch {
          logError(`Warning: could not read GEPA config from ${opts.config}`);
        }
      }

      // Load writer params override (either inline JSON or @file:path)
      let writerParamsOverride: Record<string, number | boolean> | undefined;
      if (opts.writerParams) {
        try {
          if (opts.writerParams.startsWith("@")) {
            const filePath = opts.writerParams.slice(1);
            writerParamsOverride = JSON.parse(await readFile(filePath, "utf-8"));
          } else {
            writerParamsOverride = JSON.parse(opts.writerParams);
          }
        } catch {
          logError(`Warning: could not parse writer params: ${opts.writerParams}`);
        }
      }

      const pipelineConfig = buildPipelineConfig(config, root, {
        externalContext: opts.brief,
        ...(writerParamsOverride ? { writerParamsOverride } : {}),
      });

      const pipeline = new PipelineRunner(pipelineConfig);

      const mode = (opts.mode ?? DEFAULT_REVISE_MODE) as ReviseMode;
      if (!opts.json) log(`Revising "${bookId}"${chapterNumber ? ` chapter ${chapterNumber}` : " (latest)"} [mode: ${mode}]...`);

      const result = await pipeline.reviseDraft(bookId, chapterNumber, mode, opts.gepaEval ?? false);

      // Emit GEPA scores markers if requested (must be first stdout line so Python can find them)
      if (opts.gepaEval && result.gepaEvalScores) {
        const targetWordCount = result.lengthTelemetry?.target ?? 3000;
        emitGepaScores(result.gepaEvalScores, result.wordCount, targetWordCount);
      }

      if (opts.json) {
        log(JSON.stringify(result, null, 2));
      } else if (!result.applied) {
        log(`  Chapter ${result.chapterNumber}: kept original draft`);
        if (result.skippedReason) log(`  Reason: ${result.skippedReason}`);
      } else {
        log(`  Chapter ${result.chapterNumber} revised`);
        log(`  Words: ${result.wordCount}`);
        log(`  Status: ${result.status}`);
        log("  Fixed:");
        for (const fix of result.fixedIssues) {
          log(`    - ${fix}`);
        }
      }
    } catch (e) {
      if (opts.json) {
        log(JSON.stringify({ error: String(e) }));
      } else {
        logError(`Revise failed: ${e}`);
      }
      process.exit(1);
    }
  });
