/**
 * Deterministic temporal marker extraction for timeline consistency auditing.
 *
 * Extracts time-related expressions from Chinese (and basic English) chapter text
 * so the ContinuityAuditor can compare temporal signals across chapters without
 * relying on the LLM to notice them.
 */

export interface TemporalMarker {
  readonly raw: string;
  readonly numericValue: number;
  readonly direction: "past" | "future" | "present";
  readonly context: string;
}

const MAX_MARKERS = 10;

// ── Pattern definitions ──────────────────────────────────────────────────────

interface PatternDef {
  readonly regex: RegExp;
  readonly extract: (match: RegExpExecArray) => {
    numericValue: number;
    direction: "past" | "future" | "present";
  } | null;
}

/** "3天前", "两天以后", "5个月后" */
const RELATIVE_NUMERIC: PatternDef = {
  regex: /(\d+\.?\d*)\s*(天|日|月|年)(前|后|以前|以后)/g,
  extract: (m) => {
    const raw = parseFloat(m[1]!);
    const unit = m[2]!;
    const suffix = m[3]!;
    const multiplier = unit === "月" ? 30 : unit === "年" ? 365 : 1;
    const value = raw * multiplier;
    const direction = (suffix === "前" || suffix === "以前") ? "past" : "future";
    return { numericValue: direction === "past" ? -value : value, direction };
  },
};

/** "还剩两天半", "还有3天", "还有三天" */
const COUNTDOWN: PatternDef = {
  regex: /还[剩有]\s*(\d+\.?\d*|[一二两三四五六七八九十]+)\s*个?\s*(天|日)/g,
  extract: (m) => {
    const raw = m[1]!;
    const value = /^\d/.test(raw) ? parseFloat(raw) : chineseToNumber(raw);
    return { numericValue: value, direction: "future" };
  },
};

/** "大前天" = -3, "前天" = -2, "昨天" = -1, "今天/今晚/今早" = 0, "明天" = 1, "后天" = 2, "大后天" = 3 */
const FIXED_RELATIVES: PatternDef = {
  regex: /(大前天|前天|昨天|今天|今晚|今早|明晚|明天|明早|后天|大后天)/g,
  extract: (m) => {
    const word = m[1]!;
    const map: Record<string, number> = {
      "大前天": -3, "前天": -2, "昨天": -1,
      "今天": 0, "今晚": 0, "今早": 0,
      "明天": 1, "明早": 1, "明晚": 1,
      "后天": 2, "大后天": 3,
    };
    const value = map[word] ?? 0;
    const direction = value < 0 ? "past" : value > 0 ? "future" : "present";
    return { numericValue: value, direction };
  },
};

/** "三天前", "三个月前" — Chinese numeral variants with optional measure word 个 */
const CHINESE_NUM_RELATIVE: PatternDef = {
  regex: /([一二两三四五六七八九十百]+)\s*个?\s*(天|日|月|年)(前|后|以前|以后)/g,
  extract: (m) => {
    const cnNum = chineseToNumber(m[1]!);
    if (cnNum <= 0) return null;
    const unit = m[2]!;
    const suffix = m[3]!;
    const multiplier = unit === "月" ? 30 : unit === "年" ? 365 : 1;
    const value = cnNum * multiplier;
    const direction = (suffix === "前" || suffix === "以前") ? "past" : "future";
    return { numericValue: direction === "past" ? -value : value, direction };
  },
};

const ALL_PATTERNS: ReadonlyArray<PatternDef> = [
  RELATIVE_NUMERIC,
  COUNTDOWN,
  FIXED_RELATIVES,
  CHINESE_NUM_RELATIVE,
];

// ── Helpers ──────────────────────────────────────────────────────────────────

function chineseToNumber(s: string): number {
  const digits: Record<string, number> = {
    "一": 1, "二": 2, "两": 2, "三": 3, "四": 4, "五": 5,
    "六": 6, "七": 7, "八": 8, "九": 9, "十": 10,
    "百": 100,
  };
  if (s.length === 1) return digits[s] ?? 0;
  // Handle "十X" (10+N)
  if (s.startsWith("十")) {
    const rest = digits[s.slice(1)] ?? 0;
    return 10 + rest;
  }
  // Handle "X十" (N*10)
  if (s.endsWith("十")) {
    const tens = digits[s.slice(0, -1)] ?? 0;
    return tens * 10;
  }
  // Handle "X十Y" (N*10+M)
  const idx = s.indexOf("十");
  if (idx > 0) {
    const tens = digits[s.slice(0, idx)] ?? 0;
    const ones = digits[s.slice(idx + 1)] ?? 0;
    return tens * 10 + ones;
  }
  return digits[s] ?? 0;
}

function contextSnippet(text: string, index: number, length: number): string {
  const start = Math.max(0, index - 10);
  const end = Math.min(text.length, index + length + 10);
  return text.slice(start, end).replace(/\n/g, " ");
}

// ── Public API ───────────────────────────────────────────────────────────────

export function extractTemporalMarkers(text: string): ReadonlyArray<TemporalMarker> {
  if (!text || text.length < 10) return [];

  const seen = new Set<string>();
  const markers: TemporalMarker[] = [];

  for (const pattern of ALL_PATTERNS) {
    let match: RegExpExecArray | null;
    // Reset lastIndex for each pattern (global regex state)
    pattern.regex.lastIndex = 0;
    while ((match = pattern.regex.exec(text)) !== null) {
      const raw = match[0];
      // Deduplicate identical raw strings
      if (seen.has(raw)) continue;
      seen.add(raw);

      const result = pattern.extract(match);
      if (!result) continue;

      markers.push({
        raw,
        numericValue: result.numericValue,
        direction: result.direction,
        context: contextSnippet(text, match.index, raw.length),
      });

      if (markers.length >= MAX_MARKERS) return markers;
    }
  }

  // Sort by position in text (stable: markers already added in order)
  return markers;
}

/**
 * Format extracted markers into a compact block for LLM prompt injection.
 * Caps at 200 chars total.
 */
export function formatTemporalMarkerBlock(
  currentMarkers: ReadonlyArray<TemporalMarker>,
  previousMarkers: ReadonlyArray<TemporalMarker>,
  language: "zh" | "en" = "zh",
): string {
  if (currentMarkers.length === 0 && previousMarkers.length === 0) return "";

  const formatList = (markers: ReadonlyArray<TemporalMarker>): string => {
    if (markers.length === 0) return language === "en" ? "(none)" : "(无)";
    return markers.map((m) => {
      const sign = m.numericValue > 0 ? "+" : "";
      return `${m.raw}(${sign}${m.numericValue}d)`;
    }).join(", ");
  };

  const label = language === "en"
    ? "## Temporal Markers"
    : "## 时间标记比对";

  const prevLabel = language === "en" ? "Prev" : "前章";
  const currLabel = language === "en" ? "Curr" : "当前章";

  const raw = `${label}\n${prevLabel}: ${formatList(previousMarkers)}\n${currLabel}: ${formatList(currentMarkers)}`;
  return raw.length > 200 ? raw.slice(0, 197) + "..." : raw;
}
