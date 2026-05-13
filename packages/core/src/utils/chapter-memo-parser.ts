import YAML from "js-yaml";
import { ChapterMemoSchema, type ChapterMemo } from "../models/input-governance.js";

export class PlannerParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PlannerParseError";
  }
}

// Phase hotfix 4: each required section is a (zh, en) heading pair.
// The English headings come from PLANNER_MEMO_SYSTEM_PROMPT_EN — we accept
// EITHER language at parse time so the same parser works for both.
//
// Phase hotfix 7: minContentChars enforces non-emptiness per section so
// "all 7 headings + blank payload" no longer slips through. The "do not"
// section uses a relaxed threshold because "无 / N/A / none." is legitimate
// for chapters with no extra prohibitions.
//
// Threshold rationale:
// - 20 chars: long enough to catch obvious empty sections (whitespace,
//   "(略)", "TODO") but short enough to accept genuinely sparse memos for
//   breath/transition chapters (Phase 6 sparse-memo principle).
// - 1 char for "## 不要做" / "## Do not" because "无" / "N/A" / "none" /
//   "—" are all legitimate for a chapter with no extra prohibitions; we
//   only need to ensure the section is not whitespace-only.
interface RequiredSection {
  readonly zh: string;
  readonly en: string;
  readonly minContentChars: number;
}

const REQUIRED_SECTIONS: ReadonlyArray<RequiredSection> = [
  { zh: "## 当前任务", en: "## Current task", minContentChars: 20 },
  { zh: "## 读者此刻在等什么", en: "## What the reader is waiting for right now", minContentChars: 20 },
  { zh: "## 该兑现的 / 暂不掀的", en: "## To pay off / to keep buried", minContentChars: 20 },
  { zh: "## 日常/过渡承担什么任务", en: "## What the slow / transitional beats carry", minContentChars: 20 },
  { zh: "## 关键抉择过三连问", en: "## Three-question check on the key choice", minContentChars: 20 },
  { zh: "## 章尾必须发生的改变", en: "## Required end-of-chapter change", minContentChars: 20 },
  { zh: "## 本章 hook 账", en: "## Hook ledger for this chapter", minContentChars: 20 },
  { zh: "## 不要做", en: "## Do not", minContentChars: 1 },
];

/**
 * Extract the content between `heading` and the next `## ...` heading (or
 * end-of-body). Strips whitespace and returns "" if the section payload is
 * absent. The heading itself is NOT included.
 */
function extractSectionContent(body: string, heading: string): string {
  const startIndex = body.indexOf(heading);
  if (startIndex < 0) return "";
  const after = body.slice(startIndex + heading.length);
  // Find the next H2 heading on its own line. The leading newline + ## guards
  // against false matches inside the current section's prose.
  const nextHeadingMatch = after.match(/\n##\s/);
  const sectionRaw = nextHeadingMatch
    ? after.slice(0, nextHeadingMatch.index)
    : after;
  return sectionRaw.replace(/\s+/g, " ").trim();
}

/**
 * Parse a planner memo produced by the LLM.
 *
 * Format: YAML frontmatter delimited by `---\n...\n---\n` followed by a
 * markdown body containing the seven required section headings.
 *
 * Strict on core fields (chapter integer + matches expected, goal non-empty
 * and ≤ 50 chars, required section headings present). Lenient on aux fields
 * (threadRefs coerced to string[], defaults to []).
 *
 * `isGoldenOpening` is authoritative from the caller — any value the LLM
 * includes in the frontmatter is ignored.
 */
export function parseMemo(
  raw: string,
  expectedChapter: number,
  isGoldenOpening: boolean,
): ChapterMemo {
  const trimmed = raw.trim();

  // Multi-strategy parse chain (same defense-in-depth as persisted-governed-plan).
  // Strategy 1: Primary `---` delimited YAML frontmatter.
  // Strategy 2: Line-by-line KV extraction (LLM omits `---` delimiters).
  const s1 = parseFrontmatterPrimary(trimmed);
  const s2 = s1 ? null : parseFrontmatterLineByLine(trimmed);
  const parsed = s1 ?? s2;

  if (!parsed) {
    throw new PlannerParseError("missing YAML frontmatter delimiters");
  }

  const { fm: f, body } = parsed;

  if (typeof f.chapter !== "number" || !Number.isInteger(f.chapter)) {
    throw new PlannerParseError("chapter must be an integer");
  }
  if (f.chapter !== expectedChapter) {
    throw new PlannerParseError(
      `chapter mismatch: expected ${expectedChapter}, got ${f.chapter}`,
    );
  }

  if (typeof f.goal !== "string" || f.goal.length === 0) {
    throw new PlannerParseError("goal must be a non-empty string");
  }
  if (f.goal.length > 50) {
    throw new PlannerParseError(
      `goal too long: ${f.goal.length} chars (max 50)`,
    );
  }

  const missing = REQUIRED_SECTIONS.filter(
    (section) => !body.includes(section.zh) && !body.includes(section.en),
  );
  if (missing.length > 0) {
    // Report by zh heading (canonical) so the LLM-feedback loop stays stable.
    throw new PlannerParseError(
      `missing sections: ${missing.map((s) => s.zh).join(", ")}`,
    );
  }

  // Phase hotfix 7: each section's payload must be non-empty (≥ minContentChars).
  // Headings present + blank payload was previously accepted, allowing useless
  // "shell" memos to flow downstream. Threshold differs per section: most need
  // 20 chars (one short sentence) while "## 不要做" / "## Do not" allows 5
  // (e.g. "无", "N/A") since "no extra prohibitions" is a legitimate state.
  const empty = REQUIRED_SECTIONS.filter((section) => {
    const heading = body.includes(section.zh) ? section.zh : section.en;
    const content = extractSectionContent(body, heading);
    return content.length < section.minContentChars;
  });
  if (empty.length > 0) {
    const detail = empty
      .map((s) => `${s.zh} (need ≥ ${s.minContentChars} chars)`)
      .join(", ");
    throw new PlannerParseError(`empty sections: ${detail}`);
  }

  const threadRefs = Array.isArray(f.threadRefs)
    ? f.threadRefs.filter((value): value is string => typeof value === "string")
    : [];

  return ChapterMemoSchema.parse({
    chapter: f.chapter,
    goal: f.goal,
    isGoldenOpening,
    body,
    threadRefs,
  });
}

// ── Fallback parse strategies (D issue: MiniMax M2.7 omits `---` delimiters) ─

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

/**
 * Strategy 2: Line-by-line key-value extraction.
 * Some LLMs (MiniMax M2.7) produce valid YAML KV lines but omit the `---`
 * delimiters. We scan the first ~15 lines for `key: value` patterns, then
 * split at the first `## ` heading to separate frontmatter from body.
 */
function parseFrontmatterLineByLine(raw: string): ParsedFrontmatter | null {
  const lines = raw.split("\n");
  const kvLines: string[] = [];
  let bodyStart = lines.length;

  for (let i = 0; i < Math.min(15, lines.length); i++) {
    const line = lines[i]!;
    if (/^\w[\w-]*\s*:/.test(line)) {
      kvLines.push(line);
    } else if (kvLines.length > 0 && /^\s+/.test(line)) {
      // Continuation of previous key (indented)
      kvLines.push(line);
    } else if (line.startsWith("## ")) {
      // First heading — body starts here
      bodyStart = i;
      break;
    } else if (kvLines.length > 0 && line.trim() === "") {
      // Empty line after key-values — body starts after this
      bodyStart = i + 1;
      break;
    } else if (kvLines.length === 0) {
      // Non-KV line before any KV — not our format
      return null;
    }
  }

  if (kvLines.length === 0) return null;

  // Must find at least `chapter` and `goal` to be a valid memo
  const yamlFragment = kvLines.join("\n");
  const body = lines.slice(bodyStart).join("\n");

  const result = tryLoadYaml(yamlFragment, body);
  if (!result) return null;

  // Guard: must contain the two core memo fields
  if (!("chapter" in result.fm) || !("goal" in result.fm)) return null;

  return result;
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
