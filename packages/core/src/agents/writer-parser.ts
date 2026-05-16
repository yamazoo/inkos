import type { GenreProfile } from "../models/genre-profile.js";
import type { LengthCountingMode } from "../models/length-governance.js";
import type { WriteChapterOutput } from "./writer.js";
import { countChapterLength } from "../utils/length-metrics.js";
import { stripThinkBlocks } from "../utils/strip-think-blocks.js";

export interface CreativeOutput {
  readonly title: string;
  readonly content: string;
  readonly wordCount: number;
  readonly preWriteCheck: string;
}

export function parseCreativeOutput(
  chapterNumber: number,
  content: string,
  countingMode: LengthCountingMode = "zh_chars",
): CreativeOutput {
  // Strip think blocks from reasoning models before parsing tags
  const cleaned = stripThinkBlocks(content);

  const extract = (tag: string): string => {
    // Try standard === TAG === format first
    // Stop at: (1) === TAG ===, (2) bare === separator (with optional non-alnum), (3) end
    const regex = new RegExp(
      `=== ${tag} ===\\s*([\\s\\S]*?)(?==== [A-Z_]+ ===|\\n={3,}(?:[^A-Za-z0-9]|$)|$)`,
    );
    const match = cleaned.match(regex);
    if (match?.[1]) return match[1].trim();
    // Fallback: bare tag (LLM omitted === delimiters)
    // Constrain to known tags to avoid false matches on uppercase English prose lines
    const knownTags = "CHAPTER_TITLE|CHAPTER_CONTENT|PRE_WRITE_CHECK|UPDATED_STATE|UPDATED_HOOKS|FIXED_ISSUES";
    const bareRegex = new RegExp(
      `^${tag}\\s*\\n([\\s\\S]*?)(?=^(?:${knownTags})$|=== [A-Z_]+ ===|\\n={3,}(?:[^A-Za-z0-9]|$)|$)`,
      "m",
    );
    const bareMatch = cleaned.match(bareRegex);
    return bareMatch?.[1]?.trim() ?? "";
  };

  let chapterContent = extract("CHAPTER_CONTENT");

  // Fallback: if === TAG === parsing fails (common with local/small models),
  // try to extract usable content from the raw output
  if (!chapterContent) {
    chapterContent = fallbackExtractContent(cleaned, countingMode);
  }

  const tagTitle = extract("CHAPTER_TITLE");
  // Use tag title only if it contains meaningful content (not just "第N章")
  const title = isGenericChapterTitle(tagTitle, chapterNumber, countingMode)
    ? fallbackExtractTitle(cleaned, chapterNumber, countingMode)
    : tagTitle;

  return {
    title,
    content: chapterContent,
    wordCount: countChapterLength(chapterContent, countingMode),
    preWriteCheck: extract("PRE_WRITE_CHECK"),
  };
}

/**
 * Check if a line is a markdown table row (header, separator, or data).
 * Used to strip leading metadata tables from fallback-extracted content.
 */
function isLeadingTableRow(line: string): boolean {
  const trimmed = line.trim();
  if (!trimmed.startsWith("|")) return false;
  // Separator row: | --- | --- | ... |
  if (/^\|[\s\-:|]+\|$/.test(trimmed)) return true;
  // Any row starting with | and containing at least 3 pipe chars (header/data)
  return (trimmed.match(/\|/g)?.length ?? 0) >= 3;
}

/**
 * Check if a line is a bare tag name (e.g., "CHAPTER_TITLE", "CHAPTER_CONTENT")
 * without the === ... === wrapper. Some LLMs omit the delimiters.
 */
function isBareTagLine(line: string): boolean {
  return /^[A-Z][A-Z_]{2,}$/.test(line.trim());
}

function stripLeadingTable(content: string): string {
  const lines = content.split("\n");
  let start = 0;
  // Skip all leading non-prose lines: blanks, table rows, bare tags, rules
  while (start < lines.length) {
    const trimmed = lines[start]!.trim();
    if (
      trimmed === "" ||
      trimmed === "---" ||
      trimmed === "***" ||
      isLeadingTableRow(trimmed) ||
      isBareTagLine(trimmed)
    ) {
      start++;
    } else {
      break;
    }
  }
  return lines.slice(start).join("\n").trim();
}

function fallbackExtractContent(raw: string, countingMode: LengthCountingMode): string {
  // Try markdown heading: # 第N章 ... followed by content
  const headingMatch = raw.match(/^#\s*第\d+章[^\n]*\n+([\s\S]+)/m);
  if (headingMatch) {
    return stripLeadingTable(headingMatch[1]!.trim());
  }

  if (countingMode === "en_words") {
    const englishHeadingMatch = raw.match(/^#\s*Chapter\s+\d+(?::|\s+)([^\n]*)\n+([\s\S]+)/im);
    if (englishHeadingMatch) {
      return stripLeadingTable(englishHeadingMatch[2]!.trim());
    }
  }

  // Try "正文" or "内容" labeled section
  const labelMatch = raw.match(/(?:正文|内容|章节内容)[：:]\s*\n+([\s\S]+)/);
  if (labelMatch) {
    return labelMatch[1]!.trim();
  }

  if (countingMode === "en_words") {
    const englishLabelMatch = raw.match(/(?:content|chapter content)[：:]\s*\n+([\s\S]+)/i);
    if (englishLabelMatch) {
      return englishLabelMatch[1]!.trim();
    }
  }

  // Last resort: strip lines that look like metadata/tags, keep the rest
  const lines = raw.split("\n");
  const proseLines = lines.filter((line) => {
    const trimmed = line.trim();
    // Skip tag-like lines, empty lines at boundaries, and short key-value lines
    if (/^===\s*[A-Z_]+\s*===/.test(trimmed)) return false;
    if (/^(PRE_WRITE_CHECK|CHAPTER_TITLE|章节标题|写作自检)[：:]/.test(trimmed)) return false;
    return true;
  });
  const result = proseLines.join("\n").trim();
  // Only use fallback if we got meaningful content (>100 chars)
  return result.length > 100 ? result : "";
}

/**
 * Fallback title extraction when === CHAPTER_TITLE === tag is missing.
 */
function fallbackExtractTitle(
  raw: string,
  chapterNumber: number,
  countingMode: LengthCountingMode,
): string {
  const defaultTitle = defaultChapterTitle(chapterNumber, countingMode);

  // Try: # 第N章 Title
  const headingMatch = raw.match(/^#\s*第\d+章\s+(.+)/m);
  if (headingMatch) {
    const candidate = headingMatch[1]!.trim();
    // Reject if the captured text is itself just a chapter number ("第23章" from "# 第23章 第23章")
    if (!isGenericChapterTitle(candidate, chapterNumber, countingMode)) {
      return candidate;
    }
  }
  if (countingMode === "en_words") {
    const englishHeadingMatch = raw.match(/^#\s*Chapter\s+\d+(?::|\s+)\s*(.+)/im);
    if (englishHeadingMatch) {
      const candidate = englishHeadingMatch[1]!.trim();
      if (!isGenericChapterTitle(candidate, chapterNumber, countingMode)) {
        return candidate;
      }
    }
  }
  // Try: 章节标题：Title or CHAPTER_TITLE: Title (without === delimiters)
  const labelMatch = raw.match(/(?:章节标题|CHAPTER_TITLE)[：:]\s*(.+)/);
  if (labelMatch) {
    return labelMatch[1]!.trim();
  }
  return defaultTitle;
}

export type ParsedWriterOutput = Omit<WriteChapterOutput, "postWriteErrors" | "postWriteWarnings">;

/**
 * Parse LLM output that uses === TAG === delimiters into structured chapter data.
 * Shared by WriterAgent (writing new chapters) and ChapterAnalyzerAgent (analyzing existing chapters).
 */
export function parseWriterOutput(
  chapterNumber: number,
  content: string,
  genreProfile: GenreProfile,
  countingMode: LengthCountingMode = "zh_chars",
): ParsedWriterOutput {
  // Strip think blocks before parsing — same defense as parseCreativeOutput
  const cleaned = stripThinkBlocks(content);

  const extract = (tag: string): string => {
    // Stop at: (1) === TAG ===, (2) bare === separator (with optional non-alnum), (3) end
    const regex = new RegExp(
      `=== ${tag} ===\\s*([\\s\\S]*?)(?==== [A-Z_]+ ===|\\n={3,}(?:[^A-Za-z0-9]|$)|$)`,
    );
    const match = cleaned.match(regex);
    return match?.[1]?.trim() ?? "";
  };

  const chapterContent = extract("CHAPTER_CONTENT");

  let title = extract("CHAPTER_TITLE");
  if (isGenericChapterTitle(title, chapterNumber, countingMode)) {
    // Try extracting from heading in the content section
    title = fallbackExtractTitle(cleaned, chapterNumber, countingMode);
  }

  return {
    chapterNumber,
    title,
    content: chapterContent,
    wordCount: countChapterLength(chapterContent, countingMode),
    preWriteCheck: extract("PRE_WRITE_CHECK"),
    postSettlement: extract("POST_SETTLEMENT"),
    updatedState: extract("UPDATED_STATE") || defaultStatePlaceholder(countingMode),
    updatedLedger: genreProfile.numericalSystem
      ? (extract("UPDATED_LEDGER") || defaultLedgerPlaceholder(countingMode))
      : "",
    updatedHooks: extract("UPDATED_HOOKS") || defaultHooksPlaceholder(countingMode),
    chapterSummary: extract("CHAPTER_SUMMARY"),
    updatedSubplots: extract("UPDATED_SUBPLOTS"),
    updatedEmotionalArcs: extract("UPDATED_EMOTIONAL_ARCS"),
    updatedCharacterMatrix: extract("UPDATED_CHARACTER_MATRIX"),
  };
}

function defaultChapterTitle(
  chapterNumber: number,
  countingMode: LengthCountingMode,
): string {
  return countingMode === "en_words" ? `Chapter ${chapterNumber}` : `第${chapterNumber}章`;
}

/** Check if a title is the generic default with no meaningful content. */
function isGenericChapterTitle(title: string, chapterNumber: number, countingMode: LengthCountingMode): boolean {
  if (!title) return true;
  const trimmed = title.trim();
  if (trimmed === defaultChapterTitle(chapterNumber, countingMode)) return true;
  // Also catch "第23章" variants with extra whitespace or repeated chapter numbers
  if (countingMode !== "en_words" && /^第\s*\d+\s*章$/.test(trimmed)) return true;
  if (countingMode === "en_words" && /^Chapter\s+\d+$/i.test(trimmed)) return true;
  return false;
}

function defaultStatePlaceholder(countingMode: LengthCountingMode): string {
  return countingMode === "en_words" ? "(state card not updated)" : "(状态卡未更新)";
}

function defaultLedgerPlaceholder(countingMode: LengthCountingMode): string {
  return countingMode === "en_words" ? "(ledger not updated)" : "(账本未更新)";
}

function defaultHooksPlaceholder(countingMode: LengthCountingMode): string {
  return countingMode === "en_words" ? "(hooks pool not updated)" : "(伏笔池未更新)";
}
