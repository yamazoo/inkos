/**
 * outline.ts — inkos outline CLI command
 *
 * Subcommands:
 *   inkos outline audit [book-id]       — audit volume_map.json completeness
 *   inkos outline audit [book-id] --fix  — expand range placeholders in-place
 */

import { Command } from "commander";
import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import {
  VolumeOutlineSchema,
  type VolumeOutline,
  type VolumeNode,
  type ChapterNode,
  StateManager,
  BookConfigSchema,
  PipelineRunner,
  type OutlineInitResult,
} from "@actalk/inkos-core";
import {
  findProjectRoot,
  resolveBookId,
  loadConfig,
  buildPipelineConfig,
  log,
  logError,
} from "../utils.js";

// ---------------------------------------------------------------------------
// Audit types
// ---------------------------------------------------------------------------

type GapType = "complete" | "range-placeholder" | "null-description" | "short-description";

interface ChapterAuditEntry {
  chapter: number;
  /** The event field from ChapterNode (chapter title/synopsis) */
  event: string | null;
  /** The beat field from ChapterNode */
  beat: string | null;
  /** Optional extended description */
  description: string | null;
  gapType: GapType;
}

interface VolumeAuditSummary {
  volumeId: number;
  volumeTitle: string;
  chapterRange: [number, number];
  total: number;
  complete: number;
  partial: number;
  empty: number;
  status: "complete" | "partial" | "empty";
  gapTypes: Record<string, number>;
  chapters: ChapterAuditEntry[];
}

interface OutlineAuditResult {
  bookTitle: string;
  totalChapters: number;
  totalComplete: number;
  totalPartial: number;
  totalMissing: number;
  completenessPercent: number;
  volumeSummaries: VolumeAuditSummary[];
}

// ---------------------------------------------------------------------------
// Gap classification
// ---------------------------------------------------------------------------

const RANGE_PLACEHOLDER_RE = /^(第\d+[\s　]*[-–~～][\s　]*第?\d+[\s　]*章|[第\d\s　\-–~～章]+$)/;

// TODO: Consolidate with core's classifyGap() in outline-auditor.ts.
// CLI checks event/beat; core checks description. Merge into core
// then re-export from @actalk/inkos-core so CLI can import it.
function classifyGap(node: ChapterNode): GapType {
  // ChapterNode has event, beat, and optional description
  const event = node.event ?? "";
  const beat = node.beat ?? "";
  const eventTrimmed = event.trim();
  const beatTrimmed = beat.trim();

  if (!eventTrimmed && !beatTrimmed) return "null-description";
  if (RANGE_PLACEHOLDER_RE.test(eventTrimmed) || RANGE_PLACEHOLDER_RE.test(beatTrimmed)) {
    return "range-placeholder";
  }
  if (eventTrimmed.length < 6 || beatTrimmed.length < 2) return "short-description";
  return "complete";
}

// ---------------------------------------------------------------------------
// Pure audit
// ---------------------------------------------------------------------------

function auditOutline(volumeOutline: VolumeOutline): OutlineAuditResult {
  const allChapters: ChapterAuditEntry[] = [];
  const volumeSummaries: VolumeAuditSummary[] = [];

  for (const vol of volumeOutline.volumes) {
    const chapterEntries: ChapterAuditEntry[] = [];
    let complete = 0;
    let partial = 0;
    let empty = 0;
    const gapTypes: Record<string, number> = {};

    for (const ch of vol.chapters) {
      const gapType = classifyGap(ch);
      chapterEntries.push({
        chapter: ch.chapter,
        event: ch.event ?? null,
        beat: ch.beat ?? null,
        description: ch.description ?? null,
        gapType,
      });

      if (gapType === "complete") complete++;
      else if (gapType === "short-description") partial++;
      else empty++;

      gapTypes[gapType] = (gapTypes[gapType] ?? 0) + 1;
    }

    const volChapters = vol.chapters;
    const firstCh = volChapters[0]?.chapter ?? 0;
    const lastCh = volChapters[volChapters.length - 1]?.chapter ?? 0;

    let status: "complete" | "partial" | "empty" = "complete";
    if (empty > 0 || partial > 0) status = "partial";
    if (empty === volChapters.length) status = "empty";

    volumeSummaries.push({
      volumeId: vol.volumeId,
      volumeTitle: vol.volumeTitle ?? `卷${vol.volumeId}`,
      chapterRange: [firstCh, lastCh],
      total: volChapters.length,
      complete,
      partial,
      empty,
      status,
      gapTypes,
      chapters: chapterEntries,
    });

    allChapters.push(...chapterEntries);
  }

  const totalComplete = allChapters.filter((c) => c.gapType === "complete").length;
  const totalPartial = allChapters.filter((c) => c.gapType === "short-description").length;
  const totalMissing = allChapters.filter(
    (c) => c.gapType !== "complete",
  ).length;
  const totalChapters = allChapters.length;
  const completenessPercent =
    totalChapters > 0 ? Math.round((totalComplete / totalChapters) * 100) : 0;

  return {
    bookTitle: "",
    totalChapters,
    totalComplete,
    totalPartial,
    totalMissing,
    completenessPercent,
    volumeSummaries,
  };
}

// ---------------------------------------------------------------------------
// Range placeholder expansion
// ---------------------------------------------------------------------------

function expandRangePlaceholders(volumeOutline: VolumeOutline): VolumeOutline {
  const newVolumes: VolumeNode[] = volumeOutline.volumes.map((vol: VolumeNode) => {
    const newChapters: ChapterNode[] = [];

    for (const node of vol.chapters) {
      const gapType = classifyGap(node);
      if (gapType === "range-placeholder") {
        const rangeMatch = (node.event ?? "").match(
          /第(\d+)\s*[-–~]\s*(\d+)\s*章/,
        );
        if (rangeMatch) {
          const start = Number.parseInt(rangeMatch[1], 10);
          const end = Number.parseInt(rangeMatch[2], 10);
          for (let n = start; n <= end; n++) {
            newChapters.push({
              chapter: n,
              event: "",
              beat: "",
            });
          }
          continue;
        }
      }
      newChapters.push({ ...node });
    }

    return { ...vol, chapters: newChapters };
  });

  return { ...volumeOutline, volumes: newVolumes };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function renderProgressBar(complete: number, total: number): string {
  const width = 20;
  const filled = total > 0 ? Math.round((complete / total) * width) : 0;
  const empty_ = width - filled;
  return `[${"=".repeat(filled)}${" ".repeat(empty_)}]`;
}

async function resolveBookDir(bookId?: string): Promise<string> {
  const projectRoot = findProjectRoot();
  const resolved = await resolveBookId(bookId, projectRoot);
  if (!resolved) {
    throw new Error(
      bookId
        ? `Book "${bookId}" not found. Use "inkos book list" to see available books.`
        : "No book-id provided and no single-book project found.",
    );
  }
  return join(projectRoot, "books", resolved);
}

function statusEmoji(status: "complete" | "partial" | "empty"): string {
  return status === "complete" ? "✓" : status === "partial" ? "⚠" : "✗";
}

// ---------------------------------------------------------------------------
// Audit subcommand
// ---------------------------------------------------------------------------

function buildAuditCommand(): Command {
  const cmd = new Command("audit")
    .description("Audit volume_map.json completeness")
    .argument("[book-id]", "Book ID (auto-detected if only one book exists)")
    .option("--volume <n>", "Audit only volume N")
    .option("--json", "Output machine-readable JSON")
    .option("--fix", "Expand range placeholders and write back volume_map.json")
    .option("--cross", "Cross-check per-chapter outlines against volume-level outline")
    .action(async (bookId, opts) => {
      const bookDir = await resolveBookDir(bookId);

      // Cross-audit mode: compare per-chapter outlines with volume-level outline
      if (opts.cross) {
        const { auditOutlineCross } = await import("@actalk/inkos-core");
        const crossResult = await auditOutlineCross(bookDir);

        if (opts.json) {
          console.log(JSON.stringify(crossResult, null, 2));
          return;
        }

        console.log("=== 细纲↔卷纲 交叉审计 ===");
        console.log(
          `卷数: ${crossResult.totalVolumes}  对齐: ${crossResult.volumesAligned}  偏离: ${crossResult.volumesDiverged}  缺失: ${crossResult.volumesMissingFile}`,
        );
        console.log("");

        for (const vol of crossResult.volumeSummaries) {
          const statusIcon = vol.status === "aligned" ? "✓" : vol.status === "diverged" ? "⚠" : "✗";
          console.log(`  ${statusIcon} ${vol.volumeTitle} — ${vol.status}`);
          if (!vol.rangeAligned) {
            console.log(`    ⚠ chapterRange 不一致`);
          }
          if (vol.missingInChapters.length > 0) {
            console.log(`    ⚠ 卷纲中有但细纲缺失: ${vol.missingInChapters.join(", ")}`);
          }
          if (vol.missingInVolumeMap.length > 0) {
            console.log(`    ⚠ 细纲中有但卷纲缺失: ${vol.missingInVolumeMap.join(", ")}`);
          }
          if (vol.incompleteFields.length > 0) {
            console.log(`    ⚠ event/beat 不完整: ${vol.incompleteFields.join(", ")}`);
          }
        }

        if (crossResult.entries.length === 0) {
          console.log("");
          console.log("所有细纲与卷纲完全对齐。");
        }
        return;
      }

      // Load volume_map.json
      let outline: VolumeOutline;
      const jsonPath = join(bookDir, "story", "outline", "volume_map.json");
      try {
        const raw = await readFile(jsonPath, "utf-8");
        outline = VolumeOutlineSchema.parse(JSON.parse(raw));
      } catch {
        console.error(
          `Error: volume_map.json not found or invalid at books/<id>/story/outline/volume_map.json.\n` +
            `Run "inkos consolidate ${bookId ?? ""}" first to generate it.`,
        );
        process.exit(1);
      }

      // Filter to single volume if requested
      let filteredOutline = outline;
      if (opts.volume !== undefined) {
        const volNum = Number(opts.volume);
        const vol = outline.volumes.find(
          (v: VolumeNode) => v.volumeId === volNum,
        );
        if (!vol) {
          console.error(`Error: volume ${volNum} not found in volume_map.json.`);
          process.exit(1);
        }
        filteredOutline = {
          ...outline,
          volumes: [vol],
          meta: {
            ...outline.meta,
            totalVolumes: 1,
            totalChapters: vol.chapters.length,
          },
        };
      }

      const result = auditOutline(filteredOutline);

      if (opts.fix) {
        const expanded = expandRangePlaceholders(filteredOutline);
        await writeFile(jsonPath, JSON.stringify(expanded, null, 2), "utf-8");
        console.log(`Fixed: range placeholders expanded → ${jsonPath}`);
        // Re-audit to report
        const newResult = auditOutline(
          VolumeOutlineSchema.parse(JSON.parse(JSON.stringify(expanded))),
        );
        console.log(
          `New completeness: ${newResult.completenessPercent}% (${newResult.totalComplete}/${newResult.totalChapters})`,
        );
        return;
      }

      if (opts.json) {
        console.log(JSON.stringify(result, null, 2));
        return;
      }

      // Human-readable report
      const { totalComplete, totalMissing, totalChapters, completenessPercent } = result;

      console.log("=== 细纲完整性审计 ===");
      console.log(
        `整体完整度: ${renderProgressBar(totalComplete, totalChapters)}  ${totalComplete}/${totalChapters} (${completenessPercent}%)`,
      );
      console.log("");

      for (const vol of result.volumeSummaries) {
        const status = statusEmoji(vol.status);
        const range = `ch${vol.chapterRange[0]}-${vol.chapterRange[1]}`;
        console.log(
          `  ${vol.volumeTitle} (${range}):  ${renderProgressBar(vol.complete, vol.total)}  ${vol.complete}/${vol.total}  ${status}`,
        );
        if (vol.gapTypes["range-placeholder"] && opts.volume === undefined) {
          console.log(
            `    ⚠  ${vol.gapTypes["range-placeholder"]} 个 range-placeholder 节点（可使用 --fix 展开）`,
          );
        }
        if (vol.gapTypes["null-description"] && opts.volume === undefined) {
          console.log(
            `    ⚠  ${vol.gapTypes["null-description"]} 个 description 为空的节点`,
          );
        }
      }

      console.log("");
      console.log(
        `总计：${totalMissing} 章缺失 / ${totalChapters} 章（${completenessPercent}%）`,
      );
      console.log("");
      console.log("提示：");
      console.log(
        "  inkos outline audit <book-id> --volume N   # 只审计第 N 卷",
      );
      console.log(
        "  inkos outline audit <book-id> --fix        # 展开 range-placeholder",
      );
    });

  return cmd;
}

// ---------------------------------------------------------------------------
// Init subcommand
// ---------------------------------------------------------------------------

function buildInitCommand(): Command {
  const cmd = new Command("init")
    .description("Initialize / generate missing chapter outlines via LLM")
    .argument("[book-id]", "Book ID (auto-detected if only one book exists)")
    .option("--volume <n>", "Generate outlines only for volume N")
    .option("--force", "Skip completeness check and regenerate all missing entries")
    .option("--json", "Output machine-readable JSON")
    .action(async (bookId, opts) => {
      const projectRoot = findProjectRoot();
      const config = await loadConfig();
      const pipeline = new PipelineRunner(
        buildPipelineConfig(config, projectRoot),
      );

      // Resolve book ID
      const resolved = await resolveBookId(bookId, projectRoot);
      if (!resolved) {
        logError(
          bookId
            ? `Book "${bookId}" not found. Use "inkos book list" to see available books.`
            : "No book-id provided and no single-book project found.",
        );
        process.exit(1);
      }
      const bookDir = join(projectRoot, "books", resolved);

      // Load volume_map.json for pre-check
      const jsonPath = join(bookDir, "story", "outline", "volume_map.json");
      let outline: VolumeOutline;
      try {
        const raw = await readFile(jsonPath, "utf-8");
        outline = VolumeOutlineSchema.parse(JSON.parse(raw));
      } catch {
        logError(
          `volume_map.json not found or invalid at books/<id>/story/outline/volume_map.json.\n` +
          `Run "inkos consolidate ${bookId ?? ""}" first.`,
        );
        process.exit(1);
      }

      // Pre-check completeness (skip when --force)
      if (!opts.force) {
        const result = auditOutline(outline);
        if (result.completenessPercent === 100) {
          console.log(
            `Outline is already complete (${result.totalComplete}/${result.totalChapters} chapters, 100%). ` +
            `Use --force to regenerate missing entries.`,
          );
          return;
        }
        console.log(
          `Current completeness: ${result.completenessPercent}% ` +
          `(${result.totalComplete}/${result.totalChapters} chapters complete). ` +
          `Generating missing entries...`,
        );
      }

      // Run initOutline
      try {
        const initResult: OutlineInitResult = await pipeline.initOutline(resolved, {
          volumeId: opts.volume !== undefined ? Number(opts.volume) : undefined,
        });

        if (opts.json) {
          console.log(JSON.stringify(initResult, null, 2));
          return;
        }

        const filled = initResult.chaptersFilled;
        const before = initResult.completenessBefore;
        const after = initResult.completenessAfter;
        const total = initResult.chaptersTotal;
        const bar = renderProgressBar(initResult.completenessAfter / 100, 1);
        console.log("");
        console.log("=== 细纲初始化完成 ===");
        console.log(
          `整体完整度: ${bar}  ${before}% → ${after}%`,
        );
        console.log(`填充章节数：${filled} / ${total}`);
        if (opts.volume !== undefined) {
          console.log(`（仅第 ${opts.volume} 卷）`);
        }
        console.log("");
        console.log("提示：运行以下命令验证完整性：");
        console.log(`  inkos outline audit ${resolved}`);
      } catch (err) {
        logError(err instanceof Error ? err.message : String(err));
        process.exit(1);
      }
    });

  return cmd;
}

// ---------------------------------------------------------------------------
// Main outline command
// ---------------------------------------------------------------------------

export function createOutlineCommand(): Command {
  const outline = new Command("outline")
    .description("Audit chapter outlines");

  outline.addCommand(buildAuditCommand());
  outline.addCommand(buildInitCommand());

  return outline;
}
