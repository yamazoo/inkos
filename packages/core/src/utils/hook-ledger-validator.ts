/**
 * Phase 9-3: hard gate that a chapter draft actually acts on the hook ledger
 * the planner declared in the memo's "## 本章 hook 账" / "## Hook ledger for
 * this chapter" section.
 *
 * The planner commits, per chapter, to:
 *   - advance: <hook_id> "name" → state-change
 *   - resolve: <hook_id> "name" → action
 *
 * The validator parses those two lists and checks that every committed hook
 * has observable evidence in the draft. "Evidence" means the draft mentions
 * at least one keyword from the ledger line's descriptor (hook name, key
 * noun, etc.). We deliberately do NOT require the draft to repeat the raw
 * hook_id like "H007" — writers don't embed IDs in prose.
 */

export interface HookLedgerViolation {
  readonly severity: "critical";
  readonly category: string;
  readonly description: string;
  readonly suggestion: string;
}

export interface HookLedgerEntry {
  readonly id: string;
  /** Raw text of the ledger line after the hook_id. */
  readonly descriptor: string;
  /** 2+ char CJK sequences and 3+ letter ASCII words extracted from descriptor. */
  readonly keywords: ReadonlyArray<string>;
  /** Minimum number of distinct keywords that must appear in the draft.
   *  Default 1. Set to 2 when only action-description keywords are available
   *  (no quoted hook name), to reduce false positives from generic character names. */
  readonly minKeywordMatches: number;
}

export interface HookLedger {
  readonly open: ReadonlyArray<HookLedgerEntry>;
  readonly advance: ReadonlyArray<HookLedgerEntry>;
  readonly resolve: ReadonlyArray<HookLedgerEntry>;
  readonly defer: ReadonlyArray<HookLedgerEntry>;
  /**
   * Count of `[new] ...` placeholder lines in the `open:` subsection. These
   * are brand-new hooks declared by the planner that have no pre-existing
   * hook_id (extractLedgerEntry rejects them because they carry no id to
   * match downstream), but they still count as "a new hook opened" for the
   * 揭 1 埋 1 floor check.
   */
  readonly newOpenCount: number;
}

const LEDGER_HEADING_PATTERNS = [
  /^#{2,3}\s*本章\s*hook\s*账\s*$/im,
  /^#{2,3}\s*Hook\s+ledger\s+for\s+this\s+chapter\s*$/im,
];

const SUBSECTION_KEYS: ReadonlyArray<keyof HookLedger> = ["open", "advance", "resolve", "defer"];

/**
 * Tokens that look like hook_ids but are placeholders meaning "no hooks in
 * this slot". Writers sometimes emit "- 无" or "- none" under an empty slot
 * instead of leaving it blank.
 */
const PLACEHOLDER_TOKENS = /^(无|空|none|nil|null|暂无|n\/a|na|n-a|tbd|todo|待定)$/i;

/** Subsection heading words that must not be parsed as hook_ids. */
const SUBSECTION_WORDS = /^(open|advance|resolve|defer|new)$/i;

export function parseHookLedger(memoBody: string): HookLedger {
  const section = extractLedgerSection(memoBody);
  if (!section) {
    return { open: [], advance: [], resolve: [], defer: [], newOpenCount: 0 };
  }

  type Subsection = "open" | "advance" | "resolve" | "defer";
  const result: Record<Subsection, HookLedgerEntry[]> = {
    open: [],
    advance: [],
    resolve: [],
    defer: [],
  };
  let newOpenCount = 0;

  let current: Subsection | null = null;
  for (const rawLine of section.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (line.length === 0) continue;

    const subHeadingMatch = line.match(/^(open|advance|resolve|defer)\s*[:：]?\s*$/i);
    if (subHeadingMatch) {
      current = subHeadingMatch[1]!.toLowerCase() as Subsection;
      continue;
    }

    if (!current) continue;
    if (!line.startsWith("-")) continue;

    // `[new]` placeholder lines have no hook_id but still count as a new hook
    // opened (揭 1 埋 1 floor check). extractLedgerEntry filters them out for
    // advance/resolve evidence matching; we tally them separately here.
    const cleaned = line.replace(/^-+\s*/, "").trim();
    if (current === "open" && /^\[new\]/i.test(cleaned)) {
      newOpenCount += 1;
      continue;
    }

    const entry = extractLedgerEntry(line);
    if (entry) result[current].push(entry);
  }

  return { ...result, newOpenCount };
}

/**
 * Enforce: every hook declared under advance / resolve must have observable
 * evidence in the draft text. We do NOT validate `open` (new hooks don't have
 * a pre-existing id/descriptor to echo) or `defer` (deferred = deliberately
 * not touched).
 *
 * Additionally enforces the "揭 1 埋 1" hard floor (Xu Er Jia De Mao, 番茄文章
 * 10): whenever a chapter resolves one or more hooks, it must open at least
 * as many new hooks in the same memo. "Resolve without opening" leaves the
 * reader feeling "解完即索然无味" — the story loses forward pull. The softer
 * "揭 1 埋 2" rule is a planner-prompt recommendation, not a hard gate here,
 * because enforcing ×2 would conflict with the "≤ 2 new hooks per chapter"
 * cap on the planner side when resolve=2.
 */
export function validateHookLedger(
  memoBody: string,
  draftContent: string,
): ReadonlyArray<HookLedgerViolation> {
  const ledger = parseHookLedger(memoBody);
  const violations: HookLedgerViolation[] = [];

  // Evidence check for everything the memo committed to land in prose.
  // Skip entries whose descriptor explicitly defers revelation — the planner
  // intentionally told the writer to hold back, so the validator must not
  // demand matching keywords in the draft.
  const committed = dedupeById([...ledger.advance, ...ledger.resolve]);
  for (const entry of committed) {
    if (isExplicitDefer(entry.descriptor)) continue;
    if (!draftEchoesEntry(draftContent, entry)) {
      violations.push({
        severity: "critical",
        category: "hook 账未兑现",
        description: `memo 在 advance/resolve 里声明要处理 ${entry.id}，但正文没有对应的落地动作`,
        suggestion: `在正文中加入对 ${entry.id} 的具体情节推进（动作、对话、环境变化），或把它从 hook 账里移到 defer 并给出理由`,
      });
    }
  }

  // "揭 1 埋 1" hard floor: when anything was resolved, at least the same
  // number of new hooks must have been opened. We count both `[new]`
  // placeholder lines (newOpenCount — the normal way planners declare fresh
  // hooks without an id) and any id-bearing lines under `open:` (rare, but
  // legal if a planner re-opens a previously paused hook).
  const resolvedCount = ledger.resolve.length;
  const openedCount = ledger.open.length + ledger.newOpenCount;
  if (resolvedCount > 0 && openedCount < resolvedCount) {
    violations.push({
      severity: "critical",
      category: "hook 账揭 1 埋 1 违规",
      description: `本章 resolve 了 ${resolvedCount} 个钩子，但 open 只有 ${openedCount} 个新钩子。只揭不埋会让读者豁然开朗后索然无味，本书的前进拉力被削弱。`,
      suggestion: `在 memo 的 open 段下至少再埋 ${resolvedCount - openedCount} 个与本章已揭钩子相关的新钩子（番茄老师徐二家的猫："掀开一个伏笔的同时，再埋两个伏笔"）。新钩子最好与已揭钩子彼此关联，不要凭空冒出来。`,
    });
  }

  return violations;
}

function extractLedgerSection(memoBody: string): string | undefined {
  for (const pattern of LEDGER_HEADING_PATTERNS) {
    const match = memoBody.match(pattern);
    if (!match || match.index === undefined) continue;
    const start = match.index + match[0].length;
    const rest = memoBody.slice(start);
    const nextHeading = rest.match(/\n#{2,3}\s/);
    const end = nextHeading ? nextHeading.index ?? rest.length : rest.length;
    return rest.slice(0, end);
  }
  return undefined;
}

function extractLedgerEntry(line: string): HookLedgerEntry | undefined {
  const cleaned = line.replace(/^-+\s*/, "").trim();
  if (cleaned.startsWith("[new]") || cleaned.startsWith("[NEW]")) return undefined;

  // Reject whole-line placeholders first — "- 无", "- n/a", "- none" etc.
  const firstWord = cleaned.split(/\s+/)[0] ?? "";
  if (PLACEHOLDER_TOKENS.test(firstWord)) return undefined;

  const idMatch = cleaned.match(/^([A-Za-z一-鿿][A-Za-z0-9_\-一-鿿]{0,19})/);
  if (!idMatch) return undefined;

  const candidate = idMatch[1]!;
  if (SUBSECTION_WORDS.test(candidate)) return undefined;
  if (PLACEHOLDER_TOKENS.test(candidate)) return undefined;

  const descriptor = cleaned.slice(candidate.length).trim();
  const { keywords, minMatches } = extractKeywords(descriptor);
  return { id: candidate, descriptor, keywords, minKeywordMatches: minMatches };
}

/**
 * Extract content-matching tokens from a ledger line's descriptor.
 *
 * Priority 1: quoted hook name — `H007 "胖虎借条" → ...` — this is the most
 * informative token the planner attached, and it's what the writer should
 * echo. We split compound CJK names into leading/trailing 2-grams so
 * partial echoes still count.
 *
 * Priority 2: if no quoted name, fall back to the descriptor text UP TO the
 * first state-transition arrow (→ or ->), same CJK/ASCII splitting.
 *
 * Priority 3 (fallback): keywords from the post-arrow action description.
 * For entries like `H073 "身不由己网络" → 比武场周围有人在议论陈渊的来历`,
 * the quoted name may never appear in prose, but the action description
 * contains narrative terms the writer is likely to use (e.g. "议论", "来历").
 */
function extractKeywords(descriptor: string): { keywords: ReadonlyArray<string>; minMatches: number } {
  if (!descriptor) return { keywords: [], minMatches: 1 };

  // Try the quoted-name anchor first — matches "..." or "..." quotes.
  const quotedMatch = descriptor.match(/[""]([^""\n]+)[""]/);
  const source = quotedMatch ? quotedMatch[1]! : descriptor.split(/[→]|->/, 1)[0]!;

  const nameKeywords = tokenizeCjkAscii(source);

  // Only use action-description keywords as fallback when the quoted name
  // produced no usable tokens. This avoids false-positive matches from generic
  // character names or verbs that appear in the post-arrow state-change text.
  if (nameKeywords.length > 0) return { keywords: dedupeStrings(nameKeywords), minMatches: 1 };

  const arrowParts = descriptor.split(/[→]|->/);
  if (arrowParts.length <= 1) return { keywords: [], minMatches: 1 };
  const actionText = arrowParts.slice(1).join(" ");
  // Action keywords require 2 distinct matches (not 1) because character
  // names in action text (e.g. "陈渊") can create false positives.
  const actionKws = dedupeStrings(tokenizeCjkAscii(actionText));
  // Require 2+ matches when we have enough keywords to be selective;
  // when only 1 keyword exists, requiring 2 would make the hook unsatisfiable.
  return { keywords: actionKws, minMatches: actionKws.length >= 2 ? 2 : 1 };
}

/** Tokenize text into 2+/3+ CJK grams and 3+ letter ASCII words. */
function tokenizeCjkAscii(text: string, minCjkRunLength = 2): string[] {
  const cjkRuns = text.match(new RegExp("[一-鿿]{" + minCjkRunLength + ",}", "g")) ?? [];
  const cjkTokens: string[] = [];
  for (const run of cjkRuns) {
    cjkTokens.push(run);
    if (run.length >= 3) {
      for (let index = 0; index <= run.length - 2; index++) {
        cjkTokens.push(run.slice(index, index + 2));
      }
    }
    if (run.length >= 4) {
      cjkTokens.push(run.slice(0, 3));
      cjkTokens.push(run.slice(-3));
    }
  }
  const ascii = (text.match(/[A-Za-z]{3,}/g) ?? []).map((w) => w.toLowerCase());
  return [...cjkTokens, ...ascii].filter((tok) => !ASCII_STOPWORDS.has(tok));
}

const ASCII_STOPWORDS = new Set([
  "and", "the", "for", "with", "from", "that", "into", "then",
  "open", "close", "advance", "resolve", "defer", "new",
  "planted", "pressured", "near", "payoff", "ready", "stale",
]);

function draftEchoesEntry(draft: string, entry: HookLedgerEntry): boolean {
  if (entry.keywords.length > 0) {
    const draftLower = draft.toLowerCase();
    const matchCount = entry.keywords.filter((kw) => {
      // ASCII keywords are already lowercased; CJK keywords case doesn't matter.
      return /^[a-z]/.test(kw) ? draftLower.includes(kw) : draft.includes(kw);
    }).length;
    return matchCount >= entry.minKeywordMatches;
  }
  // Bare-id ledger line with no descriptor — fall back to ID match.
  if (/^[A-Za-z0-9_-]+$/.test(entry.id)) {
    return new RegExp(`\\b${escapeRegex(entry.id)}\\b`).test(draft);
  }
  return draft.includes(entry.id);
}

function dedupeById(entries: ReadonlyArray<HookLedgerEntry>): HookLedgerEntry[] {
  const seen = new Set<string>();
  const result: HookLedgerEntry[] = [];
  for (const entry of entries) {
    if (seen.has(entry.id)) continue;
    seen.add(entry.id);
    result.push(entry);
  }
  return result;
}

function dedupeStrings(values: ReadonlyArray<string>): string[] {
  return [...new Set(values)];
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Detect whether a hook ledger descriptor explicitly tells the writer NOT to
 * reveal the hook in this chapter. When the planner defers revelation, the
 * validator must not demand matching keywords in the draft.
 *
 * Matches patterns like "具体关联本章不揭示", "暂不掀", "留作悬念",
 * "本章不揭示", "不揭示身份" etc.
 */
function isExplicitDefer(descriptor: string): boolean {
  return /暂不[揭示掀触及]|留作悬念|本章不[揭示触及]|具体.*不揭示|不揭示.*身份|先不展开|暂且搁置|故意留白|本章不动/.test(descriptor);
}

export const INTERNAL = {
  SUBSECTION_KEYS,
  extractLedgerSection,
  extractLedgerEntry,
  extractKeywords,
};
