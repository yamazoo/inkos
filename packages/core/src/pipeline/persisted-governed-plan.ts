import { readFile, writeFile } from "node:fs/promises";
import { join, relative } from "node:path";
import YAML from "js-yaml";
import type { PlanChapterOutput } from "../agents/planner.js";
import {
  ChapterIntentSchema,
  type ChapterIntent,
} from "../models/input-governance.js";
import { parseMemo, PlannerParseError } from "../utils/chapter-memo-parser.js";

/**
 * Phase 4: persisted governed plans are stored as a single markdown file
 * containing YAML frontmatter (memo + intent extensions + plannerInputs)
 * followed by the memo body (7 required sections).
 *
 * File path: `story/runtime/chapter-NNNN.plan.md`
 *
 * The sibling `chapter-NNNN.intent.md` file stays as a human-readable
 * render — it is not parsed back. We keep it in sync by regenerating
 * downstream, but only this `.plan.md` is authoritative for restore.
 *
 * If parse fails for any reason we return null and let the runner re-invoke
 * the planner. We never try to partially reconstruct — silent degradation
 * is worse than re-planning.
 */

function planPath(bookDir: string, chapterNumber: number): string {
  const runtimeDir = join(bookDir, "story", "runtime");
  const padded = String(chapterNumber).padStart(4, "0");
  return join(runtimeDir, `chapter-${padded}.plan.md`);
}

function intentPath(bookDir: string, chapterNumber: number): string {
  const runtimeDir = join(bookDir, "story", "runtime");
  const padded = String(chapterNumber).padStart(4, "0");
  return join(runtimeDir, `chapter-${padded}.intent.md`);
}

export async function savePersistedPlan(
  bookDir: string,
  plan: PlanChapterOutput,
): Promise<void> {
  const { intent, memo, plannerInputs } = plan;
  const frontmatter = {
    chapter: memo.chapter,
    goal: memo.goal,
    isGoldenOpening: memo.isGoldenOpening,
    threadRefs: memo.threadRefs,
    intent: {
      goal: intent.goal,
      outlineNode: intent.outlineNode,
      arcContext: intent.arcContext,
      mustKeep: intent.mustKeep,
      mustAvoid: intent.mustAvoid,
      styleEmphasis: intent.styleEmphasis,
    },
    plannerInputs: [...plannerInputs],
  };
  const yaml = YAML.dump(frontmatter, { lineWidth: -1 });
  const content = `---\n${yaml}---\n${memo.body}\n`;
  await writeFile(planPath(bookDir, memo.chapter), content, "utf-8");
}

export async function loadPersistedPlan(
  bookDir: string,
  chapterNumber: number,
): Promise<PlanChapterOutput | null> {
  let raw: string;
  try {
    raw = await readFile(planPath(bookDir, chapterNumber), "utf-8");
  } catch {
    return loadLegacyIntentPlan(bookDir, chapterNumber);
  }

  const trimmed = raw.trim();
  // Multi-strategy parse chain. Each returns { fm, body } or null.
  const s1 = parseFrontmatterPrimary(trimmed);
  const s2 = s1 ? null : parseFrontmatterAlternativeDelimiters(trimmed);
  const s3 = s1 || s2 ? null : parseFrontmatterLineByLine(trimmed);
  const parsed = s1 ?? s2 ?? s3;

  if (!parsed) {
    // Strategy 4: section-based memo body extraction — bypasses frontmatter entirely
    return parseSectionBasedFallback(trimmed, chapterNumber, bookDir);
  }

  const { fm: f, body } = parsed;

  if (typeof f.chapter !== "number" || f.chapter !== chapterNumber) return null;
  if (typeof f.isGoldenOpening !== "boolean") return null;
  if (!f.intent || typeof f.intent !== "object") return null;

  // Reconstruct memo via the same strict parser planner uses. This guarantees
  // the 7 required section headings are still present — any drift triggers
  // re-planning (null return).
  let memo;
  try {
    const reconstructed = `---\n${YAML.dump({
      chapter: f.chapter,
      goal: f.goal,
      threadRefs: f.threadRefs,
    })}---\n${body}`;
    memo = parseMemo(reconstructed, chapterNumber, f.isGoldenOpening);
  } catch (error) {
    if (error instanceof PlannerParseError) return null;
    throw error;
  }

  let intent: ChapterIntent;
  try {
    intent = ChapterIntentSchema.parse({
      chapter: chapterNumber,
      ...(f.intent as Record<string, unknown>),
    });
  } catch {
    return null;
  }

  const plannerInputs = Array.isArray(f.plannerInputs)
    ? f.plannerInputs.filter((value): value is string => typeof value === "string")
    : [];

  // intentMarkdown is a display artifact — read the sibling .intent.md so we
  // surface the same content downstream consumers expect. If it's missing we
  // fall back to the memo body, which is usable but less rich.
  let intentMarkdown = memo.body;
  try {
    intentMarkdown = await readFile(intentPath(bookDir, chapterNumber), "utf-8");
  } catch {
    // fall through — memo body is a safe default.
  }

  return {
    intent,
    memo,
    intentMarkdown,
    plannerInputs,
    runtimePath: intentPath(bookDir, chapterNumber),
  };
}

// ── Frontmatter parse strategies ─────────────────────────────────────────────

interface ParsedFrontmatter {
  readonly fm: Record<string, unknown>;
  readonly body: string;
}

/** Strategy 1: Primary `---` delimited YAML frontmatter. */
function parseFrontmatterPrimary(raw: string): ParsedFrontmatter | null {
  const match = raw.match(/^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/);
  if (!match) return null;
  return tryLoadYaml(match[1]!, match[2]!);
}

/** Strategy 2: Alternative delimiters (`:::` or `+++`). */
function parseFrontmatterAlternativeDelimiters(raw: string): ParsedFrontmatter | null {
  const match = raw.match(/^(?::::|\+\+\+)\s*\n([\s\S]*?)\n(?::::|\+\+\+)\s*\n([\s\S]*)$/);
  if (!match) return null;
  return tryLoadYaml(match[1]!, match[2]!);
}

function tryLoadYaml(yamlText: string, body: string): ParsedFrontmatter | null {
  try {
    const fm = YAML.load(yamlText);
    if (!fm || typeof fm !== "object" || Array.isArray(fm)) return null;
    return { fm: fm as Record<string, unknown>, body };
  } catch {
    return null;
  }
}

/** Strategy 3: Line-by-line key-value extraction for broken frontmatter. */
function parseFrontmatterLineByLine(raw: string): ParsedFrontmatter | null {
  const lines = raw.split("\n");
  const kvLines: string[] = [];
  let bodyStart = lines.length;

  // Scan first 30 lines for key-value patterns
  for (let i = 0; i < Math.min(30, lines.length); i++) {
    const line = lines[i]!;
    if (/^\w[\w-]*\s*:/.test(line)) {
      kvLines.push(line);
    } else if (kvLines.length > 0 && /^\s+/.test(line)) {
      // Continuation of previous key (indented)
      kvLines.push(line);
    } else if (kvLines.length > 0 && line.trim() === "") {
      // Empty line after key-values — body starts after this
      bodyStart = i + 1;
      break;
    }
  }

  if (kvLines.length === 0) return null;

  const yamlFragment = kvLines.join("\n");
  const body = lines.slice(bodyStart).join("\n");

  try {
    const fm = YAML.load(yamlFragment);
    if (!fm || typeof fm !== "object" || Array.isArray(fm)) return null;
    const record = fm as Record<string, unknown>;
    // Strategy 3 must find at least one recognized plan field to avoid
    // false matches on memo body key-value lines (e.g., hook entries).
    const PLAN_KEYS = ["chapter", "goal", "intent", "isGoldenOpening"];
    if (!PLAN_KEYS.some((k) => k in record)) return null;
    return { fm: record, body };
  } catch {
    return null;
  }
}

/**
 * Strategy 4: Section-based memo body extraction.
 * Works when frontmatter is completely broken — reconstructs from ## headings.
 * Returns null if the markdown body lacks the required section structure.
 */
function parseSectionBasedFallback(
  raw: string,
  chapterNumber: number,
  bookDir: string,
): PlanChapterOutput | null {
  // Extract goal from the raw text — look for a "goal:" line or a ## Goal section
  const goalMatch = raw.match(/^goal:\s*(.+)$/m)
    ?? raw.match(/^##\s*Goal\s*\n(.+)$/m);
  const goal = goalMatch?.[1]?.trim();
  if (!goal) return null;

  // Extract isGoldenOpening if present
  const goldenMatch = raw.match(/^isGoldenOpening:\s*(\w+)$/m);
  const isGoldenOpening = goldenMatch?.[1] === "true";

  // Check for the required memo section headings
  const sectionHeadings = [
    "当前任务", "Current Task",
    "该兑现", "Payoffs",
    "读者此刻在等什么", "Reader Expectations",
    "日常", "Daily/Transition",
    "关键抉择", "Three-question",
    "章尾必须发生的改变", "End-of-chapter Changes",
    "不要做", "Hard Don'ts",
  ];
  const foundSections = sectionHeadings.filter((h) => raw.includes(`## ${h}`));
  if (foundSections.length < 2) return null;

  // Build a minimal intent from what we can extract
  let intent: ChapterIntent;
  try {
    intent = ChapterIntentSchema.parse({
      chapter: chapterNumber,
      goal: goal.slice(0, 200),
      mustKeep: extractListSection(raw, "Must Keep"),
      mustAvoid: extractListSection(raw, "Must Avoid"),
    });
  } catch {
    return null;
  }

  return {
    intent,
    memo: {
      chapter: chapterNumber,
      goal: goal.slice(0, 50),
      isGoldenOpening,
      body: raw,
      threadRefs: [],
    },
    intentMarkdown: raw,
    plannerInputs: [],
    runtimePath: intentPath(bookDir, chapterNumber),
  };
}

async function loadLegacyIntentPlan(
  bookDir: string,
  chapterNumber: number,
): Promise<PlanChapterOutput | null> {
  let intentMarkdown: string;
  const runtimePath = intentPath(bookDir, chapterNumber);
  try {
    intentMarkdown = await readFile(runtimePath, "utf-8");
  } catch {
    return null;
  }

  const rawGoal = extractSection(intentMarkdown, "Goal");
  if (!rawGoal || !isMeaningfulLegacyValue(rawGoal)) return null;
  const goal = rawGoal;
  const outlineNodeRaw = extractSection(intentMarkdown, "Outline Node");
  const outlineNode = outlineNodeRaw && isMeaningfulLegacyValue(outlineNodeRaw)
    ? outlineNodeRaw
    : undefined;

  const intent: ChapterIntent = ChapterIntentSchema.parse({
    chapter: chapterNumber,
    goal,
    outlineNode,
    mustKeep: extractListSection(intentMarkdown, "Must Keep"),
    mustAvoid: extractListSection(intentMarkdown, "Must Avoid"),
    styleEmphasis: extractListSection(intentMarkdown, "Style Emphasis"),
  });

  return {
    intent,
    memo: {
      chapter: chapterNumber,
      goal: goal.slice(0, 50),
      isGoldenOpening: false,
      body: intentMarkdown,
      threadRefs: [],
    },
    intentMarkdown,
    plannerInputs: [relativeToBookDir(bookDir, runtimePath)],
    runtimePath,
  };
}

function extractSection(markdown: string, heading: string): string | undefined {
  const match = markdown.match(new RegExp(`^## ${escapeRegExp(heading)}\\s*\\n([\\s\\S]*?)(?=\\n## |\\n### |$)`, "m"));
  const value = match?.[1]?.trim();
  return value && value !== "- none" ? value : undefined;
}

function extractListSection(markdown: string, heading: string): string[] {
  const section = extractSection(markdown, heading);
  if (!section) return [];
  return section
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.startsWith("-"))
    .map((line) => line.replace(/^-\s*/, "").trim())
    .filter((line) => line.length > 0 && line.toLowerCase() !== "none");
}

function isMeaningfulLegacyValue(value: string): boolean {
  const normalized = value.trim();
  if (!normalized) return false;
  if (/^\(?not found\)?$/i.test(normalized)) return false;
  if (/^(?:none|null|undefined|n\/a)$/i.test(normalized)) return false;
  if (/^[*_`\-\s]+$/.test(normalized)) return false;
  return true;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function relativeToBookDir(bookDir: string, absolutePath: string): string {
  return relative(bookDir, absolutePath).replaceAll("\\", "/");
}
