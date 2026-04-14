import { BaseAgent } from "./base.js";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { buildDetailedOutlineSystemPrompt, buildDetailedOutlineUserPrompt, buildBatchContinuationPrompt, type DetailedOutlineInput, type BatchContinuationInput } from "./detailed-outline-prompts.js";

export interface GenerateSingleOptions {
  readonly bookDir: string;
  readonly chapterNumber: number;
  readonly language?: string;
}

export class DetailedOutlineAgent extends BaseAgent {
  get name(): string {
    return "detailed-outline";
  }

  async generateAll(input: DetailedOutlineInput): Promise<string> {
    const lang = input.language === "en" ? "en" : "zh";
    const BATCH_SIZE = 20;
    const MAX_TOKENS = 15000;

    this.log?.info(`[detailed-outline] Batch generating ${input.targetChapters} chapters (batch size: ${BATCH_SIZE})`);

    // First batch: generate initial outline
    const firstBatchEnd = Math.min(BATCH_SIZE, input.targetChapters);
    this.log?.info(`[detailed-outline] Batch 1: chapters 1–${firstBatchEnd}`);

    const firstUserPrompt = buildDetailedOutlineUserPrompt(input);
    const systemPrompt = buildDetailedOutlineSystemPrompt(lang);

    const firstResponse = await this.chat(
      [
        { role: "system", content: systemPrompt },
        { role: "user", content: firstUserPrompt },
      ],
      { temperature: 0.3, maxTokens: MAX_TOKENS },
    );

    let result = firstResponse.content.trim();
    this.log?.info(`[detailed-outline] Batch 1 done, ${result.length} chars`);

    // Subsequent batches
    let completedChapters = firstBatchEnd;

    while (completedChapters < input.targetChapters) {
      const batchStart = completedChapters + 1;
      const batchEnd = Math.min(completedChapters + BATCH_SIZE, input.targetChapters);

      this.log?.info(`[detailed-outline] Batch ${Math.ceil(batchStart / BATCH_SIZE)}: chapters ${batchStart}–${batchEnd}`);

      const lastTwoChapters = extractLastNChaptersSummary(result, 2, lang);
      const continuationPrompt = buildBatchContinuationPrompt({
        previousChaptersCount: completedChapters,
        nextBatchStart: batchStart,
        nextBatchEnd: batchEnd,
        previousSummary: lastTwoChapters,
        language: lang,
      });

      const continuationResponse = await this.chat(
        [
          { role: "system", content: systemPrompt },
          { role: "user", content: continuationPrompt },
        ],
        { temperature: 0.3, maxTokens: MAX_TOKENS },
      );

      const batchContent = continuationResponse.content.trim();
      this.log?.info(`[detailed-outline] Batch ${Math.ceil(batchStart / BATCH_SIZE)} done, ${batchContent.length} chars`);

      result += "\n\n" + batchContent;
      completedChapters = batchEnd;
    }

    this.log?.info(`[detailed-outline] All ${completedChapters} chapters generated, total ${result.length} chars`);
    return result;
  }

  async generateSingle(input: GenerateSingleOptions): Promise<string> {
    const storyDir = join(input.bookDir, "story");
    const [volumeOutline, chapterOutlines, currentState] = await Promise.all([
      readFile(join(storyDir, "volume_outline.md"), "utf-8").catch(() => ""),
      readFile(join(storyDir, "chapter_outlines.md"), "utf-8").catch(() => ""),
      readFile(join(storyDir, "current_state.md"), "utf-8").catch(() => ""),
    ]);

    // Extract previous chapter's outline as context
    const prevChapter = input.chapterNumber - 1;
    const prevOutline = prevChapter >= 1 ? extractChapterOutline(chapterOutlines, prevChapter) : "(无前章细纲)";

    const lang = input.language === "en" ? "en" : "zh";
    const isZh = lang === "zh";

    const userPrompt = `${isZh ? "## 背景：卷纲（本章部分）" : "## Background: Volume Outline (current chapter)"}
${extractChapterOutline(volumeOutline, input.chapterNumber) || (isZh ? "(本章在卷纲中无具体内容，请根据前后章推断)" : "(No specific content for this chapter in the volume outline; infer from surrounding chapters)")}

${isZh ? "## 前一章细纲" : "## Previous Chapter Outline"}
${prevOutline}

${isZh ? "## 当前 state" : "## Current State"}
${currentState || "(none)"}`;

    const systemPrompt = buildDetailedOutlineSystemPrompt(lang);

    const response = await this.chat(
      [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      { temperature: 0.3, maxTokens: 2048 },
    );

    return response.content.trim();
  }
}

/**
 * Extract a brief summary of the last N chapters from existing outline content.
 * Used for continuity when generating subsequent batches.
 */
function extractLastNChaptersSummary(content: string, n: number, _lang: "zh" | "en"): string {
  const sections = content.split(/(?:^|\n)(?=##)/);
  if (sections.length <= 1) return "(无前章内容)";

  const chapterPattern = /^##\s*(?:第\s*(\d+)\s*章|Chapter\s*(\d+)\b)/i;
  const chapters = sections.filter((s) => {
    const t = s.trim();
    if (!t) return false;
    return chapterPattern.test(t);
  });

  const lastN = chapters.slice(-n);
  return lastN
    .map((s) => {
      const trimmed = s.trim();
      return trimmed.length > 200 ? trimmed.slice(0, 200) + "..." : trimmed;
    })
    .join("\n\n");
}

/**
 * Extract the outline for a specific chapter from a chapter outlines document.
 * Works with both Chinese ("第 N 章") and English ("Chapter N") anchors.
 * Uses a split-based approach to correctly handle blank lines between chapters.
 */
export function extractChapterOutline(content: string, chapterNumber: number): string | undefined {
  if (!content || !content.trim()) return undefined;

  // Split content at ## chapter headers
  // Match: start of string OR newline, then ## lookahead
  const parts = content.split(/(?:^|\n)(?=##)/);

  for (const part of parts) {
    const trimmed = part.trim();
    // Match chapter N header: ## 第 N 章, ## 第N章, or ## Chapter N
    const headerMatch = trimmed.match(/^##\s*(?:第\s*(\d+)\s*章|Chapter\s*(\d+)\b)/i);
    if (headerMatch) {
      const num = headerMatch[1] ?? headerMatch[2];
      if (String(num) === String(chapterNumber)) {
        // Found the right chapter: remove the header line
        const firstNewline = part.indexOf('\n');
        if (firstNewline === -1) continue;
        const afterHeader = part.slice(firstNewline + 1);
        // Strip trailing whitespace then trim
        return afterHeader.trim() || undefined;
      }
    }
  }
  return undefined;
}
